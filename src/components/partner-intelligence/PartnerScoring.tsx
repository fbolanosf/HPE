'use client';

import React, { useMemo, useState } from 'react';
import { PARTNER_DATABASE, scorePartner, DOMAIN_LABEL, PARTNER_TYPE_LABEL } from '@/lib/partner-intelligence-data';
import { TrendingUp, TrendingDown, Minus, Info, Settings, ChevronDown, ChevronUp } from 'lucide-react';

const TIER_CONFIG = {
    High: {
        label: 'High Opportunity',
        bg: 'bg-green-50',
        border: 'border-green-200',
        scoreBg: 'bg-green-500',
        textColor: 'text-green-700',
        icon: TrendingUp,
    },
    Medium: {
        label: 'Medium Opportunity',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        scoreBg: 'bg-yellow-400',
        textColor: 'text-yellow-700',
        icon: Minus,
    },
    Low: {
        label: 'Low Opportunity',
        bg: 'bg-red-50',
        border: 'border-red-200',
        scoreBg: 'bg-red-500',
        textColor: 'text-red-700',
        icon: TrendingDown,
    },
};

const DOMAIN_COLORS = {
    IT: 'bg-blue-100 text-blue-700',
    OT: 'bg-orange-100 text-orange-700',
    IT_OT_HYBRID: 'bg-green-100 text-green-700',
};

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

export default function PartnerScoring() {
    const ranked: ScoredPartner[] = useMemo(() => {
        return PARTNER_DATABASE
            .map((p) => {
                const { score, tier, breakdown } = scorePartner(p);
                return { ...p, score, tier, breakdown } as ScoredPartner;
            })
            .sort((a, b) => b.score - a.score);
    }, []);

    const [showWeights, setShowWeights] = useState(false);

    const byTier = {
        High: ranked.filter((p) => p.tier === 'High'),
        Medium: ranked.filter((p) => p.tier === 'Medium'),
        Low: ranked.filter((p) => p.tier === 'Low'),
    };

    return (
        <div className="space-y-8">

            {/* HPE Scoring Engine Explanation Panel */}
            <div className="bg-white border text-gray-800 border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-gray-900">
                            <Settings className="w-5 h-5 text-[#01A982]" />
                            Motor de Puntuación (Score HPE)
                        </h2>
                        <p className="text-sm text-gray-500 max-w-3xl leading-relaxed">
                            El <strong>Score HPE</strong> es un valor dinámico calculado en tiempo real (Base Code) que determina la tracción y afinidad de un Integrador IT/OT hacia nuestro portafolio. Otorga puntos positivos por alianzas clave de nuestro ecosistema <b>(VMware, Nutanix)</b> o especializaciones tecnológicas de alto valor añadido <b>(HCI, Datacenter, etc.)</b>, y resta puntos a quienes ya sean socios fuertes de la marca para priorizar el White-Space.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowWeights(!showWeights)}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors text-gray-700"
                    >
                        {showWeights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {showWeights ? 'Ocultar Ponderaciones' : 'Ver Ponderaciones Actuales'}
                    </button>
                </div>

                {showWeights && (
                    <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-2 mb-4 text-[#01A982]">
                            <Info className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Tabla Analítica de Criterios (Modificable en Backend)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* IT Weights */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-700 border-b pb-2">IT & Cloud</h4>
                                <ul className="text-xs text-gray-600 space-y-2">
                                    <li className="flex justify-between"><span>VMware / VxRail Partner</span> <span className="font-mono font-bold text-green-600">+5 pts</span></li>
                                    <li className="flex justify-between"><span>Dell Infrastructure / Virt.</span> <span className="font-mono font-bold text-green-600">+3 pts</span></li>
                                    <li className="flex justify-between"><span>HCI / Hybrid Cloud / Datacenter</span> <span className="font-mono font-bold text-green-600">+2 pts</span></li>
                                    <li className="flex justify-between"><span>Nutanix / Veeam / PureStorage / Juniper</span> <span className="font-mono font-bold text-green-600">+2 pts</span></li>
                                    <li className="flex justify-between"><span>Cloud Migration / Backup & DR</span> <span className="font-mono font-bold text-green-600">+1 pt</span></li>
                                </ul>
                            </div>

                            {/* OT Weights */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-700 border-b pb-2">OT & Industrial Edge</h4>
                                <ul className="text-xs text-gray-600 space-y-2">
                                    <li className="flex justify-between"><span>Industrial IoT / Networking</span> <span className="font-mono font-bold text-green-600">+4 pts</span></li>
                                    <li className="flex justify-between"><span>SCADA / MES / Edge</span> <span className="font-mono font-bold text-green-600">+3 pts</span></li>
                                    <li className="flex justify-between"><span>Digital Manufacturing / Industrial Cyber</span> <span className="font-mono font-bold text-green-600">+2 pts</span></li>
                                    <li className="flex justify-between"><span>Historian / PLC Programming</span> <span className="font-mono font-bold text-green-600">+1 pt</span></li>
                                </ul>
                            </div>

                            {/* Generales */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-700 border-b pb-2">Reglas de Negocio</h4>
                                <ul className="text-xs text-gray-600 space-y-2">
                                    <li className="flex justify-between"><span>Vertical: Mfg, Energy, Oil/Gas, Mining</span> <span className="font-mono font-bold text-green-600">+1 pt</span></li>
                                    <li className="flex justify-between items-center bg-red-50 p-2 rounded -mx-2 mt-2">
                                        <span className="font-semibold text-red-700">Penalización: Partner ya es HPE</span>
                                        <span className="font-mono font-bold text-red-600">-5 pts</span>
                                    </li>
                                </ul>
                                <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
                                    Nota Técnica: La ingeniería de estos valores actualmente yace como constantes de código (Hardcoded en `scorePartner`). En un Roadmap futuro de madurez, estas ponderaciones pueden elevarse a Variables de Entorno (Global Admin Settings) permitiendo edición de los multiplicadores sin requerir deployment, con el propósito de adecuarse a nuevas estrategias de ventas de HPE por País o Cuartil en turnos.
                                </p>
                            </div>

                        </div>
                    </div>
                )}
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
                                <div key={p.id} className={`${cfg.bg} ${cfg.border} border rounded-xl p-4`}>
                                    <div className="flex items-start gap-4">
                                        {/* Rank */}
                                        <div className={`${cfg.scoreBg} text-white text-xs font-bold rounded-lg w-8 h-8 flex items-center justify-center flex-shrink-0`}>
                                            #{idx + 1}
                                        </div>
                                        {/* Main info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900">{p.company_name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${DOMAIN_COLORS[p.technology_domain]}`}>
                                                    {DOMAIN_LABEL[p.technology_domain]}
                                                </span>
                                                <span className="text-xs text-gray-400">{p.country}</span>
                                            </div>
                                            {p.description && (
                                                <p className="text-xs text-gray-500 mb-2">{p.description}</p>
                                            )}
                                            {/* Score breakdown pills */}
                                            <div className="flex flex-wrap gap-1">
                                                {p.breakdown.map((b, i) => (
                                                    <span
                                                        key={i}
                                                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                              ${b.value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                                    >
                                                        {b.value > 0 ? '+' : ''}{b.value} {b.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Score badge */}
                                        <div className="text-right flex-shrink-0">
                                            <div className={`text-2xl font-black ${cfg.textColor}`}>{p.score}</div>
                                            <div className="text-[10px] text-gray-400">Score HPE</div>
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
