import React, { useState } from 'react';
import { Network, Database, Hexagon, Component, Search } from 'lucide-react';
import GraphAnalyticsShell from './graph_analytics/GraphAnalyticsShell';
import TechnologyOverlap from './TechnologyOverlap';
import ProductOverlap from './ProductOverlap';

type EcoTab = 'graph' | 'overlap' | 'product_overlap';

const ECO_TABS: { id: EcoTab; label: string; icon: React.ElementType }[] = [
    { id: 'graph', label: 'Ecosystem Analytics', icon: Network },
    { id: 'overlap', label: 'Tech Overlap', icon: Hexagon },
    { id: 'product_overlap', label: 'Product Overlap', icon: Component },
];

export default function EcosystemIntelligenceShell() {
    const [activeTab, setActiveTab] = useState<EcoTab>('graph');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex border border-gray-200 rounded-lg overflow-hidden flex-wrap max-w-full">
                    {ECO_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors border-r border-gray-200 last:border-r-0 ${isActive
                                    ? 'bg-[#01A982] text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="min-h-[500px]">
                {activeTab === 'graph' && <GraphAnalyticsShell />}
                {activeTab === 'overlap' && (
                    <div className="bg-white border text-sm border-gray-200 rounded-xl p-4">
                        <TechnologyOverlap />
                    </div>
                )}
                {activeTab === 'product_overlap' && (
                    <div className="bg-white border text-sm border-gray-200 rounded-xl p-4">
                        <ProductOverlap />
                    </div>
                )}
            </div>
        </div>
    );
}
