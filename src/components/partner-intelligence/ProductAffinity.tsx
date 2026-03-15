'use client';

import React, { useMemo, useState } from 'react';
import { PARTNER_DATABASE, DOMAIN_LABEL, PARTNER_TYPE_LABEL, Partner } from '@/lib/partner-intelligence-data';
import { Box, CheckCircle, Info, Minus, TrendingDown, TrendingUp } from 'lucide-react';

const PRODUCTS = [
    { id: 'morpheus', label: 'HPE Morpheus VME', desc: 'Hybrid Cloud, Multi-Cloud Management, Automation & Containers' },
    { id: 'vm-essentials', label: 'HPE VM Essentials', desc: 'Virtualización empresarial moderna, desacoplada y rentable.' },
    { id: 'vm_essentials_infra', label: 'VM Essentials (Full Stack)', desc: 'Stack completo de virtualización pre-configurado e integrado.' },
    { id: 'vm_essentials_license', label: 'VM Essentials (Licencia)', desc: 'Software de virtualización para ejecución en cualquier hardware x86 estándar.' },
    { id: 'pcbe_business', label: 'PCBE Business Edition', desc: 'Nube privada simplificada para el mercado medio y sucursales.' },
    { id: 'pcbe_enterprise', label: 'PCBE Enterprise Edition', desc: 'Nube privada de alto rendimiento para cargas de trabajo críticas a escala.' },
    { id: 'storeonce', label: 'HPE StoreOnce', desc: 'Protección de datos eficiente y backup de alto rendimiento.' },
    { id: 'zerto', label: 'HPE Zerto', desc: 'Protección continua de datos y movilidad de cargas de trabajo.' },
    { id: 'simplivity', label: 'HPE SimpliVity', desc: 'HCI Inteligente con garantía de eficiencia de datos extrema.' },
    { id: 'gl-pcbe', label: 'HPE GreenLake for Private Cloud Business Edition', desc: 'La nube privada hiperconvergente simplificada para el data center moderno.' },
    { id: 'gl-pce', label: 'HPE Private Cloud Enterprise (PCE)', desc: 'Nube privada automatizada que soporta VMs, contenedores y bare metal.' },
    { id: 'gl-block', label: 'HPE GreenLake for Block Storage', desc: 'Almacenamiento de bloque como servicio con disponibilidad del 100%.' },
    { id: 'gl-file', label: 'HPE GreenLake for File Storage', desc: 'Almacenamiento de archivos escalable diseñado para IA y análisis.' },
    { id: 'gl-networking', label: 'HPE GreenLake for Networking', desc: 'NaaS - Networking as a Service gestionado desde la nube.' },
    { id: 'gl-dr', label: 'HPE GreenLake for Disaster Recovery', desc: 'SaaS-based DR con orquestación automática y resiliencia ante Ransomware.' },
    { id: 'opsramp', label: 'HPE OpsRamp', desc: 'Observabilidad full-stack y gestión de operaciones IT (AIOps).' },
] as const;

type ProductId = typeof PRODUCTS[number]['id'];

const TIER_CONFIG = {
    High: {
        label: 'High Affinity',
        bg: 'bg-green-50',
        border: 'border-green-200',
        scoreBg: 'bg-green-500',
        textColor: 'text-green-700',
        icon: TrendingUp,
    },
    Medium: {
        label: 'Potential Affinity',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        scoreBg: 'bg-yellow-400',
        textColor: 'text-yellow-700',
        icon: Minus,
    },
    Low: {
        label: 'Low Affinity',
        bg: 'bg-gray-50', // modified from red to gray for product affinity to be less harsh
        border: 'border-gray-200',
        scoreBg: 'bg-gray-400',
        textColor: 'text-gray-700',
        icon: TrendingDown,
    },
};

const DOMAIN_COLORS = {
    IT: 'bg-blue-100 text-blue-700',
    OT: 'bg-orange-100 text-orange-700',
    IT_OT_HYBRID: 'bg-green-100 text-green-700',
};

