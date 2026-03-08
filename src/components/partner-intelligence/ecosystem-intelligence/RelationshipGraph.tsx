import React, { useMemo, useState, useRef, useEffect } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { ECOSYSTEM_RELATIONSHIPS } from '@/lib/ecosystem-data';
import { CentralityScores, CommunityMap, BridgeNode } from '@/lib/graph-analytics';
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

export type AnalyticsMode = 'default' | 'influence' | 'clusters' | 'bridges' | 'path';

interface RelationshipGraphProps {
    analyticsMode?: AnalyticsMode;
    centralityScores?: CentralityScores;
    communities?: CommunityMap;
    bridges?: BridgeNode[];
    shortestPath?: string[]; // Array of node IDs in path
    onNodeClick?: (nodeId: string) => void;
    language?: 'es' | 'en';
}

const LOCAL_VENDOR_COLORS: Record<string, string> = {
    'Siemens': '#009999',
    'Rockwell Automation': '#d62222',
    'Schneider Electric': '#3dcd58',
    'ABB': '#ff0000',
    'Honeywell': '#e5261f',
    'VMware': '#717074',
    'HPE': '#01A982',
    'Dell': '#007db8',
    'Cisco': '#0096d6',
    'Microsoft': '#00a4ef',
    'AWS': '#ff9900',
    'Google Cloud': '#4285F4',
    'default': '#6366f1',
};

const TYPE_COLORS: Record<string, string> = {
    'Vendor': '#334155',
    'Partner': '#0ea5e9',
    'Technology': '#8b5cf6',
    'Industry': '#f59e0b',
    'Region': '#10b981',
};

