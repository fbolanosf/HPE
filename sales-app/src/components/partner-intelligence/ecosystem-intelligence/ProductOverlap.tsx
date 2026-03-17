'use client';

import React, { useMemo, useState, useRef } from 'react';
import { PARTNER_DATABASE, Partner } from '@/lib/partner-intelligence-data';
import { Filter, Download, Maximize, Minimize, FileText, Globe } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Same product list used in Partner Intelligence > Product Affinity
const PRODUCTS = [
    { id: 'morpheus', label: 'HPE Morpheus VME' },
    { id: 'vm-essentials', label: 'HPE VM Essentials' },
    { id: 'vm_essentials_infra', label: 'VM Essentials (Full)' },
    { id: 'vm_essentials_license', label: 'VM Essentials (Lic)' },
    { id: 'pcbe_business', label: 'PCBE Business Ed.' },
    { id: 'pcbe_enterprise', label: 'PCBE Enterprise Ed.' },
    { id: 'storeonce', label: 'HPE StoreOnce' },
    { id: 'zerto', label: 'HPE Zerto' },
    { id: 'simplivity', label: 'HPE SimpliVity' },
    { id: 'gl-pcbe', label: 'GL for Private Cloud BE' },
    { id: 'gl-pce', label: 'GL Private Cloud Enterprise' },
    { id: 'gl-block', label: 'GL for Block Storage' },
    { id: 'gl-file', label: 'GL for File Storage' },
    { id: 'gl-networking', label: 'GL for Networking' },
    { id: 'gl-dr', label: 'GL for Disaster Recovery' },
    { id: 'opsramp', label: 'HPE OpsRamp' },
] as const;

type ProductId = typeof PRODUCTS[number]['id'];

// Minimalist scoring engine for the matrix (consistent with ProductAffinity.tsx)
function calculateAffinityScore(p: Partner, productId: ProductId): number {
    let score = 0;
    const add = (val: number, cond: boolean) => { if (cond) score += val; };

    switch (productId) {
        case 'vm-essentials':
        case 'vm_essentials_infra':
            add(10, !!p.vmware_partner);
            add(8, !!p.virtualization);
            add(7, !!p.hci);
            add(6, !!p.vxrail_partner);
            break;
        case 'vm_essentials_license':
            add(10, !!p.virtualization);
            add(8, !!p.vmware_partner);
            break;
        case 'morpheus':
            add(12, !!p.hybrid_cloud);
            add(10, !!p.cloud_migration);
            add(8, !!p.observability);
            add(7, !!p.container_platforms);
            break;
        case 'pcbe_business':
        case 'pcbe_enterprise':
            add(12, !!p.hybrid_cloud);
            add(10, !!p.virtualization);
            add(8, !!p.datacenter_infrastructure);
            break;
        case 'storeonce':
            add(12, !!p.backup_and_disaster_recovery);
            add(10, !!p.datacenter_infrastructure);
            add(8, !!p.veeam_partner);
            break;
        case 'zerto':
            add(10, !!p.backup_and_disaster_recovery);
            add(8, !!p.virtualization);
            add(5, !!p.veeam_partner);
            break;
        case 'simplivity':
            add(10, !!p.hci);
            add(8, !!p.virtualization);
            add(7, !!p.edge_computing);
            break;
        case 'gl-pcbe':
            add(12, !!p.hybrid_cloud);
            add(10, !!p.virtualization);
            break;
        case 'gl-pce':
            add(12, !!p.hybrid_cloud);
            add(10, !!p.observability);
            add(8, !!p.container_platforms);
            break;
        case 'gl-block':
            add(12, !!p.datacenter_infrastructure);
            add(10, !!(p.finance || p.telecommunications));
            break;
        case 'gl-file':
            add(12, !!p.datacenter_infrastructure);
            add(10, !!p.observability);
            add(8, !!p.hci);
            break;
        case 'gl-networking':
            add(15, !!p.industrial_networking);
            add(12, !!(p.cisco_partner || p.juniper_partner));
            break;
        case 'gl-dr':
            add(15, !!p.backup_and_disaster_recovery);
            add(10, !!p.datacenter_infrastructure);
            break;
        case 'opsramp':
            add(10, !!p.observability);
            add(6, !!p.hybrid_cloud);
            add(5, !!p.datacenter_infrastructure);
            break;
    }
    return score;
}

