'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Map, LayoutDashboard, Database, UserPlus, Globe, Filter, X } from 'lucide-react';
import CustomerDashboard from '@/components/customer-intelligence/CustomerDashboard';
import CustomerDatabase from '@/components/customer-intelligence/CustomerDatabase';
import CustomerOnboarding from '@/components/customer-intelligence/CustomerOnboarding';

const CustomerGeoMap = dynamic(
    () => import('@/components/customer-intelligence/CustomerGeoMap'),
    { ssr: false, loading: () => <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">Cargando mapa...</div> }
);

type TabKey = 'dashboard' | 'map' | 'database' | 'add';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'map', label: 'Mapa Global', icon: Map },
    { key: 'database', label: 'Base de Datos', icon: Database },
    { key: 'add', label: 'Agregar Cliente', icon: UserPlus },
];

const REGIONS = ['ALL', 'LATAM', 'Europe', 'North America', 'APAC', 'Middle East'] as const;

export default function CustomerIntelligencePage() {
    const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
    const [region, setRegion] = useState<string>('ALL');

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Inicio</a>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-2">
                            <div className="bg-cyan-600 w-8 h-8 flex items-center justify-center text-white font-bold rounded text-xs">CI</div>
                            <div>
                                <h1 className="text-base font-bold text-gray-900 leading-tight">Customer Intelligence</h1>
                                <p className="text-[10px] text-gray-400 leading-none">Prospects de Virtualización HPE</p>
                            </div>
                        </div>
                    </div>

                    {/* Region filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500 hidden sm:block">Región:</span>
                        <div className="flex gap-1 flex-wrap">
                            {REGIONS.map(r => (
                                <button key={r} onClick={() => setRegion(r)}
                                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors border ${region === r
                                        ? 'bg-cyan-600 text-white border-cyan-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-cyan-400'}`}>
                                    {r === 'ALL' ? <Globe className="h-3 w-3 inline mr-1" /> : null}{r}
                                </button>
                            ))}
                        </div>
                        {region !== 'ALL' && (
                            <button onClick={() => setRegion('ALL')} className="text-gray-400 hover:text-gray-600">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-1 border-t border-gray-100 pt-0">
                        {TABS.map(({ key, label, icon: Icon }) => (
                            <button key={key} onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === key
                                    ? 'border-cyan-600 text-cyan-700'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Broadcom Alert Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
                    <p className="text-xs text-center font-medium">
                        ⚡ <strong>Oportunidad Broadcom:</strong> El cambio de modelo de precios de VMware by Broadcom generó incrementos de hasta <strong>400%</strong> — Los clientes afectados son tus mejores prospectos para HPE VM Essentials.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {activeTab === 'dashboard' && <CustomerDashboard />}
                {activeTab === 'map' && (
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                                <Map className="h-4 w-4 text-cyan-600" />
                                Mapa Global de Clientes Potenciales
                            </h3>
                            <p className="text-xs text-gray-500">Haz clic en cada punto para ver el perfil completo del prospect y sus señales de compra</p>
                        </div>
                        <CustomerGeoMap filterRegion={region !== 'ALL' ? region : undefined} />
                    </div>
                )}
                {activeTab === 'database' && <CustomerDatabase filterRegion={region !== 'ALL' ? region : undefined} />}
                {activeTab === 'add' && <CustomerOnboarding />}
            </main>
        </div>
    );
}
