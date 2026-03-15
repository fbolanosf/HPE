'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Briefcase, Box } from 'lucide-react';

const PartnerScoring = dynamic(() => import('./PartnerScoring'), { ssr: false });
const ProductAffinity = dynamic(() => import('./ProductAffinity'), { ssr: false });

type AffinityTab = 'business' | 'product';

export default function BusinessAndProductAffinityShell() {
    const [activeTab, setActiveTab] = useState<AffinityTab>('business');

    return (
        <div className="space-y-6">
            {/* ―― Panel de Control Dual ―― */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between md:items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Score HPE & Atracción Tecnológica</h3>
                    <p className="text-xs text-gray-500">Mide el nivel de alineación comercial del Partner con el ecosistema global (Business Affinity) o de forma específica por producto (Product Affinity).</p>
                </div>

                {/* Switch / Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg self-start">
                    <button
                        onClick={() => setActiveTab('business')}
                        className={`px-4 py-2 flex items-center gap-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'business'
                                ? 'bg-white text-[#01A982] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Briefcase className="h-4 w-4" />
                        Business Affinity
                    </button>
                    <button
                        onClick={() => setActiveTab('product')}
                        className={`px-4 py-2 flex items-center gap-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'product'
                                ? 'bg-white text-[#01A982] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Box className="h-4 w-4" />
                        Product Affinity
                    </button>
                </div>
            </div>

            {/* ―― Renderizado Condicional del Nested Route ―― */}
            <div className="pt-2">
                {activeTab === 'business' ? <PartnerScoring /> : <ProductAffinity />}
            </div>
        </div>
    );
}
