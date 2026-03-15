'use client';

import React, { useState, useMemo } from 'react';
import {
    Partner, PartnerFilters, PARTNER_DATABASE, DOMAIN_LABEL, PARTNER_TYPE_LABEL,
    UNIQUE_COUNTRIES, UNIQUE_REGIONS, searchPartners, scorePartner, updatePartnerInDatabase
} from '@/lib/partner-intelligence-data';
import { Search, Download, Filter, Edit2, X, Save } from 'lucide-react';
import * as XLSX from 'xlsx';

const DOMAIN_COLORS = {
    IT: 'bg-blue-100 text-blue-800',
    OT: 'bg-orange-100 text-orange-800',
    IT_OT_HYBRID: 'bg-green-100 text-green-800',
};

const TIER_COLORS = {
    High: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-red-100 text-red-800',
};

const CERT_COLORS = {
    'Triple Platinum Plus': 'bg-purple-100 text-purple-800 border-purple-200',
    'Platinum': 'bg-blue-100 text-blue-800 border-blue-200',
    'Gold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Silver': 'bg-gray-100 text-gray-800 border-gray-200',
    'Business Partner': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'None': 'bg-gray-50 text-gray-400 border-transparent',
};

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${className}`}>
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
    veeam_partner: 'Veeam',
    purestorage_partner: 'PureStorage',
    juniper_partner: 'Juniper',
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

interface PartnerDatabaseProps {
    preFilteredData?: Partner[];
    hideFilters?: boolean;
}

export default function PartnerDatabase({ preFilteredData, hideFilters }: PartnerDatabaseProps = {}) {
    const [filters, setFilters] = useState<PartnerFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    // Edit Modal State
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [editProfile, setEditProfile] = useState<Partial<Partner>>({});

    // Force re-render trick on save
    const [tick, setTick] = useState(0);

    const results = useMemo(() => {
        if (preFilteredData) return preFilteredData;
        return searchPartners(PARTNER_DATABASE, filters);
    }, [filters, tick, preFilteredData]);

    const handleEditClick = (p: Partner) => {
        setEditingPartner(p);
        setEditProfile({ ...p });
    };

    const handleSaveEdit = () => {
        if (editingPartner && editProfile) {
            updatePartnerInDatabase(editingPartner.id, editProfile);
            setEditingPartner(null);
            setTick(t => t + 1); // trigger re-render
        }
    };

    const toggleBool = (key: keyof Partner) => {
        setEditProfile(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const vendorsIT = ['vmware_partner', 'vxrail_partner', 'hpe_partner', 'dell_partner', 'nutanix_partner', 'cisco_partner', 'microsoft_partner', 'aws_partner', 'google_cloud_partner', 'veeam_partner', 'purestorage_partner', 'juniper_partner'] as const;
    const vendorsOT = ['siemens_partner', 'rockwell_partner', 'schneider_partner', 'abb_partner', 'honeywell_partner', 'emerson_partner', 'aveva_partner'] as const;
    const virtSolutions = ['virtualization', 'hci', 'datacenter_infrastructure', 'hybrid_cloud', 'cloud_migration', 'backup_and_disaster_recovery', 'container_platforms'] as const;
    const industries = ['telecommunications', 'finance', 'healthcare', 'retail', 'public_sector', 'manufacturing', 'energy', 'oil_and_gas', 'mining'] as const;
    const formatKey = (key: string) => key.replace(/_/g, ' ').replace('partner', '').trim().toUpperCase();

    function handleExportXLS() {
        const headers = [
            'Empresa', 'País', 'Ciudad', 'Región', 'Tipo', 'Dominio',
            'Empleados', 'Certificación HPE', 'Marcas / Vendors', 'Soluciones de Virtualización', 'Score HPE', 'Oportunidad', 'Website',
        ];
        const rows = results.map((p) => {
            const { score, tier } = scorePartner(p);
            const activeVendors = Object.entries(VENDOR_MAP).filter(([k]) => p[k as keyof Partner]).map(([, v]) => v).join('; ');
            const activeVirtSolutions = Object.entries(VIRT_MAP).filter(([k]) => p[k as keyof Partner]).map(([, v]) => v).join('; ');

            return [
                p.company_name, p.country, p.city, p.region,
                PARTNER_TYPE_LABEL[p.partner_type],
                DOMAIN_LABEL[p.technology_domain],
                p.estimated_employees, p.hpe_certification, activeVendors, activeVirtSolutions, score, tier, p.website,
            ];
        });

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Partners");
        XLSX.writeFile(workbook, "hpe-partner-intelligence.xlsx");
    }

    const update = (patch: Partial<PartnerFilters>) =>
        setFilters((f) => ({ ...f, ...patch }));

    return (
        <div className="space-y-4">
            {/* Search bar + actions */}
            {!hideFilters && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar empresa, país, descripción…"
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01A982]"
                            value={filters.query ?? ''}
                            onChange={(e) => update({ query: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="h-4 w-4" /> Filtros
                    </button>
                    <button
                        onClick={handleExportXLS}
                        className="flex items-center gap-2 px-4 py-2 bg-[#01A982] text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                    >
                        <Download className="h-4 w-4" /> Exportar XLS
                    </button>
                </div>
            )}

            {/* Advanced filters */}
            {showFilters && !hideFilters && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">País</label>
                        <select
                            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#01A982] focus:outline-none"
                            value={filters.country ?? ''}
                            onChange={(e) => update({ country: e.target.value || undefined })}
                        >
                            <option value="">Todos</option>
                            {UNIQUE_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Región</label>
                        <select
                            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#01A982] focus:outline-none"
                            value={filters.region ?? 'ALL'}
                            onChange={(e) => update({ region: e.target.value === 'ALL' ? undefined : e.target.value })}
                        >
                            <option value="ALL">Todas</option>
                            {UNIQUE_REGIONS.map((r) => <option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Dominio</label>
                        <select
                            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#01A982] focus:outline-none"
                            value={filters.technology_domain ?? 'ALL'}
                            onChange={(e) => update({ technology_domain: e.target.value as PartnerFilters['technology_domain'] })}
                        >
                            <option value="ALL">IT + OT + Hybrid</option>
                            <option value="IT">Solo IT</option>
                            <option value="OT">Solo OT</option>
                            <option value="IT_OT_HYBRID">Solo IT/OT Hybrid</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Oportunidad</label>
                        <select
                            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#01A982] focus:outline-none"
                            value={filters.opportunity_tier ?? 'ALL'}
                            onChange={(e) => update({ opportunity_tier: e.target.value as PartnerFilters['opportunity_tier'] })}
                        >
                            <option value="ALL">Todas</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Industria</label>
                        <select
                            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#01A982] focus:outline-none"
                            value={filters.industry ?? 'ALL'}
                            onChange={(e) => update({ industry: e.target.value as PartnerFilters['industry'] })}
                        >
                            <option value="ALL">Todas</option>
                            <option value="manufacturing">Manufactura</option>
                            <option value="retail">Retail / Comercio</option>
                            <option value="finance">Banca y Finanzas</option>
                            <option value="telecommunications">Telecomunicaciones</option>
                            <option value="healthcare">Salud</option>
                            <option value="public_sector">Sector Público</option>
                            <option value="food_and_beverage">Alimentos y Bebidas</option>
                            <option value="pharmaceutical">Farmacéutica</option>
                            <option value="energy">Energía</option>
                            <option value="mining">Minería</option>
                            <option value="oil_and_gas">Oil & Gas</option>
                            <option value="utilities">Utilities</option>
                        </select>
                    </div>
                    <div className="flex items-end col-span-2 sm:col-span-1">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input
                                type="checkbox"
                                className="rounded accent-[#01A982]"
                                checked={!!filters.excludeHPEPartners}
                                onChange={(e) => update({ excludeHPEPartners: e.target.checked })}
                            />
                            Excluir ya partners HPE
                        </label>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({})}
                            className="text-xs text-gray-500 underline hover:text-gray-800"
                        >Limpiar filtros</button>
                    </div>
                </div>
            )}

            {/* Results count */}
            <p className="text-sm text-gray-500">
                {results.length} partner{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </p>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Empresa</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">País</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Dominio</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Tipo</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Certificación HPE</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Marcas</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Virtualización</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">Score HPE</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Oportunidad</th>
                            <th className="text-center px-4 py-3 font-semibold text-gray-700">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {results.length === 0 && (
                            <tr>
                                <td colSpan={9} className="text-center py-12 text-gray-400">
                                    No se encontraron partners con los filtros seleccionados.
                                </td>
                            </tr>
                        )}
                        {results.map((p) => {
                            const { score, tier } = scorePartner(p);
                            const activeVendors = Object.entries(VENDOR_MAP)
                                .filter(([k]) => p[k as keyof Partner])
                                .map(([, v]) => v);
                            const activeVirtSolutions = Object.entries(VIRT_MAP)
                                .filter(([k]) => p[k as keyof Partner])
                                .map(([, v]) => v);

                            return (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{p.company_name}</div>
                                        <div className="text-xs text-gray-400">{p.website}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{p.country}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={DOMAIN_COLORS[p.technology_domain]}>
                                            {DOMAIN_LABEL[p.technology_domain]}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">
                                        {PARTNER_TYPE_LABEL[p.partner_type]}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={`border ${CERT_COLORS[p.hpe_certification]}`}>
                                            {p.hpe_certification}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                                            {activeVendors.length > 0 ? activeVendors.map(v => (
                                                <span key={v} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200">{v}</span>
                                            )) : <span className="text-xs text-gray-400">-</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                                            {activeVirtSolutions.length > 0 ? activeVirtSolutions.map(v => (
                                                <span key={v} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">{v}</span>
                                            )) : <span className="text-xs text-gray-400">-</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900">{score}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={TIER_COLORS[tier]}>{tier}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleEditClick(p)}
                                            className="p-1.5 text-gray-400 hover:text-[#01A982] hover:bg-emerald-50 rounded-md transition-colors"
                                            title="Editar Capacidades"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingPartner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200">

                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Actualizar Partner</h3>
                                <p className="text-sm text-gray-500">{editingPartner.company_name} ({editingPartner.country})</p>
                            </div>
                            <button onClick={() => setEditingPartner(null)} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">

                            {/* Company Attributes */}
                            <div>
                                <h4 className="text-xs font-bold uppercase text-gray-500 mb-3 border-b pb-1">Atributos Generales</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Tamaño de Empresa</label>
                                        <select
                                            value={editProfile.company_size || 'Medium'}
                                            onChange={e => setEditProfile(prev => ({ ...prev, company_size: e.target.value as any }))}
                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#01A982]"
                                        >
                                            <option value="Small">Small</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Large">Large</option>
                                            <option value="Enterprise">Enterprise</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Certificación HPE</label>
                                        <select
                                            value={editProfile.hpe_certification || 'None'}
                                            onChange={e => setEditProfile(prev => ({ ...prev, hpe_certification: e.target.value as any }))}
                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#01A982]"
                                        >
                                            <option value="None">Sin Certificación</option>
                                            <option value="Business Partner">Business Partner</option>
                                            <option value="Silver">Silver</option>
                                            <option value="Gold">Gold</option>
                                            <option value="Platinum">Platinum</option>
                                            <option value="Triple Platinum Plus">Triple Platinum Plus</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Empleados (Aprox)</label>
                                        <input
                                            type="number"
                                            value={editProfile.estimated_employees || 0}
                                            onChange={e => setEditProfile(prev => ({ ...prev, estimated_employees: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#01A982]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Matrix */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* IT */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-gray-500 border-b pb-1">IT & Cloud</h4>
                                    {vendorsIT.map(v => (
                                        <label key={v} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={!!editProfile[v]} onChange={() => toggleBool(v)} className="rounded text-[#01A982] focus:ring-[#01A982]" />
                                            <span className={`text-sm group-hover:text-[#01A982] ${editProfile[v] ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{formatKey(v)}</span>
                                        </label>
                                    ))}
                                </div>
                                {/* OT */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-gray-500 border-b pb-1">OT / Industrial</h4>
                                    {vendorsOT.map(v => (
                                        <label key={v} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={!!editProfile[v]} onChange={() => toggleBool(v)} className="rounded text-orange-500 focus:ring-orange-500" />
                                            <span className={`text-sm group-hover:text-orange-500 ${editProfile[v] ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{formatKey(v)}</span>
                                        </label>
                                    ))}
                                </div>
                                {/* Virt/DC */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-gray-500 border-b pb-1">Data Center</h4>
                                    {virtSolutions.map(v => (
                                        <label key={v} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={!!editProfile[v]} onChange={() => toggleBool(v)} className="rounded text-indigo-500 focus:ring-indigo-500" />
                                            <span className={`text-sm group-hover:text-indigo-500 ${editProfile[v] ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{formatKey(v)}</span>
                                        </label>
                                    ))}
                                </div>
                                {/* Industries */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-gray-500 border-b pb-1">Verticales</h4>
                                    {industries.map(v => (
                                        <label key={v} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={!!editProfile[v]} onChange={() => toggleBool(v)} className="rounded text-pink-500 focus:ring-pink-500" />
                                            <span className={`text-sm group-hover:text-pink-500 ${editProfile[v] ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{formatKey(v)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-end gap-3 z-10">
                            <button onClick={() => setEditingPartner(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleSaveEdit} className="flex items-center gap-2 px-5 py-2 bg-[#01A982] hover:bg-[#008f6b] text-white rounded-lg text-sm font-bold transition-colors">
                                <Save className="w-4 h-4" /> Guardar Cambios
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
