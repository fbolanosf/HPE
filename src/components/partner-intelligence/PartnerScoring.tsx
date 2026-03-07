'use client';

import React, { useMemo } from 'react';
import { PARTNER_DATABASE, scorePartner, DOMAIN_LABEL, PARTNER_TYPE_LABEL } from '@/lib/partner-intelligence-data';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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

    const byTier = {
        High: ranked.filter((p) => p.tier === 'High'),
        Medium: ranked.filter((p) => p.tier === 'Medium'),
        Low: ranked.filter((p) => p.tier === 'Low'),
    };

    return (
        <div className="space-y-8">
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
