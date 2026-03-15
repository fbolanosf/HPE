'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Partner } from '@/lib/partner-intelligence-data';
import { Globe, RefreshCw, AlertCircle, Wifi, Users, Phone, MapPin, Filter, Maximize2, Minimize2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix for default marker icons and clustering style
const createCustomIcon = (color: string) => {
    return new L.DivIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4); z-index: 1000;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });
};

const createClusterCustomIcon = (cluster: any) => {
    const count = cluster.getChildCount();
    return new L.DivIcon({
        html: `
            <div class="custom-cluster-icon" style="background: rgba(1, 169, 130, 0.95); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid rgba(255, 255, 255, 0.9); box-shadow: 0 4px 15px rgba(0,0,0,0.3); font-weight: 900; font-size: 14px; z-index: 2000;">
                ${count}
                <div class="pulse-ring"></div>
            </div>
        `,
        className: 'cluster-marker',
        iconSize: L.point(42, 42, true),
    });
};

const VENDOR_COLORS: Record<string, string> = {
    'Siemens': '#009999',
    'Rockwell Automation': '#d62222',
    'Schneider Electric': '#3dcd58',
    'ABB': '#ff0000',
    'Honeywell': '#e5261f',
    'VMware': '#717074',
    'HPE': '#01A982',
    'Dell': '#007db8',
    'Cisco': '#0096d6',
    'default': '#6366f1',
};

const DOMAIN_COLORS: Record<string, string> = {
    'IT': '#2563eb',
    'OT': '#ea580c',
    'IT_OT_HYBRID': '#16a34a',
};

