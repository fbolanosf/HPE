'use client';

import { useMemo } from 'react';
import { CUSTOMER_DATABASE, scoreCustomer } from '@/lib/customer-intelligence-data';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Server, Cloud, ShieldCheck, Cpu, Database, Zap, BarChart2, ArrowRight } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// HPE Product Portfolio mapped to Customer Pain Points / Buying Signals
// ──────────────────────────────────────────────────────────────────────────────

interface ProductAffinityRow {
    product: string;
    icon: React.ElementType;
    description: string;
    color: string;
    bgLight: string;
    signals: { key: keyof typeof SIGNAL_LABELS; weight: number }[];
    painPoints: string[];
    benefits: string[];
}

const SIGNAL_LABELS: Record<string, string> = {
    broadcom_pricing_impact: 'Impacto Broadcom',
    vmware_license_renewal_due: 'Renovación VMware',
    vmware_version_eol: 'VMware EOL',
    datacenter_refresh_cycle: 'Refresh Datacenter',
    existing_hpe_hardware: 'HPE Hardware Exist.',
    cloud_repatriation_interest: 'Cloud Repatriation',
    cost_optimization_priority: 'Optimización Costos',
    hpe_greenlake_interest: 'Interés GreenLake',
    on_prem_datacenter: 'Datacenter On-Premise',
    edge_infrastructure: 'Infraestructura Edge',
    digital_transformation_initiative: 'Transformación Digital',
    green_it_initiative: 'Green IT',
    nutanix_user: 'Usuario Nutanix',
    microsoft_hyper_v_user: 'Usuario Hyper-V',
};

