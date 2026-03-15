'use client';

import { useState, useMemo } from 'react';
import {
    PARTNER_DATABASE, scorePartner, DOMAIN_LABEL, PARTNER_TYPE_LABEL,
    TechnologyDomain, Partner, PartnerFilters, searchPartners
} from '@/lib/partner-intelligence-data';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';
import { Building2, Monitor, Factory, Combine, Star, Globe, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

function KPICard({
    label, value, sub, icon: Icon, color,
}: {
    label: string; value: number | string; sub?: string;
    icon: React.ElementType; color: string;
}) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <div className={`${color} text-white rounded-lg p-2.5 flex-shrink-0`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <div className="text-2xl font-black text-gray-900">{value}</div>
                <div className="text-xs font-semibold text-gray-700">{label}</div>
                {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
            </div>
        </div>
    );
}

const PIE_COLORS = ['#2563eb', '#ea580c', '#16a34a', '#7c3aed', '#0891b2'];

const DOMAIN_COLORS_TW: Record<TechnologyDomain, string> = {
    IT: 'bg-blue-100 text-blue-800',
    OT: 'bg-orange-100 text-orange-800',
    IT_OT_HYBRID: 'bg-green-100 text-green-800',
};

const TIER_COLORS: Record<string, string> = {
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
    vmware_partner: 'VMware', vxrail_partner: 'VxRail', dell_partner: 'Dell', hpe_partner: 'HPE',
    nutanix_partner: 'Nutanix', cisco_partner: 'Cisco', microsoft_partner: 'Microsoft',
    aws_partner: 'AWS', google_cloud_partner: 'Google Cloud', siemens_partner: 'Siemens',
    rockwell_partner: 'Rockwell', schneider_partner: 'Schneider', abb_partner: 'ABB',
    honeywell_partner: 'Honeywell', emerson_partner: 'Emerson', aveva_partner: 'AVEVA',
    yokogawa_partner: 'Yokogawa',
};

const VIRT_MAP: Partial<Record<keyof Partner, string>> = {
    virtualization: 'Virtualización', hci: 'HCI', datacenter_infrastructure: 'Datacenter',
    hybrid_cloud: 'Nube Híbrida', cloud_migration: 'Migración Cloud',
    backup_and_disaster_recovery: 'Backup & DR', container_platforms: 'Contenedores',
};

export default function EcosystemDashboard() {
    const [filters, setFilters] = useState<PartnerFilters>({});

    const filteredDatabase = useMemo(() => searchPartners(PARTNER_DATABASE, filters), [filters]);

    const scored = useMemo(() => {
        return filteredDatabase.map((p) => ({ ...p, ...scorePartner(p) }));
    }, [filteredDatabase]);

    const totals = {
        all: scored.length,
        it: scored.filter((p) => p.technology_domain === 'IT').length,
        ot: scored.filter((p) => p.technology_domain === 'OT').length,
        hybrid: scored.filter((p) => p.technology_domain === 'IT_OT_HYBRID').length,
        high: scored.filter((p) => p.tier === 'High').length,
    };

    function handleExportXLS() {
        const headers = [
            'Empresa', 'País', 'Ciudad', 'Región', 'Tipo', 'Dominio',
            'Empleados', 'Marcas / Vendors', 'Soluciones de Virtualización', 'Score HPE', 'Oportunidad', 'Website',
        ];
        const rows = scored.map((p) => {
            const activeVendors = Object.entries(VENDOR_MAP).filter(([k]) => p[k as keyof Partner]).map(([, v]) => v).join('; ');
            const activeVirtSolutions = Object.entries(VIRT_MAP).filter(([k]) => p[k as keyof Partner]).map(([, v]) => v).join('; ');

            return [
                p.company_name, p.country, p.city, p.region,
                PARTNER_TYPE_LABEL[p.partner_type],
                DOMAIN_LABEL[p.technology_domain],
                p.estimated_employees, activeVendors, activeVirtSolutions, p.score, p.tier, p.website,
            ];
        });

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Partners");
        XLSX.writeFile(workbook, "hpe-filtered-partners.xlsx");
    }

    // Industry distribution
    const INDUSTRY_KEYS: { key: keyof Partner; label: string; color: string }[] = [
        { key: 'telecommunications', label: 'Telecomunicaciones', color: '#01A982' },
        { key: 'finance', label: 'Banca y Finanzas', color: '#2563eb' },
        { key: 'healthcare', label: 'Salud', color: '#7c3aed' },
        { key: 'retail', label: 'Retail / Comercio', color: '#ec4899' },
        { key: 'public_sector', label: 'Sector Público', color: '#f59e0b' },
        { key: 'manufacturing', label: 'Manufactura', color: '#0284c7' },
        { key: 'oil_and_gas', label: 'Oil & Gas', color: '#8b5cf6' },
        { key: 'energy', label: 'Energía', color: '#ea580c' },
        { key: 'mining', label: 'Minería', color: '#d946ef' },
        { key: 'utilities', label: 'Utilities', color: '#14b8a6' },
        { key: 'food_and_beverage', label: 'Alimentos', color: '#f43f5e' },
        { key: 'pharmaceutical', label: 'Farmacéutica', color: '#6366f1' },
        { key: 'transportation', label: 'Transporte', color: '#84cc16' },
    ];
    let industryData = INDUSTRY_KEYS.map(({ key, label, color }) => ({
        name: label,
        dataKey: key,
        color: color,
        value: filteredDatabase.filter((p) => p[key]).length,
    })).sort((a, b) => b.value - a.value);

    // Fix: Si un filtro de industria está activo, ocultar el resto para evitar confusiones de multi-industria.
    if (filters.industry) {
        industryData = industryData.filter(d => d.dataKey === filters.industry);
    }

    // Domain pie
    const domainData = (['IT', 'OT', 'IT_OT_HYBRID'] as TechnologyDomain[]).map((d) => ({
        name: DOMAIN_LABEL[d],
        domainKey: d,
        value: filteredDatabase.filter((p) => p.technology_domain === d).length,
    }));

    // Top vendors (IT & Virtualization)
    const vendorData = [
        { name: 'VMware', value: filteredDatabase.filter((p) => p.vmware_partner).length },
        { name: 'Cisco', value: filteredDatabase.filter((p) => p.cisco_partner).length },
        { name: 'Dell', value: filteredDatabase.filter((p) => p.dell_partner).length },
        { name: 'HPE', value: filteredDatabase.filter((p) => p.hpe_partner).length },
        { name: 'Microsoft', value: filteredDatabase.filter((p) => p.microsoft_partner).length },
        { name: 'AWS', value: filteredDatabase.filter((p) => p.aws_partner).length },
        { name: 'Google Cloud', value: filteredDatabase.filter((p) => p.google_cloud_partner).length },
        { name: 'Nutanix', value: filteredDatabase.filter((p) => p.nutanix_partner).length },
        { name: 'VxRail', value: filteredDatabase.filter((p) => p.vxrail_partner).length },
    ].sort((a, b) => b.value - a.value);

    // Top OT vendors
    const otVendorData = [
        { name: 'Siemens', value: filteredDatabase.filter((p) => p.siemens_partner).length },
        { name: 'Rockwell', value: filteredDatabase.filter((p) => p.rockwell_partner).length },
        { name: 'Schneider', value: filteredDatabase.filter((p) => p.schneider_partner).length },
        { name: 'ABB', value: filteredDatabase.filter((p) => p.abb_partner).length },
        { name: 'Honeywell', value: filteredDatabase.filter((p) => p.honeywell_partner).length },
        { name: 'AVEVA', value: filteredDatabase.filter((p) => p.aveva_partner).length },
        { name: 'Emerson', value: filteredDatabase.filter((p) => p.emerson_partner).length },
    ].sort((a, b) => b.value - a.value);

    // Top partners by score
    const topPartners = scored.sort((a, b) => b.score - a.score).slice(0, 5);

    return (
        <div className="space-y-6">
            {Object.keys(filters).length > 0 && (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm mb-4">
                    <span><strong>Filtros activos:</strong> Haz click en los gráficos para removerlos o explorar más.</span>
                    <button onClick={() => setFilters({})} className="text-xs font-semibold underline hover:bg-green-100 px-2 pl-3 py-1 rounded">
                        Limpiar todo
                    </button>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <KPICard label="Total Partners" value={totals.all} icon={Building2} color="bg-gray-700" sub="Base de datos actual" />
                <KPICard label="Partners IT" value={totals.it} icon={Monitor} color="bg-blue-600" sub="Infraestructura / Cloud" />
                <KPICard label="Partners OT" value={totals.ot} icon={Factory} color="bg-orange-500" sub="Automatización / SCADA" />
                <KPICard label="IT/OT Híbridos" value={totals.hybrid} icon={Combine} color="bg-green-600" sub="Ecosistema convergido" />
                <KPICard label="High Opportunity" value={totals.high} icon={Star} color="bg-[#01A982]" sub="Score ≥ 14 pts HPE" />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Domain pie */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Combine className="h-4 w-4 text-[#01A982]" /> Distribución por Dominio Tecnológico
                    </h4>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie data={domainData} cx="50%" cy="50%" outerRadius={80}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                dataKey="value" nameKey="name" label={(props: any) =>
                                    `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                                labelLine={false} fontSize={11}
                                onClick={(data) => setFilters(f => ({ ...f, technology_domain: f.technology_domain === data.payload.domainKey ? undefined : data.payload.domainKey }))}
                                className="cursor-pointer"
                            >
                                {domainData.map((d, i) => (
                                    <Cell key={i} fill={['#2563eb', '#ea580c', '#16a34a'][i]} fillOpacity={filters.technology_domain && filters.technology_domain !== d.domainKey ? 0.3 : 1} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Industry bar */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-[#01A982]" /> Partners por Industria
                    </h4>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={industryData} layout="vertical" margin={{ left: 0, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} interval={0} />
                            <Tooltip />
                            <Bar dataKey="value" name="Partners" fill="#01A982" radius={[0, 4, 4, 0]}
                                onClick={(data) => {
                                    const mappedKey = INDUSTRY_KEYS.find(k => k.label === data.name)?.key;
                                    setFilters(f => ({ ...f, industry: f.industry === mappedKey ? undefined : mappedKey as any }));
                                }}
                                className="cursor-pointer"
                            >
                                {industryData.map((d, i) => (
                                    <Cell key={i} fill={d.color} fillOpacity={filters.industry && filters.industry !== INDUSTRY_KEYS.find(k => k.label === d.name)?.key ? 0.3 : 1} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* IT vendors */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-800 mb-4">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#01A982] mr-2" />
                        Vendors IT & Cloud — Partners por Fabricante
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={vendorData} margin={{ left: -10, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" name="Partners" fill="#01A982" radius={[4, 4, 0, 0]}
                                onClick={(data) => setFilters(f => ({ ...f, vendor: f.vendor === data.name ? undefined : data.name }))}
                                className="cursor-pointer"
                            >
                                {vendorData.map((d, i) => (
                                    <Cell key={i} fill="#01A982" fillOpacity={filters.vendor && filters.vendor !== d.name ? 0.3 : 1} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* OT vendors */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-800 mb-4">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 mr-2" />
                        Vendors OT — Partners por Fabricante Industrial
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={otVendorData} margin={{ left: -10, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" name="Partners" fill="#ea580c" radius={[4, 4, 0, 0]}
                                onClick={(data) => setFilters(f => ({ ...f, vendor: f.vendor === data.name ? undefined : data.name }))}
                                className="cursor-pointer"
                            >
                                {otVendorData.map((d, i) => (
                                    <Cell key={i} fill="#ea580c" fillOpacity={filters.vendor && filters.vendor !== d.name ? 0.3 : 1} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top 5 partners */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" /> Top 5 Partners por Oportunidad HPE
                </h4>
                <div className="space-y-3">
                    {topPartners.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3">
                            <div className="text-sm font-black text-gray-400 w-6 text-right">#{i + 1}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900 text-sm">{p.company_name}</span>
                                    <span className="text-xs text-gray-400">{p.country}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium
                    ${p.technology_domain === 'IT' ? 'bg-blue-100 text-blue-700' :
                                            p.technology_domain === 'OT' ? 'bg-orange-100 text-orange-700' :
                                                'bg-green-100 text-green-700'}`}>
                                        {DOMAIN_LABEL[p.technology_domain]}
                                    </span>
                                </div>
                                <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-2 rounded-full bg-[#01A982] transition-all"
                                        style={{ width: `${Math.min(100, (p.score / 25) * 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-sm font-bold text-gray-900 w-8 text-right">{p.score}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filtered Partners Table */}
            {Object.keys(filters).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-6">
                    <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                        <h4 className="text-sm font-bold text-gray-800">
                            Partners Filtrados ({scored.length})
                        </h4>
                        <button
                            onClick={handleExportXLS}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#01A982] text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                            <Download className="h-3.5 w-3.5" /> Exportar Selección a XLS
                        </button>
                    </div>
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2 font-semibold text-gray-600">Empresa</th>
                                    <th className="px-4 py-2 font-semibold text-gray-600">País</th>
                                    <th className="px-4 py-2 font-semibold text-gray-600">Dominio</th>
                                    <th className="px-4 py-2 font-semibold text-gray-600">Marcas</th>
                                    <th className="px-4 py-2 font-semibold text-gray-600 text-center">Score</th>
                                    <th className="px-4 py-2 font-semibold text-gray-600 text-center">Oportunidad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {scored.map((p) => {
                                    const activeVendors = Object.entries(VENDOR_MAP).filter(([k]) => p[k as keyof Partner]).map(([, v]) => v);
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-2">
                                                <div className="font-medium text-gray-900">{p.company_name}</div>
                                                <div className="text-[10px] text-gray-400">{p.website?.replace('https://www.', '')}</div>
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">{p.country}</td>
                                            <td className="px-4 py-2">
                                                <Badge className={DOMAIN_COLORS_TW[p.technology_domain]}>
                                                    {DOMAIN_LABEL[p.technology_domain]}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                    {activeVendors.length > 0 ? (
                                                        activeVendors.map(v => (
                                                            <span key={v} className="text-[10px] px-1 bg-gray-100 text-gray-600 rounded border border-gray-200">{v}</span>
                                                        ))
                                                    ) : <span className="text-gray-400 italic text-[10px]">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center font-bold text-gray-900">{p.score}</td>
                                            <td className="px-4 py-2 text-center">
                                                <Badge className={TIER_COLORS[p.tier]}>{p.tier}</Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
