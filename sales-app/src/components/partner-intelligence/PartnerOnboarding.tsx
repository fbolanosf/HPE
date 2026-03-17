'use client';

import React, { useState } from 'react';
import { BASE, Partner, addPartnerToDatabase, UNIQUE_COUNTRIES, PARTNER_TYPE_LABEL, PARTNER_TYPE_DESCRIPTIONS } from '@/lib/partner-intelligence-data';
import { Globe, Search, Save, CheckCircle2, ChevronRight, Loader2, Building2, MapPin, Link as LinkIcon, Star, Info } from 'lucide-react';

export default function PartnerOnboarding() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [scrapedData, setScrapedData] = useState<Partial<Partner> | null>(null);

    // Base form state
    const [url, setUrl] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [country, setCountry] = useState('Mexico');

    const getExtractedCount = () => {
        if (!scrapedData) return 0;
        return Object.keys(scrapedData).filter(k =>
            typeof scrapedData[k as keyof Partner] === 'boolean' &&
            scrapedData[k as keyof Partner] === true &&
            k !== 'linkedin'
        ).length;
    };


    // Partner profile state (start with BASE)
    const [profile, setProfile] = useState<Partial<Partner>>({
        ...BASE,
        partner_type: 'system_integrator',
        technology_domain: 'IT',
    });

    const handleScrape = async () => {
        if (!url) {
            alert("Por favor ingresa la URL corporativa del partner.");
            return;
        }

        setLoading(true);
        setSuccess(false);

        try {
            const res = await fetch('/api/partners/scrape-single', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, company_name: companyName, country })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Falló el scrapping');
            }

            const data: Partial<Partner> = await res.json();
            setScrapedData(data);

            // Merge inferred data into profile state
            setProfile(prev => ({
                ...prev,
                ...data,
                // Override if user already typed something explicitly
                company_name: companyName || data.company_name,
                country: country || data.country,
            }));

            if (data.company_name && !companyName) setCompanyName(data.company_name);

        } catch (error: any) {
            console.error(error);
            alert(`Fallo en Auto-Descubrimiento: ${error.message}\n\nSugerencia: Puedes llenar el perfil manualmente en la matriz inferior.`);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (!companyName || !country || !url) {
            alert("Nombre, URL y País son obligatorios para guardar el Partnership.");
            return;
        }

        const newPartner: Partner = {
            ...profile,
            id: `p_new_${Date.now()}`,
            company_name: companyName,
            country: country,
            website: url,
            city: profile.city || 'S/D',
            region: profile.region || 'LATAM',
            partner_type: profile.partner_type || 'system_integrator',
            technology_domain: profile.technology_domain || 'IT',
            company_size: profile.company_size || 'Medium',
            estimated_employees: profile.estimated_employees || 50,
            other_oem_brands: profile.other_oem_brands || '',
            hpe_virtualization_products: profile.hpe_virtualization_products || '',
            tech_brands_by_category: profile.tech_brands_by_category || '',
        } as Partner;

        addPartnerToDatabase(newPartner);
        setSuccess(true);

        // Reset form slightly
        setTimeout(() => {
            setSuccess(false);
            setScrapedData(null);
            setUrl('');
            setCompanyName('');
            setProfile({ ...BASE, partner_type: 'system_integrator', technology_domain: 'IT' });
        }, 3000);
    };

    const toggleBool = (key: keyof Partner) => {
        setProfile(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Helper subsets for toggles
    const vendorsIT = ['vmware_partner', 'vxrail_partner', 'hpe_partner', 'dell_partner', 'nutanix_partner', 'cisco_partner', 'microsoft_partner', 'aws_partner', 'google_cloud_partner', 'veeam_partner', 'purestorage_partner', 'juniper_partner'] as const;
    const vendorsOT = ['siemens_partner', 'rockwell_partner', 'schneider_partner', 'abb_partner', 'honeywell_partner', 'emerson_partner', 'aveva_partner'] as const;
    const virtSolutions = ['virtualization', 'hci', 'datacenter_infrastructure', 'hybrid_cloud', 'cloud_migration', 'backup_and_disaster_recovery', 'container_platforms'] as const;
    const industries = ['telecommunications', 'finance', 'healthcare', 'retail', 'public_sector', 'manufacturing', 'energy', 'oil_and_gas', 'mining'] as const;

    const formatKey = (key: string) => key.replace(/_/g, ' ').replace('partner', '').trim().toUpperCase();

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* Header section */}
            <div className="bg-white border text-gray-800 border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#01A982]" /> Alta y Descubrimiento de Partner
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Ingresa los datos generales del integrador para registrarlo manualmente, o provee su URL para que nuestro Robot
                    descubra sus capacidades tecnológicas automáticamente extrayendo información de su portal corporativo web.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre Comercial (Opcional si Scrape)</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ej. Logicalis" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#01A982]" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Sitio Web Corporativo (* Obligatorio)</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="Ej. la.logicalis.com" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#01A982]" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">País Sede (* Obligatorio)</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select value={country} onChange={e => setCountry(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#01A982]">
                                {UNIQUE_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                <option value="Otro">Otro (LATAM)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                        <label className="block text-xs font-bold text-gray-600 mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Clasificación del Partner (Tipo de Negocio)
                        </label>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                            {Object.entries(PARTNER_TYPE_LABEL).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setProfile(prev => ({ ...prev, partner_type: key as any }))}
                                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 ${
                                        profile.partner_type === key 
                                        ? 'bg-emerald-50 border-[#01A982] ring-1 ring-[#01A982]' 
                                        : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-bold ${profile.partner_type === key ? 'text-[#01A982]' : 'text-gray-700'}`}>{label}</span>
                                        {profile.partner_type === key && <CheckCircle2 className="w-4 h-4 text-[#01A982]" />}
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-tight">
                                        {PARTNER_TYPE_DESCRIPTIONS[key] || 'Descripción no disponible.'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 italic mt-8">
                            * Selecciona el tipo de partner para habilitar recomendaciones personalizadas.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleScrape}
                        disabled={loading || !url}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        {loading ? 'Analizando Website...' : 'Auto-Descubrimiento (Scraping)'}
                    </button>

                    {/* Botón Guardar Superior (Aparece cuando ya se tiene url para agilizar workflow) */}
                    {url && (
                        <button
                            onClick={handleSave}
                            disabled={!companyName || !url}
                            className="bg-[#01A982] hover:bg-[#008f6b] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ml-auto"
                        >
                            <Save className="w-4 h-4" /> Guardar en Base de Datos
                        </button>
                    )}
                </div>

                {!loading && scrapedData && (
                    <div className={`mt-5 p-4 rounded-lg border ${getExtractedCount() > 0 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
                        <h4 className={`font-bold flex items-center gap-2 ${getExtractedCount() > 0 ? 'text-blue-800' : 'text-amber-800'}`}>
                            {getExtractedCount() > 0 ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5" />}
                            Resultados del Análisis Web
                        </h4>
                        {getExtractedCount() > 0 ? (
                            <p className="text-sm text-blue-700 mt-2">
                                Se detectaron <strong>{getExtractedCount()} atributos técnicos clave</strong> en la página principal
                                (Dominio inferido: <b>{scrapedData.technology_domain}</b>).
                                Hemos activado las casillas correspondientes de forma automática en la matriz inferior.
                                <br /><br />
                                <b>Importante:</b> Revisa las casillas, haz ajustes manuales si lo necesitas, y luego <b>haz clic en "Guardar en Base de Datos"</b> para persistir la información.
                            </p>
                        ) : (
                            <p className="text-sm text-amber-700 mt-2">
                                El escaneo estructural finalizó, pero <strong>no se identificaron palabras clave técnicas explícitas</strong> en la portada del sitio.
                                Esto es muy común si el website bloquea robots o no menciona sus marcas/industrias en texto plano.
                                <br /><br />
                                <b>Siguiente Paso:</b> Por favor, <b>selecciona las casillas manualmente</b> en la matriz inferior y haz clic en <b>"Guardar en Base de Datos"</b>.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Matrix Form */}
            <div className="bg-white border text-gray-800 border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Matriz de Capacidades y Cobertura</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* IT Vendors */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-gray-500 border-b pb-1">Fabricantes IT & Cloud</h4>
                        <div className="space-y-2">
                            {vendorsIT.map(v => (
                                <label key={v} className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" checked={!!profile[v]} onChange={() => toggleBool(v)} className="rounded text-[#01A982] focus:ring-[#01A982]" />
                                    <span className={`text-sm group-hover:text-[#01A982] ${profile[v] ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{formatKey(v)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* OT Vendors */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-gray-500 border-b pb-1">Fabricantes OT / Industrial</h4>
                        <div className="space-y-2">
                            {vendorsOT.map(v => (
                                <label key={v} className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" checked={!!profile[v]} onChange={() => toggleBool(v)} className="rounded text-orange-500 focus:ring-orange-500" />
                                    <span className={`text-sm group-hover:text-orange-500 ${profile[v] ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{formatKey(v)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Virtualization Solutions */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-gray-500 border-b pb-1">Capacidades Data Center</h4>
                        <div className="space-y-2">
                            {virtSolutions.map(v => (
                                <label key={v} className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" checked={!!profile[v]} onChange={() => toggleBool(v)} className="rounded text-indigo-500 focus:ring-indigo-500" />
                                    <span className={`text-sm group-hover:text-indigo-500 ${profile[v] ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{formatKey(v)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Industries */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-gray-500 border-b pb-1">Verticales de Industria</h4>
                        <div className="space-y-2">
                            {industries.map(v => (
                                <label key={v} className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" checked={!!profile[v]} onChange={() => toggleBool(v)} className="rounded text-pink-500 focus:ring-pink-500" />
                                    <span className={`text-sm group-hover:text-pink-500 ${profile[v] ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{formatKey(v)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                </div>

                {/* OEM & Sales Intelligence (Expansion v8.1) */}
                <div className="mt-8 pt-6 border-t border-gray-100 col-span-full">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" /> Inteligencia Comercial y Alianzas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Otras Marcas OEM Representadas</label>
                            <textarea 
                                value={profile.other_oem_brands || ''} 
                                onChange={e => setProfile(prev => ({ ...prev, other_oem_brands: e.target.value }))}
                                placeholder="Ej. Cisco, Dell, Microsoft, Lenovo..."
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#01A982] h-20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Productos Portafolio Virtualización HPE</label>
                            <textarea 
                                value={profile.hpe_virtualization_products || ''} 
                                onChange={e => setProfile(prev => ({ ...prev, hpe_virtualization_products: e.target.value }))}
                                placeholder="Ej. HPE VM Essentials, Zerto, GreenLake..."
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#01A982] h-20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Marcas por Tecnología (Especialización)</label>
                            <textarea 
                                value={profile.tech_brands_by_category || ''} 
                                onChange={e => setProfile(prev => ({ ...prev, tech_brands_by_category: e.target.value }))}
                                placeholder="Ej. VERITAS para Disaster Recovery, Veeam para Backup..."
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#01A982] h-20"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Block */}
                <div className="mt-8 pt-4 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500 max-w-lg">
                        Al guardar este Partner, su información se inyectará de manera inmediata en la memoria de la aplicación.
                        Podrás visualizar su peso en el Dashboard y en el Scoring automáticamente.
                    </p>
                    <div className="flex items-center gap-3">
                        {success && (
                            <span className="text-sm font-bold text-[#01A982] flex items-center gap-1">
                                <CheckCircle2 className="w-5 h-5" /> ¡Volcado a la Base de Datos!
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!companyName || !url}
                            className="bg-[#01A982] hover:bg-[#008f6b] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition"
                        >
                            <Save className="w-4 h-4" /> Registrar Partner
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
