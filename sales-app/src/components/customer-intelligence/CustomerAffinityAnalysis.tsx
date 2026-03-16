'use client';

import React, { useMemo, useState } from 'react';
import { CUSTOMER_DATABASE } from '@/lib/customer-intelligence-data';
import { BarChart2, CheckCircle, TrendingUp, TrendingDown, Minus, X, Briefcase, Target, ClipboardList, Info, ExternalLink } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Same product list used in Partner Intelligence > Product Affinity
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCTS = [
    { id: 'morpheus',               label: 'HPE Morpheus VME',                           desc: 'Hybrid Cloud, Multi-Cloud Management, Automation & Containers' },
    { id: 'vm-essentials',          label: 'HPE VM Essentials',                          desc: 'Virtualización empresarial moderna, desacoplada y rentable.' },
    { id: 'vm_essentials_infra',    label: 'VM Essentials (Full Stack)',                  desc: 'Stack completo de virtualización pre-configurado e integrado.' },
    { id: 'vm_essentials_license',  label: 'VM Essentials (Licencia)',                   desc: 'Software de virtualización para cualquier hardware x86 estándar.' },
    { id: 'pcbe_business',          label: 'PCBE Business Edition',                      desc: 'Nube privada simplificada para el mercado medio y sucursales.' },
    { id: 'pcbe_enterprise',        label: 'PCBE Enterprise Edition',                    desc: 'Nube privada de alto rendimiento para cargas críticas a escala.' },
    { id: 'storeonce',              label: 'HPE StoreOnce',                              desc: 'Protección de datos eficiente y backup de alto rendimiento.' },
    { id: 'zerto',                  label: 'HPE Zerto',                                  desc: 'Protección continua de datos y movilidad de cargas de trabajo.' },
    { id: 'simplivity',             label: 'HPE SimpliVity',                             desc: 'HCI Inteligente con garantía de eficiencia de datos extrema.' },
    { id: 'gl-pcbe',                label: 'HPE GreenLake for Private Cloud BE',         desc: 'La nube privada hiperconvergente simplificada para el data center.' },
    { id: 'gl-pce',                 label: 'HPE Private Cloud Enterprise (PCE)',         desc: 'Nube privada automatizada que soporta VMs, contenedores y bare metal.' },
    { id: 'gl-block',               label: 'HPE GreenLake for Block Storage',            desc: 'Almacenamiento de bloque como servicio con disponibilidad del 100%.' },
    { id: 'gl-file',                label: 'HPE GreenLake for File Storage',             desc: 'Almacenamiento de archivos escalable diseñado para IA y análisis.' },
    { id: 'gl-networking',          label: 'HPE GreenLake for Networking',               desc: 'NaaS - Networking as a Service gestionado desde la nube.' },
    { id: 'gl-dr',                  label: 'HPE GreenLake for Disaster Recovery',        desc: 'SaaS-based DR con orquestación automática y resiliencia ante Ransomware.' },
    { id: 'opsramp',                label: 'HPE OpsRamp',                                desc: 'Observabilidad full-stack y gestión de operaciones IT (AIOps).' },
] as const;

type ProductId = typeof PRODUCTS[number]['id'];

const TIER_CONFIG = {
    High:   { label: 'Alta Afinidad',      bg: 'bg-green-50',  border: 'border-green-200',  scoreBg: 'bg-green-500',  textColor: 'text-green-700',  icon: TrendingUp },
    Medium: { label: 'Afinidad Potencial', bg: 'bg-yellow-50', border: 'border-yellow-200', scoreBg: 'bg-yellow-400', textColor: 'text-yellow-700', icon: Minus },
    Low:    { label: 'Baja Afinidad',      bg: 'bg-gray-50',   border: 'border-gray-200',   scoreBg: 'bg-gray-400',   textColor: 'text-gray-600',   icon: TrendingDown },
};

