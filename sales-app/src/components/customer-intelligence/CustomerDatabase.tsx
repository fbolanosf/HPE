'use client';

import React, { useState, useMemo } from 'react';
import {
    CUSTOMER_DATABASE, scoreCustomer, searchCustomers,
    CustomerFilters, HypervisorInUse, CustomerSize, CloudAdoption, Customer
} from '@/lib/customer-intelligence-data';
import { Search, X, AlertTriangle, Download, ChevronDown, ChevronUp, Zap, Monitor, RefreshCcw, CloudOff, Check, Database as DatabaseIcon, Activity, Minus, Shield } from 'lucide-react';
import * as XLSX from 'xlsx';
import HPEIntelligenceCenter from './HPEIntelligenceCenter';

const TIER_COLORS: Record<string, string> = {
    Hot: 'bg-green-100 text-green-700 border border-green-200',
    Warm: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    Cold: 'bg-red-100 text-red-700 border border-red-200',
};

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
    return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${className}`}>{children}</span>;
}

interface Props { filterRegion?: string; onEdit?: (c: Customer) => void; }

export default function CustomerDatabase({ filterRegion, onEdit }: Props) {
    const [filters, setFilters] = useState<CustomerFilters>({});
    const [query, setQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<'score' | 'company_name' | 'estimated_employees'>('company_name');
    const [sortAsc, setSortAsc] = useState(true);
    const [intelligenceCustomer, setIntelligenceCustomer] = useState<Customer | null>(null);

    const allFilters: CustomerFilters = {
        ...filters,
        query: query || undefined,
        region: filterRegion && filterRegion !== 'ALL' ? filterRegion : undefined,
    };

    const results = useMemo(() => {
        const base = searchCustomers(CUSTOMER_DATABASE, allFilters);
        return base.map(c => ({ ...c, ...scoreCustomer(c) })).sort((a, b) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const va = (a as any)[sortKey]; const vb = (b as any)[sortKey];
            if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
            return sortAsc ? va - vb : vb - va;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, query, filterRegion, sortKey, sortAsc]);

    function handleSort(key: typeof sortKey) {
        if (sortKey === key) setSortAsc(a => !a);
        else { setSortKey(key); setSortAsc(false); }
    }

    function SortIcon({ k }: { k: typeof sortKey }) {
        if (sortKey !== k) return null;
        return sortAsc ? <ChevronUp className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />;
    }

    function handleExport() {
        const headers = ['Empresa', 'País', 'Industria', 'Tamaño', 'Empleados', 'Servidores', 'Hypervisor', 'Cloud', 'Score', 'Prioridad', 'Broadcom', 'HPE Hardware', 'Website'];
        const rows = results.map(c => [
            c.company_name, c.country, c.industry, c.company_size, c.estimated_employees,
            c.estimated_servers, c.current_hypervisor, c.cloud_adoption, c.score, c.tier,
            c.broadcom_pricing_impact ? 'Sí' : 'No', c.existing_hpe_hardware ? 'Sí' : 'No', c.website,
        ]);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Prospects');
        XLSX.writeFile(wb, 'hpe-customer-intelligence.xlsx');
    }

    return (
        <div className="space-y-4">
            {/* Search & Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                            placeholder="Buscar empresa, país, industria..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-3.5 w-3.5 text-gray-400" /></button>}
                    </div>
                    <button onClick={handleExport}
                        className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 text-white rounded-lg text-xs font-semibold hover:bg-cyan-700 transition-colors whitespace-nowrap">
                        <Download className="h-3.5 w-3.5" /> Exportar XLS
                    </button>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {/* Tier */}
                    <select value={filters.tier ?? 'ALL'} onChange={e => setFilters(f => ({ ...f, tier: e.target.value === 'ALL' ? undefined : e.target.value as never }))}
                        className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                        <option value="ALL">Prioridad: Todas</option>
                        <option value="Hot">Alta Prioridad</option>
                        <option value="Warm">Media Prioridad</option>
                        <option value="Cold">Baja Prioridad</option>
                    </select>

                    {/* Hypervisor */}
                    <select value={filters.current_hypervisor ?? 'ALL'} onChange={e => setFilters(f => ({ ...f, current_hypervisor: e.target.value === 'ALL' ? undefined : e.target.value as HypervisorInUse }))}
                        className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                        <option value="ALL">Hypervisor: Todos</option>
                        {['VMware', 'Hyper-V', 'Nutanix', 'KVM/OpenStack', 'Mixed', 'None/Bare Metal'].map(h => (
                            <option key={h} value={h}>{h}</option>
                        ))}
                    </select>

                    {/* Size */}
                    <select value={filters.company_size ?? 'ALL'} onChange={e => setFilters(f => ({ ...f, company_size: e.target.value === 'ALL' ? undefined : e.target.value as CustomerSize }))}
                        className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                        <option value="ALL">Tamaño: Todos</option>
                        <option value="SMB">SMB</option>
                        <option value="Mid-Market">Mid-Market</option>
                        <option value="Enterprise">Enterprise</option>
                        <option value="Large Enterprise">Large Enterprise</option>
                    </select>

                    {/* Cloud */}
                    <select value={filters.cloud_adoption ?? 'ALL'} onChange={e => setFilters(f => ({ ...f, cloud_adoption: e.target.value === 'ALL' ? undefined : e.target.value as CloudAdoption }))}
                        className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                        <option value="ALL">Cloud: Todos</option>
                        {['On-Premise Only', 'Hybrid', 'Multi-Cloud', 'Cloud-First'].map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    {/* Broadcom toggle */}
                    <button onClick={() => setFilters(f => ({ ...f, broadcom_impact: !f.broadcom_impact }))}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${filters.broadcom_impact ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400'}`}>
                        <AlertTriangle className="h-3.5 w-3.5" /> Solo Broadcom
                    </button>

                    {/* HPE hardware toggle */}
                    <button onClick={() => setFilters(f => ({ ...f, has_hpe_hardware: !f.has_hpe_hardware }))}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${filters.has_hpe_hardware ? 'bg-[#01A982] text-white border-[#01A982]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#01A982]'}`}>
                        HPE Hardware Exist.
                    </button>
                </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between px-1">
                <p className="text-xs text-gray-500">{results.length} prospects encontrados</p>
                {(Object.keys(filters).length > 0 || query) && (
                    <button onClick={() => { setFilters({}); setQuery(''); }} className="text-xs text-cyan-600 underline hover:text-cyan-800">Limpiar filtros</button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2.5 font-semibold text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('company_name')}>
                                    Empresa <SortIcon k="company_name" />
                                </th>
                                <th className="px-4 py-2.5 font-semibold text-gray-600">País</th>
                                <th className="px-4 py-2.5 font-semibold text-gray-600">Industria</th>
                                <th className="px-4 py-2.5 font-semibold text-gray-600">Hypervisor</th>
                                <th className="px-4 py-2.5 font-semibold text-gray-600 cursor-pointer hover:text-gray-900 text-right" onClick={() => handleSort('estimated_employees')}>
                                    Empleados <SortIcon k="estimated_employees" />
                                </th>
                                <th className="px-4 py-2.5 font-semibold text-gray-600 text-center cursor-pointer hover:text-gray-900" onClick={() => handleSort('score')}>
                                    Score <SortIcon k="score" />
                                </th>
                                <th className="px-4 py-2.5 font-semibold text-gray-600 text-center">Prioridad</th>
                                <th className="px-4 py-2.5 font-semibold text-gray-600 text-center">Señales</th>
                                <th className="px-4 py-2.5 font-semibold text-gray-600 text-right text-[10px] uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {results.map(c => (
                                <React.Fragment key={c.id}>
                                    <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                                        <td className="px-4 py-2.5">
                                            <div className="font-semibold text-gray-900">{c.company_name}</div>
                                            <div className="text-[10px] text-gray-400">{c.city}</div>
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-600">{c.country}</td>
                                        <td className="px-4 py-2.5 text-gray-600 max-w-[140px]">
                                            <span className="truncate block">{c.industry}</span>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${c.current_hypervisor === 'VMware' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                {c.current_hypervisor}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-gray-600">{c.estimated_employees.toLocaleString('en-US')}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <span className="font-bold text-gray-900">{c.score}</span>
                                                <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500"
                                                        style={{ width: `${Math.min(100, (c.score / 35) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-center"><Badge className={TIER_COLORS[c.tier]}>{c.tier}</Badge></td>
                                        <td className="px-4 py-2.5 text-center">
                                            <div className="flex gap-1 justify-center flex-wrap">
                                                {c.broadcom_pricing_impact && <span title="Impacto Broadcom" className="inline-flex items-center gap-0.5 text-[9px] bg-orange-100 text-orange-700 border border-orange-200 px-1 py-0.5 rounded font-medium"><Zap className="h-2.5 w-2.5" />BC</span>}
                                                {c.existing_hpe_hardware && <span title="HPE Hardware existente" className="inline-flex items-center gap-0.5 text-[9px] bg-teal-100 text-teal-700 border border-teal-200 px-1 py-0.5 rounded font-medium"><Monitor className="h-2.5 w-2.5" />HPE</span>}
                                                {c.vmware_license_renewal_due && <span title="Renovación VMware pendiente" className="inline-flex items-center gap-0.5 text-[9px] bg-blue-100 text-blue-700 border border-blue-200 px-1 py-0.5 rounded font-medium"><RefreshCcw className="h-2.5 w-2.5" />VM</span>}
                                                {c.cloud_repatriation_interest && <span title="Interés en repatriar cloud" className="inline-flex items-center gap-0.5 text-[9px] bg-purple-100 text-purple-700 border border-purple-200 px-1 py-0.5 rounded font-medium"><CloudOff className="h-2.5 w-2.5" />Rpt</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-right flex items-center justify-end gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setIntelligenceCustomer(c as Customer); }}
                                                className="text-[10px] bg-cyan-50 hover:bg-cyan-600 hover:text-white text-cyan-600 p-1.5 rounded-lg font-bold transition-all border border-cyan-100 flex items-center gap-1 shadow-sm"
                                                title="HPE Intelligence Center"
                                            >
                                                <Shield className="h-3 w-3" />
                                                <span className="hidden lg:inline">Intelligence</span>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onEdit?.(c as Customer); }}
                                                className="text-[10px] bg-gray-50 hover:bg-slate-200 text-gray-600 p-1.5 rounded-lg font-bold transition-colors border border-gray-100"
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expanded detail row */}
                                    {expandedId === c.id && (
                                        <tr key={`${c.id}-detail`}>
                                            <td colSpan={9} className="px-4 py-3 bg-cyan-50 border-b border-cyan-100">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                                    <div>
                                                        <div className="font-bold text-gray-700 mb-1">Infraestructura Actual</div>
                                                        <div className="space-y-0.5 text-gray-600">
                                                            <div><span className="text-gray-400">Hypervisor:</span> {c.current_hypervisor}</div>
                                                            <div><span className="text-gray-400">Cloud:</span> {c.cloud_adoption}</div>
                                                            <div><span className="text-gray-400">Servidores est.:</span> {c.estimated_servers.toLocaleString('en-US')}</div>
                                                            <div><span className="text-gray-400">Empleados:</span> {c.estimated_employees.toLocaleString('en-US')}</div>
                                                            <div className="mt-2 pt-2 border-t border-cyan-100 flex items-center justify-between">
                                                                <span className="font-bold text-gray-700">Directorio de Contactos</span>
                                                                {c.contacts && c.contacts.length > 0 && <span className="text-[10px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded-full">{c.contacts.length}</span>}
                                                            </div>
                                                            <div className="space-y-3 mt-2">
                                                                {c.contacts && c.contacts.length > 0 ? (
                                                                    c.contacts.map((contact) => (
                                                                        <div key={contact.id} className="bg-white/50 p-2 rounded border border-cyan-100/50">
                                                                            <div className="font-bold text-cyan-800">{contact.name}</div>
                                                                            {contact.title && <div className="text-[10px] text-gray-500 font-medium">{contact.title}</div>}
                                                                            <div className="flex gap-2 mt-1">
                                                                                {contact.email && <a href={`mailto:${contact.email}`} className="text-cyan-600 hover:underline">{contact.email}</a>}
                                                                                {contact.phone && <span className="text-gray-400">{contact.phone}</span>}
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <>
                                                                        {c.contact_name && <div className="font-bold text-cyan-800">{c.contact_name}</div>}
                                                                        {c.contact_title && <div className="text-[10px] text-gray-500 font-medium">{c.contact_title}</div>}
                                                                        <div className="flex gap-2 mt-1">
                                                                            {c.contact_email && <a href={`mailto:${c.contact_email}`} className="text-cyan-600 hover:underline">{c.contact_email}</a>}
                                                                            {c.contact_phone && <span className="text-gray-400">{c.contact_phone}</span>}
                                                                        </div>
                                                                        {!c.contact_name && <div className="text-gray-400 italic">Sin contactos registrados</div>}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-700 mb-1">Señales de Oportunidad</div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {c.broadcom_pricing_impact && <span className="inline-flex items-center gap-0.5 bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px]"><Zap className="h-2.5 w-2.5" /> Broadcom Impact</span>}
                                                            {c.vmware_license_renewal_due && <span className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px]"><RefreshCcw className="h-2.5 w-2.5" /> Renovación VMware</span>}
                                                            {c.vmware_version_eol && <span className="inline-flex items-center gap-0.5 bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px]"><AlertTriangle className="h-2.5 w-2.5" /> VMware EOL</span>}
                                                            {c.datacenter_refresh_cycle && <span className="inline-flex items-center gap-0.5 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px]"><RefreshCcw className="h-2.5 w-2.5" /> Refresh Pendiente</span>}
                                                            {c.existing_hpe_hardware && <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px]"><Check className="h-2.5 w-2.5" /> HPE Hardware</span>}
                                                            {c.cloud_repatriation_interest && <span className="inline-flex items-center gap-0.5 bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px]"><CloudOff className="h-2.5 w-2.5" /> Cloud Repatriation</span>}
                                                            {c.hpe_greenlake_interest && <span className="inline-flex items-center gap-0.5 bg-[#e6f7f2] text-[#01A982] px-1.5 py-0.5 rounded text-[10px]"><Activity className="h-2.5 w-2.5" /> GreenLake Interest</span>}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-700 mb-1">Pain Points</div>
                                                        <ul className="space-y-0.5 text-gray-600">
                                                            {(c.pain_points ?? ['No documentados']).map((p, i) => (
                                                                <li key={i} className="flex items-start gap-1"><span className="text-red-400 mt-0.5">•</span>{p}</li>
                                                            ))}
                                                        </ul>
                                                        <div className="mt-4 pt-4 border-t border-cyan-100 flex items-center justify-between">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setIntelligenceCustomer(c as Customer); }}
                                                                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-lg shadow-cyan-600/20 active:scale-95 transition-all"
                                                            >
                                                                <Shield className="h-3 w-3" />
                                                                Deep Intelligence (Apollo.io)
                                                            </button>
                                                            <a href={`https://${c.website}`} target="_blank" rel="noopener" className="text-cyan-600 underline text-[10px]">{c.website}</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    {results.length === 0 && (
                        <div className="py-16 text-center text-gray-400 text-sm">
                            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p>No se encontraron prospects con los filtros actuales.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Intelligence Modal */}
            {intelligenceCustomer && (
                <HPEIntelligenceCenter 
                    customer={intelligenceCustomer} 
                    onClose={() => setIntelligenceCustomer(null)} 
                />
            )}
        </div>
    );
}
