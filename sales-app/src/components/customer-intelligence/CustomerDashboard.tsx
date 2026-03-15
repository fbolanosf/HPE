'use client';

import { useState, useMemo } from 'react';
import {
    CUSTOMER_DATABASE, scoreCustomer, searchCustomers, CustomerFilters
} from '@/lib/customer-intelligence-data';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { Building2, Activity, TrendingUp, Minus, AlertTriangle, Download, Server, Star, Zap } from 'lucide-react';
import * as XLSX from 'xlsx';

function KPICard({ label, value, sub, icon: Icon, color }: {
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

const TIER_COLORS: Record<string, string> = {
    Hot: 'bg-green-100 text-green-700',
    Warm: 'bg-yellow-100 text-yellow-700',
    Cold: 'bg-red-100 text-red-700',
};

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
    return (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${className}`}>
            {children}
        </span>
    );
}

const HYPERVISOR_COLORS = ['#01A982', '#2563eb', '#7c3aed', '#ea580c', '#f59e0b', '#6b7280'];
const PIE_COLORS = ['#16a34a', '#f59e0b', '#dc2626'];

export default function CustomerDashboard() {
    const [filters, setFilters] = useState<CustomerFilters>({});

    const filtered = useMemo(() => searchCustomers(CUSTOMER_DATABASE, filters), [filters]);
    const scored = useMemo(() => filtered.map(c => ({ ...c, ...scoreCustomer(c) })), [filtered]);

    const totals = {
        all: scored.length,
        hot: scored.filter(c => c.tier === 'Hot').length,
        warm: scored.filter(c => c.tier === 'Warm').length,
        cold: scored.filter(c => c.tier === 'Cold').length,
        broadcom: CUSTOMER_DATABASE.filter(c => c.broadcom_pricing_impact).length,
    };

    // Hypervisor distribution
    const hypervisorData = ['VMware', 'Hyper-V', 'Nutanix', 'KVM/OpenStack', 'Mixed', 'None/Bare Metal'].map(h => ({
        name: h,
        value: filtered.filter(c => c.current_hypervisor === h).length,
    })).filter(d => d.value > 0);

    // Tier pie
    const tierData = [
        { name: 'Alta Prioridad', value: totals.hot },
        { name: 'Media Prioridad', value: totals.warm },
        { name: 'Baja Prioridad', value: totals.cold },
    ].filter(d => d.value > 0);

    // Industry bar
    const industryMap: { label: string; color: string }[] = [
        { label: 'Banca y Finanzas', color: '#2563eb' },
        { label: 'Manufactura', color: '#01A982' },
        { label: 'Energía / Utilities', color: '#f59e0b' },
        { label: 'Oil & Gas', color: '#8b5cf6' },
        { label: 'Retail', color: '#ec4899' },
        { label: 'Salud', color: '#14b8a6' },
        { label: 'Telecomunicaciones', color: '#0284c7' },
        { label: 'Sector Público', color: '#84cc16' },
    ];
    const industryData = industryMap.map(({ label, color }) => ({
        name: label, color,
        value: filtered.filter(c => c.industry.toLowerCase().includes(label.split('/')[0].trim().toLowerCase())).length,
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

    // Top prospects
    const topCustomers = [...scored].sort((a, b) => b.score - a.score).slice(0, 5);

    function handleExport() {
        const headers = ['Empresa', 'País', 'Ciudad', 'Industria', 'Tamaño', 'Hypervisor Actual', 'Score HPE', 'Prioridad', 'Impacto Broadcom', 'Website'];
        const rows = scored.map(c => [
            c.company_name, c.country, c.city, c.industry, c.company_size,
            c.current_hypervisor, c.score, c.tier,
            c.broadcom_pricing_impact ? 'Sí' : 'No', c.website,
        ]);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Customers');
        XLSX.writeFile(wb, 'hpe-customer-prospects.xlsx');
    }

    return (
        <div className="space-y-6">
            {Object.keys(filters).length > 0 && (
                <div className="flex items-center justify-between bg-cyan-50 border border-cyan-200 text-cyan-800 px-4 py-2 rounded-lg text-sm">
                    <span><strong>Filtros activos —</strong> Haz clic en gráficos para refinar.</span>
                    <button onClick={() => setFilters({})} className="text-xs font-semibold underline hover:bg-cyan-100 px-2 py-1 rounded">Limpiar todo</button>
                </div>
            )}

            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <KPICard label="Total Prospects" value={totals.all} icon={Building2} color="bg-gray-700" sub="Base de clientes" />
                <KPICard label="Alta Prioridad" value={totals.hot} icon={Activity} color="bg-green-600" sub="Score ≥ 18 pts" />
                <KPICard label="Media Prioridad" value={totals.warm} icon={TrendingUp} color="bg-amber-500" sub="Score 9-17 pts" />
                <KPICard label="Baja Prioridad" value={totals.cold} icon={Minus} color="bg-red-500" sub="Score < 9 pts" />
                <KPICard label="Impacto Broadcom" value={totals.broadcom} icon={AlertTriangle} color="bg-orange-600" sub="Candidatos urgentes" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tier Pie */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-600" /> Distribución por Prioridad de Venta
                    </h4>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={tierData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                label={(props: any) => `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                                labelLine={false} fontSize={11}
                                onClick={(d) => setFilters(f => ({ ...f, tier: f.tier === (d.payload.name.includes('Hot') ? 'Hot' : d.payload.name.includes('Warm') ? 'Warm' : 'Cold') ? undefined : (d.payload.name.includes('Hot') ? 'Hot' : d.payload.name.includes('Warm') ? 'Warm' : 'Cold') }))}
                                className="cursor-pointer">
                                {tierData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Hypervisor bar */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Server className="h-4 w-4 text-[#01A982]" /> Hypervisor Actual de los Prospects
                    </h4>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={hypervisorData} layout="vertical" margin={{ left: 10, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} interval={0} />
                            <Tooltip />
                            <Bar dataKey="value" name="Empresas" radius={[0, 4, 4, 0]}
                                onClick={d => setFilters(f => ({ ...f, current_hypervisor: f.current_hypervisor === d.name ? undefined : d.name as never }))}>
                                {hypervisorData.map((_, i) => <Cell key={i} fill={HYPERVISOR_COLORS[i % HYPERVISOR_COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Industries */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h4 className="text-sm font-bold text-gray-800 mb-4">Prospects por Industria</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={industryData} margin={{ left: -10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={45} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" name="Empresas" radius={[4, 4, 0, 0]}
                            onClick={d => setFilters(f => ({ ...f, industry: f.industry === d.name ? undefined : d.name as never }))}>
                            {industryData.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Top prospects */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" /> Top 5 Prospects — Mayor Potencial HPE
                </h4>
                <div className="space-y-3">
                    {topCustomers.map((c, i) => (
                        <div key={c.id} className="flex items-center gap-3">
                            <div className="text-sm font-black text-gray-400 w-6 text-right">#{i + 1}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-gray-900 text-sm">{c.company_name}</span>
                                    <span className="text-xs text-gray-400">{c.country}</span>
                                    <Badge className={TIER_COLORS[c.tier]}>{c.tier}</Badge>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{c.current_hypervisor}</span>
                                    {c.broadcom_pricing_impact && (
                                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium"><Zap className="h-2.5 w-2.5" /> Broadcom</span>
                                    )}
                                </div>
                                <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-red-500 transition-all"
                                        style={{ width: `${Math.min(100, (c.score / 35) * 100)}%` }} />
                                </div>
                            </div>
                            <div className="text-sm font-bold text-gray-900 w-8 text-right">{c.score}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <h4 className="text-sm font-bold text-gray-800">Todos los Prospects ({scored.length})</h4>
                    <button onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 text-white rounded text-xs font-semibold hover:bg-cyan-700 transition-colors cursor-pointer">
                        <Download className="h-3.5 w-3.5" /> Exportar a XLS
                    </button>
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 font-semibold text-gray-600">Empresa</th>
                                <th className="px-4 py-2 font-semibold text-gray-600">País</th>
                                <th className="px-4 py-2 font-semibold text-gray-600">Industria</th>
                                <th className="px-4 py-2 font-semibold text-gray-600">Hypervisor</th>
                                <th className="px-4 py-2 font-semibold text-gray-600 text-center">Empleados</th>
                                <th className="px-4 py-2 font-semibold text-gray-600 text-center">Score</th>
                                <th className="px-4 py-2 font-semibold text-gray-600 text-center">Prioridad</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {scored.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2">
                                        <div className="font-medium text-gray-900">{c.company_name}</div>
                                        <div className="text-[10px] text-gray-400">{c.website}</div>
                                    </td>
                                    <td className="px-4 py-2 text-gray-600">{c.country}</td>
                                    <td className="px-4 py-2 text-gray-600 max-w-[140px] truncate">{c.industry}</td>
                                    <td className="px-4 py-2">
                                        <span className="text-[10px] px-1 bg-gray-100 text-gray-700 rounded border border-gray-200">
                                            {c.current_hypervisor}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center text-gray-600">{c.estimated_employees.toLocaleString()}</td>
                                    <td className="px-4 py-2 text-center font-bold text-gray-900">{c.score}</td>
                                    <td className="px-4 py-2 text-center">
                                        <Badge className={TIER_COLORS[c.tier]}>{c.tier}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
