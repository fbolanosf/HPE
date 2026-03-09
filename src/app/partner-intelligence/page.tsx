'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Database, Star, Map, BarChart2, Network, UserPlus } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic imports to avoid SSR chart issues
const PartnerDatabase = dynamic(() => import('@/components/partner-intelligence/PartnerDatabase'), { ssr: false });
const BusinessAndProductAffinityShell = dynamic(() => import('@/components/partner-intelligence/BusinessAndProductAffinityShell'), { ssr: false });
const EcosystemMap = dynamic(() => import('@/components/partner-intelligence/EcosystemMap'), { ssr: false });
const EcosystemDashboard = dynamic(() => import('@/components/partner-intelligence/EcosystemDashboard'), { ssr: false });
const PartnerOnboarding = dynamic(() => import('@/components/partner-intelligence/PartnerOnboarding'), { ssr: false });
const EcosystemIntelligenceShell = dynamic(() => import('@/components/partner-intelligence/ecosystem-intelligence/EcosystemIntelligenceShell'), { ssr: false });

type Tab = 'dashboard' | 'database' | 'scoring' | 'ecosystem' | 'intelligence' | 'onboarding';

const TABS: { id: Tab; label: string; icon: React.ElementType; description: string }[] = [
    {
        id: 'dashboard',
        label: 'Analytics Dashboard',
        icon: BarChart2,
        description: 'KPIs y métricas del ecosistema global de partners',
    },
    {
        id: 'intelligence',
        label: 'Ecosystem Intelligence',
        icon: Network,
        description: 'Análisis Relacional y Grafos del Ecosistema',
    },
    {
        id: 'database',
        label: 'Partner Database',
        icon: Database,
        description: 'Base de datos de partners IT y OT con filtros avanzados',
    },
    {
        id: 'scoring',
        label: 'Business & Product Affinity',
        icon: Star,
        description: 'Ranking de partners con mayor potencial para HPE y afinidad de portafolio',
    },
    {
        id: 'ecosystem',
        label: 'Ecosystem Map',
        icon: Map,
        description: 'Mapa visual del ecosistema IT / OT / Híbrido',
    },
    {
        id: 'onboarding',
        label: 'Añadir Partner',
        icon: UserPlus,
        description: 'Alta manual o por IA de nuevos integradores al sistema',
    },
];

export default function PartnerIntelligencePage() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    const activeTabData = TABS.find((t) => t.id === activeTab)!;
    const ActiveIcon = activeTabData.icon;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver al inicio
                            </Link>
                            <div className="h-5 w-px bg-gray-200" />
                            <div className="flex items-center gap-3">
                                <div className="bg-[#01A982] w-9 h-9 flex items-center justify-center text-white rounded-lg">
                                    <Network className="h-5 w-5" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">Partner Intelligence</h1>
                                    <p className="text-xs text-gray-400">IT + OT Ecosystem Intelligence</p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">IT Ecosystem</span>
                            <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded font-medium">OT Ecosystem</span>
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-medium">IT/OT Hybrid</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Module title block */}
                <div className="mb-8">
                    <h2 className="text-2xl font-extrabold text-gray-900">
                        Global Partner & Integrator Intelligence
                    </h2>
                    <p className="mt-1 text-gray-500 text-sm max-w-2xl">
                        Mapa global de integradores IT y OT. Identifica oportunidades comerciales para el portafolio HPE mediante scoring automatizado y análisis del ecosistema tecnológico.
                    </p>
                </div>

                {/* Tab navigation */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${isActive
                                    ? 'bg-[#01A982] text-white border-[#01A982] shadow-md'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#01A982] hover:text-[#01A982]'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Active tab header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-white">
                        <div className="bg-emerald-100 text-[#01A982] rounded-lg p-2">
                            <ActiveIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{activeTabData.label}</h3>
                            <p className="text-xs text-gray-500">{activeTabData.description}</p>
                        </div>
                    </div>

                    {/* Tab content */}
                    <div className="p-6">
                        {activeTab === 'dashboard' && <EcosystemDashboard />}
                        {activeTab === 'intelligence' && <EcosystemIntelligenceShell />}
                        {activeTab === 'database' && <PartnerDatabase />}
                        {activeTab === 'scoring' && <BusinessAndProductAffinityShell />}
                        {activeTab === 'ecosystem' && <EcosystemMap />}
                        {activeTab === 'onboarding' && <PartnerOnboarding />}
                    </div>
                </div>
            </main>
        </div>
    );
}