// ─────────────────────────────────────────────────────────────────────────────
// Scoring engine: maps Customer pain-point signals → product affinity score
// Mirrors the logic from partner-intelligence/ProductAffinity.tsx but adapted
// to Customer boolean fields instead of Partner fields.
// ─────────────────────────────────────────────────────────────────────────────
function scoreCustomerForProduct(c: typeof CUSTOMER_DATABASE[number], pid: ProductId) {
    let score = 0;
    const breakdown: { label: string; value: number }[] = [];

    const add = (val: number, label: string, cond: boolean) => {
        if (cond) { score += val; breakdown.push({ label, value: val }); }
    };

    switch (pid) {
        case 'vm-essentials':
        case 'vm_essentials_infra':
            add(12, 'Impacto Broadcom',         c.broadcom_pricing_impact);
            add(10, 'VMware en uso',             c.current_hypervisor === 'VMware');
            add(9,  'Renovación VMware',          c.vmware_license_renewal_due);
            add(8,  'VMware EOL',                c.vmware_version_eol);
            add(6,  'HPE Hardware exist.',       c.existing_hpe_hardware);
            add(5,  'On-Premise DC',             c.on_prem_datacenter);
            add(4,  'Refresh pendiente',         c.datacenter_refresh_cycle);
            break;
        case 'vm_essentials_license':
            add(10, 'VMware en uso',             c.current_hypervisor === 'VMware');
            add(9,  'Impacto Broadcom',          c.broadcom_pricing_impact);
            add(8,  'Renovación VMware',          c.vmware_license_renewal_due);
            add(6,  'On-Premise DC',             c.on_prem_datacenter);
            add(4,  'Opt. de costos',            c.cost_optimization_priority);
            break;
        case 'morpheus':
            add(12, 'Transformación Digital',   c.digital_transformation_initiative);
            add(10, 'Cloud Repatriation',       c.cloud_repatriation_interest);
            add(8,  'Interés GreenLake',        c.hpe_greenlake_interest);
            add(6,  'Edge Infra',               c.edge_infrastructure);
            add(5,  'Optimización costos',      c.cost_optimization_priority);
            break;
        case 'pcbe_business':
            add(10, 'On-Premise DC',            c.on_prem_datacenter);
            add(8,  'Cloud Repatriation',       c.cloud_repatriation_interest);
            add(6,  'Impacto Broadcom',         c.broadcom_pricing_impact);
            add(5,  'Refresh pendiente',        c.datacenter_refresh_cycle);
            add(4,  'Empresa Mid-Market',       c.company_size === 'Mid-Market');
            break;
        case 'pcbe_enterprise':
            add(12, 'On-Premise DC',            c.on_prem_datacenter);
            add(10, 'Cloud Repatriation',       c.cloud_repatriation_interest);
            add(8,  'Impacto Broadcom',         c.broadcom_pricing_impact);
            add(7,  'Refresh pendiente',        c.datacenter_refresh_cycle);
            add(6,  'Empresa Enterprise',       c.company_size === 'Enterprise' || c.company_size === 'Large Enterprise');
            add(4,  'HPE Hardware exist.',      c.existing_hpe_hardware);
            break;
        case 'storeonce':
            add(12, 'On-Premise DC',            c.on_prem_datacenter);
            add(10, 'Refresh pendiente',        c.datacenter_refresh_cycle);
            add(8,  'Impacto Broadcom',         c.broadcom_pricing_impact);
            add(6,  'HPE Hardware exist.',      c.existing_hpe_hardware);
            add(4,  'Opt. de costos',           c.cost_optimization_priority);
            break;
        case 'zerto':
            add(12, 'On-Premise DC',            c.on_prem_datacenter);
            add(10, 'Renovación VMware',         c.vmware_license_renewal_due);
            add(8,  'Impacto Broadcom',         c.broadcom_pricing_impact);
            add(6,  'Cloud Repatriation',       c.cloud_repatriation_interest);
            add(5,  'Refresh pendiente',        c.datacenter_refresh_cycle);
            break;
        case 'simplivity':
            add(12, 'On-Premise DC',            c.on_prem_datacenter);
            add(10, 'Refresh pendiente',        c.datacenter_refresh_cycle);
            add(8,  'Edge Infra',               c.edge_infrastructure);
            add(6,  'HPE Hardware exist.',      c.existing_hpe_hardware);
            add(6,  'VMware en uso',            c.current_hypervisor === 'VMware');
            add(4,  'Impacto Broadcom',         c.broadcom_pricing_impact);
            break;
        case 'gl-pcbe':
            add(12, 'Interés GreenLake',        c.hpe_greenlake_interest);
            add(10, 'Cloud Repatriation',       c.cloud_repatriation_interest);
            add(8,  'On-Premise DC',            c.on_prem_datacenter);
            add(6,  'Edge Infra',               c.edge_infrastructure);
            add(4,  'Opt. de costos',           c.cost_optimization_priority);
            break;
        case 'gl-pce':
            add(12, 'Interés GreenLake',        c.hpe_greenlake_interest);
            add(10, 'Cloud Repatriation',       c.cloud_repatriation_interest);
            add(8,  'Transformación digital',   c.digital_transformation_initiative);
            add(6,  'On-Premise DC',            c.on_prem_datacenter);
            add(5,  'Empresa Enterprise',       c.company_size === 'Enterprise' || c.company_size === 'Large Enterprise');
            break;
        case 'gl-block':
            add(12, 'On-Premise DC',            c.on_prem_datacenter);
            add(10, 'Refresh pendiente',        c.datacenter_refresh_cycle);
            add(8,  'HPE Hardware exist.',      c.existing_hpe_hardware);
            add(6,  'Interés GreenLake',        c.hpe_greenlake_interest);
            add(4,  'Impacto Broadcom',         c.broadcom_pricing_impact);
            break;
        case 'gl-file':
            add(12, 'On-Premise DC',            c.on_prem_datacenter);
            add(10, 'Transformación digital',   c.digital_transformation_initiative);
            add(8,  'Interés GreenLake',        c.hpe_greenlake_interest);
            add(6,  'Refresh pendiente',        c.datacenter_refresh_cycle);
            break;
        case 'gl-networking':
            add(12, 'Edge Infra',               c.edge_infrastructure);
            add(10, 'Transformación digital',   c.digital_transformation_initiative);
            add(8,  'Interés GreenLake',        c.hpe_greenlake_interest);
            add(6,  'Cloud Repatriation',       c.cloud_repatriation_interest);
            break;
        case 'gl-dr':
            add(12, 'On-Premise DC',            c.on_prem_datacenter);
            add(10, 'VMware EOL',               c.vmware_version_eol);
            add(8,  'Renovación VMware',         c.vmware_license_renewal_due);
            add(6,  'Impacto Broadcom',         c.broadcom_pricing_impact);
            add(5,  'Interés GreenLake',        c.hpe_greenlake_interest);
            break;
        case 'opsramp':
            add(12, 'Transformación digital',   c.digital_transformation_initiative);
            add(10, 'Interés GreenLake',        c.hpe_greenlake_interest);
            add(8,  'On-Premise DC',            c.on_prem_datacenter);
            add(5,  'Cloud Repatriation',       c.cloud_repatriation_interest);
            add(4,  'Opt. de costos',           c.cost_optimization_priority);
            break;
    }

    let tier: keyof typeof TIER_CONFIG = 'Low';
    if (score >= 18) tier = 'High';
    else if (score >= 9) tier = 'Medium';

    return { score, tier, breakdown };
}

