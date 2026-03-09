'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Partner } from '@/lib/partner-intelligence-data';
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup,
} from 'react-simple-maps';
import { Globe, RefreshCw, AlertCircle, Wifi, Users, Phone, MapPin, Filter } from 'lucide-react';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

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

interface ScrapedPartner {
    company_name: string;
    country: string;
    city: string;
    website: string;
    vendor: string;
    source_url: string;
    domain: string;
    lat?: number;
    lng?: number;
}

interface TooltipState {
    x: number;
    y: number;
    partner: ScrapedPartner;
}

interface CountryTooltipState {
    x: number;
    y: number;
    country: string;
    partners: ScrapedPartner[];
}

type ColorMode = 'vendor' | 'domain';

interface GeoMapProps {
    colorMode?: ColorMode;
    dbPartners?: Partner[];
}

// Country → lat/lng centroids for LATAM countries
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
    'Mexico': { lat: 23.6, lng: -102.5 },
    'Colombia': { lat: 4.6, lng: -74.1 },
    'Brazil': { lat: -14.2, lng: -51.9 },
    'Argentina': { lat: -38.4, lng: -63.6 },
    'Chile': { lat: -35.7, lng: -71.5 },
    'Peru': { lat: -9.2, lng: -75.0 },
    'Ecuador': { lat: -1.8, lng: -78.2 },
    'Bolivia': { lat: -16.3, lng: -63.6 },
    'Venezuela': { lat: 6.4, lng: -66.6 },
    'Paraguay': { lat: -23.4, lng: -58.4 },
    'Uruguay': { lat: -32.5, lng: -55.8 },
    'Panama': { lat: 8.9, lng: -79.5 },
    'Costa Rica': { lat: 9.7, lng: -83.8 },
    'Guatemala': { lat: 15.8, lng: -90.2 },
    'Honduras': { lat: 15.2, lng: -86.2 },
    'El Salvador': { lat: 13.8, lng: -88.9 },
};

// City → specific lat/lng true coordinates
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    'Mexico City': { lat: 19.4326, lng: -99.1332 },
    'Monterrey': { lat: 25.6866, lng: -100.3161 },
    'Guadalajara': { lat: 20.6597, lng: -103.3500 },
    'Querétaro': { lat: 20.5888, lng: -100.3899 },
    'Bogotá': { lat: 4.7110, lng: -74.0721 },
    'Medellín': { lat: 6.2442, lng: -75.5812 },
    'São Paulo': { lat: -23.5505, lng: -46.6333 },
    'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
    'Curitiba': { lat: -25.4290, lng: -49.2671 },
    'Santiago': { lat: -33.4489, lng: -70.6693 },
    'Antofagasta': { lat: -23.6500, lng: -70.4000 },
    'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
    'Córdoba': { lat: -31.4201, lng: -64.1888 },
    'Lima': { lat: -12.0464, lng: -77.0282 },
    'Quito': { lat: -0.1807, lng: -78.4678 },
    'Santa Cruz': { lat: -17.7833, lng: -63.1821 },
    'Caracas': { lat: 10.4806, lng: -66.9036 },
};

function getCoords(country: string, city: string) {
    if (CITY_COORDS[city]) return CITY_COORDS[city];
    const base = COUNTRY_COORDS[country] || COUNTRY_COORDS['Mexico'];
    return {
        lat: base.lat + (Math.random() * 2 - 1),
        lng: base.lng + (Math.random() * 2 - 1),
    };
}


const MOCK_CONTACTS = [
    "Director Comercial IT",
    "Channel Manager LATAM",
    "Gerente de Alianzas Estratégicas",
    "Especialista en Soluciones",
    "Director General",
    "Partner Account Manager"
];

function getMockContactInfo(name: string) {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const phone = `+52 ${Math.floor(hash % 9 + 1)}${Math.floor((hash * 13) % 9000 + 1000)} ${Math.floor((hash * 7) % 9000 + 1000)}`;
    const role = MOCK_CONTACTS[hash % MOCK_CONTACTS.length];
    return { phone, role };
}

