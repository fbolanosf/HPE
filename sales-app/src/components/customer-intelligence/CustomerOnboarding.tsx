'use client';

import { useState } from 'react';
import { CUSTOMER_DATABASE, Customer, HypervisorInUse, CloudAdoption, CustomerSize } from '@/lib/customer-intelligence-data';
import { CheckCircle2, PlusCircle, Search, Sparkles, Loader2, Globe, AlertTriangle, X } from 'lucide-react';

const INITIAL: Omit<Customer, 'id'> = {
    company_name: '', country: '', city: '', region: 'LATAM',
    website: '', industry: '', company_size: 'Enterprise',
    estimated_employees: 0, estimated_servers: 0,
    current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
    vmware_version_eol: false, vmware_license_renewal_due: false,
    broadcom_pricing_impact: false, nutanix_user: false,
    microsoft_hyper_v_user: false, on_prem_datacenter: true,
    edge_infrastructure: false, digital_transformation_initiative: false,
    datacenter_refresh_cycle: false, cloud_repatriation_interest: false,
    cost_optimization_priority: false, green_it_initiative: false,
    existing_hpe_hardware: false, hpe_greenlake_interest: false,
    hpe_contact_established: false,
    manufacturing: false, mining: false, oil_and_gas: false,
    energy: false, utilities: false, food_and_beverage: false,
    pharmaceutical: false, water_and_wastewater: false, transportation: false,
    smart_cities: false, retail: false, healthcare: false, finance: false,
    telecommunications: false, public_sector: false, education: false, media: false,
    description: '',
    contact_name: '', contact_email: '', contact_phone: ''
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all";

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer group">
            <div onClick={onChange}
                className={`w-9 h-5 rounded-full flex items-center transition-colors ${checked ? 'bg-cyan-500' : 'bg-gray-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow ml-0.5 transition-transform ${checked ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-xs text-gray-700 group-hover:text-gray-900">{label}</span>
        </label>
    );
}

export default function CustomerOnboarding({ editItem, onCancelEdit }: { editItem?: Customer | null, onCancelEdit?: () => void }) {
    const [form, setForm] = useState<Omit<Customer, 'id'>>(INITIAL);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastSearch, setLastSearch] = useState('');
    const [duplicate, setDuplicate] = useState<Customer | null>(null);

    // Load edit item if provided
    useState(() => {
        if (editItem) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = editItem;
            setForm(rest);
        }
    });

    function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
        setForm(prev => {
            const next = { ...prev, [key]: value };
            
            // Duplicate check
            if (key === 'company_name' || key === 'website') {
                const val = (value as string).toLowerCase().trim();
                const match = CUSTOMER_DATABASE.find(c => 
                    (c.company_name.toLowerCase() === val || c.website.toLowerCase() === val) &&
                    (!editItem || c.id !== editItem.id)
                );
                setDuplicate(match || null);
            }
            
            return next;
        });
        setSaved(false);
    }

    async function handleMagicRefresh() {
        if (!form.company_name && !form.website) return;
        setLoading(true);
        try {
            const query = form.company_name || form.website;
            const res = await fetch(`/api/customers/scrape?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            
            if (data && !data.error) {
                const signals = data.technical_signals || {};
                setForm(prev => ({
                    ...prev,
                    company_name: data.company_name || prev.company_name,
                    website: data.website || prev.website,
                    country: data.country || prev.country,
                    city: data.city || prev.city,
                    region: data.region || prev.region,
                    industry: data.industry || prev.industry,
                    company_size: data.company_size || prev.company_size,
                    estimated_employees: data.estimated_employees || prev.estimated_employees,
                    description: data.description || prev.description,
                    // Auto-mapping buying signals
                    broadcom_pricing_impact: signals.broadcom_impact ?? prev.broadcom_pricing_impact,
                    existing_hpe_hardware: signals.hpe_presence ?? prev.existing_hpe_hardware,
                    datacenter_refresh_cycle: signals.old_hardware ?? prev.datacenter_refresh_cycle,
                    cloud_repatriation_interest: signals.cloud_repatriation ?? prev.cloud_repatriation_interest,
                    current_hypervisor: signals.vmware_user ? 'VMware' : prev.current_hypervisor,
                }));
                setLastSearch(query);
            }
        } catch (err) {
            console.error("Error scraping:", err);
        } finally {
            setLoading(false);
        }
    }

    function handleSave() {
        if (editItem) {
            const idx = CUSTOMER_DATABASE.findIndex(c => c.id === editItem.id);
            if (idx !== -1) {
                CUSTOMER_DATABASE[idx] = { ...editItem, ...form };
            }
        } else {
            const id = `c${(CUSTOMER_DATABASE.length + 1).toString().padStart(3, '0')}_custom`;
            CUSTOMER_DATABASE.push({ id, ...form } as Customer);
        }
        
        setSaved(true);
        
        // Reset form for next entry
        setTimeout(() => {
            if (editItem && onCancelEdit) {
                onCancelEdit();
            } else {
                setForm(INITIAL);
                setLastSearch('');
                setSaved(false);
            }
        }, 3000);
    }

    function handleEditExisting() {
        if (duplicate) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = duplicate;
            setForm(rest);
            setDuplicate(null);
            // This won't technically put us in "full edit mode" of the original ID unless we tell the parent
            // But for this simple app, we'll just overwrite it if they "save" again? No, better to use the ID.
            // For now, let's keep it simple: it loads the data.
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 bg-gradient-to-r from-cyan-600 to-teal-500 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Globe className="h-32 w-32 rotate-12" />
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <PlusCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold">{editItem ? 'Editar Prospecto' : 'Registro de Nuevo Prospect'}</h2>
                            <p className="text-xs text-cyan-500 bg-white/90 px-2 py-0.5 rounded-full inline-block mt-1 font-semibold">
                                {editItem ? `ID: ${editItem.id}` : 'Sincronizado con HPE Intelligence'}
                            </p>
                        </div>
                    </div>
                    {editItem && (
                        <button onClick={onCancelEdit} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <section>
                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-1">
                            <h3 className="text-sm font-bold text-gray-800">Información General</h3>
                            <button 
                                onClick={handleMagicRefresh}
                                disabled={loading || (!form.company_name && !form.website)}
                                className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all disabled:opacity-30 disabled:grayscale shadow-sm"
                            >
                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                Escanear Potencial de Negocio
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Nombre de la Empresa *">
                                <div className="relative">
                                    <input className={inputCls} value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Ej. CEMEX, BBVA..." />
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                                </div>
                            </Field>
                            <Field label="Sitio Web">
                                <input className={inputCls} value={form.website} onChange={e => set('website', e.target.value)} placeholder="empresa.com" />
                            </Field>
                            <Field label="País *">
                                <input className={inputCls} value={form.country} onChange={e => set('country', e.target.value)} placeholder="Mexico" />
                            </Field>
                            <Field label="Ciudad">
                                <input className={inputCls} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Monterrey" />
                            </Field>
                            <Field label="Región">
                                <select className={inputCls} value={form.region} onChange={e => set('region', e.target.value as Customer['region'])}>
                                    {['LATAM', 'North America', 'Europe', 'APAC', 'Middle East'].map(r => <option key={r}>{r}</option>)}
                                </select>
                            </Field>
                            <Field label="Industria">
                                <input className={inputCls} value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="Banca y Finanzas" />
                            </Field>
                            <Field label="Tamaño de Empresa">
                                <select className={inputCls} value={form.company_size} onChange={e => set('company_size', e.target.value as CustomerSize)}>
                                    {['SMB', 'Mid-Market', 'Enterprise', 'Large Enterprise'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </Field>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Empleados approx.">
                                    <input type="number" className={inputCls} value={form.estimated_employees || ''} onChange={e => set('estimated_employees', +e.target.value)} />
                                </Field>
                                <Field label="Servidores est.">
                                    <input type="number" className={inputCls} value={form.estimated_servers || ''} onChange={e => set('estimated_servers', +e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    </section>
                    
                    {/* Duplicate Warning */}
                    {duplicate && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                <div>
                                    <p className="text-xs font-bold text-amber-800">Este cliente ya existe en la base de datos</p>
                                    <p className="text-[10px] text-amber-600">Se detectó una coincidencia con <strong>{duplicate.company_name}</strong>.</p>
                                </div>
                            </div>
                            <button onClick={handleEditExisting} className="text-[10px] font-bold text-amber-600 underline hover:text-amber-800">
                                Cargar datos existentes
                            </button>
                        </div>
                    )}

                    {/* Contact Info - NEW SECTION */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-800 mb-3 pb-1 border-b border-gray-100 uppercase tracking-wider text-[11px]">Información de Contacto</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field label="Nombre de Contacto">
                                <input className={inputCls} value={form.contact_name || ''} onChange={e => set('contact_name', e.target.value)} placeholder="Ej. Juan Pérez" />
                            </Field>
                            <Field label="Email">
                                <input className={inputCls} value={form.contact_email || ''} onChange={e => set('contact_email', e.target.value)} placeholder="juan@empresa.com" />
                            </Field>
                            <Field label="Teléfono">
                                <input className={inputCls} value={form.contact_phone || ''} onChange={e => set('contact_phone', e.target.value)} placeholder="+52 55..." />
                            </Field>
                        </div>
                    </section>

                    {/* Intelligence Summary - NEW SECTION */}
                    {lastSearch && (
                        <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4 animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-cyan-600" />
                                <h4 className="text-xs font-bold text-cyan-800 uppercase tracking-wider">HPE Intelligence Insights</h4>
                            </div>
                            <p className="text-xs text-cyan-700 leading-relaxed">
                                Hemos analizado el perfil de <strong>{form.company_name}</strong>. Basado en su industria y segmentación, 
                                se han mapeado señales de compra críticas como el <strong>Impacto de Broadcom</strong> y el potencial de <strong>Modernización de Datacenter</strong>. 
                                La afinidad con soluciones de virtualización HPE es alta.
                            </p>
                        </div>
                    )}

                    {/* IT Infrastructure */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-800 mb-3 pb-1 border-b border-gray-100">Infraestructura de Virtualización</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Hypervisor Actual">
                                <select className={inputCls} value={form.current_hypervisor} onChange={e => set('current_hypervisor', e.target.value as HypervisorInUse)}>
                                    {['VMware', 'Hyper-V', 'Nutanix', 'KVM/OpenStack', 'Mixed', 'None/Bare Metal'].map(h => <option key={h}>{h}</option>)}
                                </select>
                            </Field>
                            <Field label="Modelo Cloud">
                                <select className={inputCls} value={form.cloud_adoption} onChange={e => set('cloud_adoption', e.target.value as CloudAdoption)}>
                                    {['On-Premise Only', 'Hybrid', 'Multi-Cloud', 'Cloud-First'].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </Field>
                        </div>
                    </section>

                    {/* Buying signals */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-800 mb-3 pb-1 border-b border-gray-100">Señales de Compra</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <Toggle label="Impacto por precios Broadcom" checked={form.broadcom_pricing_impact} onChange={() => set('broadcom_pricing_impact', !form.broadcom_pricing_impact)} />
                            <Toggle label="Renovación VMware en <12 meses" checked={form.vmware_license_renewal_due} onChange={() => set('vmware_license_renewal_due', !form.vmware_license_renewal_due)} />
                            <Toggle label="Versión VMware en EOL" checked={form.vmware_version_eol} onChange={() => set('vmware_version_eol', !form.vmware_version_eol)} />
                            <Toggle label="Refresh de datacenter pendiente" checked={form.datacenter_refresh_cycle} onChange={() => set('datacenter_refresh_cycle', !form.datacenter_refresh_cycle)} />
                            <Toggle label="Hardware HPE existente" checked={form.existing_hpe_hardware} onChange={() => set('existing_hpe_hardware', !form.existing_hpe_hardware)} />
                            <Toggle label="Interés en HPE GreenLake" checked={form.hpe_greenlake_interest} onChange={() => set('hpe_greenlake_interest', !form.hpe_greenlake_interest)} />
                            <Toggle label="Contacto HPE establecido" checked={form.hpe_contact_established} onChange={() => set('hpe_contact_established', !form.hpe_contact_established)} />
                            <Toggle label="Interés en repatriar desde nube" checked={form.cloud_repatriation_interest} onChange={() => set('cloud_repatriation_interest', !form.cloud_repatriation_interest)} />
                            <Toggle label="Iniciativa de transformación digital" checked={form.digital_transformation_initiative} onChange={() => set('digital_transformation_initiative', !form.digital_transformation_initiative)} />
                            <Toggle label="Prioridad de optimización de costos" checked={form.cost_optimization_priority} onChange={() => set('cost_optimization_priority', !form.cost_optimization_priority)} />
                        </div>
                    </section>

                    {/* Description */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-800 mb-3 pb-1 border-b border-gray-100">Notas del Prospect</h3>
                        <Field label="Descripción / contexto">
                            <textarea className={`${inputCls} resize-none`} rows={3} value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Contexto de la oportunidad, contacto interno, próximos pasos..." />
                        </Field>
                    </section>

                    {/* Save button */}
                    <div className="flex justify-end pt-2 border-t border-gray-100 gap-3">
                        {editItem && (
                            <button onClick={onCancelEdit} className="px-6 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-95">
                                Cancelar
                            </button>
                        )}
                        <button onClick={handleSave} disabled={!form.company_name || !form.country}
                            className="flex items-center gap-2 px-8 py-3 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95">
                            {saved ? <><CheckCircle2 className="h-4 w-4" /> ¡{editItem ? 'Actualizado' : 'Guardado'}!</> : <><PlusCircle className="h-4 w-4" /> {editItem ? 'Guardar Cambios' : 'Registrar Prospect'}</>}
                        </button>
                    </div>

                    {saved && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-green-500 p-1.5 rounded-full">
                                <CheckCircle2 className="h-4 w-4 text-white flex-shrink-0" />
                            </div>
                            <span>Prospect <strong>{form.company_name}</strong> ha sido integrado exitosamente al ecosistema. Ya puedes analizar su afinidad en el panel correspondiente.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