// ─────────────────────────────────────────────────────────────────────────────
// Work Plan Generator Helper
// ─────────────────────────────────────────────────────────────────────────────
function generateWorkPlan(customer: any, product: typeof PRODUCTS[number]) {
    const plan = [];
    
    // Phase 1: Preparation
    plan.push({
        title: "Evaluación Técnica Inicial",
        steps: [
            `Analizar infraestructura actual (${customer.current_hypervisor}) para viabilidad técnica de ${product.label}.`,
            customer.broadcom_pricing_impact ? "Cuantificación financiera del impacto Broadcom para caso de negocio inicial." : "Evaluación de costos operativos actuales vs proyección HPE.",
            customer.vmware_version_eol ? "Auditoría de versiones críticas de VMware cercanas a EOL a mitigar." : "Inventario de activos de virtualización críticos."
        ]
    });

    // Phase 2: Technical Value Prop
    const technicalSteps = [];
    if (product.id.includes('vm-essentials')) {
        technicalSteps.push("Demo de coexistencia: Ejecutar VM Essentials en hardware HPE existente.");
        technicalSteps.push("Plan de migración 'Zero Downtime' para cargas de trabajo críticas.");
    } else if (product.id.includes('gl')) {
        technicalSteps.push("Taller de modelado financiero 'Pay-per-use' vs CapEx tradicional.");
        technicalSteps.push("Evaluación de conectividad para gestión desde GreenLake Cloud Portal.");
    } else {
        technicalSteps.push(`Deep-dive técnico: Arquitectura de referencia de ${product.label}.`);
        technicalSteps.push("Prueba de concepto (PoC) sobre necesidades de datacenter refresh.");
    }
    plan.push({ title: "Propuesta de Valor Técnica", steps: technicalSteps });

    // Phase 3: Sales Motion
    plan.push({
        title: "Estrategia de Cierre Comercial",
        steps: [
            `Presentar ROI basado en la eliminación de ${customer.broadcom_pricing_impact ? 'sobrecostos de licenciamiento' : 'ineficiencias operativas'}.`,
            "Alinear con el partner estratégico local para la implementación del servicio.",
            `Agenda de reunión ejecutiva con stakeholders de ${customer.industry.split('/')[0].trim()}.`
        ]
    });
    return plan;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CustomerAffinityAnalysis({ filterRegion }: { filterRegion?: string }) {
    const [selectedProduct, setSelectedProduct] = useState<ProductId>(PRODUCTS[0].id);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

    const activeProduct = PRODUCTS.find(p => p.id === selectedProduct)!;
    const ranked = useMemo(() => {
        return CUSTOMER_DATABASE
            .filter((c: any) => !filterRegion || c.region === filterRegion || c.country === filterRegion)
            .map((c: any) => {
                const { score, tier, breakdown } = scoreCustomerForProduct(c, selectedProduct);
                return { ...c, score, tier, breakdown };
            })
            .filter((c: any) => c.score > 0)
            .sort((a: any, b: any) => b.score - a.score);
    }, [selectedProduct, filterRegion]);

    const selectedCustomer = useMemo(() =>
        selectedCustomerId ? ranked.find((c: any) => c.id === selectedCustomerId) : null
    , [selectedCustomerId, ranked]);

    const byTier = {
        High:   ranked.filter((c: any) => c.tier === 'High'),
        Medium: ranked.filter((c: any) => c.tier === 'Medium'),
        Low:    ranked.filter((c: any) => c.tier === 'Low'),
    };

    const handleExportPDF = () => {
        if (!selectedCustomer || !activeProduct) return;

        const doc = new jsPDF();
        const customer = selectedCustomer;
        const product = activeProduct;

        // Header
        doc.setFillColor(1, 169, 130);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("Plan de Trabajo HPE", 20, 25);
        doc.setFontSize(10);
        doc.text(`Cliente: ${customer.company_name} | Producto: ${product.label}`, 20, 33);

        let y = 50;

        // Section: Profile
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("Perfil Técnico del Cliente", 20, y);
        y += 10;
        
        autoTable(doc, {
            startY: y,
            head: [['Parámetro', 'Valor']],
            body: [
                ['Hypervisor Actual', customer.current_hypervisor],
                ['Adopción Cloud', customer.cloud_adoption],
                ['Servidores Estimados', customer.estimated_servers.toLocaleString('en-US')],
                ['Tamaño de Cia.', customer.company_size],
                ['Industria', customer.industry]
            ],
            theme: 'striped',
            headStyles: { fillColor: [1, 169, 130] }
        });
        
        y = (doc as any).lastAutoTable.finalY + 15;

        // Section: Work Plan
        doc.setFontSize(14);
        doc.text("Plan de Trabajo Proyectado", 20, y);
        y += 10;
        
        const phases = generateWorkPlan(customer, product);
        phases.forEach(phase => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFontSize(11);
            doc.setTextColor(1, 169, 130);
            doc.text(phase.title, 20, y);
            y += 6;
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(9);
            phase.steps.forEach(step => {
                const lines = doc.splitTextToSize(`• ${step}`, 170);
                if (y + (lines.length * 5) > 280) { doc.addPage(); y = 20; }
                doc.text(lines, 25, y);
                y += (lines.length * 5);
            });
            y += 5;
        });

        doc.save(`Plan_HPE_${customer.company_name.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div className="space-y-6">
            {/* Header + Product Selector */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-gray-900">
                            <BarChart2 className="w-5 h-5 text-[#01A982]" />
                            Afinidad de Negocio HPE — Portafolio de Virtualización
                        </h2>
                        <p className="text-sm text-gray-500 max-w-3xl leading-relaxed mb-4">
                            Selecciona una solución HPE para analizar qué prospects tienen mayor afinidad de compra. El motor evalúa señales de pain points conocidos como impacto Broadcom, VMware EOL, interés en GreenLake y refresh de datacenter.
                        </p>

                        {/* Product chips */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                            {PRODUCTS.map(prod => (
                                <button key={prod.id} onClick={() => setSelectedProduct(prod.id)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${selectedProduct === prod.id
                                        ? 'bg-[#01A982] text-white border-[#01A982] shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#01A982] hover:text-[#01A982]'}`}>
                                    {selectedProduct === prod.id && <CheckCircle className="w-3 h-3 inline-block mr-1.5 mb-0.5" />}
                                    {prod.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active product info */}
                    <div className="md:w-64 flex-shrink-0 bg-gray-50 p-4 flex flex-col rounded-lg border border-gray-100">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Producto en Foco:</div>
                        <div className="text-base font-black text-[#01A982] leading-tight mb-2">{activeProduct.label}</div>
                        <p className="text-xs text-gray-500">{activeProduct.desc}</p>
                    </div>
                </div>
            </div>

            {/* Summary pills */}
            <div className="grid grid-cols-3 gap-4">
                {(['High', 'Medium', 'Low'] as const).map(tier => {
                    const cfg = TIER_CONFIG[tier];
                    const Icon = cfg.icon;
                    return (
                        <div key={tier} className={`${cfg.bg} ${cfg.border} border rounded-xl p-4 flex items-center gap-3`}>
                            <div className={`${cfg.scoreBg} text-white rounded-lg p-2`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <div className={`text-2xl font-bold ${cfg.textColor}`}>{byTier[tier].length}</div>
                                <div className="text-xs text-gray-500">{cfg.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Ranked list by tier */}
            {(['High', 'Medium', 'Low'] as const).map(tier => {
                const customers = byTier[tier];
                if (customers.length === 0) return null;
                const cfg = TIER_CONFIG[tier];
                const Icon = cfg.icon;
                return (
                    <div key={tier}>
                        <h3 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-3 ${cfg.textColor}`}>
                            <Icon className="h-4 w-4" />
                            {cfg.label} ({customers.length})
                        </h3>
                        <div className="space-y-3">
                            {customers.map((c: any, idx: number) => (
                                <div 
                                    key={c.id} 
                                    onClick={() => setSelectedCustomerId(c.id)}
                                    className={`${cfg.bg} ${cfg.border} border rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-md cursor-pointer transition-all ${selectedCustomerId === c.id ? 'ring-2 ring-[#01A982] border-transparent' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Rank */}
                                        <div className={`${cfg.scoreBg} text-white text-xs font-bold rounded-lg w-8 h-8 flex items-center justify-center flex-shrink-0`}>
                                            #{idx + 1}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="font-semibold text-gray-900 truncate max-w-[200px]">{c.company_name}</span>
                                                <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5">{c.country}</span>
                                                <span className="text-xs px-2 py-0.5 rounded font-medium bg-gray-100 text-gray-600">{c.industry.split('/')[0].trim()}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${c.current_hypervisor === 'VMware' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{c.current_hypervisor}</span>
                                            </div>
                                            {/* Signal breakdown pills */}
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {c.breakdown.map((b: any, i: number) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        +{b.value} {b.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Score */}
                                        <div className="text-right flex-shrink-0">
                                            <div className={`text-2xl font-black ${cfg.textColor}`}>{c.score}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Pts Afinidad</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
            {/* Opportunity Detail Side Panel */}
            <AnimatePresence>
                {selectedCustomer && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCustomerId(null)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
                        />
                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-100"
                        >
                            {/* Panel Header */}
                            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b p-6 z-10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">{selectedCustomer.company_name}</h2>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Briefcase className="h-3.5 w-3.5" />
                                        Oportunidad detectada para {activeProduct.label}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedCustomerId(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-6 w-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Customer Snapshot */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-blue-50 rounded-lg">
                                            <Info className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Perfíl Técnico del Cliente</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="text-[10px] text-gray-400 uppercase font-black mb-1">Entorno Actual</div>
                                            <div className="font-bold text-gray-900">{selectedCustomer.current_hypervisor}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="text-[10px] text-gray-400 uppercase font-black mb-1">Adopción Cloud</div>
                                            <div className="font-bold text-gray-900">{selectedCustomer.cloud_adoption}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="text-[10px] text-gray-400 uppercase font-black mb-1">Capacidad Infra.</div>
                                            <div className="font-bold text-gray-900">{selectedCustomer.estimated_servers.toLocaleString('en-US')} Srv.</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="text-[10px] text-gray-400 uppercase font-black mb-1">Tamaño Cía.</div>
                                            <div className="font-bold text-gray-900">{selectedCustomer.company_size}</div>
                                        </div>
                                    </div>
                                </section>

                                {/* Affinity Justification */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-emerald-50 rounded-lg">
                                            <Target className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Justificación de Afinidad</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {selectedCustomer.breakdown.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                                                <span className="text-sm text-emerald-800 font-medium">{item.label}</span>
                                                <span className="text-sm font-black text-emerald-600">+{item.value} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Work Plan */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-[#01A982]/10 rounded-lg">
                                            <ClipboardList className="h-4 w-4 text-[#01A982]" />
                                        </div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Plan de Trabajo Sugerido</h3>
                                    </div>
                                    <div className="space-y-6">
                                        {generateWorkPlan(selectedCustomer, activeProduct).map((phase, i) => (
                                            <div key={i} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-gray-200 last:before:hidden">
                                                <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-[#01A982] border-2 border-white" />
                                                <h4 className="text-sm font-bold text-gray-900 mb-3">{phase.title}</h4>
                                                <ul className="space-y-3">
                                                    {phase.steps.map((step, j) => (
                                                        <li key={j} className="text-sm text-gray-600 flex gap-2">
                                                            <div className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                                                            {step}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* External Actions */}
                                <div className="pt-4 flex gap-3">
                                    <button 
                                        onClick={handleExportPDF}
                                        className="flex-1 bg-[#01A982] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#01A982]/20 hover:bg-[#018e6c] transition-all flex items-center justify-center gap-2"
                                    >
                                        Exportar Plan (PDF)
                                        <ExternalLink className="h-4 w-4" />
                                    </button>
                                    <button className="px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                                        <Target className="h-4 w-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
