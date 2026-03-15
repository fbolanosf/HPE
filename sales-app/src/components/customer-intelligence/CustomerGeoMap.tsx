'use client';

import { useEffect, useRef, useMemo } from 'react';
import { CUSTOMER_DATABASE, scoreCustomer } from '@/lib/customer-intelligence-data';
import 'leaflet/dist/leaflet.css';

const TIER_COLORS: Record<string, string> = {
    Hot: '#ef4444',
    Warm: '#f59e0b',
    Cold: '#3b82f6',
};

interface Props {
    filterRegion?: string;
}

export default function CustomerGeoMap({ filterRegion }: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapInstance = useRef<any>(null);

    const customers = useMemo(() => {
        return CUSTOMER_DATABASE
            .filter(c => c.latitude && c.longitude)
            .filter(c => !filterRegion || filterRegion === 'ALL' || c.region === filterRegion)
            .map(c => ({ ...c, ...scoreCustomer(c) }));
    }, [filterRegion]);

    useEffect(() => {
        if (typeof window === 'undefined' || !mapRef.current) return;

        let L: typeof import('leaflet');
        let map: ReturnType<typeof L.map>;

        const initMap = async () => {
            L = (await import('leaflet')).default;

            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }

            map = L.map(mapRef.current!, {
                center: [15, -50],
                zoom: 3,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '©OpenStreetMap ©CartoDB',
                maxZoom: 18,
            }).addTo(map);

            customers.forEach(c => {
                const color = TIER_COLORS[c.tier] ?? '#6b7280';
                const radius = c.company_size === 'Large Enterprise' ? 14 : c.company_size === 'Enterprise' ? 11 : 8;

                const marker = L.circleMarker([c.latitude!, c.longitude!], {
                    radius,
                    fillColor: color,
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9,
                }).addTo(map);

                const broadcomBadge = c.broadcom_pricing_impact
                    ? `<span style="display:inline-block;background:#f97316;color:#fff;font-size:9px;padding:2px 5px;border-radius:4px;font-weight:700;margin-top:4px">⚡ Impacto Broadcom</span>`
                    : '';
                const hpeBadge = c.existing_hpe_hardware
                    ? `<span style="display:inline-block;background:#01A982;color:#fff;font-size:9px;padding:2px 5px;border-radius:4px;font-weight:700;margin-top:4px">HPE Hardware Exist.</span>`
                    : '';

                const painList = (c.pain_points ?? []).slice(0, 2)
                    .map(p => `<li style="margin-bottom:2px">• ${p}</li>`).join('');

                marker.bindPopup(`
                    <div style="font-family:system-ui,sans-serif;min-width:240px;padding:4px">
                        <div style="font-size:14px;font-weight:800;color:#111;margin-bottom:2px">${c.company_name}</div>
                        <div style="font-size:11px;color:#6b7280;margin-bottom:6px">${c.city}, ${c.country}</div>

                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
                            <span style="background:${color};color:#fff;font-size:10px;padding:2px 7px;border-radius:12px;font-weight:700">${c.tier}</span>
                            <span style="background:#f1f5f9;color:#374151;font-size:10px;padding:2px 7px;border-radius:12px">${c.industry}</span>
                        </div>

                        <table style="font-size:11px;width:100%;border-collapse:collapse">
                            <tr><td style="color:#6b7280;padding:2px 0">Hypervisor</td><td style="font-weight:600">${c.current_hypervisor}</td></tr>
                            <tr><td style="color:#6b7280;padding:2px 0">Servidores est.</td><td style="font-weight:600">${c.estimated_servers.toLocaleString()}</td></tr>
                            <tr><td style="color:#6b7280;padding:2px 0">Cloud</td><td style="font-weight:600">${c.cloud_adoption}</td></tr>
                            <tr><td style="color:#6b7280;padding:2px 0">Score HPE</td><td><strong style="color:#01A982">${c.score} pts</strong></td></tr>
                        </table>

                        ${painList ? `<div style="margin-top:6px"><div style="font-size:10px;font-weight:700;color:#dc2626;margin-bottom:2px">Pain Points:</div><ul style="font-size:10px;color:#374151;margin:0;padding:0;list-style:none">${painList}</ul></div>` : ''}

                        <div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">${broadcomBadge}${hpeBadge}</div>

                        ${c.description ? `<div style="margin-top:8px;font-size:10px;color:#6b7280;line-height:1.4;border-top:1px solid #f1f5f9;padding-top:6px">${c.description}</div>` : ''}
                        <a href="https://${c.website}" target="_blank" rel="noopener noreferrer"
                            style="display:inline-block;margin-top:8px;color:#01A982;font-size:10px;text-decoration:underline">${c.website}</a>
                    </div>
                `, { maxWidth: 300 });
            });

            mapInstance.current = map;

            // Fit bounds
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
        <div className="relative w-full" style={{ height: '70vh', minHeight: 480 }}>
            <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-[999] bg-gray-900/90 text-white rounded-lg p-3 text-xs space-y-1.5">
                <div className="font-bold text-[11px] text-gray-300 mb-1">Prioridad de Venta</div>
                {['Hot', 'Warm', 'Cold'].map(t => (
                    <div key={t} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: TIER_COLORS[t] }} />
                        <span>{t === 'Hot' ? '🔥 Hot (≥18)' : t === 'Warm' ? '⚡ Warm (9-17)' : '❄️ Cold (<9)'}</span>
                    </div>
                ))}
                <div className="border-t border-gray-700 pt-1.5 mt-1.5 text-gray-400">
                    Tamaño ∝ empresa
                </div>
            </div>

            {/* Stats overlay */}
            <div className="absolute top-4 right-4 z-[999] bg-gray-900/90 text-white rounded-lg p-3 text-xs">
                <div className="font-bold mb-1.5 text-gray-300">Prospects en mapa</div>
                {(['Hot', 'Warm', 'Cold'] as const).map(t => (
                    <div key={t} className="flex justify-between gap-6 py-0.5">
                        <span style={{ color: TIER_COLORS[t] }}>{t}</span>
                        <span className="font-bold">{customers.filter(c => c.tier === t).length}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
