import { HPE_SOLUTIONS } from '@/lib/comparator-data';
import { Layers, Server, Activity, Database, Cpu, Network } from 'lucide-react';

interface TopologyDiagramProps {
    selectedSolutionId: string;
    selectedCompetitorId: string;
}

const LAYER_ICONS: Record<string, any> = {
    'Gestión': Activity,
    'Virtualización': Layers,
    'Data Virtualization Platform': Database,
    'Storage Controller': Database,
    'Software Defined Storage': Database,
    'Storage': Database,
    'Almacenamiento': Database,
    'I/O Path': Database,
    'Networking': Network,
    'Hardware': Server,
    'OS / Hypervisor': Cpu,
    'Computo': Cpu,
    'Consumo': Activity
};

export default function TopologyDiagram({ selectedSolutionId, selectedCompetitorId }: TopologyDiagramProps) {
    const currentSolution = HPE_SOLUTIONS[selectedSolutionId];
    const currentCompetitor = currentSolution?.competitors.find(c => c.id === selectedCompetitorId) || currentSolution?.competitors[0];

    if (!currentSolution || !currentCompetitor) return <div className="p-8 text-center text-gray-500">Seleccione una solución y un competidor para ver la topología.</div>;

    const renderStack = (title: string, topology: any, isHpe: boolean) => {
        if (!topology) {
            return (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center w-full h-full flex flex-col items-center justify-center min-h-[400px]">
                    <Layers className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">Diagrama de topología no disponible para {title}</p>
                </div>
            );
        }

        return (
            <div className={`flex flex-col h-full ${isHpe ? 'border-[#01A982]/20' : 'border-gray-200'}`}>
                <div className={`p-4 rounded-t-xl border-b ${isHpe ? 'bg-[#01A982] text-white' : 'bg-gray-800 text-white'}`}>
                    <h3 className="font-bold text-lg flex items-center justify-center">
                        <Layers className="w-5 h-5 mr-2 opacity-80" />
                        Arquitectura {title}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-b-xl border-x border-b border-gray-200 shadow-sm flex-grow flex flex-col gap-4">
                    <p className="text-sm text-gray-600 mb-4 italic text-center border-b border-gray-100 pb-4">
                        "{topology.summary}"
                    </p>

                    <div className="flex flex-col gap-3 flex-grow justify-end">
                        {/* Render layers from top to bottom (reverse array if typically defined bottom-up, but here defined logical top-down) */}
                        {topology.layers.map((layer: any, idx: number) => {
                            const Icon = LAYER_ICONS[layer.name] || Layers;
                            const colorClass = isHpe && layer.color ? `border-[${layer.color}]` : isHpe ? 'border-[#01A982]' : 'border-gray-300';
                            const bgClass = isHpe && layer.color ? `bg-[${layer.color}]/5` : isHpe ? 'bg-[#01A982]/5' : 'bg-gray-50';
                            const textClass = isHpe ? 'text-[#01A982]' : 'text-gray-700';

                            return (
                                <div key={idx} className={`relative flex flex-col p-3 rounded-lg border hover:shadow-md transition-all ${colorClass} ${bgClass}`}>
                                    <div className="flex items-center mb-1">
                                        <Icon className={`w-4 h-4 mr-2 ${textClass}`} />
                                        <span className={`text-xs font-bold uppercase tracking-wider ${textClass}`}>{layer.name}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {layer.components.map((comp: string, cIdx: number) => (
                                            <span key={cIdx} className="px-2 py-1 bg-white rounded border border-gray-200 text-sm font-semibold text-gray-800 shadow-sm">
                                                {comp}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        {layer.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* HPE Solution Stack */}
            <div className="transform transition-all hover:-translate-y-1">
                {renderStack(currentSolution.name, currentSolution.topology, true)}
            </div>

            {/* Competitor Stack */}
            <div className="transform transition-all hover:-translate-y-1">
                {renderStack(currentCompetitor.name, currentCompetitor.topology || (currentCompetitor as any).topology, false)}
            </div>

            {/* Legend / Key takeaway */}
            <div className="col-span-1 md:col-span-2 mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                    <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h4 className="font-bold text-blue-900 text-sm uppercase mb-1">Análisis Arquitectónico</h4>
                    <p className="text-blue-800 text-sm">
                        La arquitectura de <span className="font-bold">{currentSolution.name}</span> está diseñada para reducir la complejidad mediante la unificación de capas,
                        mientras que <span className="font-bold">{currentCompetitor.name}</span> a menudo requiere componentes discretos adicionales para lograr la misma funcionalidad,
                        aumentando los puntos de falla y la complejidad de gestión.
                    </p>
                </div>
            </div>
        </div>
    );
}
