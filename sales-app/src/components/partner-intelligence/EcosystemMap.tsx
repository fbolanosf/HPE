'use client';

import {
    PARTNER_DATABASE, scorePartner, DOMAIN_LABEL, PARTNER_TYPE_LABEL,
    TechnologyDomain, Partner
} from '@/lib/partner-intelligence-data';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { MapPin, Map, BarChart2 } from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const GeoMap = dynamic(() => import('./GeoMap'), {
    ssr: false, loading: () => (
        <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center text-sm text-slate-400">Cargando mapa geográfico…</div>
    )
});

const DOMAIN_COLORS: Record<TechnologyDomain, string> = {
    IT: '#2563eb',
    OT: '#ea580c',
    IT_OT_HYBRID: '#16a34a',
};

const DOMAIN_BG: Record<TechnologyDomain, string> = {
    IT: 'bg-blue-500',
    OT: 'bg-orange-500',
    IT_OT_HYBRID: 'bg-green-600',
};

const TIER_COLORS = {
    High: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-red-100 text-red-800',
};

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
    return (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${className}`}>
            {children}
        </span>
    );
}

const VENDOR_MAP: Partial<Record<keyof Partner, string>> = {
    vmware_partner: 'VMware',
    vxrail_partner: 'VxRail',
    dell_partner: 'Dell',
    hpe_partner: 'HPE',
    nutanix_partner: 'Nutanix',
    cisco_partner: 'Cisco',
    microsoft_partner: 'Microsoft',
    aws_partner: 'AWS',
    google_cloud_partner: 'Google Cloud',
    siemens_partner: 'Siemens',
    rockwell_partner: 'Rockwell',
    schneider_partner: 'Schneider',
    abb_partner: 'ABB',
    honeywell_partner: 'Honeywell',
    emerson_partner: 'Emerson',
    aveva_partner: 'AVEVA',
    yokogawa_partner: 'Yokogawa',
};

const VIRT_MAP: Partial<Record<keyof Partner, string>> = {
    virtualization: 'Virtualización',
    hci: 'HCI',
    datacenter_infrastructure: 'Datacenter',
    hybrid_cloud: 'Nube Híbrida',
    cloud_migration: 'Migración Cloud',
    backup_and_disaster_recovery: 'Backup & DR',
    container_platforms: 'Contenedores',
};

interface TooltipPayload {
    payload: {
        name: string;
        country: string;
        domain: TechnologyDomain;
        type: string;
        score: number;
        employees: number;
        hpe_certification?: string;
        website?: string;
        vendors?: string[];
        virtTechs?: string[];
        address?: string;
        city?: string;
    };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
    if (!active || !payload || payload.length === 0) return null;
    const d = payload[0].payload;
    
    return (
        <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl p-4 text-sm min-w-[260px] border-t-4 border-t-[#01A982] animate-in fade-in zoom-in duration-200">
            <div className="border-b border-gray-50 pb-2 mb-3">
                <p className="font-black text-gray-900 text-base leading-tight">{d.name}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: DOMAIN_COLORS[d.domain] + '15', color: DOMAIN_COLORS[d.domain] }}>
                        {DOMAIN_LABEL[d.domain]}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{d.type}</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Nivel Socio HPE</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-black border ${
                            d.hpe_certification === 'Triple Platinum Plus' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            d.hpe_certification === 'Platinum' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            d.hpe_certification === 'Gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            d.hpe_certification === 'Silver' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                            {d.hpe_certification || 'Business Partner'}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Score HPE</p>
                        <p className="text-sm font-black text-[#01A982]">{d.score}</p>
                    </div>
                </div>

                {d.vendors && d.vendors.length > 0 && (
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Marcas Aliadas</p>
                        <div className="flex flex-wrap gap-1">
                            {d.vendors.slice(0, 4).map(v => (
                                <span key={v} className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
                                    {v}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {d.virtTechs && d.virtTechs.length > 0 && (
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Especialización</p>
                        <div className="flex flex-wrap gap-1">
                            {d.virtTechs.slice(0, 3).map(tech => (
                                <span key={tech} className="text-[8px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold border border-blue-100">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-3 border-t border-gray-50 flex flex-col gap-1.5">
                    <p className="text-[9px] text-gray-400 italic flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" /> {d.address || `${d.city}, ${d.country}`}
                    </p>
                    {d.website && (
                        <p className="text-[9px] text-[#01A982] font-bold truncate">
                            {d.website}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Simplified Global Regions
const REGIONS = ['ALL', 'LATAM', 'Europe'];

type ViewMode = 'scatter' | 'geo';

export default function EcosystemMap() {
    const [selectedRegion, setSelectedRegion] = useState('ALL');
    const [selectedDomain, setSelectedDomain] = useState<TechnologyDomain | 'ALL'>('ALL');
    const [selectedCountry, setSelectedCountry] = useState<string | 'ALL'>('ALL');
    const [viewMode, setViewMode] = useState<ViewMode>('geo');
    const [dbPartners, setDbPartners] = useState<Partner[]>([]);

    useEffect(() => {
        setDbPartners([...PARTNER_DATABASE]);
        const interval = setInterval(() => {
            setDbPartners(current => {
                if (current.length !== PARTNER_DATABASE.length) return [...PARTNER_DATABASE];
                return current;
            });
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const chartData = useMemo(() => {
        return dbPartners
            .filter((p) => {
                if (selectedRegion !== 'ALL' && p.region !== selectedRegion) return false;
                if (selectedDomain !== 'ALL' && p.technology_domain !== selectedDomain) return false;
                return true;
            })
            .map((p) => {
                const { score } = scorePartner(p);
                const sizeMap = { Small: 20, Medium: 40, Large: 65, Enterprise: 90 };
                const yPos = sizeMap[p.company_size] + Math.random() * 8 - 4;
                const activeVendors = Object.entries(VENDOR_MAP).filter(([k]) => p[k as keyof Partner]).map(([, v]) => v!);
                const activeVirt = Object.entries(VIRT_MAP).filter(([k]) => p[k as keyof Partner]).map(([, v]) => v!);

                return {
                    name: p.company_name,
                    country: p.country,
                    city: p.city,
                    domain: p.technology_domain,
                    type: PARTNER_TYPE_LABEL[p.partner_type],
                    score,
                    employees: p.estimated_employees,
                    hpe_certification: p.hpe_certification,
                    website: p.website || '',
                    vendors: activeVendors,
                    virtTechs: activeVirt,
                    address: `Av. Tecnología ${Math.floor(p.company_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 999)}, Edif. ${p.company_name.substring(0,2).toUpperCase()}, ${p.city}`,
                    x: score,
                    y: Math.round(yPos),
                };
            });
    }, [selectedRegion, selectedDomain, dbPartners]);

    const countryDataPool = useMemo(() => {
        return dbPartners.filter(p => {
            if (selectedRegion !== 'ALL' && p.region !== selectedRegion) return false;
            if (selectedDomain !== 'ALL' && p.technology_domain !== selectedDomain) return false;
            return true;
        });
    }, [selectedRegion, selectedDomain, dbPartners]);

    const countryDistGroups = useMemo(() => {
        return countryDataPool.reduce<Record<string, number>>((acc, p) => {
            acc[p.country] = (acc[p.country] ?? 0) + 1;
            return acc;
        }, {});
    }, [countryDataPool]);

    const domainGroups: Record<TechnologyDomain, typeof chartData> = {
        IT: chartData.filter((d) => d.domain === 'IT'),
        OT: chartData.filter((d) => d.domain === 'OT'),
        IT_OT_HYBRID: chartData.filter((d) => d.domain === 'IT_OT_HYBRID'),
    };

    const stats = {
        IT: dbPartners.filter((p) => p.technology_domain === 'IT').length,
        OT: dbPartners.filter((p) => p.technology_domain === 'OT').length,
        IT_OT_HYBRID: dbPartners.filter((p) => p.technology_domain === 'IT_OT_HYBRID').length,
    };

    return (
        <div className="space-y-6">
            {/* Domain legend pills */}
            <div className="flex flex-wrap gap-3">
                {(['IT', 'OT', 'IT_OT_HYBRID'] as TechnologyDomain[]).map((d) => (
                    <div key={d} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${DOMAIN_BG[d]}`} />
                        <span className="text-sm text-gray-700 font-medium">{DOMAIN_LABEL[d]}</span>
                        <span className="text-xs text-gray-400">({stats[d]})</span>
                    </div>
                ))}
            </div>

            {/* View mode toggle + filters */}
            <div className="flex flex-wrap items-center gap-4">
                {/* View toggle */}
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                    <button
                        onClick={() => setViewMode('geo')}
                        className={`px-4 py-2 transition-colors flex items-center gap-1.5 ${viewMode === 'geo' ? 'bg-[#01A982] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Map className="w-4 h-4" /> Mapa Geográfico
                    </button>
                    <button
                        onClick={() => setViewMode('scatter')}
                        className={`px-4 py-2 transition-colors flex items-center gap-1.5 ${viewMode === 'scatter' ? 'bg-[#01A982] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        <BarChart2 className="w-4 h-4" /> Score vs Tamaño
                    </button>
                </div>

                {/* Region filter — only for scatter chart view */}
                {viewMode === 'scatter' && (
                    <>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 mr-2">Región:</label>
                            {REGIONS.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setSelectedRegion(r)}
                                    className={`mr-1 px-3 py-1 text-xs rounded-full border transition-colors ${selectedRegion === r
                                        ? 'bg-[#01A982] text-white border-[#01A982]'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#01A982]'
                                        }`}
                                >
                                    {r === 'ALL' ? 'Todos' : r === 'Europe' ? 'Europa' : r}
                                </button>
                            ))}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 mr-2">Dominio:</label>
                            {(['ALL', 'IT', 'OT', 'IT_OT_HYBRID'] as const).map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setSelectedDomain(d)}
                                    className={`mr-1 px-3 py-1 text-xs rounded-full border transition-colors ${selectedDomain === d
                                        ? 'bg-[#01A982] text-white border-[#01A982]'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#01A982]'
                                        }`}
                                >
                                    {d === 'ALL' ? 'Todos' : DOMAIN_LABEL[d as TechnologyDomain]}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ── Geo Map View ─────────────────────────────────────── */}
            {viewMode === 'geo' && <GeoMap dbPartners={dbPartners} />}

            {/* ── Scatter Chart View ───────────────────────────────── */}
            {viewMode === 'scatter' && (
                <>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-3">Eje X: Score de Oportunidad HPE &nbsp;|&nbsp; Eje Y: Tamaño de empresa (Small → Very Large Enterprise)</p>
                        <ResponsiveContainer width="100%" height={400}>
                            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="x" type="number" domain={[0, 25]}
                                    name="Score HPE"
                                    label={{ value: 'Score HPE', position: 'insideBottom', offset: -10, fontSize: 12 }}
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    dataKey="y" type="number" domain={[0, 100]}
                                    tickFormatter={(v) => v < 30 ? 'Small' : v < 50 ? 'Mid Size' : v < 75 ? 'Large Enterprise' : 'Very Large Enterprise'}
                                    tick={{ fontSize: 10 }}
                                    width={68}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    formatter={(value: string) => DOMAIN_LABEL[value as TechnologyDomain] || value}
                                    wrapperStyle={{ fontSize: 12, paddingTop: '15px' }}
                                    verticalAlign="bottom"
                                />
                                {(['IT', 'OT', 'IT_OT_HYBRID'] as TechnologyDomain[]).map((domain) => (
                                    <Scatter
                                        key={domain}
                                        name={domain}
                                        data={domainGroups[domain]}
                                        fill={DOMAIN_COLORS[domain]}
                                    >
                                        {domainGroups[domain].map((_, i) => (
                                            <Cell key={i} fill={DOMAIN_COLORS[domain]} opacity={0.8} />
                                        ))}
                                    </Scatter>
                                ))}
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Country distribution */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#01A982]" /> Distribución por País
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(countryDistGroups)
                                .sort((a, b) => b[1] - a[1])
                                .map(([country, count]) => (
                                    <button
                                        key={country}
                                        onClick={() => setSelectedCountry(country === selectedCountry ? 'ALL' : country)}
                                        className={`border rounded-lg px-3 py-1.5 flex items-center gap-2 transition-colors cursor-pointer ${selectedCountry === country ? 'bg-[#01A982] border-[#01A982] text-white' : 'bg-white border-gray-200 hover:border-[#01A982]'}`}
                                    >
                                        <span className={`text-sm font-medium ${selectedCountry === country ? 'text-white' : 'text-gray-700'}`}>{country}</span>
                                        <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${selectedCountry === country ? 'bg-white text-[#01A982]' : 'text-white bg-[#01A982]'}`}>{count}</span>
                                    </button>
                                ))}
                        </div>

                        {selectedCountry !== 'ALL' && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h5 className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Partners en {selectedCountry}</h5>
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-3 py-2 font-semibold text-gray-600">Empresa</th>
                                                <th className="px-3 py-2 font-semibold text-gray-600">Dominio</th>
                                                <th className="px-3 py-2 font-semibold text-gray-600">Tipo</th>
                                                <th className="px-3 py-2 font-semibold text-gray-600">Tamaño</th>
                                                <th className="px-3 py-2 font-semibold text-gray-600">Marcas</th>
                                                <th className="px-3 py-2 font-semibold text-gray-600">Virtualización</th>
                                                <th className="px-3 py-2 font-semibold text-gray-600 text-center">Score HPE</th>
                                                <th className="px-3 py-2 font-semibold text-gray-600 text-center">Oportunidad</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {
                                                countryDataPool.filter(d => d.country === selectedCountry).map((p, i) => {
                                                    const { score, tier } = scorePartner(p);
                                                    const activeVendors = Object.entries(VENDOR_MAP).filter(([k]) => p[k as keyof Partner]).map(([, v]) => v);
                                                    const activeVirtSolutions = Object.entries(VIRT_MAP).filter(([k]) => p[k as keyof Partner]).map(([, v]) => v);

                                                    return (
                                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-3 py-2 text-gray-800 font-medium">
                                                                <div>{p.company_name}</div>
                                                                <div className="text-[10px] text-gray-400 font-normal">{p.website?.replace('https://www.', '')}</div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: DOMAIN_COLORS[p.technology_domain as TechnologyDomain] + '15', color: DOMAIN_COLORS[p.technology_domain as TechnologyDomain] }}>
                                                                    {DOMAIN_LABEL[p.technology_domain as TechnologyDomain]}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 text-gray-600">{PARTNER_TYPE_LABEL[p.partner_type]}</td>
                                                            <td className="px-3 py-2 text-gray-600">{p.company_size}</td>
                                                            <td className="px-3 py-2">
                                                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                                    {activeVendors.length > 0 ? (
                                                                        activeVendors.map(vendor => (
                                                                            <Badge key={vendor} className="bg-gray-100 text-gray-600 border border-gray-200">
                                                                                {vendor}
                                                                            </Badge>
                                                                        ))
                                                                    ) : <span className="text-gray-400 italic text-[10px]">No info</span>}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                                    {activeVirtSolutions.length > 0 ? (
                                                                        activeVirtSolutions.map(sol => (
                                                                            <Badge key={sol} className="bg-blue-50 text-blue-600 border border-blue-100">
                                                                                {sol}
                                                                            </Badge>
                                                                        ))
                                                                    ) : <span className="text-gray-400 italic text-[10px]">No info</span>}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2 text-center text-gray-900 font-bold">{score}</td>
                                                            <td className="px-3 py-2 text-center">
                                                                <Badge className={TIER_COLORS[tier]}>{tier}</Badge>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            {countryDataPool.filter(d => d.country === selectedCountry).length === 0 && (
                                                <tr>
                                                    <td colSpan={8} className="px-3 py-4 text-center text-gray-400">No hay datos que coincidan con la selección Actual</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