// --- Product Scoring Engine ---
// Asigna puntos (positivos/negativos) a las capacidades de un partner dado el producto
function scoreForProduct(p: Partner, productId: ProductId): { score: number; tier: keyof typeof TIER_CONFIG; breakdown: { label: string; value: number }[] } {
    let score = 0;
    const breakdown: { label: string; value: number }[] = [];

    const add = (val: number, label: string, cond: boolean) => {
        if (cond) {
            score += val;
            breakdown.push({ label, value: val });
        }
    };

    switch (productId) {
        case 'vm-essentials':
        case 'vm_essentials_infra':
            add(10, 'VMware Base', !!p.vmware_partner);
            add(8, 'Virtualization', !!p.virtualization);
            add(7, 'HCI Expertise', !!p.hci);
            add(6, 'VxRail Experience', !!p.vxrail_partner);
            add(5, 'Datacenter', !!p.datacenter_infrastructure);
            add(3, 'Dell Footprint', !!p.dell_partner);
            break;
        case 'vm_essentials_license':
            add(10, 'Virtualization', !!p.virtualization);
            add(8, 'VMware Base', !!p.vmware_partner);
            add(5, 'Datacenter', !!p.datacenter_infrastructure);
            break;
        case 'morpheus':
            add(12, 'Hybrid Cloud', !!p.hybrid_cloud);
            add(10, 'Cloud Migration', !!p.cloud_migration);
            add(8, 'Automation/Ops', !!p.observability);
            add(7, 'Containers', !!p.container_platforms);
            add(5, 'Multi-Cloud Focus', !!(p.aws_partner || p.microsoft_partner || p.google_cloud_partner));
            add(5, 'Datacenter', !!p.datacenter_infrastructure);
            break;
        case 'pcbe_business':
        case 'pcbe_enterprise':
            add(12, 'Hybrid Cloud', !!p.hybrid_cloud);
            add(10, 'Private Cloud', !!p.virtualization);
            add(8, 'Datacenter', !!p.datacenter_infrastructure);
            add(7, 'Edge Ready', !!p.edge_computing);
            add(productId === 'pcbe_enterprise' ? 10 : 0, 'Enterprise Scale', p.company_size === 'Enterprise');
            break;
        case 'storeonce':
            add(12, 'Backup & DR', !!p.backup_and_disaster_recovery);
            add(10, 'Data Protection', !!p.datacenter_infrastructure);
            add(8, 'Veeam Ecosystem', !!p.veeam_partner);
            add(5, 'Infrastructure', !!p.datacenter_infrastructure);
            break;
        case 'zerto':
            add(10, 'Backup & DR', !!p.backup_and_disaster_recovery);
            add(8, 'Virtualization', !!p.virtualization);
            add(6, 'Datacenter Inf.', !!p.datacenter_infrastructure);
            add(5, 'Veeam Partner', !!p.veeam_partner); // Proxies backup skill
            add(4, 'Finance/Critical', !!(p.finance || p.telecommunications || p.public_sector));
            break;
        case 'simplivity':
            add(10, 'HCI Expertise', !!p.hci);
            add(8, 'Virtualization', !!p.virtualization);
            add(7, 'Edge Computing', !!p.edge_computing);
            add(5, 'Datacenter Inf.', !!p.datacenter_infrastructure);
            add(3, 'Dell/VMware', !!(p.dell_partner || p.vmware_partner));
            break;
        case 'gl-pcbe':
            add(12, 'Hybrid Cloud', !!p.hybrid_cloud);
            add(10, 'Private Cloud', !!p.virtualization);
            add(7, 'Edge Ready', !!p.edge_computing);
            add(5, 'MSP Profile', p.partner_type === 'managed_service_provider');
            break;
        case 'gl-pce':
            add(12, 'Hybrid Cloud', !!p.hybrid_cloud);
            add(10, 'Automation/Ops', !!p.observability);
            add(8, 'Containers', !!p.container_platforms);
            add(6, 'Enterprise Size', p.company_size === 'Enterprise');
            break;
        case 'gl-block':
            add(12, 'Block Storage', !!p.datacenter_infrastructure);
            add(10, 'Mission Critical', !!(p.finance || p.telecommunications));
            add(8, 'Pure/Dell Exp', !!(p.purestorage_partner || p.dell_partner));
            break;
        case 'gl-file':
            add(12, 'Unstructured Data', !!p.datacenter_infrastructure);
            add(10, 'AI/Analytics', !!p.observability);
            add(8, 'Scale-out Exp', !!p.hci);
            break;
        case 'gl-networking':
            add(15, 'Networking', !!p.industrial_networking);
            add(12, 'Cisco/Aruba Exp', !!(p.cisco_partner || p.juniper_partner));
            add(8, 'NaaS/SaaS', p.partner_type === 'managed_service_provider');
            break;
        case 'gl-dr':
            add(15, 'Backup & DR', !!p.backup_and_disaster_recovery);
            add(10, 'Data Protection', !!p.datacenter_infrastructure);
            add(8, 'Zerto/Veeam Exp', !!p.veeam_partner);
            break;
        case 'opsramp':
            add(10, 'MSP Profile', p.partner_type === 'managed_service_provider');
            add(10, 'Observability', !!p.observability);
            add(6, 'Hybrid Cloud', !!p.hybrid_cloud);
            add(5, 'Datacenter Inf.', !!p.datacenter_infrastructure);
            add(4, 'Cloud Migration', !!p.cloud_migration);
            break;
    }

    // Clasificación de tiers con umbrales ajustados para que sea parejo
    let tier: keyof typeof TIER_CONFIG = 'Low';
    if (score >= 15) tier = 'High';
    else if (score >= 8) tier = 'Medium';

    return { score, tier, breakdown };
}