export default function ProductOverlap() {
    const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
    const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get unique regions and countries from Database
    const regions = useMemo(() => {
        const set = new Set(PARTNER_DATABASE.map(p => p.region));
        return Array.from(set).sort();
    }, []);

    const countries = useMemo(() => {
        const filtered = PARTNER_DATABASE.filter(p => selectedRegion === 'ALL' || p.region === selectedRegion);
        const set = new Set(filtered.map(p => p.country));
        return Array.from(set).sort();
    }, [selectedRegion]);

    const data = useMemo(() => {
        return PARTNER_DATABASE
            .filter(p => (selectedRegion === 'ALL' || p.region === selectedRegion))
            .filter(p => (selectedCountry === 'ALL' || p.country === selectedCountry))
            .map(partner => ({
                id: partner.id,
                name: partner.company_name,
                country: partner.country,
                region: partner.region,
                scores: PRODUCTS.reduce((acc, prod) => {
                    acc[prod.id] = calculateAffinityScore(partner, prod.id);
                    return acc;
                }, {} as Record<string, number>)
            }));
    }, [selectedRegion, selectedCountry]);

    const maxScore = 25;

    const getColor = (val: number) => {
        if (val === 0) return '#f1f5f9';
        const intensity = 0.05 + (val / maxScore) * 0.95;
        // Using a softer, more translucent HPE Green (01A982)
        return `rgba(1, 169, 130, ${Math.min(intensity, 0.85)})`;
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // Listen for fullscreen changes to update local state (handles Esc key)
    React.useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const exportToPDF = () => {
        const doc = new jsPDF('landscape', 'pt', 'a4');
        
        // Premium Header Branding
        doc.setFillColor(1, 169, 130);
        doc.rect(0, 0, 842, 60, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('HPE PORTFOLIO OVERLAP MATRIX', 40, 38);
        
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Region: ${selectedRegion} | Country: ${selectedCountry}`, 40, 80);
        doc.text(`Source Data: HPE Partner Intelligence Ecosystem`, 40, 95);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 650, 95);

        const tableHeaders = [['Partner', ...PRODUCTS.map(p => p.label)]];
        const tableData = data.map(row => [
            row.name,
            ...PRODUCTS.map(p => row.scores[p.id].toString())
        ]);

        autoTable(doc, {
            head: tableHeaders,
            body: tableData,
            startY: 110,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 3, halign: 'center' },
            headStyles: { fillColor: [1, 169, 130], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            columnStyles: {
                0: { fontStyle: 'bold', minCellWidth: 100 }
            }
        });

        doc.save(`HPE_Product_Overlap_${selectedCountry}.pdf`);
    };

    return (
        <div className={`flex flex-col h-full space-y-6 ${isFullscreen ? 'bg-white p-8 overflow-y-auto w-full' : ''}`} ref={containerRef}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        Product Overlap Matrix
                        {isFullscreen && <span className="text-[10px] bg-emerald-100 text-[#01A982] px-2 py-0.5 rounded-full uppercase tracking-widest">Pantalla Completa</span>}
                    </h3>
                    <p className="text-xs text-gray-500 max-w-2xl">
                        Afinidad Partner vs Portafolio HPE: Visualización cruzada para identificación de potencial de venta cruzada.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Region Filter */}
                    <div className="relative group">
                        <select
                            value={selectedRegion}
                            onChange={(e) => {
                                setSelectedRegion(e.target.value);
                                setSelectedCountry('ALL');
                            }}
                            className="appearance-none pl-8 pr-8 py-1.5 text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-lg hover:border-[#01A982] transition-colors focus:ring-1 focus:ring-[#01A982] outline-none cursor-pointer"
                        >
                            <option value="ALL">Todas las Regiones</option>
                            {regions.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-hover:text-[#01A982]" />
                    </div>

                    {/* Country Filter */}
                    <div className="relative group">
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="appearance-none pl-8 pr-8 py-1.5 text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-lg hover:border-[#01A982] transition-colors focus:ring-1 focus:ring-[#01A982] outline-none cursor-pointer"
                        >
                            <option value="ALL">Todos los países</option>
                            {countries.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-hover:text-[#01A982]" />
                    </div>

                    <div className="h-6 w-px bg-gray-200" />

                    {/* Actions */}
                    <button 
                        onClick={toggleFullscreen}
                        className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-[#01A982] hover:border-[#01A982] transition-all"
                        title={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
                    >
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>

                    <button 
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:text-[#01A982] hover:border-[#01A982] transition-all"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Exportar PDF
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-xl relative shadow-sm bg-white scrollbar-thin scrollbar-thumb-gray-200">
                <table className="w-full text-left text-[11px] text-gray-700 border-collapse">
                    <thead className="bg-slate-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 font-bold w-64 sticky left-0 bg-slate-50 z-20 border-r border-gray-100 align-bottom uppercase tracking-wider text-[10px] text-gray-500">
                                Partner Intelligence
                                {selectedCountry !== 'ALL' && <div className="text-[9px] text-[#01A982] font-semibold mt-0.5">{selectedCountry}</div>}
                            </th>
                            {PRODUCTS.map(prod => (
                                <th key={prod.id} className="px-2 font-semibold align-bottom min-w-[50px] max-w-[50px]" style={{ height: '180px' }}>
                                    <div className="relative h-full w-full">
                                        <div className="absolute bottom-3 left-1/2 origin-bottom-left -rotate-45 whitespace-nowrap text-[11px] text-gray-700 tracking-wide">
                                            {prod.label}
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-emerald-50/30 transition-colors">
                                <td className="px-4 py-2 font-bold bg-white sticky left-0 z-10 border-r border-gray-100 whitespace-nowrap shadow-[1px_0_0_0_#f1f5f9]">
                                    <div className="text-gray-900">{row.name}</div>
                                    <div className="text-[9px] text-gray-400 font-medium flex items-center gap-1">
                                        <Globe className="w-2.5 h-2.5" /> {row.country} • {row.region}
                                    </div>
                                </td>
                                {PRODUCTS.map(prod => {
                                    const val = row.scores[prod.id];
                                    return (
                                        <td key={prod.id} className="p-0.5 text-center">
                                            <div
                                                className="w-full h-8 flex items-center justify-center rounded text-[10px] font-bold transition-all"
                                                style={{ 
                                                    backgroundColor: getColor(val), 
                                                    color: val > (maxScore / 2) ? 'white' : 'inherit' 
                                                }}
                                                title={`${row.name} affinity for ${prod.label}: ${val} pts`}
                                            >
                                                {val > 0 ? val : '-'}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length === 0 && (
                    <div className="p-12 text-center text-gray-400 italic">No se encontraron partners para los filtros seleccionados.</div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-[11px] text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                    <span className="font-bold not-italic">Legend:</span>
                    <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 border border-gray-200 bg-white rounded-sm" /> 0 Low</div>
                    <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: 'rgba(1, 169, 130, 0.3)' }} /> Potential</div>
                    <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: 'rgba(1, 169, 130, 0.7)' }} /> Strong</div>
                    <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-sm shadow-sm" style={{ backgroundColor: 'rgba(1, 169, 130, 1)' }} /> High Alignment</div>
                </div>
                
                <div className="text-[10px] text-gray-400">
                    Mostrando <strong>{data.length}</strong> partners de <strong>{PARTNER_DATABASE.length}</strong>
                </div>
            </div>
        </div>
    );
}
