import React, { useMemo, useState, useRef, useEffect } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { ECOSYSTEM_RELATIONSHIPS } from '@/lib/ecosystem-data';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

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

export default function RelationshipGraph() {
    const fgRef = useRef<ForceGraphMethods>(null);
    const [graphWidth, setGraphWidth] = useState(800);
    const containerRef = useRef<HTMLDivElement>(null);

    // Prepare Node/Link data
    const graphData = useMemo(() => {
        const nodesMap = new Map();
        const links: any[] = [];
        const allowedTypes = ['Vendor', 'Partner', 'Technology', 'Industry'];

        ECOSYSTEM_RELATIONSHIPS.forEach(rel => {
            if (!allowedTypes.includes(rel.source_type) || !allowedTypes.includes(rel.target_type)) return;

            const srcId = `${rel.source_type}:${rel.source_id}`;
            const tgtId = `${rel.target_type}:${rel.target_id}`;

            if (!nodesMap.has(srcId)) {
                nodesMap.set(srcId, { id: srcId, name: rel.source_id, group: rel.source_type, val: rel.source_type === 'Vendor' ? 20 : rel.source_type === 'Industry' ? 12 : 5 });
            }
            if (!nodesMap.has(tgtId)) {
                nodesMap.set(tgtId, { id: tgtId, name: rel.target_id, group: rel.target_type, val: rel.target_type === 'Vendor' ? 20 : rel.target_type === 'Industry' ? 12 : 5 });
            }

            links.push({
                source: srcId,
                target: tgtId,
                name: rel.relation_type,
            });
        });

        // Compute degrees for sizing
        links.forEach(l => {
            nodesMap.get(l.source).val += 0.2;
            nodesMap.get(l.target).val += 0.2;
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
        window.addEventListener('resize', handleResize);

        // Increase repulsion for better layout spacing at mount
        setTimeout(() => {
            if (fgRef.current) {
                fgRef.current.d3Force('charge')?.strength(-120);
                fgRef.current.d3Force('link')?.distance(60);
            }
        }, 100);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const zoomIn = () => {
        const currentZoom = fgRef.current?.zoom() || 1;
        fgRef.current?.zoom(currentZoom * 1.5, 400);
    };

    const zoomOut = () => {
        const currentZoom = fgRef.current?.zoom() || 1;
        fgRef.current?.zoom(currentZoom / 1.5, 400);
    };

    const fitGraph = () => {
        fgRef.current?.zoomToFit(400, 20);
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-gray-800">Global Ecosystem Network</h3>
                    <p className="text-xs text-gray-500">Visualización Topológica de Relaciones Comerciales (Integrador ↔ Tecnología ↔ Vertical)</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={zoomIn} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"><ZoomIn className="w-4 h-4" /></button>
                    <button onClick={zoomOut} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"><ZoomOut className="w-4 h-4" /></button>
                    <button onClick={fitGraph} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"><Maximize2 className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="flex gap-4">
                {Object.entries(TYPE_COLORS).filter(([type]) => type !== 'Region').map(([type, color]) => (
                    <div key={type} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs text-gray-600 font-medium">{type} Nodos</span>
                    </div>
                ))}
            </div>

            <div ref={containerRef} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative min-h-[500px]">
                <ForceGraph2D
                    ref={fgRef as any}
                    width={graphWidth}
                    height={500}
                    graphData={graphData}
                    nodeLabel={(node: any) => `${node.group}: ${node.name}`}
                    nodeColor={(node: any) => {
                        if (node.group === 'Vendor') return LOCAL_VENDOR_COLORS[node.name] || LOCAL_VENDOR_COLORS['default'];
                        return TYPE_COLORS[node.group] || '#999';
                    }}
                    nodeRelSize={4}
                    linkColor={() => '#cbd5e1'}
                    linkDirectionalArrowLength={2}
                    linkDirectionalArrowRelPos={1}
                    linkWidth={0.5}
                    // Implement freezing physics on drag end
                    onNodeDragEnd={(node: any) => {
                        node.fx = node.x;
                        node.fy = node.y;
                    }}
                    // Custom Canvas Drawing for persistent text labels
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                        const label = node.name;
                        const fontSize = node.group === 'Vendor' ? 14 / globalScale : 10 / globalScale;
                        const radius = Math.sqrt(node.val) * 4; // matches nodeRelSize internally

                        // Draw circle
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                        ctx.fillStyle = node.group === 'Vendor' ? (LOCAL_VENDOR_COLORS[node.name] || LOCAL_VENDOR_COLORS['default']) : (TYPE_COLORS[node.group] || '#999');
                        ctx.fill();

                        // Draw text
                        ctx.font = `${node.group === 'Vendor' ? 'bold ' : ''}${fontSize}px Inter, Sans-Serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        // Outline for readability
                        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                        ctx.lineWidth = fontSize / 4;
                        ctx.strokeText(label, node.x, node.y + radius + (4 / globalScale));

                        ctx.fillStyle = '#334155'; // Dark text
                        ctx.fillText(label, node.x, node.y + radius + (4 / globalScale));
                    }}
                    nodeCanvasObjectMode={() => 'replace'}
                />
            </div>

            <p className="text-[10px] text-gray-400">
                Interacción: Arrastra los nodos para reacomodar el layout físico. Scroll para zoom. Da doble clic en un nodo para centrar.
            </p>
        </div>
    );
}