// Soft palette for country bars
const SOFT_PALETTE = [
    '#9EE493', '#9DC7C8', '#D7AF70', '#E4B7E5', '#B2CEFE', 
    '#A7E8BD', '#FCF6BD', '#D0F4DE', '#A9DEF9', '#E4C1F9'
];

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${className}`}>
            {children}
        </span>
    );
}

// Country → lat/lng centroids
const COUNTRY_COORDS: Record<string, [number, number]> = {
    'Mexico': [23.6, -102.5], 'Colombia': [4.6, -74.1], 'Brazil': [-14.2, -51.9],
    'Argentina': [-38.4, -63.6], 'Chile': [-35.7, -71.5], 'Peru': [-9.2, -75.0],
    'Ecuador': [-1.8, -78.2], 'Bolivia': [-16.3, -63.6], 'Venezuela': [6.4, -66.6],
    'Paraguay': [-23.4, -58.4], 'Uruguay': [-32.5, -55.8], 'Panama': [8.9, -79.5],
    'Costa Rica': [9.7, -83.8], 'Guatemala': [15.8, -90.2], 'Honduras': [15.2, -86.2],
    'El Salvador': [13.8, -88.9],
    // Europe
    'Spain': [40.5, -3.7], 'Italy': [41.9, 12.6], 'Portugal': [39.4, -8.2],
    'Greece': [39.1, 21.8], 'Cyprus': [35.1, 33.4], 'Andorra': [42.5, 1.5],
    'San Marino': [43.9, 12.4], 'Malta': [35.9, 14.4],
    // Middle East
    'Israel': [31.0, 34.8], 'Gaza Strip': [31.4, 34.4],
};

const CITY_COORDS: Record<string, [number, number]> = {
    'Mexico City': [19.4326, -99.1332], 'Monterrey': [25.6866, -100.3161],
    'Guadalajara': [20.6597, -103.3500], 'Querétaro': [20.5888, -100.3899],
    'Bogotá': [4.7110, -74.0721], 'Medellín': [6.2442, -75.5812],
    'São Paulo': [-23.5505, -46.6333], 'Rio de Janeiro': [-22.9068, -43.1729],
    'Curitiba': [-25.4290, -49.2671], 'Santiago': [-33.4489, -70.6693],
    'Antofagasta': [-23.6500, -70.4000], 'Buenos Aires': [-34.6037, -58.3816],
    'Córdoba': [-31.4201, -64.1888], 'Lima': [-12.0464, -77.0282],
    'Quito': [-0.1807, -78.4678], 'Santa Cruz': [-17.7833, -63.1821],
    'Caracas': [10.4806, -66.9036],
    // Europe Cities
    'Madrid': [40.4168, -3.7038], 'Barcelona': [41.3851, 2.1734],
    'Milan': [45.4642, 9.1900], 'Verona': [45.4384, 10.9916],
    'Lisbon': [38.7223, -9.1393], 'Athens': [37.9838, 23.7275],
    'Limassol': [34.6786, 33.0413], 'Andorra la Vella': [42.5063, 1.5218],
    'San Marino': [43.9333, 12.4500], 'Birkirkara': [35.8972, 14.4611],
    // Middle East Cities
    'Petah Tikva': [32.0840, 34.8878], 'Beersheba': [31.2530, 34.7915],
    'Gaza City': [31.5000, 34.4667],
};

function getCoords(country: string, city: string): [number, number] {
    if (city && CITY_COORDS[city]) return CITY_COORDS[city];
    const base = COUNTRY_COORDS[country] || [23.6, -102.5];
    return [base[0], base[1]];
}

interface ScrapedPartner {
    company_name: string;
    country: string;
    city: string;
    website: string;
    vendor: string; // Keep for legacy/scraping single vendors
    vendors?: string[]; // New: support multiple vendors
    virtualization_techs?: string[]; // New: virtualization specializations
    address?: string; // New: physical location
    phone?: string; // New: contact number
    source_url: string;
    domain: string;
    hpe_certification?: string;
    lat?: number;
    lng?: number;
}

type ColorMode = 'vendor' | 'domain';

interface GeoMapProps {
    colorMode?: ColorMode;
    dbPartners?: Partner[];
}

function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
}

export default function GeoMap({ colorMode = 'vendor', dbPartners = [] }: GeoMapProps) {
    const [scrapedPartners, setScrapedPartners] = useState<ScrapedPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPartner, setSelectedPartner] = useState<ScrapedPartner | null>(null);
    const [scrapedCount, setScrapedCount] = useState(0);
    const [activeColorMode, setActiveColorMode] = useState<ColorMode>(colorMode);
    const [viewPosition, setViewPosition] = useState<{ center: [number, number]; zoom: number }>({ 
        center: [20, 0], 
        zoom: 2 
    });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Filters
    const [filterCountry, setFilterCountry] = useState<string>('ALL');
    const [filterVendor, setFilterVendor] = useState<string>('ALL');
    const [filterHpe, setFilterHpe] = useState<boolean>(false);
    const [filterVirt, setFilterVirt] = useState<boolean>(false);

    const toggleFullscreen = () => {
        if (!mapContainerRef.current) return;
        if (!document.fullscreenElement) {
            mapContainerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const fetchPartners = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/partners/scrape');
            if (!res.ok) throw new Error('Error al obtener datos de scraping');
            const data = await res.json();
            const withCoords = (data.partners as ScrapedPartner[]).map(p => ({
                ...p,
                vendors: [p.vendor]
            })).filter(
                (p) => p.lat && p.lng
            );
            setScrapedPartners(withCoords);
            setScrapedCount(data.scraped_live ?? 0);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPartners(); }, [fetchPartners]);

    const partners = useMemo(() => {
        const dbMapped: ScrapedPartner[] = dbPartners.map(p => {
            const possibleVendors = ['vmware', 'vxrail', 'dell', 'cisco', 'microsoft', 'aws', 'google_cloud', 'nutanix', 'siemens', 'rockwell', 'schneider', 'abb', 'honeywell', 'aveva', 'emerson', 'yokogawa', 'hpe'];
            const activeVendors: string[] = [];
            for (const v of possibleVendors) {
                if (p[`${v}_partner` as keyof Partner]) {
                    const label = v === 'rockwell' ? 'Rockwell Automation'
                        : v === 'schneider' ? 'Schneider Electric'
                            : v === 'google_cloud' ? 'Google Cloud'
                                : v.charAt(0).toUpperCase() + v.slice(1);
                    activeVendors.push(label);
                }
            }

            const possibleVirt = ['virtualization', 'hci', 'hybrid_cloud', 'cloud_migration', 'container_platforms', 'backup_and_disaster_recovery'];
            const activeVirt: string[] = [];
            for (const v of possibleVirt) {
                if (p[v as keyof Partner]) {
                    const label = v.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    activeVirt.push(label);
                }
            }
            
            const hash = p.company_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const jitterLat = (hash % 100) / 1000 - 0.05;
            const jitterLng = ((hash * 13) % 100) / 1000 - 0.05;
            const base = getCoords(p.country, p.city);

            return {
                company_name: p.company_name,
                country: p.country,
                city: p.city,
                website: p.website || '',
                vendor: activeVendors[0] || 'HPE',
                vendors: activeVendors.length > 0 ? activeVendors : ['HPE'],
                virtualization_techs: activeVirt,
                address: `Av. Tecnología ${Math.floor(hash % 999)}, Edif. ${p.company_name.substring(0,2).toUpperCase()}, ${p.city}`,
                phone: `+${hash % 90 + 10} ${Math.floor(hash % 9 + 1)}${Math.floor((hash * 13) % 9000 + 1000)}`,
                source_url: 'HPE Partner Database',
                domain: p.technology_domain,
                hpe_certification: p.hpe_certification,
                lat: base[0] + jitterLat,
                lng: base[1] + jitterLng
            };
        });

        const scrapeNames = new Set(scrapedPartners.map(p => p.company_name.toLowerCase()));
        const uniqueDb = dbMapped.filter(p => !scrapeNames.has(p.company_name.toLowerCase()));
        return [...scrapedPartners, ...uniqueDb];
    }, [scrapedPartners, dbPartners]);

    const getColor = (p: ScrapedPartner) => {
        if (activeColorMode === 'domain') return DOMAIN_COLORS[p.domain] ?? '#6366f1';
        return VENDOR_COLORS[p.vendors?.[0] || p.vendor] ?? VENDOR_COLORS['default'];
    };

    const filteredPartners = partners.filter(p => {
        const partnerVendors = p.vendors || [p.vendor];
        if (filterCountry !== 'ALL' && p.country !== filterCountry) return false;
        if (filterVendor !== 'ALL' && !partnerVendors.includes(filterVendor)) return false;
        if (filterHpe && !partnerVendors.includes('HPE')) return false;
        if (filterVirt && !partnerVendors.some(v => ['VMware', 'HPE'].includes(v))) return false;
        return true;
    });

    const zoomToCountry = (country: string) => {
        const coords = getCoords(country, "");
        setViewPosition({ center: coords, zoom: 5 });
    };

    const filteredCountryGroups = filteredPartners.reduce<Record<string, number>>((acc, p) => {
        acc[p.country] = (acc[p.country] ?? 0) + 1;
        return acc;
    }, {});

    const getMockContactInfo = (name: string) => {
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return {
            phone: `+52 ${Math.floor(hash % 9 + 1)}${Math.floor((hash * 13) % 9000 + 1000)} ${Math.floor((hash * 7) % 9000 + 1000)}`,
            role: ["Director Comercial IT", "Channel Manager", "Gerente de Alianzas", "Especialista", "Director General"][hash % 5]
        };
    };

    return (
        <div className="space-y-4 font-sans">
            <style jsx global>{`
                /* Deep Blue Sea / Soft Green-Grey Earth filter for Voyager */
                .custom-map-tiles {
                    filter: saturate(1.8) brightness(1.0) hue-rotate(-12deg) contrast(1.1);
                }
                .leaflet-container {
                    background: #111b27 !important; /* Matches deepest sea tone */
                }
                /* Custom cluster animation */
                .custom-cluster-icon {
                    position: relative;
                }
                .pulse-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    border: 4px solid rgba(1, 169, 130, 0.4);
                    animation: cluster-pulse 2s infinite ease-out;
                }
                @keyframes cluster-pulse {
                    0% { transform: scale(0.6); opacity: 1; }
                    100% { transform: scale(1.6); opacity: 0; }
                }

                /* Custom scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
            `}</style>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm transition-all">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#01A982]/10 flex items-center justify-center">
                        <Globe className="h-6 w-6 text-[#01A982]" />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-gray-900 block">
                            Mapa Geográfico de Partners
                        </span>
                        {!loading && scrapedCount > 0 && (
                            <span className="text-[10px] text-[#01A982] font-semibold flex items-center gap-1 mt-0.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#01A982] animate-pulse" />
                                {scrapedCount} datos en tiempo real
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs">
                        <Filter className="h-3.5 w-3.5 text-gray-400" />
                        <select
                            value={filterCountry}
                            onChange={e => {
                                setFilterCountry(e.target.value);
                                if (e.target.value !== 'ALL') zoomToCountry(e.target.value);
                            }}
                            className="bg-white border border-gray-200 text-gray-700 rounded-xl px-3 py-2 outline-none focus:border-[#01A982] transition-colors cursor-pointer text-[12px] font-medium min-w-[140px]"
                        >
                            <option value="ALL">Todos los Países</option>
                            {[...new Set(partners.map(p => p.country))].sort().map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex rounded-xl bg-gray-100 p-1 text-[11px] font-bold">
                        <button
                            onClick={() => setActiveColorMode('vendor')}
                            className={`px-4 py-1.5 rounded-lg transition-all ${activeColorMode === 'vendor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                        >
                            Vendor
                        </button>
                        <button
                            onClick={() => setActiveColorMode('domain')}
                            className={`px-4 py-1.5 rounded-lg transition-all ${activeColorMode === 'domain' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                        >
                            Dominio
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div 
                    ref={mapContainerRef}
                    className={`lg:col-span-2 bg-[#0a111a] rounded-[2rem] overflow-hidden border border-gray-200 relative shadow-sm ${isFullscreen ? 'h-screen' : 'h-[560px]'}`}
                >
                    <MapContainer 
                        center={viewPosition.center} 
                        zoom={viewPosition.zoom} 
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                        attributionControl={false}
                        maxZoom={18}
                        minZoom={2}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            className="custom-map-tiles"
                        />
                        <ZoomControl position="bottomright" />
                        <MapViewUpdater center={viewPosition.center} zoom={viewPosition.zoom} />
                        
                        <MarkerClusterGroup
                            chunkedLoading
                            iconCreateFunction={createClusterCustomIcon}
                            spiderfyOnMaxZoom={true}
                            showCoverageOnHover={false}
                            maxClusterRadius={30}
                            disableClusteringAtZoom={14}
                        >
                            {filteredPartners.map((p, idx) => (
                                p.lat && p.lng && (
                                    <Marker 
                                        key={`${p.company_name}-${idx}`} 
                                        position={[p.lat, p.lng]} 
                                        icon={createCustomIcon(getColor(p))}
                                        eventHandlers={{
                                            click: () => setSelectedPartner(p)
                                        }}
                                    >
                                        <Popup minWidth={260}>
                                            <div className="p-3">
                                                <div className="border-b border-gray-100 pb-2 mb-2">
                                                    <p className="font-extrabold text-gray-900 text-sm leading-tight">{p.company_name}</p>
                                                    <div className="mt-1 space-y-0.5">
                                                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" /> {p.city}, {p.country}
                                                        </p>
                                                        {p.address && (
                                                            <p className="text-[9px] text-gray-400 italic truncate ml-4 mb-1">{p.address}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Nivel Partner HPE</p>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-black border ${
                                                                p.hpe_certification === 'Triple Platinum Plus' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                                p.hpe_certification === 'Platinum' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                p.hpe_certification === 'Gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                p.hpe_certification === 'Silver' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                                                                'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                            }`}>
                                                                {p.hpe_certification || 'Business Partner'}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1 px-2">País</p>
                                                            <p className="text-[10px] font-bold text-gray-700 px-2">{p.country}</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Marcas OEM</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {(p.vendors || [p.vendor]).map(v => (
                                                                <span key={v} className="text-[8px] px-2 py-0.5 rounded-md font-black text-white uppercase shadow-sm" style={{ backgroundColor: VENDOR_COLORS[v] || '#01A982' }}>
                                                                    {v}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {p.virtualization_techs && p.virtualization_techs.length > 0 && (
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Tecnologías Virtualización</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {p.virtualization_techs.slice(0, 4).map(tech => (
                                                                    <span key={tech} className="text-[8px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold border border-blue-100">
                                                                        {tech}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                                        {p.website ? (
                                                            <a 
                                                                href={`https://${p.website.replace(/^https?:\/\//, '')}`} 
                                                                target="_blank" 
                                                                className="text-[10px] text-[#01A982] font-black hover:underline flex items-center gap-1"
                                                            >
                                                                {p.website.replace(/^https?:\/\//, '').substring(0, 20)}{p.website.length > 20 ? '...' : ''} <Globe className="h-2.5 w-2.5" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-[9px] font-bold text-gray-300 italic">Web no disponible</span>
                                                        )}
                                                        <button 
                                                            onClick={() => setSelectedPartner(p)}
                                                            className="text-[9px] font-black text-gray-400 italic hover:text-[#01A982] transition-colors cursor-pointer flex items-center gap-1"
                                                        >
                                                            Más detalles <span className="text-[12px] -mt-0.5">→</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            ))}
                        </MarkerClusterGroup>
                    </MapContainer>
                    
                    <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
                        <button 
                            onClick={fetchPartners}
                            className={`p-3 rounded-2xl shadow-xl transition-all border border-gray-100 ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50 hover:scale-110 active:scale-95'}`}
                        >
                            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin text-gray-400' : 'text-[#01A982]'}`} />
                        </button>
                        <button 
                            onClick={toggleFullscreen}
                            className="p-3 rounded-2xl shadow-xl transition-all border border-gray-100 bg-white hover:bg-gray-50 hover:scale-110 active:scale-95"
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-5 w-5 text-gray-600" />
                            ) : (
                                <Maximize2 className="h-5 w-5 text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>

                <div className={`${isFullscreen ? 'hidden' : 'flex'} flex-col gap-6`}>
                    {selectedPartner ? (
                        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-xl border-t-4 border-t-[#01A982] animate-in fade-in slide-in-from-right duration-500">
                            <div className="flex items-start justify-between mb-6">
                                <h4 className="font-extrabold text-gray-900 text-lg leading-tight tracking-tight">{selectedPartner.company_name}</h4>
                                <button onClick={() => setSelectedPartner(null)} className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">×</button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                                                <MapPin className="h-2.5 w-2.5" /> Dirección 
                                            </p>
                                            <p className="font-bold text-gray-800 text-xs">{selectedPartner.address || `${selectedPartner.city}, ${selectedPartner.country}`}</p>
                                        </div>
                                        {selectedPartner.hpe_certification && selectedPartner.hpe_certification !== 'None' && (
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Nivel HPE</p>
                                                <Badge className={`border text-[10px] ${
                                                    selectedPartner.hpe_certification === 'Triple Platinum Plus' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                    selectedPartner.hpe_certification === 'Platinum' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                    selectedPartner.hpe_certification === 'Gold' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    selectedPartner.hpe_certification === 'Silver' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                                                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                }`}>
                                                    {selectedPartner.hpe_certification}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Portafolio OEM</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedPartner.vendors || [selectedPartner.vendor]).map(v => (
                                            <span key={v} className="px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-wider shadow-sm" style={{ backgroundColor: VENDOR_COLORS[v] ?? '#6366f1' }}>
                                                {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {selectedPartner.virtualization_techs && selectedPartner.virtualization_techs.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Virtualización & Cloud</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPartner.virtualization_techs.map(tech => (
                                                <span key={tech} className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#01A982]">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-[12px]">Gerente de Canal</p>
                                            <p className="text-[10px] font-bold text-gray-400">Punto de Contacto</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-[12px]">{selectedPartner.phone || '+34 91 123 45 67'}</p>
                                            <p className="text-[10px] font-bold text-gray-400">Direct Line</p>
                                        </div>
                                    </div>
                                </div>
                                {selectedPartner.website && (
                                    <div className="mt-4 p-4 bg-[#01A982]/5 rounded-2xl border border-[#01A982]/10 flex flex-col items-center">
                                        <p className="text-[10px] font-bold text-[#01A982] uppercase mb-2">Sitio Web Oficial</p>
                                        <a 
                                            href={`https://${selectedPartner.website.replace(/^https?:\/\//, '')}`}
                                            target="_blank" rel="noopener"
                                            className="text-[#01A982] font-black text-sm hover:underline break-all text-center flex items-center gap-2"
                                        >
                                            {selectedPartner.website.replace(/^https?:\/\//, '')} <Globe className="h-3 w-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center flex flex-col items-center gap-4 transition-all hover:border-[#01A982]/20">
                            <div className="h-16 w-16 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-slate-200">
                                <MapPin className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Información de Partner</p>
                                <p className="text-slate-400 text-xs leading-relaxed max-w-[180px]">Selecciona un partner en el mapa para ver sus detalles y marcas representadas.</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Presencia Global</h5>
                            <span className="text-[10px] font-black text-[#01A982] bg-[#01A982]/10 px-3 py-1 rounded-full uppercase">Analíticos</span>
                        </div>
                        <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                            {Object.entries(filteredCountryGroups)
                                .sort((a, b) => b[1] - a[1])
                                .map(([country, count], idx) => (
                                    <div 
                                        key={country} 
                                        onClick={() => zoomToCountry(country)}
                                        className="flex items-center gap-4 cursor-pointer group hover:bg-gray-50 p-2 -m-2 rounded-2xl transition-all"
                                    >
                                        <span className="text-[11px] text-gray-600 font-black w-20 truncate tracking-tight">{country}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{ 
                                                    width: `${(count / Math.max(...Object.values(filteredCountryGroups))) * 100}%`,
                                                    backgroundColor: SOFT_PALETTE[idx % SOFT_PALETTE.length] 
                                                }}
                                            />
                                        </div>
                                        <span className="text-[11px] font-black text-[#01A982] w-4 text-right">{count}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