interface ScoredPartner {
    id: string;
    company_name: string;
    country: string;
    website: string;
    partner_type: keyof typeof PARTNER_TYPE_LABEL;
    technology_domain: keyof typeof DOMAIN_LABEL;
    description?: string;
    score: number;
    tier: keyof typeof TIER_CONFIG;
    breakdown: { label: string; value: number }[];
}

export default function ProductAffinity() {
    const [selectedProduct, setSelectedProduct] = useState<ProductId>('morpheus');

    const activeProduct = PRODUCTS.find(p => p.id === selectedProduct)!;

    const ranked: ScoredPartner[] = useMemo(() => {
        return PARTNER_DATABASE
            .map((p) => {
                const { score, tier, breakdown } = scoreForProduct(p, selectedProduct);
                return { ...p, score, tier, breakdown } as ScoredPartner;
            })
            // Solo rankea a los que tienen un score mayor a 0 para Product Affinity
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score);
    }, [selectedProduct]);

    const byTier = {
        High: ranked.filter((p) => p.tier === 'High'),
        Medium: ranked.filter((p) => p.tier === 'Medium'),
        Low: ranked.filter((p) => p.tier === 'Low'),
    };

    return (
        <div className="space-y-6">

            {/* Product Selector Header */}
            <div className="bg-white border text-gray-800 border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-gray-900">
                            <Box className="w-5 h-5 text-[#01A982]" />
                            Product Affinity Matrix
                        </h2>
                        <p className="text-sm text-gray-500 max-w-3xl leading-relaxed mb-4">
                            Selecciona una solución específica de HPE para analizar el ecosistema de integradores. El motor dinámico valorará a la base evaluando banderas como virtualización, cloud, perfiles MSP e infraestructuras heterogéneas que fungen de catalizadores comerciales directos.
                        </p>

                        {/* Selector de Chips */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                            {PRODUCTS.map(prod => (
                                <button
                                    key={prod.id}
                                    onClick={() => setSelectedProduct(prod.id)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${selectedProduct === prod.id
                                            ? 'bg-[#01A982] text-white border-[#01A982] shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#01A982] hover:text-[#01A982]'
                                        }`}
                                >
                                    {selectedProduct === prod.id && <CheckCircle className="w-3 h-3 inline-block mr-1.5 mb-0.5" />}
                                    {prod.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="md:w-64 flex-shrink-0 bg-gray-50 p-4 justify-center flex flex-col rounded-lg border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">Producto Focus:</h4>
                        <div className="text-lg font-black text-[#01A982] leading-tight mb-2">{activeProduct.label}</div>
                        <p className="text-xs text-gray-500">{activeProduct.desc}</p>
                    </div>
                </div>
            </div>

            {/* Summary pills */}
            <div className="grid grid-cols-3 gap-4">
                {(['High', 'Medium', 'Low'] as const).map((tier) => {
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
            {(['High', 'Medium', 'Low'] as const).map((tier) => {
                const partners = byTier[tier];
                if (partners.length === 0) return null;
                const cfg = TIER_CONFIG[tier];
                const Icon = cfg.icon;
                return (
                    <div key={tier}>
                        <h3 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-3 ${cfg.textColor}`}>
                            <Icon className="h-4 w-4" />
                            {cfg.label} ({partners.length})
                        </h3>
                        <div className="space-y-3">
                            {partners.map((p, idx) => (
                                <div key={p.id} className={`${cfg.bg} ${cfg.border} border rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm`}>
                                    <div className="flex items-start gap-4">
                                        {/* Rank */}
                                        <div className={`${cfg.scoreBg} text-white text-xs font-bold rounded-lg w-8 h-8 flex items-center justify-center flex-shrink-0`}>
                                            #{idx + 1}
                                        </div>
                                        {/* Main info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="font-semibold text-gray-900">{p.company_name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${DOMAIN_COLORS[p.technology_domain]}`}>
                                                    {DOMAIN_LABEL[p.technology_domain]}
                                                </span>
                                                <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5">{p.partner_type === 'managed_service_provider' ? 'MSP' : PARTNER_TYPE_LABEL[p.partner_type]}</span>
                                                <span className="text-xs text-gray-400">{p.country}</span>
                                            </div>
                                            {/* Score breakdown pills */}
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {p.breakdown.map((b, i) => (
                                                    <span
                                                        key={i}
                                                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${b.value > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-gray-200 text-gray-700'
                                                            }`}
                                                    >
                                                        {b.value > 0 ? '+' : ''}{b.value} {b.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Score badge */}
                                        <div className="text-right flex-shrink-0">
                                            <div className={`text-2xl font-black ${cfg.textColor}`}>{p.score}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Pts Afinidad</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

        </div>
    );
}