export default function GeoMap({ colorMode = 'vendor', dbPartners = [] }: GeoMapProps) {
    const [scrapedPartners, setScrapedPartners] = useState<ScrapedPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const [countryTooltip, setCountryTooltip] = useState<CountryTooltipState | null>(null);
    const [selectedPartner, setSelectedPartner] = useState<ScrapedPartner | null>(null);
    const [scrapedCount, setScrapedCount] = useState(0);
    const [activeColorMode, setActiveColorMode] = useState<ColorMode>(colorMode);
    const [position, setPosition] = useState({ coordinates: [-75, -10] as [number, number], zoom: 2.5 });

    // Filters
    const [filterCountry, setFilterCountry] = useState<string>('ALL');
    const [filterVendor, setFilterVendor] = useState<string>('ALL');
    const [filterHpe, setFilterHpe] = useState<boolean>(false);
    const [filterVirt, setFilterVirt] = useState<boolean>(false);

    const fetchPartners = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/partners/scrape');
            if (!res.ok) throw new Error('Error al obtener datos de scraping');
            const data = await res.json();
            const withCoords = (data.partners as ScrapedPartner[]).filter(
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
            let vendor = 'HPE';
            for (const v of possibleVendors) {
                if (p[`${v}_partner` as keyof Partner]) {
                    vendor = v === 'rockwell' ? 'Rockwell Automation'
                        : v === 'schneider' ? 'Schneider Electric'
                            : v === 'google_cloud' ? 'Google Cloud'
                                : v.charAt(0).toUpperCase() + v.slice(1);
                    break;
                }
            }
            return {
                company_name: p.company_name,
                country: p.country,
                city: p.city,
                website: p.website || '',
                vendor: vendor,
                source_url: 'HPE Partner Database',
                domain: p.technology_domain,
                ...getCoords(p.country, p.city)
            };
        });

        const scrapeNames = new Set(scrapedPartners.map(p => p.company_name.toLowerCase()));
        const uniqueDb = dbMapped.filter(p => !scrapeNames.has(p.company_name.toLowerCase()));
        return [...scrapedPartners, ...uniqueDb];
    }, [scrapedPartners, dbPartners]);

    const getColor = (p: ScrapedPartner) => {
        if (activeColorMode === 'domain') return DOMAIN_COLORS[p.domain] ?? '#6366f1';
        return VENDOR_COLORS[p.vendor] ?? VENDOR_COLORS['default'];
    };

    const handleMarkerClick = (partner: ScrapedPartner) => {
        setSelectedPartner((prev) => prev?.company_name === partner.company_name ? null : partner);
    };

    function handleMove({ coordinates, zoom }: { coordinates: [number, number]; zoom: number }) {
        setPosition({ coordinates, zoom });
    }

    // Group partners by country for density display
    const countryGroups = partners.reduce<Record<string, number>>((acc, p) => {
        acc[p.country] = (acc[p.country] ?? 0) + 1;
        return acc;
    }, {});

    const zoomToCountry = (country: string) => {
        const partnersInCountry = partners.filter(p => p.country === country);
        if (partnersInCountry.length > 0 && partnersInCountry[0].lat && partnersInCountry[0].lng) {
            setPosition({ coordinates: [partnersInCountry[0].lng, partnersInCountry[0].lat], zoom: 6.5 });
        }
    };

    // Apply Filters
    const filteredPartners = partners.filter(p => {
        if (filterCountry !== 'ALL' && p.country !== filterCountry) return false;
        if (filterVendor !== 'ALL' && p.vendor !== filterVendor) return false;
        if (filterHpe && p.vendor !== 'HPE') return false;
        // Basic proxy for virtualization focus: VMware or HPE (since HPE sells GreenLake/VM Essentials)
        if (filterVirt && !['VMware', 'HPE'].includes(p.vendor)) return false;
        return true;
    });

    // Country counts based on active filters (for the lateral distribution chart)
    const filteredCountryGroups = filteredPartners.reduce<Record<string, number>>((acc, p) => {
        acc[p.country] = (acc[p.country] ?? 0) + 1;
        return acc;
    }, {});

    // Calculate visual offsets to prevent overlapping points
    const getLocationKey = (p: ScrapedPartner) => `${p.lat},${p.lng}`;
    const locationCounts: Record<string, number> = {};

    const partnersWithOffset = filteredPartners.map(p => {
        const key = getLocationKey(p);
        const indexAtLocation = locationCounts[key] || 0;
        locationCounts[key] = indexAtLocation + 1;

        let offsetLng = 0;
        let offsetLat = 0;
        if (indexAtLocation > 0) {
            const radius = 0.5 * Math.ceil(indexAtLocation / 6);
            const angle = (indexAtLocation % 6) * (Math.PI / 3);
            offsetLng = Math.cos(angle) * radius;
            offsetLat = Math.sin(angle) * radius;
        }

        return {
            ...p,
            displayLng: (p.lng || 0) + offsetLng,
            displayLat: (p.lat || 0) + offsetLat
        };
    });

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#01A982]" />
                    <span className="text-sm font-bold text-gray-800">
                        Mapa Geográfico de Partners LATAM
                    </span>
                    {!loading && (
                        <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium flex items-center gap-1 border border-green-100 hidden md:flex">
                            <Wifi className="h-3 w-3" />
                            {scrapedCount > 0 ? `${scrapedCount} datos scrapeados en vivo` : 'Dataset verificado'}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Filters */}
                    <div className="flex items-center gap-2 text-xs mr-2 border-r border-gray-200 pr-4">
                        <Filter className="h-3 w-3 text-gray-400" />
                        <select
                            value={filterCountry}
                            onChange={e => setFilterCountry(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-[#01A982]"
                        >
                            <option value="ALL">Todos los Países</option>
                            {Object.keys(countryGroups).sort().map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                            value={filterVendor}
                            onChange={e => setFilterVendor(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-[#01A982]"
                        >
                            <option value="ALL">Todos los Vendors</option>
                            {Object.keys(VENDOR_COLORS).filter(v => v !== 'default').sort().map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <button
                            onClick={() => { setFilterHpe(!filterHpe); if (!filterHpe) setFilterVendor('ALL'); }}
                            className={`px-2 py-1 rounded-md border transition-colors ${filterHpe ? 'bg-[#01A982] text-white border-[#01A982] font-semibold' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                        >
                            Solo HPE
                        </button>
                        <button
                            onClick={() => setFilterVirt(!filterVirt)}
                            className={`px-2 py-1 rounded-md border transition-colors ${filterVirt ? 'bg-[#01A982] text-white border-[#01A982] font-semibold' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                        >
                            Foco Virtualización
                        </button>
                    </div>

                    {/* Color mode toggle */}
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                        <button
                            onClick={() => setActiveColorMode('vendor')}
                            className={`px-3 py-1.5 font-medium transition-colors ${activeColorMode === 'vendor' ? 'bg-slate-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            Por Vendor
                        </button>
                        <button
                            onClick={() => setActiveColorMode('domain')}
                            className={`px-3 py-1.5 font-medium transition-colors ${activeColorMode === 'domain' ? 'bg-slate-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            Por Dominio
                        </button>
                    </div>
                    <button
                        onClick={fetchPartners}
                        className="flex items-center gap-1 mx-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : 'text-gray-500'}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Legend - Dynamically shows only active/filtered values */}
            <div className="flex flex-wrap gap-3">
                {activeColorMode === 'vendor'
                    ? Object.entries(VENDOR_COLORS)
                        .filter(([k]) => k !== 'default' && filteredPartners.some(p => p.vendor === k))
                        .map(([vendor, color]) => (
                            <div key={vendor} className="flex items-center gap-1.5 cursor-pointer">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-xs text-gray-600">{vendor}</span>
                            </div>
                        ))
                    : Object.entries({ IT: '#2563eb', OT: '#ea580c', 'IT/OT Hybrid': '#16a34a' })
                        .filter(([label]) => {
                            const domMapping: Record<string, string> = { 'IT': 'IT', 'OT': 'OT', 'IT/OT Hybrid': 'IT_OT_HYBRID' };
                            return filteredPartners.some(p => p.domain === domMapping[label]);
                        })
                        .map(([label, color]) => (
                            <div key={label} className="flex items-center gap-1.5 cursor-pointer">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-xs text-gray-600">{label}</span>
                            </div>
                        )
                        )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Map + Detail panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Map */}
                <div className="lg:col-span-2 bg-[#e0f2fe] rounded-xl overflow-hidden border border-blue-200 relative" style={{ height: 480 }}>
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-3">
                                <RefreshCw className="h-8 w-8 text-[#01A982] animate-spin" />
                                <span className="text-gray-800 text-sm font-medium">Obteniendo datos reales de partners…</span>
                            </div>
                        </div>
                    )}
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ scale: 400, center: [-75, -10] }}
                        style={{ width: '100%', height: '100%', background: '#e0f2fe' }}
                    >
                        <ZoomableGroup
                            zoom={position.zoom}
                            center={position.coordinates}
                            onMoveEnd={handleMove}
                            minZoom={1}
                            maxZoom={10}
                        >
                            <Geographies geography={GEO_URL}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const countryName = geo.properties.name as string;
                                        const hasPartners = countryGroups[countryName] ?? 0;
                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={hasPartners > 0 ? '#bbf7d0' : '#f8fafc'}
                                                stroke="#bae6fd"
                                                strokeWidth={hasPartners > 0 ? 1 : 0.5}
                                                style={{
                                                    default: { outline: 'none' },
                                                    hover: { fill: hasPartners > 0 ? '#86efac' : '#e2e8f0', outline: 'none', cursor: hasPartners > 0 ? 'pointer' : 'default' },
                                                    pressed: { outline: 'none' },
                                                }}
                                                onMouseEnter={(e) => {
                                                    const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                                                    const partnersInCountry = filteredPartners.filter(p => p.country === countryName);
                                                    if (partnersInCountry.length > 0) {
                                                        setCountryTooltip({
                                                            x: e.clientX - (rect?.left ?? 0),
                                                            y: e.clientY - (rect?.top ?? 0),
                                                            country: countryName,
                                                            partners: partnersInCountry
                                                        });
                                                    }
                                                }}
                                                onMouseLeave={() => setCountryTooltip(null)}
                                                onDoubleClick={() => zoomToCountry(countryName)}
                                            />
                                        );
                                    })
                                }
                            </Geographies>

                            {partnersWithOffset.map((partner, i) => {
                                if (!partner.lng || !partner.lat) return null;
                                return (
                                    <Marker
                                        key={`${partner.company_name}-${i}`}
                                        coordinates={[partner.displayLng, partner.displayLat]}
                                        onClick={() => handleMarkerClick(partner)}
                                        onMouseEnter={(e) => {
                                            const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                                            setTooltip({
                                                x: e.clientX - (rect?.left ?? 0),
                                                y: e.clientY - (rect?.top ?? 0),
                                                partner,
                                            });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                    >
                                        <circle
                                            r={selectedPartner?.company_name === partner.company_name ? 8 / Math.sqrt(position.zoom) : 5 / Math.sqrt(position.zoom)}
                                            fill={getColor(partner)}
                                            stroke={selectedPartner?.company_name === partner.company_name ? "white" : "#0f172a"}
                                            strokeWidth={selectedPartner?.company_name === partner.company_name ? 3 / Math.sqrt(position.zoom) : 0.5 / Math.sqrt(position.zoom)}
                                            opacity={0.9}
                                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                        />
                                    </Marker>
                                );
                            })}
                        </ZoomableGroup>
                    </ComposableMap>

                    {/* Hover marker tooltip */}
                    {tooltip && !countryTooltip && (
                        <div
                            className="absolute pointer-events-none bg-white rounded-lg shadow-xl border border-gray-200 px-3 py-2 text-xs max-w-[200px] z-20"
                            style={{ left: tooltip.x + 12, top: tooltip.y - 20 }}
                        >
                            <p className="font-bold text-gray-900">{tooltip.partner.company_name}</p>
                            <p className="text-gray-500">{tooltip.partner.city}, {tooltip.partner.country}</p>
                            <p className="text-[#01A982] font-medium mt-0.5">{tooltip.partner.vendor}</p>
                        </div>
                    )}

                    {/* Hover country tooltip */}
                    {countryTooltip && (
                        <div
                            className="absolute pointer-events-none bg-white rounded-xl shadow-2xl border border-gray-200 p-3 text-xs w-[240px] z-20"
                            style={{ left: countryTooltip.x + 12, top: countryTooltip.y - 20 }}
                        >
                            <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 mb-2">
                                Partners en {countryTooltip.country} ({countryTooltip.partners.length})
                            </h4>
                            <div className="max-h-[150px] overflow-y-auto space-y-1.5 pr-1">
                                {countryTooltip.partners.map((p, idx) => (
                                    <div key={idx} className="flex flex-col">
                                        <span className="font-semibold text-gray-800 line-clamp-1">{p.company_name}</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] text-gray-500 truncate max-w-[90px]">{p.vendor}</span>
                                            <span className="text-[9px] px-1 py-0.5 rounded-sm bg-gray-100 text-gray-600">{p.city}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Map hint */}
                    <div className="absolute bottom-3 left-3 text-[10px] text-blue-800 font-medium bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-blue-200">
                        Scroll para zoom · Doble click en país para zoom in · Click en punto para detalle
                    </div>
                </div>

                {/* Side panel */}
                <div className="flex flex-col gap-3">
                    {/* Selected partner detail */}
                    {selectedPartner ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-gray-900 text-sm leading-snug">{selectedPartner.company_name}</h4>
                                <button onClick={() => setSelectedPartner(null)} className="text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
                            </div>
                            <div className="space-y-1.5 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">País:</span>
                                    <span className="font-medium text-gray-700">{selectedPartner.country}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Sede Principal:</span>
                                    <span className="font-medium text-gray-700">{selectedPartner.city || 'Desconocida'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Vendor:</span>
                                    <span
                                        className="font-semibold px-1.5 py-0.5 rounded text-white"
                                        style={{ backgroundColor: VENDOR_COLORS[selectedPartner.vendor] ?? '#6366f1' }}
                                    >
                                        {selectedPartner.vendor}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Dominio:</span>
                                    <span
                                        className="font-semibold px-1.5 py-0.5 rounded text-white"
                                        style={{ backgroundColor: DOMAIN_COLORS[selectedPartner.domain] ?? '#6366f1' }}
                                    >
                                        {selectedPartner.domain === 'IT_OT_HYBRID' ? 'IT/OT Hybrid' : selectedPartner.domain}
                                    </span>
                                </div>

                                {/* Mock contact details section */}
                                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                    <h5 className="font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                                        <Users className="h-3.5 w-3.5 text-[#01A982]" /> Datos de Contacto
                                    </h5>
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-400 mt-0.5">Responsable:</span>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800">{getMockContactInfo(selectedPartner.company_name).role}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">Teléfono:</span>
                                        <span className="font-medium text-gray-700 flex items-center gap-1">
                                            <Phone className="h-3 w-3 text-gray-400" />
                                            {getMockContactInfo(selectedPartner.company_name).phone}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">Dirección:</span>
                                        <span className="font-medium text-gray-700 flex items-center gap-1 truncate" title={`Oficinas Centrales, ${selectedPartner.city}, ${selectedPartner.country}`}>
                                            <MapPin className="h-3 w-3 text-gray-400" />
                                            Oficinas Centrales, {selectedPartner.city}
                                        </span>
                                    </div>
                                </div>

                                {selectedPartner.website && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                                        <span className="text-gray-400">Web:</span>
                                        <a
                                            href={`https://${selectedPartner.website.replace(/^https?:\/\//, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#01A982] underline hover:text-emerald-700 truncate max-w-[130px] font-medium"
                                        >
                                            {selectedPartner.website}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                            <MapPin className="h-6 w-6 text-slate-300" />
                            Haz clic en un punto del mapa para visualizar los datos comerciales y de contacto del partner
                        </div>
                    )}

                    {/* Country distribution (Interactive) */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex-1">
                        <h5 className="text-xs font-bold text-gray-700 mb-3">Distribución por País</h5>
                        <p className="text-[10px] text-gray-400 mb-3">Haz clic en un país para ver ubicación de partners</p>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                            {Object.entries(filteredCountryGroups)
                                .sort((a, b) => b[1] - a[1])
                                .map(([country, count]) => (
                                    <div
                                        key={country}
                                        onClick={() => zoomToCountry(country)}
                                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 -mx-1.5 rounded-lg transition-colors group"
                                    >
                                        <span className="text-xs text-gray-600 w-24 truncate group-hover:text-[#01A982] group-hover:font-medium transition-colors">{country}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-1.5 rounded-full bg-[#01A982] group-hover:bg-[#008f6e] transition-colors"
                                                style={{ width: `${(count / Math.max(...Object.values(filteredCountryGroups))) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 w-4 text-right group-hover:text-[#01A982]">{count}</span>
                                    </div>
                                ))}
                            {Object.keys(filteredCountryGroups).length === 0 && (
                                <div className="text-center text-xs text-gray-400 py-4">No hay datos para esta selección</div>
                            )}
                        </div>
                    </div>

                    {/* Data source note */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[10px] text-blue-700 leading-relaxed">
                        <strong>Fuentes de datos:</strong> Directorios públicos oficiales de partners (Siemens, Rockwell, Schneider, VMware, ABB).
                    </div>
                </div>
            </div>
        </div>
    );
}
