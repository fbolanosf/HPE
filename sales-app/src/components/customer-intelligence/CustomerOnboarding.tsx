'use client';

import { useState } from 'react';
import { CUSTOMER_DATABASE, Customer, HypervisorInUse, CloudAdoption, CustomerSize } from '@/lib/customer-intelligence-data';
import { CheckCircle2, PlusCircle } from 'lucide-react';

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
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500";

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

export default function CustomerOnboarding() {
    const [form, setForm] = useState<Omit<Customer, 'id'>>(INITIAL);
    const [saved, setSaved] = useState(false);

    function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
        setForm(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    }

    function handleSave() {
        const id = `c${(CUSTOMER_DATABASE.length + 1).toString().padStart(3, '0')}_custom`;
        CUSTOMER_DATABASE.push({ id, ...form });
        setSaved(true);
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-teal-500 text-white">
                    <div className="flex items-center gap-3">
                        <PlusCircle className="h-6 w-6" />
                        <div>
                            <h2 className="text-base font-bold">Registro de Nuevo Prospect</h2>
                            <p className="text-xs text-cyan-100 mt-0.5">Agrega una empresa a la base de datos de clientes potenciales</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-800 mb-3 pb-1 border-b border-gray-100">Información General</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Nombre de la Empresa *">
                                <input className={inputCls} value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Ej. Empresa S.A. de C.V." />
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
                                <Field label="Empleados aprox.">
                                    <input type="number" className={inputCls} value={form.estimated_employees || ''} onChange={e => set('estimated_employees', +e.target.value)} />
                                </Field>
                                <Field label="Servidores est.">
                                    <input type="number" className={inputCls} value={form.estimated_servers || ''} onChange={e => set('estimated_servers', +e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    </section>

                    {/* IT Infrastructure */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-800 mb-3 pb-1 border-b border-gray-100">Infraestructura de Virtualización</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                    <div className="flex justify-end">
                        <button onClick={handleSave} disabled={!form.company_name || !form.country}
                            className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 text-white rounded-lg text-sm font-semibold hover:bg-cyan-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                            {saved ? <><CheckCircle2 className="h-4 w-4" /> Guardado!</> : <><PlusCircle className="h-4 w-4" /> Agregar a Base de Datos</>}
                        </button>
                    </div>

                    {saved && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>Prospect <strong>{form.company_name}</strong> agregado exitosamente. Ve a la pestaña <em>Base de Datos</em> para verlo.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
