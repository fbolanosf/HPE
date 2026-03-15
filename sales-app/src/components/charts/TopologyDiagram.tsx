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

    if (!currentSolution || !currentCompetitor) return <div className="p-8 text-center" style={{ color: '#6b7280' }}>Seleccione una solución y un competidor para ver la topología.</div>;

    const renderStack = (title: string, topology: any, isHpe: boolean) => {
        if (!topology) {
            return (
                <div
                    className="rounded-xl p-8 text-center w-full h-full flex flex-col items-center justify-center min-h-[400px]"
                    style={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <Layers className="w-12 h-12 mb-4" style={{ color: '#d1d5db' }} />
                    <p style={{ color: '#6b7280' }}>Diagrama de topología no disponible para {title}</p>
                </div>
            );
        }

        return (
            <div
                className="flex flex-col h-full"
                style={{
                    border: isHpe ? '1px solid rgba(1, 169, 130, 0.2)' : '1px solid #e5e7eb',
                    borderRadius: '0.75rem' // rounded-xl
                }}
            >
                <div
                    className="p-4 rounded-t-xl"
                    style={{
                        backgroundColor: isHpe ? '#01A982' : '#1f2937',
                        color: '#ffffff',
                        borderBottom: isHpe ? '1px solid #01A982' : '1px solid #111827'
                    }}
                >
                    <h3 className="font-bold text-lg flex items-center justify-center">
                        <Layers className="w-5 h-5 mr-2 opacity-80" />
                        Arquitectura {title}
                    </h3>
                </div>

                <div
                    className="p-6 rounded-b-xl flex-grow flex flex-col gap-4"
                    style={{
                        backgroundColor: '#ffffff',
                        borderLeft: '1px solid #e5e7eb',
                        borderRight: '1px solid #e5e7eb',
                        borderBottom: '1px solid #e5e7eb',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                >
                    <p className="text-sm mb-4 italic text-center pb-4" style={{ color: '#4b5563', borderBottom: '1px solid #f3f4f6' }}>
                        "{topology.summary}"
                    </p>

                    <div className="flex flex-col gap-3 flex-grow justify-start">
                        {/* Render layers from top to bottom */}
                        {topology.layers.map((layer: any, idx: number) => {
                            if (layer.name === 'spacer') {
                                return (
                                    <div 
                                        key={idx} 
                                        className="relative flex flex-col p-3 rounded-lg"
                                        style={{ 
                                            visibility: 'hidden', 
                                            minHeight: '80px', // Matches base layer height roughly
                                            border: '1px solid transparent'
                                        }}
                                    />
                                );
                            }

                            const Icon = LAYER_ICONS[layer.name] || Layers;
                            // Explicit Hex fallback
                            const borderColor = isHpe && layer.color ? layer.color : isHpe ? '#01A982' : '#d1d5db';
                            const bgColor = isHpe && layer.color ? `${layer.color}0D` : isHpe ? '#01A9820D' : '#f9fafb'; // 0D is ~5% opacity hex
                            const textColor = isHpe ? '#01A982' : '#374151';

                            return (
                                <div
                                    key={idx}
                                    className="relative flex flex-col p-3 rounded-lg"
                                    style={{
                                        border: `1px solid ${borderColor}`,
                                        backgroundColor: bgColor,
                                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                        minHeight: '80px' // Added for better alignment
                                    }}
                                >
                                    <div className="flex items-center mb-1">
                                        <Icon className="w-4 h-4 mr-2" style={{ color: textColor }} />
                                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: textColor }}>{layer.name}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {layer.components.map((comp: string, cIdx: number) => (
                                            <span
                                                key={cIdx}
                                                className="px-2 py-1 rounded text-sm font-semibold"
                                                style={{
                                                    backgroundColor: '#ffffff',
                                                    color: '#1f2937',
                                                    border: '1px solid #e5e7eb',
                                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                                }}
                                            >
                                                {comp}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
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
            <div>
                {renderStack(currentSolution.name, currentSolution.topology, true)}
            </div>

            {/* Competitor Stack */}
            <div>
                {renderStack(currentCompetitor.name, currentCompetitor.topology || (currentCompetitor as any).topology, false)}
            </div>

            {/* Legend / Key takeaway */}
            <div
                className="col-span-1 md:col-span-2 mt-4 rounded-lg p-4 flex items-start"
                style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #dbeafe'
                }}
            >
                <div className="p-2 rounded-full mr-4 flex-shrink-0" style={{ backgroundColor: '#dbeafe' }}>
                    <Activity className="w-5 h-5" style={{ color: '#2563eb' }} />
                </div>
                <div>
                    <h4 className="font-bold text-sm uppercase mb-1" style={{ color: '#1e3a8a' }}>Análisis Arquitectónico</h4>
                    <p className="text-sm" style={{ color: '#1e40af' }}>
                        La arquitectura de <span className="font-bold">{currentSolution.name}</span> está diseñada para reducir la complejidad mediante la unificación de capas,
                        mientras que <span className="font-bold">{currentCompetitor.name}</span> a menudo requiere componentes discretos adicionales para lograr la misma funcionalidad,
                        aumentando los puntos de falla y la complejidad de gestión.
                    </p>
                </div>
            </div>
        </div>
    );
}
