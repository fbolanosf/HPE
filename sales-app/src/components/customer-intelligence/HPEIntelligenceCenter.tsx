'use client';

import React, { useState, useEffect } from 'react';
import { 
    X, Shield, Users, Mail, Linkedin, Zap, 
    Search, Cpu, CheckCircle2, AlertCircle, Loader2,
    Database, CreditCard, ChevronRight
} from 'lucide-react';
import { Customer, CUSTOMER_DATABASE } from '@/lib/customer-intelligence-data';
import { ApolloContact, ApolloTechnicalProfile, getApolloExtension } from '@/lib/customer-apollo-data';
import { PersistenceService } from '@/lib/persistence-service';

interface HPEIntelligenceCenterProps {
    customer: Customer;
    onClose: () => void;
}

export default function HPEIntelligenceCenter({ customer, onClose }: HPEIntelligenceCenterProps) {
    const [activeTab, setActiveTab] = useState<'tech' | 'corporate'>('tech');
    const [loading, setLoading] = useState(false);
    const [enriching, setEnriching] = useState(false);
    const [contacts, setContacts] = useState<ApolloContact[]>([]);
    const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
    const [techStack, setTechStack] = useState<string[]>([]);
    const [itHeadcount, setItHeadcount] = useState<number | null>(null);
    const [isFallback, setIsFallback] = useState(false);
    const [isPlanRestricted, setIsPlanRestricted] = useState(false);
    const [corporateInfo, setCorporateInfo] = useState<Partial<ApolloTechnicalProfile>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchIntelligence();
    }, [customer]);

    const fetchIntelligence = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Enrich Company to get IT Headcount & Tech Stack
            const enrichRes = await fetch('/api/customers/apollo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'bulkEnrichCompanies', 
                    params: { domains: [customer.website] } 
                })
            });
            const enrichData = await enrichRes.json();
            let currentTech: string[] = [];
            
            if (enrichData.organizations?.[0]) {
                const org = enrichData.organizations[0];
                setItHeadcount(org.departmental_head_count?.information_technology || null);
                
                // Extract Corporate Data
                setCorporateInfo({
                    organization_id: org.id,
                    annual_revenue: org.annual_revenue,
                    revenue_string: org.revenue_str,
                    total_funding: org.total_funding_str,
                    founded_year: org.founded_year,
                    short_description: org.short_description,
                    long_description: org.long_description,
                    keywords: org.keywords || [],
                    it_headcount: org.departmental_head_count?.information_technology,
                    logo_url: org.logo_url,
                    industry: org.industry,
                    phone: org.primary_phone?.number || org.primary_phone,
                    linkedin_url_company: org.linkedin_url,
                    twitter_url: org.twitter_url,
                    facebook_url: org.facebook_url,
                    hq_city: org.city,
                    hq_state: org.state,
                    hq_country: org.country
                });

                if (org.technology_names) {
                    currentTech = [...new Set(org.technology_names.slice(0, 15))] as string[];
                    setTechStack(currentTech);
                }
            }

            const res = await fetch('/api/customers/apollo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'discoverContacts', 
                    params: { 
                        domain: customer.website,
                        companyName: customer.company_name,
                        organizationId: enrichData.organizations?.[0]?.id
                    } 
                })
            });
            
            if (res.status === 402) {
                setIsPlanRestricted(true);
                generateSimulatedContacts(enrichData.organizations?.[0]?.departmental_head_count?.information_technology || 0);
                return;
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setContacts(data.contacts || []);
            setIsFallback(data.contacts?.some((c: any) => c.is_fallback));

            // Tech stack fallback if enrichment didn't return much
            if (currentTech.length < 3) {
                setTechStack(['VMware vSphere', 'AWS', 'Azure', 'HPE ProLiant', 'Veeam', 'Nutanix']);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const generateSimulatedContacts = (count: number) => {
        const simulated: ApolloContact[] = [
            { id: 'sim_1', name: 'Juan P****', first_name: 'Juan', last_name: 'P****', title: 'Director de Infraestructura IT', seniority: 'director', department: 'IT', is_enriched: false, is_fallback: false, has_email: true, has_phone: true },
            { id: 'sim_2', name: 'Maria G****', first_name: 'Maria', last_name: 'G****', title: 'Manager de Sistemas', seniority: 'manager', department: 'IT', is_enriched: false, is_fallback: false, has_email: true, has_phone: false },
            { id: 'sim_3', name: 'Carlos R****', first_name: 'Carlos', last_name: 'R****', title: 'Cloud Architect', seniority: 'senior', department: 'Engineering', is_enriched: false, is_fallback: false, has_email: true, has_phone: true },
        ];
        if (count > 100) {
            simulated.push({ id: 'sim_4', name: 'Elena M****', first_name: 'Elena', last_name: 'M****', title: 'VP of Technology', seniority: 'vice_president', department: 'IT', is_enriched: false, is_fallback: false, has_email: true, has_phone: true } as ApolloContact);
        }
        setContacts(simulated);
    };

    const handleToggleContact = (id: string) => {
        const newSet = new Set(selectedContactIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedContactIds(newSet);
    };

    const handleBulkEnrich = async () => {
        if (selectedContactIds.size === 0) return;
        const confirmMsg = `¿Deseas consumir ${selectedContactIds.size} créditos para obtener los correos y LinkedIn de los contactos seleccionados?`;
        if (!confirm(confirmMsg)) return;
        await performEnrich(Array.from(selectedContactIds));
        setSelectedContactIds(new Set());
    };

    const handleEnrichContact = async (id: string) => {
        if (!confirm('Esta acción consumirá 1 crédito. ¿Continuar?')) return;
        await performEnrich([id]);
    };

    const performEnrich = async (ids: string[]) => {
        setEnriching(true);
        try {
            const res = await fetch('/api/customers/apollo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'enrichContacts', 
                    params: { ids, customerId: customer.id } 
                })
            });
            const data = await res.json();
            const enrichedMap = new Map<string, ApolloContact>(data.contacts.map((c: ApolloContact) => [c.id, c]));
            setContacts((prev: ApolloContact[]) => prev.map(c => enrichedMap.get(c.id) || c));
        } catch (err: any) {
            alert('Error al enriquecer: ' + err.message);
        } finally {
            setEnriching(false);
        }
    };

    const handleSyncData = async () => {
        if (loading || !corporateInfo.industry) return;
        setLoading(true);
        try {
            // 1. Persist to side-car (API)
            const res = await fetch('/api/customers/apollo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'syncCustomerData', 
                    params: { customerId: customer.id, data: corporateInfo } 
                })
            });
            const data = await res.json();
            
            // 2. Update main database in-memory and persist to server
            if (data.success) {
                const index = CUSTOMER_DATABASE.findIndex(c => c.id === customer.id);
                if (index !== -1) {
                    CUSTOMER_DATABASE[index] = {
                        ...CUSTOMER_DATABASE[index],
                        industry: corporateInfo.industry || CUSTOMER_DATABASE[index].industry,
                        short_description: corporateInfo.short_description,
                        logo_url: corporateInfo.logo_url,
                        it_headcount: corporateInfo.it_headcount,
                        annual_revenue: corporateInfo.annual_revenue,
                        revenue_string: corporateInfo.revenue_string,
                        tech_stack: techStack,
                        contacts: contacts.map(c => ({
                            id: c.id,
                            name: c.name,
                            title: c.title,
                            email: c.email || '',
                            phone: '' // ApolloContact doesn't have phone, CustomerContact requires it
                        }))
                    };
                    await PersistenceService.save('customers', CUSTOMER_DATABASE);
                }
                alert('¡Datos sincronizados exitosamente con la DB local!');
            } else {
                throw new Error('No se pudo sincronizar');
            }
        } catch (err: any) {
            alert('Error en sincronización: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header Section */}
                <div className="bg-[#f8fafc] border-b border-slate-200/60 p-6 text-slate-900 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-sky-50 rounded-2xl flex items-center justify-center border border-sky-100 shadow-inner">
                            <Shield className="h-5 w-5 text-sky-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black tracking-tight text-slate-800">HPE Intelligence Center</h2>
                                <span className="text-[9px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold border border-sky-200">v2.7 (Advanced)</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                                <Database className="h-3 w-3" />
                                Análisis corporativo y técnico para {customer.company_name}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {corporateInfo.logo_url && (
                            <div className="h-16 w-16 bg-white rounded-xl border border-slate-100 shadow-sm p-1.5 flex items-center justify-center overflow-hidden">
                                <img src={corporateInfo.logo_url} alt="logo" className="max-w-full max-h-full object-contain" />
                            </div>
                        )}
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-[#f1f5f9]/50 border-b border-slate-200/60 px-8 flex gap-8 z-10">
                    <button 
                        onClick={() => setActiveTab('tech')}
                        className={`py-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all relative ${
                            activeTab === 'tech' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Propuesta Técnica (IT Stack)
                        {activeTab === 'tech' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500 rounded-t-full shadow-[0_-2px_6px_rgba(14,165,233,0.3)]" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('corporate')}
                        className={`py-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all relative ${
                            activeTab === 'corporate' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Perfil Corporativo & Financiero
                        {activeTab === 'corporate' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500 rounded-t-full shadow-[0_-2px_6px_rgba(14,165,233,0.3)]" />}
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#f8fafc]">
                    
                    {/* Left Column: Contextual Insights */}
                    <div className="lg:col-span-4 space-y-6">
                        {activeTab === 'tech' ? (
                            <>
                                <div className="bg-sky-50/30 border border-sky-100/60 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
                                    <h3 className="text-xs font-black text-slate-800 mb-5 flex items-center gap-2 uppercase tracking-widest">
                                        <Cpu className="h-[14px] w-[14px] text-sky-500" />
                                        Tecnología Detectada
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {techStack.map(tech => (
                                            <span key={tech} className="text-[10px] bg-sky-50/50 border border-sky-100/60 text-sky-700 px-3 py-1.5 rounded-xl font-bold">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-8 p-5 bg-teal-50/50 rounded-2xl border border-teal-100 shadow-sm shadow-teal-600/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Zap className="h-3.5 w-3.5 text-teal-500 fill-teal-500" />
                                            <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest">Oportunidad HPE</span>
                                        </div>
                                        <p className="text-[11px] text-teal-800 leading-relaxed font-semibold">
                                            Detectada infraestructura <span className="text-teal-900 underline decoration-sky-500/30 underline-offset-4">Virtualizada</span>. Candidato ideal para <span className="text-teal-900 font-black">HPE VM Essentials</span> y modernización de Alletra.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-[#f1f5f9]/40 border border-slate-200/60 rounded-[2rem] p-6 shadow-sm">
                                    <h3 className="text-xs font-black text-slate-800 mb-5 flex items-center gap-2 uppercase tracking-widest">
                                        <CreditCard className="h-[14px] w-[14px] text-sky-500" />
                                        Consumo Apollo
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-tight text-slate-500">
                                            <span>Créditos del Plan</span>
                                            <span className="text-slate-900">100 / mes</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-sky-400 to-teal-400 w-[12%]" />
                                        </div>
                                        <p className="text-[9px] text-slate-400 italic font-medium leading-tight">
                                            Recuperando datos en tiempo real. La búsqueda inicial no consume créditos.
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-[#f1f5f9]/40 border border-slate-200/60 rounded-[2rem] p-6 shadow-sm">
                                    <h3 className="text-xs font-black text-slate-800 mb-5 flex items-center gap-2 uppercase tracking-widest">
                                        <Database className="h-[14px] w-[14px] text-sky-500" />
                                        Datos Maestros
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="text-[9px] text-slate-400 font-black uppercase block mb-1">Industria Principal</span>
                                            <span className="text-xs text-slate-900 font-black">{corporateInfo.industry || customer.industry}</span>
                                        </div>
                                        {corporateInfo.hq_city && (
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="text-[9px] text-slate-400 font-black uppercase block mb-1">Ciudad / Estado</span>
                                                <span className="text-xs text-slate-900 font-black">{corporateInfo.hq_city}{corporateInfo.hq_state ? `, ${corporateInfo.hq_state}` : ''}</span>
                                            </div>
                                        )}
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="text-[9px] text-slate-400 font-black uppercase block mb-1">Año de Fundación</span>
                                            <span className="text-xs text-slate-900 font-black">{corporateInfo.founded_year || 'N/A'}</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="text-[9px] text-slate-400 font-black uppercase block mb-1">Sede Central</span>
                                            <span className="text-xs text-slate-900 font-black">{corporateInfo.hq_country || customer.country}</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={handleSyncData}
                                        disabled={loading}
                                        className="w-full mt-6 py-3.5 bg-sky-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="h-[14px] w-[14px] text-white" />
                                        Sincronizar DB Local
                                    </button>
                                </div>

                                <div className="bg-[#f1f5f9]/40 border border-slate-200/60 rounded-[2rem] p-6 shadow-sm">
                                    <h3 className="text-xs font-black text-slate-800 mb-5 flex items-center gap-2 uppercase tracking-widest">
                                        <Linkedin className="h-[14px] w-[14px] text-sky-500" />
                                        Presencia Digital
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        {corporateInfo.phone && (
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">{corporateInfo.phone}</span>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            {corporateInfo.linkedin_url_company && (
                                                <a href={corporateInfo.linkedin_url_company} target="_blank" className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase hover:bg-blue-100 transition-all border border-blue-100/50">
                                                    <Linkedin className="h-4 w-4" />
                                                    Company
                                                </a>
                                            )}
                                            {corporateInfo.twitter_url && (
                                                <a href={corporateInfo.twitter_url} target="_blank" className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all border border-slate-200/60">
                                                    <X className="h-3 w-3" />
                                                    Twitter
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column: Dynamic Displays */}
                    <div className="lg:col-span-8 flex flex-col space-y-6">
                        {activeTab === 'tech' ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                                            <Users className="h-[14px] w-[14px] text-sky-500" />
                                            Stakeholders Detectados
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1.5">
                                            <p className="text-[10px] text-slate-500 font-medium">Búsqueda avanzada de tomadores de decisión</p>
                                            {itHeadcount !== null && (
                                                <div className="flex items-center gap-1.5 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                                                    <div className="w-1 h-1 bg-sky-500 rounded-full animate-pulse" />
                                                    <span className="text-[9px] font-black text-sky-700 uppercase">{itHeadcount} IT Headcount</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {selectedContactIds.size > 0 && (
                                        <button 
                                            onClick={handleBulkEnrich}
                                            disabled={enriching}
                                            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-sky-500/30 active:scale-95 transition-all"
                                        >
                                            {enriching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3 fill-white" />}
                                            Revelar {selectedContactIds.size} Contactos
                                        </button>
                                    )}
                                </div>

                                {loading ? (
                                    <div className="bg-sky-50/50 border border-sky-100/60 rounded-[2.5rem] flex-1 flex flex-col items-center justify-center py-24 p-8 text-center shadow-inner">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-sky-200/30 blur-2xl rounded-full" />
                                            <Loader2 className="h-10 w-10 text-sky-500 animate-spin relative" />
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 mb-2">Escaneo Transaccional Activo</h4>
                                        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">Mapeando la estructura jerárquica de TI para identificar perfiles de infraestructura y storage.</p>
                                    </div>
                                ) : error ? (
                                    <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-12 text-center">
                                        <div className="bg-white h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/50 border border-red-100">
                                            <AlertCircle className="h-8 w-8 text-red-500" />
                                        </div>
                                        <h4 className="text-sm font-black text-red-900 uppercase tracking-widest">Error de Sincronización</h4>
                                        <p className="text-xs text-red-600 mt-2 font-medium">{error}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col flex-1 space-y-4 min-h-0">
                                        {isPlanRestricted && (
                                            <div className="p-5 bg-amber-50/50 border border-amber-200/60 rounded-3xl flex items-start gap-4">
                                                <div className="bg-amber-100 p-2 rounded-xl">
                                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] mb-1">Restricción de Plan (Free)</p>
                                                    <p className="text-[11px] text-amber-700/80 leading-relaxed font-semibold">
                                                        La API de búsqueda directa está limitada en tu plan actual. Hemos generado una <span className="text-amber-700 font-black underline decoration-amber-300">Vista de Prospección</span> basada en señales reales de headcount.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                                            {contacts.map(contact => (
                                                <div 
                                                    key={contact.id} 
                                                    onClick={() => !enriching && !contact.is_enriched && !isPlanRestricted && handleToggleContact(contact.id)}
                                                    className={`group relative overflow-hidden border-2 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 ${
                                                        !contact.is_enriched && !isPlanRestricted ? 'cursor-pointer hover:border-sky-200 hover:shadow-xl hover:shadow-sky-500/5' : 'cursor-default'
                                                    } ${
                                                        selectedContactIds.has(contact.id) 
                                                            ? 'bg-sky-50/50 border-sky-400 shadow-lg shadow-sky-500/5' 
                                                            : 'bg-white/80 border-slate-200/60 shadow-sm'
                                                    } ${isPlanRestricted ? 'grayscale-[0.4] opacity-80' : ''}`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-xs font-black ring-4 ring-slate-50 ${
                                                                selectedContactIds.has(contact.id) || contact.is_enriched ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                                {contact.first_name[0]}{contact.last_name[0]}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{contact.name}</h4>
                                                                <p className="text-[9px] text-sky-600 font-bold leading-tight mb-1">{contact.title}</p>
                                                                {(contact.city || contact.country) && (
                                                                    <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">
                                                                        {contact.city}{contact.city && contact.country ? ', ' : ''}{contact.country}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!contact.is_enriched && !isPlanRestricted && (
                                                            <div className="flex flex-col items-end gap-2">
                                                                <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${
                                                                    selectedContactIds.has(contact.id) 
                                                                        ? 'bg-sky-500 border-sky-500 text-white' 
                                                                        : 'bg-white border-slate-200'
                                                                }`}>
                                                                    {selectedContactIds.has(contact.id) && <Zap className="h-3 w-3 fill-white" />}
                                                                </div>
                                                                <div className="flex gap-1.5">
                                                                    {contact.has_email && <span title="Email disponible"><Mail className="h-2.5 w-2.5 text-teal-400" /></span>}
                                                                    {contact.has_phone && <span title="Teléfono disponible"><Database className="h-2.5 w-2.5 text-sky-400" /></span>}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {contact.is_enriched ? (
                                                        <div className="pt-3 border-t border-slate-100 space-y-3">
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-sky-700 bg-sky-50 p-2 rounded-xl">
                                                                <Mail className="h-3 w-3" />
                                                                {contact.email}
                                                            </div>
                                                            <a href={contact.linkedin_url} target="_blank" className="flex items-center justify-center gap-2 py-2 text-[10px] font-black text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all border border-blue-100">
                                                                <Linkedin className="h-3 w-3" />
                                                                Conectar en LinkedIn
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2">
                                                            {isPlanRestricted ? (
                                                                <div className="text-[9px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-2 bg-sky-50/50 py-2 justify-center rounded-xl border border-sky-100/50">
                                                                    <CreditCard className="h-3 w-3" />
                                                                    Habilitar con Pro
                                                                </div>
                                                            ) : (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleEnrichContact(contact.id); }}
                                                                    className="w-full py-2.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl text-[10px] font-black uppercase tracking-widest border border-teal-100 flex items-center justify-center gap-2 transition-all active:scale-95"
                                                                >
                                                                    <Zap className="h-3 w-3 fill-teal-500" />
                                                                    Ver Correo
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col gap-6">
                                <div className="bg-sky-50/30 border-2 border-sky-100/50 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                                    
                                    <div className="flex items-start justify-between relative z-10 mb-10">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Análisis Predictivo Financiero</h3>
                                            <p className="text-xs text-slate-500 font-medium italic">Señales de gasto y solvencia corporativa para calificación de cuenta</p>
                                        </div>
                                        <div className="bg-sky-50 p-6 rounded-[2rem] text-sky-900 border border-sky-100 shadow-sm relative overflow-hidden group min-w-[140px]">
                                            <span className="text-[8px] text-sky-500 font-bold uppercase block tracking-[0.2em] mb-1">Empresa Tier 1</span>
                                            <span className="text-base font-black lowercase tracking-tight text-slate-700">{corporateInfo.revenue_string || 'Private'}</span>
                                            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-sky-100/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-5 p-2 pr-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                <div className="h-10 w-10 bg-gradient-to-br from-amber-300 to-orange-400 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/10">
                                                    <Database className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-400 font-black uppercase block tracking-widest">Fondos Levantados</span>
                                                    <span className="text-xs font-black text-slate-700">{corporateInfo.total_funding || 'BOOTSTRAPPED'}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="p-6 bg-white/60 border border-sky-100/50 rounded-3xl shadow-sm backdrop-blur-sm">
                                                <span className="text-[10px] text-slate-400 font-black uppercase block mb-2 tracking-widest">Contexto de Mercado</span>
                                                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold italic">
                                                    "{corporateInfo.short_description || customer.description || 'Perfil corporativo sólido con enfoque en escalabilidad técnica.'}"
                                                </p>
                                                {corporateInfo.keywords && corporateInfo.keywords.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-1.5 slice-y-1">
                                                        {corporateInfo.keywords.slice(0, 5).map(kw => (
                                                            <span key={kw} className="text-[8px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100 font-bold uppercase tracking-tighter italic">
                                                                #{kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] pl-2 mb-4">Métricas de Prospección</h4>
                                            {[
                                                { label: 'Score de Salud Financiera', value: 'OPTIMO', color: 'bg-teal-50 text-teal-600 border border-teal-100/50' },
                                                { label: 'Velocidad de Crecimiento', value: 'ALTA', color: 'bg-sky-50 text-sky-600 border border-sky-100/50' },
                                                { label: 'Prioridad de Abordaje', value: (corporateInfo.annual_revenue || 0) > 1000000000 ? 'P0 - ESTRATÉGICO' : 'P1 - ALTO', color: 'bg-slate-100 text-slate-600' }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white/50 border border-sky-100/30 rounded-2xl hover:bg-white transition-all group">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight group-hover:text-slate-900 transition-colors">{item.label}</span>
                                                    <span className={`text-[9px] px-3 py-1 rounded-full font-black tracking-widest shadow-sm ${item.color}`}>
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-sky-100/40 via-sky-50/30 to-slate-100/40 rounded-[2.5rem] p-10 text-slate-900 shadow-xl border border-sky-200/40 relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col gap-8">
                                        <div className="flex-1">
                                            <div className="inline-flex items-center gap-3 mb-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-sky-200/50 shadow-sm transition-all hover:shadow-md">
                                                <Zap className="h-5 w-5 text-sky-500 fill-sky-400" />
                                                <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">HPE Sales Recommendation</h3>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed font-bold mb-8 italic">
                                                Dada la escala corporativa ({corporateInfo.revenue_string}) y la madurez técnica, este prospecto debería ser abordado con un enfoque de <span className="text-sky-600 font-black underline decoration-sky-200 decoration-4">Infraestructura como Servicio (GreenLake)</span>, mitigando el riesgo de migración de virtualización con <span className="text-sky-600 font-black">HPE VM Essentials</span>.
                                            </p>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="bg-white/70 backdrop-blur-sm px-5 py-3 rounded-2xl border border-sky-100/60 shadow-sm hover:border-sky-300 transition-all">
                                                    <span className="text-[8px] text-sky-400 font-black uppercase block tracking-widest mb-1">Abordaje</span>
                                                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Consolidación DC</span>
                                                </div>
                                                <div className="bg-white/70 backdrop-blur-sm px-5 py-3 rounded-2xl border border-sky-100/60 shadow-sm hover:border-sky-300 transition-all">
                                                    <span className="text-[8px] text-sky-400 font-black uppercase block tracking-widest mb-1">Solución Prime</span>
                                                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Alletra Storage</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-100/20 rounded-full blur-3xl -mb-48 -mr-48 animate-pulse" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Bar / Footer */}
                <div className="bg-[#f8fafc] border-t border-slate-200/60 py-6 px-10 flex justify-between items-center z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-sky-500">
                            <Database className="h-[14px] w-[14px] text-sky-500" />
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Authority:</span>
                            <span className="text-[10px] text-slate-800 font-black tracking-widest">APOLLO INTELLIGENCE</span>
                        </div>
                        {itHeadcount !== null && (
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{itHeadcount} EMPLOYEES DETECTED</span>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-[10px] font-black text-slate-400 hover:text-sky-600 uppercase tracking-widest transition-colors flex items-center gap-2 group"
                    >
                        Cerrar Monitor
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
