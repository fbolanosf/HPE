'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { CUSTOMER_DATABASE, scoreCustomer, Customer } from '@/lib/customer-intelligence-data';
import 'leaflet/dist/leaflet.css';
import { X, Building2, MapPin, Server, Cloud, Users, Activity, Zap, RefreshCcw, AlertTriangle, Monitor, Check, CloudOff } from 'lucide-react';

// Tier styling (Hot=green, Warm=yellow, Cold=red)
const TIER_COLORS: Record<string, string> = {
    Hot: '#16a34a',
    Warm: '#d97706',
    Cold: '#dc2626',
};

const TIER_BADGE: Record<string, string> = {
    Hot: 'bg-green-100 text-green-700 border border-green-200',
    Warm: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    Cold: 'bg-red-100 text-red-700 border border-red-200',
};

interface Props { filterRegion?: string; }

type ScoredCustomer = Customer & { score: number; tier: string };

function CustomerCard({ customer, onClose }: { customer: ScoredCustomer; onClose: () => void }) {
    const { score, tier } = customer;
    const signals = [
        customer.broadcom_pricing_impact && { label: 'Impacto Broadcom', icon: Zap, color: 'text-orange-600 bg-orange-50 border-orange-200' },
        customer.vmware_license_renewal_due && { label: 'Renovación VMware', icon: RefreshCcw, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        customer.vmware_version_eol && { label: 'VMware EOL', icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200' },
        customer.datacenter_refresh_cycle && { label: 'DC Refresh', icon: Server, color: 'text-purple-600 bg-purple-50 border-purple-200' },
        customer.existing_hpe_hardware && { label: 'HPE Hardware', icon: Check, color: 'text-teal-600 bg-teal-50 border-teal-200' },
        customer.cloud_repatriation_interest && { label: 'Cloud Repatriation', icon: CloudOff, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
        customer.hpe_greenlake_interest && { label: 'GreenLake', icon: Activity, color: 'text-[#01A982] bg-[#e6f7f2] border-[#b3e8d9]' },
    ].filter(Boolean) as { label: string; icon: React.ElementType; color: string }[];

    return (
        <div className="w-80 bg-white shadow-2xl border border-gray-200 rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: '70vh' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4 flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-sm leading-snug truncate">{customer.company_name}</h3>
                    <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 flex-shrink-0" />{customer.city}, {customer.country}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TIER_BADGE[tier]}`}>{tier === 'Hot' ? 'Alta' : tier === 'Warm' ? 'Media' : 'Baja'}</span>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Score bar */}
            <div className="px-4 py-2 bg-slate-50 border-b border-gray-100 flex items-center gap-3">
                <span className="text-xs text-gray-500 whitespace-nowrap">Score HPE</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                        width: `${Math.min(100, (score / 40) * 100)}%`,
                        backgroundColor: TIER_COLORS[tier],
                    }} />
                </div>
                <span className="text-sm font-black text-gray-900 w-8 text-right">{score}</span>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {/* Data grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500"><Building2 className="h-3 w-3 text-gray-400" /><span>Industria</span></div>
                    <div className="text-gray-800 font-medium text-right truncate">{customer.industry.split('/')[0].trim()}</div>

                    <div className="flex items-center gap-1.5 text-gray-500"><Server className="h-3 w-3 text-gray-400" /><span>Hypervisor</span></div>
                    <div className="text-right"><span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${customer.current_hypervisor === 'VMware' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{customer.current_hypervisor}</span></div>

                    <div className="flex items-center gap-1.5 text-gray-500"><Cloud className="h-3 w-3 text-gray-400" /><span>Cloud</span></div>
                    <div className="text-gray-800 font-medium text-right text-[10px]">{customer.cloud_adoption}</div>

                    <div className="flex items-center gap-1.5 text-gray-500"><Monitor className="h-3 w-3 text-gray-400" /><span>Servidores</span></div>
                    <div className="text-gray-800 font-medium text-right">{customer.estimated_servers.toLocaleString('en-US')}</div>

                    <div className="flex items-center gap-1.5 text-gray-500"><Users className="h-3 w-3 text-gray-400" /><span>Empleados</span></div>
                    <div className="text-gray-800 font-medium text-right">{customer.estimated_employees.toLocaleString('en-US')}</div>
                </div>

                {/* Signals */}
                {signals.length > 0 && (
                    <div>
                        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Señales de Oportunidad</div>
                        <div className="flex flex-wrap gap-1">
                            {signals.map(({ label, icon: Icon, color }) => (
                                <span key={label} className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded border ${color}`}>
                                    <Icon className="h-2.5 w-2.5" />{label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pain points */}
                {customer.pain_points && customer.pain_points.length > 0 && (
                    <div>
                        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pain Points</div>
                        <ul className="space-y-0.5">
                            {customer.pain_points.map((p, i) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                    <span className="text-red-400 mt-0.5 flex-shrink-0">—</span>{p}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Description */}
                {customer.description && (
                    <p className="text-[10px] text-gray-500 italic border-t border-gray-100 pt-2">{customer.description}</p>
                )}

                {/* Website */}
                <a href={`https://${customer.website}`} target="_blank" rel="noopener noreferrer"
                    className="block text-center text-xs font-semibold text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg py-1.5 transition-colors mt-1">
                    Visitar sitio web
                </a>
            </div>
        </div>
    );
}

export default function CustomerGeoMap({ filterRegion }: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapInstance = useRef<any>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<ScoredCustomer | null>(null);

    const customers = useMemo(() => {
        return CUSTOMER_DATABASE
            .filter(c => c.latitude && c.longitude)
            .filter(c => !filterRegion || filterRegion === 'ALL' || c.region === filterRegion)
            .map(c => ({ ...c, ...scoreCustomer(c) }));
    }, [filterRegion]);

    useEffect(() => {
        if (typeof window === 'undefined' || !mapRef.current) return;

        let L: typeof import('leaflet');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let map: any;

        const initMap = async () => {
            L = (await import('leaflet')).default;

            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }

            map = L.map(mapRef.current!, {
                center: [15, -30],
                zoom: 3,
                zoomControl: true,
                attributionControl: false,
            });

            // ESRI World Street Map — proper blue ocean, no API key required
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 18,
            }).addTo(map);

            customers.forEach(c => {
                const color = TIER_COLORS[c.tier] ?? '#6b7280';
                const radius = c.company_size === 'Large Enterprise' ? 13 : c.company_size === 'Enterprise' ? 10 : 7;

                const marker = L.circleMarker([c.latitude!, c.longitude!], {
                    radius,
                    fillColor: color,
                    color: '#fff',
                    weight: 2.5,
                    opacity: 1,
                    fillOpacity: 0.92,
                }).addTo(map);

                marker.on('click', () => {
                    setSelectedCustomer(c);
                });

                marker.bindTooltip(`<strong>${c.company_name}</strong><br/><small>${c.country} · Score: ${c.score}</small>`, {
                    direction: 'top', offset: [0, -8],
                });
            });

            mapInstance.current = map;

            if (customers.length > 0) {
                const bounds = L.latLngBounds(customers.map(c => [c.latitude!, c.longitude!]));
                map.fitBounds(bounds, { padding: [40, 40] });
            }
        };

        initMap();
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customers]);

    return (
        <div className="relative w-full flex gap-3" style={{ height: '70vh', minHeight: 500 }}>
            {/* Map */}
            <div className="relative flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <div ref={mapRef} className="w-full h-full" />

                {/* Legend */}
                <div className="absolute bottom-4 left-4 z-[999] bg-white/95 shadow-md border border-gray-200 rounded-lg p-3 text-xs space-y-1.5">
                    <div className="font-semibold text-[10px] text-gray-500 uppercase tracking-wide mb-1">Prioridad de Venta</div>
                    {[
                        { tier: 'Hot', label: 'Alta (score ≥ 18)', color: TIER_COLORS.Hot },
                        { tier: 'Warm', label: 'Media (9 - 17)', color: TIER_COLORS.Warm },
                        { tier: 'Cold', label: 'Baja (< 9)', color: TIER_COLORS.Cold },
                    ].map(({ label, color }) => (
                        <div key={label} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full inline-block flex-shrink-0 border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
                            <span className="text-gray-700">{label}</span>
                        </div>
                    ))}
                    <div className="border-t border-gray-100 pt-1 text-gray-400 text-[9px]">Tamaño proporcional al nivel de empresa</div>
                </div>

                {/* Stats overlay */}
                <div className="absolute top-4 right-4 z-[999] bg-white/95 shadow-md border border-gray-200 rounded-lg p-3 text-xs">
                    <div className="font-semibold mb-1.5 text-gray-700 text-[10px] uppercase tracking-wide">Prospects en mapa</div>
                    {[
                        { tier: 'Hot', label: 'Alta', color: TIER_COLORS.Hot },
                        { tier: 'Warm', label: 'Media', color: TIER_COLORS.Warm },
                        { tier: 'Cold', label: 'Baja', color: TIER_COLORS.Cold },
                    ].map(({ tier, label, color }) => (
                        <div key={tier} className="flex justify-between gap-6 py-0.5">
                            <span style={{ color }}>{label}</span>
                            <span className="font-bold text-gray-900">{customers.filter(c => c.tier === tier).length}</span>
                        </div>
                    ))}
                </div>

                {/* Click hint */}
                {!selectedCustomer && (
                    <div className="absolute bottom-4 right-4 z-[999] bg-white/90 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 shadow-sm">
                        Selecciona un punto para ver el perfil
                    </div>
                )}
            </div>

            {/* Right panel — customer card */}
            {selectedCustomer && (
                <div className="flex-shrink-0 flex items-start" style={{ maxHeight: '70vh' }}>
                    <CustomerCard customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
                </div>
            )}
        </div>
    );
}