const HPE_PRODUCTS: ProductAffinityRow[] = [
    {
        product: 'HPE VM Essentials',
        icon: Server,
        description: 'Hypervisor nativo HPE — alternativa directa a VMware post-Broadcom',
        color: '#01A982',
        bgLight: '#e6f7f2',
        signals: [
            { key: 'broadcom_pricing_impact', weight: 10 },
            { key: 'vmware_license_renewal_due', weight: 9 },
            { key: 'vmware_version_eol', weight: 8 },
            { key: 'existing_hpe_hardware', weight: 6 },
            { key: 'cost_optimization_priority', weight: 5 },
            { key: 'datacenter_refresh_cycle', weight: 4 },
            { key: 'on_prem_datacenter', weight: 2 },
        ],
        painPoints: ['Aumento de precios Broadcom', 'EOL de ESXi 7.x/6.x', 'Contratos VMware no renovables', 'Dependencia vendedor único'],
        benefits: ['Sin tasa de licencia por núcleo', 'Integrado con HPE ProLiant', 'Soporte enterprise nativo', 'Migración live del entorno VMware'],
    },
    {
        product: 'HPE GreenLake (HaaS)',
        icon: Cloud,
        description: 'Infraestructura como servicio on-site — modelo CapEx → OpEx',
        color: '#0096d6',
        bgLight: '#e6f3fb',
        signals: [
            { key: 'hpe_greenlake_interest', weight: 10 },
            { key: 'cloud_repatriation_interest', weight: 9 },
            { key: 'cost_optimization_priority', weight: 7 },
            { key: 'datacenter_refresh_cycle', weight: 6 },
            { key: 'digital_transformation_initiative', weight: 5 },
            { key: 'green_it_initiative', weight: 4 },
        ],
        painPoints: ['Costos cloud imprevisibles', 'Necesidad de repatriar workloads', 'Presión de CapEx en datacenters', 'Requerimientos de soberanía de datos'],
        benefits: ['Pago por consumo real', 'On-site pero gestionado por HPE', 'Escalado en días, no meses', 'SLA garantizado 99.999%'],
    },
    {
        product: 'HPE ProLiant & Synergy',
        icon: Cpu,
        description: 'Servidores composables — plataforma de compute para virtualización',
        color: '#7c3aed',
        bgLight: '#f0ebfd',
        signals: [
            { key: 'existing_hpe_hardware', weight: 8 },
            { key: 'datacenter_refresh_cycle', weight: 10 },
            { key: 'broadcom_pricing_impact', weight: 6 },
            { key: 'on_prem_datacenter', weight: 5 },
            { key: 'vmware_version_eol', weight: 4 },
            { key: 'nutanix_user', weight: 3 },
        ],
        painPoints: ['Hardware >5 años sin soporte', 'Cuellos de botella de cómputo', 'Infraestructura heterogénea difícil de gestionar'],
        benefits: ['Gen11 con Intel Xeon Scalable', 'Composabilidad de recursos', 'Integración nativa con VMware y VM Essentials', 'Project management unificado vía OneView'],
    },
    {
        product: 'HPE Storage (Alletra)',
        icon: Database,
        description: 'Almacenamiento cloud-native — unified storage para workloads virtuales',
        color: '#ea580c',
        bgLight: '#fdeee6',
        signals: [
            { key: 'datacenter_refresh_cycle', weight: 8 },
            { key: 'existing_hpe_hardware', weight: 7 },
            { key: 'cloud_repatriation_interest', weight: 6 },
            { key: 'broadcom_pricing_impact', weight: 5 },
            { key: 'cost_optimization_priority', weight: 5 },
            { key: 'on_prem_datacenter', weight: 4 },
        ],
        painPoints: ['Storage expirando sin upgrade path', 'Rendimiento IOPS insuficiente para VMs', 'Silos de almacenamiento desconectados', 'Costos de snapshot inefficientes'],
        benefits: ['All-NVMe desde el primer día', 'Reducción de latencia 10x vs SAS', 'API-first para integración cloud', 'Garantía de 100% disponibilidad'],
    },
    {
        product: 'HPE Networking (Aruba)',
        icon: Zap,
        description: 'Red intelligent para datacenters y edge — SD-WAN, SD-Fabric',
        color: '#d97706',
        bgLight: '#fdf3e6',
        signals: [
            { key: 'edge_infrastructure', weight: 10 },
            { key: 'digital_transformation_initiative', weight: 6 },
            { key: 'datacenter_refresh_cycle', weight: 5 },
            { key: 'cloud_repatriation_interest', weight: 4 },
        ],
        painPoints: ['Latencia de edge en plantas industriales', 'Gestión compleja multi-red', 'Costos de MPLS insostenibles'],
        benefits: ['Zero Trust Network Access nativo', 'SD-WAN con IA para QoS automático', 'Visibilidad unificada DC + Edge', 'Integración con GreenLake'],
    },
    {
        product: 'HPE Pointnext (Servicios)',
        icon: ShieldCheck,
        description: 'Servicios de consultoría y migración — advisory VMware → HPE',
        color: '#0f766e',
        bgLight: '#e6f7f5',
        signals: [
            { key: 'vmware_license_renewal_due', weight: 8 },
            { key: 'broadcom_pricing_impact', weight: 7 },
            { key: 'vmware_version_eol', weight: 7 },
            { key: 'digital_transformation_initiative', weight: 5 },
            { key: 'datacenter_refresh_cycle', weight: 4 },
            { key: 'microsoft_hyper_v_user', weight: 3 },
        ],
        painPoints: ['Sin roadmap claro post-VMware', 'Equipo IT sin experiencia en alternativas', 'Riesgo operacional durante migración'],
        benefits: ['Assessment gratuito de migración', 'Plan de transición 100% documentado', 'Soporte 24/7 certificado', 'SLA de uptime durante migración'],
    },
];

// ──────────────────────────────────────────────────────────────────────────────
// Score a product against the full customer database
// ──────────────────────────────────────────────────────────────────────────────
function computeProductAffinity(product: ProductAffinityRow) {
    const scored = CUSTOMER_DATABASE.map(c => ({ ...c, ...scoreCustomer(c) }));
    const hot = scored.filter(c => {
        const raw = c as unknown as Record<string, unknown>;
        return product.signals.some(s => raw[s.key]);
    });
    const totalSignalWeight = product.signals.reduce((acc, s) => acc + s.weight, 0);
    const avgSignalScore = scored.reduce((acc, c) => {
        const raw = c as unknown as Record<string, unknown>;
        const hit = product.signals.reduce((a, s) => a + (raw[s.key] ? s.weight : 0), 0);
        return acc + hit;
    }, 0) / Math.max(1, scored.length);
    const affinity = Math.round((avgSignalScore / totalSignalWeight) * 100);
    return { count: hot.length, affinity };
}

