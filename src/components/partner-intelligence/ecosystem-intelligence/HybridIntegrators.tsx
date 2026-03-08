import React, { useMemo } from 'react';
import { identifyHybridIntegrators } from '@/lib/ecosystem-data';
import { PARTNER_DATABASE, scorePartner, Partner } from '@/lib/partner-intelligence-data';
import { Network, Crown, ArrowRight } from 'lucide-react';

export default function HybridIntegrators() {
    // Map partners and inject dynamic scoring data
    const hybrids = useMemo(() => {
        return identifyHybridIntegrators(PARTNER_DATABASE).map(p => ({
            ...p,
            ...scorePartner(p)
        }));
    }, []);

    return (
        <div className="flex flex-col h-full space-y-6">
            <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-emerald-500" />
                    Hybrid IT/OT Integrators
                </h3>
                <p className="text-xs text-gray-500 max-w-2xl mt-1">
                    Lista exclusiva de integradores altamente estratégicos que cuentan con certificaciones y capacidades técnicas comprobadas **tanto en tecnologías de la información (IT) como en tecnología operativa (OT)**. Son candidatos clave para Soluciones Edge, IoT Industrial y Nube Privada.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {hybrids.map(partner => (
                    <div key={partner.id} className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Network className="w-16 h-16 text-emerald-600" />
                        </div>

                        <div className="flex items-start justify-between mb-3 relative z-10">
                            <div>
                                <h4 className="font-bold text-gray-900">{partner.company_name}</h4>
                                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase font-semibold">
                                    {partner.country}
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs ring-4 ring-white">
                                {partner.tier === 'High' ? 'H' : partner.tier === 'Medium' ? 'M' : 'L'}
                            </div>
                        </div>

                        <div className="relative z-10 space-y-3">
                            <div className="bg-slate-50 rounded p-2 border border-slate-100">
                                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">OT Stack (Industrial)</span>
                                <div className="flex flex-wrap gap-1">
                                    {partner.siemens_partner && <span className="text-xs text-gray-600">Siemens</span>}
                                    {partner.rockwell_partner && <span className="text-xs text-gray-600">Rockwell</span>}
                                    {partner.schneider_partner && <span className="text-xs text-gray-600">Schneider</span>}
                                    {partner.scada_integration && <span className="text-xs bg-orange-100 text-orange-700 px-1 rounded">SCADA</span>}
                                    {partner.industrial_iot && <span className="text-xs bg-orange-100 text-orange-700 px-1 rounded">IIoT</span>}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded p-2 border border-slate-100">
                                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">IT Stack (Datacenter)</span>
                                <div className="flex flex-wrap gap-1">
                                    {partner.hpe_partner && <span className="text-xs font-semibold text-[#01A982] flex items-center gap-1"><ArrowRight className="w-3 h-3" />HPE</span>}
                                    {partner.vmware_partner && <span className="text-xs text-gray-600">VMware</span>}
                                    {partner.virtualization && <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">Virtualization</span>}
                                    {partner.hybrid_cloud && <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">Cloud</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {hybrids.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                    <Network className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">No se detectaron integradores híbridos en la base de datos.</p>
                </div>
            )}
        </div>
    );
}
