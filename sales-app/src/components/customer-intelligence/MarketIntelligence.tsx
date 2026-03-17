'use client';

import React, { useState } from 'react';
import { 
    Globe, Search, Target, Users, TrendingUp, Zap, 
    Download, PlusCircle, Loader2, Sparkles, Filter, Info
} from 'lucide-react';
import axios from 'axios';
import { CUSTOMER_DATABASE, Customer } from '@/lib/customer-intelligence-data';

// Apollo.io Configuration (Same as API Route)
const APOLLO_API_KEY = 'lPLQB5UdLyjntpSMHXRynA';

export default function MarketIntelligence() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [importingId, setImportingId] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchQuery) return;
        setLoading(true);
        try {
            // In a real frontend, we would use an internal proxy to avoid CORS and hide the API key
            // But for this rapid prototype and following user request to "exploit capabilities"
            // we'll hit the Search endpoint if it was available or provide a rich simulation
            // for the PROSPECTING view since directly hitting Apollo from browser usually fails due to CORS.
            
            // We'll call our internal enrichment API as a "discovery" engine for the demo
            const res = await fetch(`/api/customers/scrape?query=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            
            if (data && !data.error) {
                // If it's a single result, wrap it. If it was a list (future), use it.
                setResults([data]);
            }
        } catch (err) {
            console.error("Discovery error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = (company: any) => {
        setImportingId(company.website);
        const id = `c${(CUSTOMER_DATABASE.length + 1).toString().padStart(3, '0')}_apollo`;
        
        const newCustomer: Customer = {
            id,
            company_name: company.company_name,
            website: company.website,
            country: company.country,
            city: company.city || '',
            region: company.region || 'LATAM',
            industry: company.industry,
            company_size: company.company_size,
            estimated_employees: company.estimated_employees,
            estimated_servers: Math.round(company.estimated_employees / 50),
            current_hypervisor: company.technical_signals?.vmware_user ? 'VMware' : 'Mixed',
            cloud_adoption: 'Hybrid',
            vmware_version_eol: false,
            vmware_license_renewal_due: false,
            broadcom_pricing_impact: company.technical_signals?.broadcom_impact || false,
            nutanix_user: false,
            microsoft_hyper_v_user: false,
            on_prem_datacenter: true,
            edge_infrastructure: false,
            digital_transformation_initiative: true,
            datacenter_refresh_cycle: company.technical_signals?.old_hardware || false,
            cloud_repatriation_interest: company.technical_signals?.cloud_repatriation || false,
            cost_optimization_priority: true,
            green_it_initiative: false,
            existing_hpe_hardware: company.technical_signals?.hpe_presence || false,
            hpe_greenlake_interest: true,
            hpe_contact_established: false,
            manufacturing: company.industry.toLowerCase().includes('manuf'),
            mining: false, oil_and_gas: false, energy: false, utilities: false,
            food_and_beverage: false, pharmaceutical: false, water_and_wastewater: false,
            transportation: false, smart_cities: false, retail: false, 
            healthcare: company.industry.toLowerCase().includes('health'),
            finance: company.industry.toLowerCase().includes('bank') || company.industry.toLowerCase().includes('finan'),
            telecommunications: company.industry.toLowerCase().includes('telecom'),
            public_sector: false, education: false, media: false,
            description: company.description + " (Importado desde Market Intelligence)",
            contact_name: '', contact_email: '', contact_phone: ''
        };

        CUSTOMER_DATABASE.push(newCustomer);
        
        setTimeout(() => {
            setImportingId(null);
            alert(`¡Empresa ${company.company_name} importada con éxito!`);
        }, 800);
    };

    return (
        <div className="space-y-8">
            {/* Header section with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={Globe} label="Apollo Network" value="275M+" color="blue" />
                <StatCard icon={Target} label="Prospectos Detectados" value="12,450" color="emerald" />
                <StatCard icon={TrendingUp} label="Market Intent" value="High" color="amber" />
                <StatCard icon={Zap} label="API Credits" value="Unlimited" color="purple" />
            </div>

            {/* Discovery Engine */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-cyan-600/90 to-teal-600/90 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-amber-300" />
                        <h3 className="text-lg font-bold">Advanced Prospecting Engine</h3>
                        <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-bold border border-white/30 ml-2">Market Discovery</span>
                    </div>
                    <p className="text-sm text-cyan-50 mb-6">
                        Utiliza inteligencia de mercado para identificar empresas con señales de compra de infraestructura HPE.
                    </p>
                    
                    <div className="flex gap-2 p-1.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-100" />
                            <input 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                placeholder="Escribe un nombre de empresa o dominio (ej. femsa.com, banorte.com)..."
                                className="w-full bg-transparent border-none text-white text-sm pl-10 pr-4 py-2.5 focus:outline-none placeholder:text-cyan-200/70"
                            />
                        </div>
                        <button 
                            onClick={handleSearch}
                            disabled={loading || !searchQuery}
                            className="bg-[#01A982] hover:bg-[#008f6d] px-6 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analizar Mercado"}
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {results.length > 0 ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inteligencia Encontrada</h4>
                                <div className="text-[10px] text-gray-400 italic flex items-center gap-1">
                                    <Info className="h-3 w-3" />
                                    Datos enriquecidos vía Apollo Organizations API
                                </div>
                            </div>
                            
                            {results.map((company, i) => (
                                <div key={i} className="group relative border border-gray-100 rounded-2xl p-5 hover:border-[#01A982]/30 hover:shadow-lg hover:shadow-[#01A982]/5 transition-all bg-slate-50/50">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h5 className="font-bold text-gray-900 text-lg leading-tight">{company.company_name}</h5>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-[#01A982] font-semibold">
                                                        <span>{company.website}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                        <span className="text-gray-500 font-normal">{company.industry}</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleImport(company)}
                                                    disabled={importingId === company.website}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#01A982] text-white rounded-lg text-xs font-bold hover:bg-[#008f6d] transition-all shadow-md shadow-[#01A982]/20 active:scale-95 disabled:opacity-50"
                                                >
                                                    {importingId === company.website ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="h-3.5 w-3.5" />}
                                                    Importar Prospecto
                                                </button>
                                            </div>
                                            
                                            <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-2">
                                                {company.description}
                                            </p>
                                            
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <Metric icon={Users} label="Employees" value={company.estimated_employees.toLocaleString()} />
                                                <Metric icon={Globe} label="Country" value={company.country} />
                                                <Metric icon={Target} label="Size" value={company.company_size} />
                                                <Metric icon={TrendingUp} label="Region" value={company.region} />
                                            </div>
                                        </div>

                                        <div className="w-full md:w-64 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                            <h6 className="text-[10px] font-extrabold text-[#01A982] uppercase tracking-tighter mb-3">Technical Highlights</h6>
                                            <div className="space-y-2.5">
                                                <TechSignal label="VMware User" active={company.technical_signals?.vmware_user} />
                                                <TechSignal label="Broadcom Impact" active={company.technical_signals?.broadcom_impact} />
                                                <TechSignal label="HPE Hardware" active={company.technical_signals?.hpe_presence} />
                                                <TechSignal label="Potential Lead" active={true} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Search className="h-8 w-8 text-slate-300" />
                            </div>
                            <h4 className="text-sm font-bold text-gray-800">No hay búsquedas activas</h4>
                            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                                Ingresa el dominio o nombre de una empresa para extraer inteligencia comercial detallada.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Market Segments - Dummy visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center justify-between">
                        Top Cloud Intent Industries
                        <Filter className="h-4 w-4 text-gray-400 cursor-pointer" />
                    </h3>
                    <div className="space-y-4">
                        <ProgressItem label="Finance & Banking" value={85} color="#0EA5E9" />
                        <ProgressItem label="Manufacturing 4.0" value={72} color="#F59E0B" />
                        <ProgressItem label="Retail E-commerce" value={64} color="#10B981" />
                        <ProgressItem label="Public Health" value={45} color="#6366F1" />
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-teal-500/90 to-emerald-600/90 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-teal-500/10">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp className="h-48 w-48 text-white" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-300" />
                            Portfolio Expansion Tip
                        </h3>
                        <p className="text-xs text-teal-50 leading-relaxed mb-4">
                            Apollo Intelligence detecta que las empresas de <span className="text-white font-bold underline decoration-amber-300">LATAM</span> están priorizando la <span className="text-white font-bold">Consolidación de Datacenter</span> debido a los cambios de licenciamiento.
                        </p>
                        <div className="flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest bg-white/20 w-fit px-3 py-1.5 rounded-full border border-white/30 backdrop-blur-sm">
                            HPE Morpheus Suggestion: High Potential
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600'
    };
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className={`${colors[color]} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        </div>
    );
}

function Metric({ icon: Icon, label, value }: any) {
    return (
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
            <div className="flex items-center gap-2 mb-1">
                <Icon className="h-3 w-3 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{label}</span>
            </div>
            <p className="text-[11px] font-bold text-gray-700">{value}</p>
        </div>
    );
}

function TechSignal({ label, active }: { label: string; active?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500">{label}</span>
            <div className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[#01A982] shadow-[0_0_8px_rgba(1,169,130,0.8)]' : 'bg-gray-200'}`} />
        </div>
    );
}

function ProgressItem({ label, value, color }: any) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
                <span className="text-gray-600">{label}</span>
                <span className="text-gray-900">{value}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${value}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}
