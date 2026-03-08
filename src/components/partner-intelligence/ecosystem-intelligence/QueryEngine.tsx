import React, { useState, useMemo } from 'react';
import { queryEcosystem } from '@/lib/ecosystem-data';
import { PARTNER_DATABASE, scorePartner } from '@/lib/partner-intelligence-data';
import { Search, Download, FilterX } from 'lucide-react';

export default function QueryEngine() {
    const [vendor, setVendor] = useState<string>('ALL');
    const [tech, setTech] = useState<string>('ALL');
    const [industry, setIndustry] = useState<string>('ALL');
    const [region, setRegion] = useState<string>('ALL');
    const [isHybrid, setIsHybrid] = useState<string>('ALL');

    const results = useMemo(() => {
        const rawResults = queryEcosystem(PARTNER_DATABASE, {
            vendor: vendor !== 'ALL' ? vendor : undefined,
            technology: tech !== 'ALL' ? tech : undefined,
            industry: industry !== 'ALL' ? industry : undefined,
            region: region !== 'ALL' ? region : undefined,
            isHybrid: isHybrid === 'ALL' ? undefined : isHybrid === 'TRUE'
        });
        return rawResults.map(p => ({ ...p, ...scorePartner(p) }));
    }, [vendor, tech, industry, region, isHybrid]);

    const handleExportCSV = () => {
        const headers = ['Company', 'Country', 'Region', 'Domain', 'HPE Score', 'Tier'];
        const csvContent = [
            headers.join(','),
            ...results.map(p => `"${p.company_name}","${p.country}","${p.region}","${p.technology_domain}",${p.score},"${p.tier}"`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ecosystem_query_results.csv`;
        link.click();
    };

    const resetFilters = () => {
        setVendor('ALL');
        setTech('ALL');
        setIndustry('ALL');
        setRegion('ALL');
        setIsHybrid('ALL');
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-bold text-gray-800">Ecosystem Query Engine</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                        Motor de consulta analítica. Muestra la intersección exacta de partners cruzando filtros relacionales (Ej. "Quiero ver todos los integradores en LATAM que vendan Siemens Y hagan Virtualización").
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <FilterX className="w-3.5 h-3.5" />
                        Limpiar
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Exportar CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-4 border border-gray-200 rounded-xl">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Vendor Aliance</label>
                    <select value={vendor} onChange={e => setVendor(e.target.value)} className="w-full text-xs border-gray-300 rounded shadow-sm py-1.5">
                        <option value="ALL">Cualquiera</option>
                        <option value="VMware">VMware</option>
                        <option value="HPE">HPE</option>
                        <option value="Siemens">Siemens</option>
                        <option value="Rockwell Automation">Rockwell Automation</option>
                        <option value="Schneider Electric">Schneider Electric</option>
                        <option value="ABB">ABB</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Technology Focus</label>
                    <select value={tech} onChange={e => setTech(e.target.value)} className="w-full text-xs border-gray-300 rounded shadow-sm py-1.5">
                        <option value="ALL">Cualquiera</option>
                        <option value="Virtualization">Virtualization</option>
                        <option value="Hybrid Cloud">Hybrid Cloud</option>
                        <option value="SCADA Integration">SCADA Integration</option>
                        <option value="Industrial IoT">Industrial IoT</option>
                        <option value="PLC Programming">PLC Programming</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Target Industry</label>
                    <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full text-xs border-gray-300 rounded shadow-sm py-1.5">
                        <option value="ALL">Cualquiera</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Energy">Energy</option>
                        <option value="Oil & Gas">Oil & Gas</option>
                        <option value="Mining">Mining</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Region</label>
                    <select value={region} onChange={e => setRegion(e.target.value)} className="w-full text-xs border-gray-300 rounded shadow-sm py-1.5">
                        <option value="ALL">Global</option>
                        <option value="LATAM">LATAM</option>
                        <option value="NA">North America</option>
                        <option value="EMEA">EMEA</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">IT/OT Hybrid</label>
                    <select value={isHybrid} onChange={e => setIsHybrid(e.target.value)} className="w-full text-xs border-gray-300 rounded shadow-sm py-1.5">
                        <option value="ALL">Indiferente</option>
                        <option value="TRUE">Sí (Híbridos)</option>
                        <option value="FALSE">No (Dominio Puro)</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 min-h-[300px] border border-gray-200 bg-white rounded-xl overflow-hidden flex flex-col">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                        Resultados de Consulta
                    </span>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {results.length} Partners Encontrados
                    </span>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                        <thead className="bg-white border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-2 font-semibold">Integrador</th>
                                <th className="px-4 py-2 font-semibold">País</th>
                                <th className="px-4 py-2 font-semibold">Dominio Tech</th>
                                <th className="px-4 py-2 font-semibold">HPE Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map(p => (
                                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-2 font-bold text-gray-900">{p.company_name}</td>
                                    <td className="px-4 py-2 text-gray-500">{p.country}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.technology_domain === 'IT' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                            p.technology_domain === 'OT' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                                'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            }`}>
                                            {p.technology_domain.replace('_', '/')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`font-mono font-bold ${p.score >= 80 ? 'text-[#01A982]' : p.score >= 50 ? 'text-amber-500' : 'text-gray-400'
                                            }`}>
                                            {Math.round(p.score)} pt
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {results.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400 font-medium">
                                        Ningun partner cumple con todos los criterios exactos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