export default function RelationshipGraph({
    analyticsMode = 'default',
    centralityScores,
    communities,
    bridges,
    shortestPath,
    onNodeClick,
    language = 'es'
}: RelationshipGraphProps) {
    const fgRef = useRef<ForceGraphMethods>(null);
    const [graphWidth, setGraphWidth] = useState(800);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Prepare Node/Link data
    const graphData = useMemo(() => {
        const nodesMap = new Map();
        const links: any[] = [];
        const allowedTypes = ['Vendor', 'Partner', 'Technology', 'Industry'];

        ECOSYSTEM_RELATIONSHIPS.forEach(rel => {
            if (!allowedTypes.includes(rel.source_type) || !allowedTypes.includes(rel.target_type)) return;

            // Enforce ID standard matching graph-analytics Engine
            const srcId = `${rel.source_type}:${rel.source_id}`;
            const tgtId = `${rel.target_type}:${rel.target_id}`;

            if (!nodesMap.has(srcId)) {
                nodesMap.set(srcId, { id: srcId, name: rel.source_id, group: rel.source_type, baseVal: rel.source_type === 'Vendor' ? 20 : rel.source_type === 'Industry' ? 12 : 5 });
            }
            if (!nodesMap.has(tgtId)) {
                nodesMap.set(tgtId, { id: tgtId, name: rel.target_id, group: rel.target_type, baseVal: rel.target_type === 'Vendor' ? 20 : rel.target_type === 'Industry' ? 12 : 5 });
            }

            links.push({
                source: srcId,
                target: tgtId,
                name: rel.relation_type,
            });
        });

        // Compute base degrees for default sizing
        links.forEach(l => {
            nodesMap.get(l.source).baseVal += 0.2;
            nodesMap.get(l.target).baseVal += 0.2;
        });

        return { nodes: Array.from(nodesMap.values()), links };
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            setGraphWidth(containerRef.current.offsetWidth);
        }

        const handleResize = () => {
            if (containerRef.current) setGraphWidth(containerRef.current.offsetWidth);
        };
        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);
            // Delay measurement to allow CSS classes (w-screen) to apply
            setTimeout(() => {
                if (containerRef.current) setGraphWidth(containerRef.current.offsetWidth);
            }, 50);
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Increase repulsion for better layout spacing at mount
        setTimeout(() => {
            if (fgRef.current) {
                fgRef.current.d3Force('charge')?.strength(-120);
                fgRef.current.d3Force('link')?.distance(60);
            }
        }, 100);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const zoomIn = () => {
        const currentZoom = fgRef.current?.zoom() || 1;
        fgRef.current?.zoom(currentZoom * 1.5, 400);
    };

    const zoomOut = () => {
        const currentZoom = fgRef.current?.zoom() || 1;
        fgRef.current?.zoom(currentZoom / 1.5, 400);
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-gray-800">
                        {language === 'es' ? 'Topología Global del Ecosistema' : 'Global Ecosystem Network'}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {language === 'es' ? 'Visualización de Relaciones Comerciales (Integrador ↔ Tecnología ↔ Vertical)' : 'Visualización Topológica de Relaciones Comerciales (Integrador ↔ Tecnología ↔ Vertical)'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={zoomIn} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"><ZoomIn className="w-4 h-4" /></button>
                    <button onClick={zoomOut} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"><ZoomOut className="w-4 h-4" /></button>
                    <button onClick={toggleFullscreen} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600">
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className="flex gap-4">
                {analyticsMode === 'clusters' ? (
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" /><span className="text-xs text-gray-600 font-medium">{language === 'es' ? 'Grupos / Comunidades' : 'Auto-detected Community Clusters'}</span></div>
                ) : analyticsMode === 'bridges' ? (
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600" /><span className="text-xs text-gray-600 font-medium">{language === 'es' ? 'Integradores Puente (Múltiples Tecnologías)' : 'Bridge Nodes (Connecting 2+ Ecosystems)'}</span></div>
                ) : analyticsMode === 'influence' ? (
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-400" /><span className="text-xs text-gray-600 font-medium">{language === 'es' ? 'Tamaño = Nivel de Influencia' : 'Size = Degree Centrality'}</span></div>
                ) : analyticsMode === 'path' ? (
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#01A982]" /><span className="text-xs text-gray-600 font-medium">{language === 'es' ? 'La Ruta Más Corta' : 'Shortest Path'}</span></div>
                ) : (
                    Object.entries(TYPE_COLORS).filter(([type]) => type !== 'Region').map(([type, color]) => (
                        <div key={type} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-xs text-gray-600 font-medium">{type} Nodos</span>
                        </div>
                    ))
                )}
            </div>

            <div ref={containerRef} className={`flex-1 bg-slate-50 relative ${isFullscreen ? 'w-screen h-screen' : 'border border-slate-200 rounded-xl overflow-hidden min-h-[500px]'}`}>
                {isFullscreen && (
                    <div className="absolute top-4 right-4 z-50 flex gap-2 bg-white/80 backdrop-blur p-1 rounded-lg shadow-sm border border-gray-200">
                        <button onClick={zoomIn} className="p-1.5 hover:bg-gray-100 rounded text-gray-700"><ZoomIn className="w-5 h-5" /></button>
                        <button onClick={zoomOut} className="p-1.5 hover:bg-gray-100 rounded text-gray-700"><ZoomOut className="w-5 h-5" /></button>
                        <button onClick={toggleFullscreen} className="p-1.5 hover:bg-gray-100 rounded text-gray-700"><Minimize2 className="w-5 h-5" /></button>
                    </div>
                )}
                <ForceGraph2D
                    ref={fgRef as any}
                    width={graphWidth}
                    height={isFullscreen ? window.innerHeight : 500}
                    graphData={graphData}
                    nodeLabel={(node: any) => `${node.group}: ${node.name}`}
                    nodeColor={(node: any) => {
                        if (node.group === 'Vendor') return LOCAL_VENDOR_COLORS[node.name] || LOCAL_VENDOR_COLORS['default'];
                        return TYPE_COLORS[node.group] || '#999';
                    }}
                    nodeRelSize={4}
                    linkColor={(link: any) => {
                        if (analyticsMode === 'path' && shortestPath) {
                            const isPath = shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id);
                            return isPath ? '#01A982' : 'rgba(203, 213, 225, 0.2)';
                        }
                        if (analyticsMode !== 'default') return 'rgba(203, 213, 225, 0.3)';
                        return '#cbd5e1';
                    }}
                    linkDirectionalArrowLength={analyticsMode === 'default' ? 2 : 0}
                    linkDirectionalArrowRelPos={1}
                    linkWidth={(link: any) => {
                        if (analyticsMode === 'path' && shortestPath) {
                            return shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id) ? 3 : 0.5;
                        }
                        return 0.5;
                    }}
                    // Enable clicks
                    onNodeClick={(node: any) => {
                        if (onNodeClick) onNodeClick(node.id);
                    }}
                    // Implement freezing physics on drag end
                    onNodeDragEnd={(node: any) => {
                        node.fx = node.x;
                        node.fy = node.y;
                    }}
                    // Custom Canvas Drawing for persistent text labels and Overlays
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                        const label = node.name;

                        // 1. Determine Node Size dynamically based on Analytics Mode
                        let sizeFactor = node.baseVal;
                        if (analyticsMode === 'influence' && centralityScores) {
                            // Expand highly central nodes exponentially
                            const score = centralityScores[node.id] || 0.1;
                            sizeFactor = 5 + (score * 50);
                        }

                        const radius = Math.sqrt(sizeFactor) * 4;
                        const fontSize = node.group === 'Vendor' ? 14 / globalScale : 10 / globalScale;

                        // 2. Determine Node Color dynamically
                        let fillColor = node.group === 'Vendor' ? (LOCAL_VENDOR_COLORS[node.name] || LOCAL_VENDOR_COLORS['default']) : (TYPE_COLORS[node.group] || '#999');
                        let isFaded = false;
                        let hasBorder = false;
                        let borderColor = '#000';

                        if (analyticsMode === 'clusters' && communities) {
                            // Hue based on Community ID
                            const commId = communities[node.id] || 0;
                            fillColor = `hsl(${(commId * 137.5) % 360}, 70%, 50%)`;
                        } else if (analyticsMode === 'bridges' && bridges) {
                            const isBridge = bridges.some(b => b.id === node.id);
                            if (isBridge) {
                                fillColor = '#facc15'; // yellow-400
                                hasBorder = true;
                                borderColor = '#ca8a04'; // yellow-600
                            } else {
                                isFaded = true;
                            }
                        } else if (analyticsMode === 'path' && shortestPath) {
                            if (shortestPath.includes(node.id)) {
                                fillColor = '#01A982'; // HPE green for path nodes
                                hasBorder = true;
                                borderColor = '#005a46';
                            } else {
                                isFaded = true;
                            }
                        }

                        // Draw circle
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                        ctx.fillStyle = isFaded ? 'rgba(200, 200, 200, 0.3)' : fillColor;
                        ctx.fill();

                        if (hasBorder) {
                            ctx.lineWidth = 2 / globalScale;
                            ctx.strokeStyle = borderColor;
                            ctx.stroke();
                        }

                        // Draw text
                        if (analyticsMode === 'default' || !isFaded || (analyticsMode === 'influence' && sizeFactor > 15)) {
                            ctx.font = `${node.group === 'Vendor' ? 'bold ' : ''}${fontSize}px Inter, Sans-Serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';

                            // Outline for readability
                            ctx.strokeStyle = isFaded ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)';
                            ctx.lineWidth = fontSize / 4;
                            ctx.strokeText(label, node.x, node.y + radius + (4 / globalScale));

                            ctx.fillStyle = isFaded ? '#94a3b8' : '#334155'; // Dark text
                            ctx.fillText(label, node.x, node.y + radius + (4 / globalScale));
                        }
                    }}
                    nodeCanvasObjectMode={() => 'replace'}
                />
            </div>

            <p className="text-[10px] text-gray-400">
                {language === 'es'
                    ? 'Interacción: Arrastra los nodos para explorar la red. Usa el scroll para acercar/alejar. Da doble clic en un nodo para centrar.'
                    : 'Interaction: Drag nodes to explore the network layout. Scroll to zoom. Double click a node to center.'}
            </p>
        </div>
    );
}
