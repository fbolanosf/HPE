'use client';

import React, { useMemo, useState } from 'react';
import { PARTNER_DATABASE, DOMAIN_LABEL, PARTNER_TYPE_LABEL, Partner } from '@/lib/partner-intelligence-data';
import { Box, CheckCircle, Info, Minus, TrendingDown, TrendingUp } from 'lucide-react';

const PRODUCTS = [
    { id: 'morpheus', label: 'HPE Morpheus', desc: 'Hybrid Cloud, Multi-Cloud Management & Container Platforms' },
    { id: 'vm_essentials', label: 'HPE VM Essentials', desc: 'Virtualization, HCI, and Datacenter Infrastructure' },
    { id: 'zerto', label: 'Zerto', desc: 'Backup, Disaster Recovery, and Data Resilience' },
    { id: 'simplivity', label: 'HPE SimpliVity', desc: 'Hyperconverged Infrastructure (HCI) and Edge Data' },
    { id: 'greenlake', label: 'HPE GreenLake', desc: 'As-a-Service, Managed Services, and Hybrid Cloud' },
    { id: 'opsramp', label: 'OpsRamp', desc: 'AIOps, Observability, and Managed Services' },
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
        case 'vm_essentials':
            add(10, 'VMware Base', !!p.vmware_partner);
            add(8, 'Virtualization', !!p.virtualization);
            add(7, 'HCI Expertise', !!p.hci);
            add(5, 'Datacenter', !!p.datacenter_infrastructure);
            add(4, 'VxRail Familiarity', !!p.vxrail_partner);
            add(3, 'Dell Footprint', !!p.dell_partner);
            break;
        case 'morpheus':
            add(10, 'Hybrid Cloud', !!p.hybrid_cloud);
            add(8, 'Cloud Migration', !!p.cloud_migration);
            add(7, 'Container Platforms', !!p.container_platforms);
            add(5, 'Datacenter Inf.', !!p.datacenter_infrastructure);
            // Si es un gran CSP o public cloud partner
            add(4, 'AWS/Azure Focus', !!(p.aws_partner || p.microsoft_partner || p.google_cloud_partner));
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
        case 'greenlake':
            add(10, 'MSP Profile', p.partner_type === 'managed_service_provider');
            add(8, 'Hybrid Cloud', !!p.hybrid_cloud);
            add(6, 'Cloud Migration', !!p.cloud_migration);
            add(5, 'Datacenter Inf.', !!p.datacenter_infrastructure);
            add(4, 'Edge Computing', !!p.edge_computing); // GreenLake for Edge
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