export default function CustomerAffinityAnalysis() {
    const affinityData = useMemo(() => {
        return HPE_PRODUCTS.map(p => ({
            ...p,
            ...computeProductAffinity(p),
        }));
    }, []);

    // Radar data: normalize signal coverage per product
    const radarData = HPE_PRODUCTS.map(p => {
        const totalSignals = p.signals.length;
        const coverageCount = CUSTOMER_DATABASE.filter(c => {
            const raw = c as unknown as Record<string, unknown>;
            return p.signals.filter(s => raw[s.key]).length >= Math.ceil(totalSignals * 0.4);
        }).length;
        return {
            subject: p.product.replace('HPE ', '').replace(' (HaaS)', '').replace(' & Synergy', '').replace(' (Alletra)', '').replace(' (Aruba)', '').replace(' (Servicios)', ''),
            value: Math.round((coverageCount / CUSTOMER_DATABASE.length) * 100),
        };
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-1">
                    <BarChart2 className="h-5 w-5 text-[#01A982]" />
                    <h3 className="text-base font-bold text-gray-900">Análisis de Afinidad de Negocio HPE</h3>
                </div>
                <p className="text-xs text-gray-500 ml-8">
                    Mapeo de los pain points y señales de compra de tus prospects con el portafolio de productos HPE. Identifica qué solución tiene mayor tracción comercial en tu base de datos.
                </p>
            </div>

            {/* Overview charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar: affinity % per product */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-[#01A982]" /> Prospects con señales por Producto HPE
                    </h4>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={affinityData} layout="vertical" margin={{ left: 0, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                            <YAxis type="category" dataKey="product" tick={{ fontSize: 9 }} width={140}
                                tickFormatter={(v: string) => v.replace('HPE ', '').slice(0, 22)} />
                            <Tooltip formatter={(v) => [`${v} empresas`, 'Prospects con señales']} />
                            <Bar dataKey="count" name="Prospects" radius={[0, 4, 4, 0]}>
                                {affinityData.map((p, i) => <Cell key={i} fill={p.color} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Radar: coverage % per product  */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Server className="h-4 w-4 text-[#01A982]" /> Cobertura de Portafolio HPE — Vista Radar
                    </h4>
                    <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={90}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                            <Radar dataKey="value" stroke="#01A982" fill="#01A982" fillOpacity={0.3} strokeWidth={2} />
                            <Tooltip formatter={(v) => [`${v}%`, 'Cobertura de prospects']} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Product Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {affinityData.map(p => {
                    const Icon = p.icon;
                    return (
                        <div key={p.product} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            {/* Card header */}
                            <div className="p-4 flex items-start gap-3" style={{ backgroundColor: p.bgLight }}>
                                <div className="rounded-lg p-2 flex-shrink-0" style={{ backgroundColor: p.color }}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{p.product}</h4>
                                    <p className="text-[10px] text-gray-600 leading-snug mt-0.5">{p.description}</p>
                                </div>
                            </div>

                            {/* Affinity bar */}
                            <div className="px-4 py-2 bg-white border-b border-gray-100 flex items-center gap-2">
                                <span className="text-[10px] text-gray-500 whitespace-nowrap">Afinidad</span>
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${p.affinity}%`, backgroundColor: p.color }} />
                                </div>
                                <span className="text-xs font-bold text-gray-700 w-10 text-right">{p.count} emp.</span>
                            </div>

                            {/* Body */}
                            <div className="p-4 space-y-3">
                                {/* Pain points */}
                                <div>
                                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pain Points que Resuelve</div>
                                    <ul className="space-y-0.5">
                                        {p.painPoints.map((pp, i) => (
                                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                                <span className="text-red-400 flex-shrink-0 mt-0.5 font-bold">—</span>
                                                {pp}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Key signals */}
                                <div>
                                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Señales Clave de Compra</div>
                                    <div className="flex flex-wrap gap-1">
                                        {p.signals.slice(0, 4).map(s => (
                                            <span key={s.key} className="text-[9px] px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-600 font-medium">
                                                {SIGNAL_LABELS[s.key]}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Benefits top 2 */}
                                <div>
                                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Beneficios Clave HPE</div>
                                    <ul className="space-y-0.5">
                                        {p.benefits.slice(0, 2).map((b, i) => (
                                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                                <ArrowRight className="h-2.5 w-2.5 flex-shrink-0 mt-0.5" style={{ color: p.color }} />
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
