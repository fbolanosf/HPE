import React, { useState, useMemo } from 'react';
import { Network, Activity, Layers, ActivitySquare, Route, Lightbulb, Search } from 'lucide-react';

import RelationshipGraph, { AnalyticsMode } from '../RelationshipGraph';
import { ECOSYSTEM_RELATIONSHIPS, queryEcosystem, identifyHybridIntegrators } from '@/lib/ecosystem-data';
import { PARTNER_DATABASE, Partner } from '@/lib/partner-intelligence-data';
import {
    buildGraph,
    calculateDegreeCentrality,
    detectCommunities,
    detectBridges,
    findShortestPath
} from '@/lib/graph-analytics';

export default function GraphAnalyticsShell() {
    // 1. Core State
    const [language, setLanguage] = useState<'es' | 'en'>('es');
    const [mode, setMode] = useState<AnalyticsMode | 'queries' | 'insights'>('influence');
    const [pathStart, setPathStart] = useState<string>('');
    const [pathEnd, setPathEnd] = useState<string>('');

    // --- Query State ---
    const [queryFilters, setQueryFilters] = useState({ vendor: 'ALL', technology: 'ALL', industry: 'ALL', isHybrid: undefined as boolean | undefined });
    const queryResults = useMemo(() => queryEcosystem(PARTNER_DATABASE, queryFilters), [queryFilters]);

    // Complete vendor list derived from Partner interface structure
    const allVendors = [
        'ABB', 'AVEVA', 'AWS', 'Cisco', 'Dell', 'Emerson', 'Google Cloud',
        'Honeywell', 'HPE', 'Juniper', 'Microsoft', 'Nutanix', 'PureStorage',
        'Rockwell Automation', 'Schneider', 'Siemens', 'Veeam', 'VMware',
        'VxRail', 'Yokogawa'
    ];

    // 2. Pre-Calculate Graph Mathematics on Mount (Memoized)
    const { graph, centrality, communities, bridges } = useMemo(() => {
        const g = buildGraph(ECOSYSTEM_RELATIONSHIPS);
        const cent = calculateDegreeCentrality(g);
        const comms = detectCommunities(g);
        const brigs = detectBridges(g, comms);
        return { graph: g, centrality: cent, communities: comms, bridges: brigs };
    }, []);

    // 3. Dynamic Path Calculation
    const activePath = useMemo(() => {
        if (mode !== 'path' || !pathStart || !pathEnd) return undefined;
        const res = findShortestPath(graph, pathStart, pathEnd);
        return res ? res.path : undefined;
    }, [mode, pathStart, pathEnd, graph]);

    // Graph Interaction Handler (For Path Picker)
    const handleNodeClick = (nodeId: string) => {
        if (mode !== 'path') return;
        if (!pathStart) setPathStart(nodeId);
        else if (!pathEnd) setPathEnd(nodeId);
        else {
            // Reset if both are selected
            setPathStart(nodeId);
            setPathEnd('');
        }
    };

    // Sub-menus
    const ANALYTICS_MENU = [
        {
            id: 'influence', icon: Activity,
            label: language === 'es' ? 'Mapa de Influencia' : 'Influence Map',
            desc: language === 'es' ? 'Descubre empresas altamente conectadas' : 'Centrality & highly-connected nodes'
        },
        {
            id: 'clusters', icon: Layers,
            label: language === 'es' ? 'Análisis de Grupos' : 'Cluster Analysis',
            desc: language === 'es' ? 'Agrupa empresas que trabajan juntas' : 'Louvain communities detection'
        },
        {
            id: 'bridges', icon: ActivitySquare,
            label: language === 'es' ? 'Nodos Puente' : 'Bridge Analysis',
            desc: language === 'es' ? 'Integradores que conectan mundos (IT/OT)' : 'Integrators crossing ecosystems'
        },
        {
            id: 'path', icon: Route,
            label: language === 'es' ? 'Ruta Más Corta' : 'Shortest Path',
            desc: language === 'es' ? 'Encuentra la ruta directa entre dos nodos' : 'Connect two disparate entities'
        },
        {
            id: 'queries', icon: Search,
            label: language === 'es' ? 'Buscador del Ecosistema' : 'Ecosystem Queries',
            desc: language === 'es' ? 'Filtra y explora las conexiones' : 'Filter nodes by capabilities'
        },
        {
            id: 'insights', icon: Lightbulb,
            label: language === 'es' ? 'Recomendaciones Estratégicas' : 'Graph Insights',
            desc: language === 'es' ? 'Oportunidades sugeridas por el sistema' : 'Strategic recommendations engine'
        },
    ] as const;

    return (
        <div className="flex flex-col lg:flex-row gap-6">

            {/* LEFT: Master Graph View */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
                <div className="bg-white border text-sm border-gray-200 rounded-xl p-4 min-h-[600px] flex flex-col shadow-sm">
                    <RelationshipGraph
                        analyticsMode={(mode === 'queries' || mode === 'insights') ? 'default' : mode}
                        centralityScores={centrality}
                        communities={communities}
                        bridges={bridges}
                        shortestPath={activePath}
                        onNodeClick={handleNodeClick}
                        language={language}
                    />
                </div>
            </div>

            {/* RIGHT: Analytics Sidebar Engine */}
            <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0">

                {/* 1. Control Panel */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Network className="w-4 h-4 text-[#01A982]" />
                            {language === 'es' ? 'Operaciones de Análisis' : 'Graph Operations'}
                        </h3>
                        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setLanguage('es')} className={`text-[10px] font-bold px-2 py-1 rounded ${language === 'es' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>ES</button>
                            <button onClick={() => setLanguage('en')} className={`text-[10px] font-bold px-2 py-1 rounded ${language === 'en' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>EN</button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {ANALYTICS_MENU.map(item => {
                            const Icon = item.icon;
                            const isActive = mode === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setMode(item.id as any)}
                                    className={`w-full flex flex-col items-start p-3 rounded-lg border transition-all text-left ${isActive
                                        ? 'bg-[#01A982]/10 border-[#01A982] text-gray-900 shadow-sm'
                                        : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 font-semibold text-sm">
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#01A982]' : ''}`} />
                                        {item.label}
                                    </div>
                                    <p className="text-[11px] mt-1 opacity-80 pl-6">{item.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Contextual Panel (Changes based on mode) */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex-1">

                    {mode === 'influence' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                <Activity className="w-4 h-4" /> {language === 'es' ? 'Centralidad (Nivel de Conexiones)' : 'Degree Centrality'}
                            </h4>
                            <p className="text-xs text-gray-600 mb-4">
                                {language === 'es' ? 'Muestra cuáles son las entidades con más conexiones directas dentro del ecosistema. Entre más grande sea el círculo en la red, mayor es su influencia y poder comercial.' : 'Most connected entities within the ecosystem. Size correlates directly with immediate degree centrality (number of edges).'}
                            </p>
                            <div className="space-y-3">
                                {Object.entries(centrality)
                                    .filter(([id]) => id.startsWith('Vendor:') || id.startsWith('Partner:'))
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 5)
                                    .map(([id, score], idx) => {
                                        const [type, name] = id.split(':');
                                        return (
                                            <div key={id} className="flex justify-between items-center text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400 font-mono">{idx + 1}.</span>
                                                    <span className={`font-medium ${type === 'Vendor' ? 'text-slate-800' : 'text-blue-600'}`}>
                                                        {name}
                                                    </span>
                                                </div>
                                                <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                                                    {(score * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    )}

                    {mode === 'clusters' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                <Layers className="w-4 h-4" /> {language === 'es' ? 'Grupos Detectados Automáticamente' : 'Autodetected Communities'}
                            </h4>
                            <p className="text-xs text-gray-600 mb-4">
                                {language === 'es' ? 'Analizamos la densidad de las conexiones para descubrir de forma automática qué empresas y tecnologías suelen operar siempre juntas formando su propio \'micro ecosistema\'.' : 'Using Label Propagation to identify organic "ecosystems" within the graph topology based on density.'}
                            </p>
                            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                <p className="text-xs text-amber-800 font-medium whitespace-pre-line">
                                    {language === 'es'
                                        ? `El ecosistema ha sido dividido en ${new Set(Object.values(communities)).size} grupos distintos. Cada color en el mapa representa una comunidad de empresas y tecnologías fuertemente entrelazadas.`
                                        : `Graph mathematically fragmented into ${new Set(Object.values(communities)).size} distinct communities. Nodes sharing the same hue belong to the same dense cluster.`}
                                </p>
                            </div>
                        </div>
                    )}

                    {mode === 'bridges' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                <ActivitySquare className="w-4 h-4" /> {language === 'es' ? 'Integradores de Frontera (Nodos Puente)' : 'Bridge Nodes'}
                            </h4>
                            <p className="text-xs text-gray-600 mb-4">
                                {language === 'es' ? 'Empresas únicas que sirven como puentes conectando dos mundos diferentes (por ejemplo, integradores que saben de centros de datos IT pero también dominan plantas OT).' : 'Entities that span multiple isolated communities, acting as crucial translators (typically IT/OT integrators).'}
                            </p>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                {bridges.slice(0, 8).map((b, idx) => {
                                    const [type, name] = b.id.split(':');
                                    return (
                                        <div key={b.id} className="flex justify-between items-center text-[11px] p-2 bg-gray-50 rounded border border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700">{name} <span className="text-gray-400 font-normal">({type})</span></span>
                                                <span className="text-gray-500 mt-1">{language === 'es' ? `Conecta ${b.bridgeScore} Grupos` : `Crosses ${b.bridgeScore} Clusters`}</span>
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-yellow-100 border border-yellow-300 flex items-center justify-center text-yellow-700 font-bold">
                                                {b.bridgeScore}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {mode === 'path' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                <Route className="w-4 h-4" /> {language === 'es' ? 'Caminos Más Cortos (Rutas Relacionales)' : 'Shortest Path (BFS)'}
                            </h4>
                            <p className="text-xs text-gray-600">
                                {language === 'es' ? 'Haz clic en cualquier círculo del mapa y luego haz clic en otro diferente. Esta máquina calculará de inmediato cuál es la ruta comercial que los conecta directamente.' : 'Click on any two nodes in the graph to discover the shortest relationship path between them.'}
                            </p>

                            <div className="flex flex-col gap-2 mt-4">
                                <div className={`p-2 rounded text-xs border ${pathStart ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-dashed border-gray-300 text-gray-400'}`}>
                                    <strong>A:</strong> {pathStart ? pathStart.split(':')[1] : (language === 'es' ? 'Selecciona un origen en él gráfico...' : 'Click a start node...')}
                                </div>
                                <div className="flex justify-center"><Network className="w-3 h-3 text-gray-300" /></div>
                                <div className={`p-2 rounded text-xs border ${pathEnd ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-dashed border-gray-300 text-gray-400'}`}>
                                    <strong>B:</strong> {pathEnd ? pathEnd.split(':')[1] : (language === 'es' ? 'Selecciona un destino en el gráfico...' : 'Click a destination node...')}
                                </div>
                            </div>

                            {activePath && pathStart && pathEnd && (
                                <div className="mt-4 p-3 bg-slate-800 text-white rounded-lg text-xs">
                                    {activePath ? (
                                        <>
                                            <span className="text-emerald-400 font-bold mb-2 block">{activePath.length - 1} {language === 'es' ? 'grados de separación (saltos):' : 'degrees of separation:'}</span>
                                            <div className="flex flex-col gap-1.5 opacity-90">
                                                {activePath.map((id, i) => (
                                                    <div key={id} className="flex gap-2 items-center">
                                                        <span className="text-slate-500">{i + 1}.</span>
                                                        <span>{id.split(':')[1]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-red-400">{language === 'es' ? 'No existe una ruta conocida o conexión posible entre estas dos entidades en la base de datos actual.' : 'No reachable path exists between these entities.'}</span>
                                    )}
                                </div>
                            )}

                            {(pathStart || pathEnd) && (
                                <button
                                    onClick={() => { setPathStart(''); setPathEnd(''); }}
                                    className="w-full mt-2 py-1.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded border border-transparent transition-colors"
                                >
                                    {language === 'es' ? 'Limpiar Selección' : 'Clear Selection'}
                                </button>
                            )}
                        </div>
                    )}

                    {mode === 'queries' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                <Search className="w-4 h-4" /> {language === 'es' ? 'Buscador Relacional' : 'Relational Queries'}
                            </h4>
                            <p className="text-xs text-gray-600 mb-4">
                                {language === 'es' ? 'Filtra la base de datos original usando la red topológica para encontrar socios con capacidades específicas.' : 'Filter the entire underlying ecosystem database based on connected edges.'}
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">{language === 'es' ? 'Filtrar por Fabricante' : 'Vendor Filter'}</label>
                                    <select
                                        className="w-full mt-1 text-xs border-gray-200 rounded-md p-2"
                                        value={queryFilters.vendor}
                                        onChange={e => setQueryFilters({ ...queryFilters, vendor: e.target.value })}
                                    >
                                        <option value="ALL">{language === 'es' ? 'Todos' : 'All Vendors'}</option>
                                        {allVendors.map(vendor => (
                                            <option key={vendor} value={vendor}>{vendor}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pt-2 border-t border-gray-100">
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <span className="text-xs font-semibold text-gray-700">{language === 'es' ? 'Partners Compatibles' : 'Matched Partners'}</span>
                                        <span className="bg-[#01A982] text-white text-xs font-bold px-2 py-0.5 rounded-full">{queryResults.length}</span>
                                    </div>
                                    <div className="mt-2 max-h-[150px] overflow-y-auto space-y-1">
                                        {queryResults.slice(0, 50).map(p => (
                                            <div key={p.id} className="text-[11px] text-gray-600 truncate p-1.5 bg-gray-50 rounded">
                                                {p.company_name} <span className="text-gray-400 capitalize">({p.region})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {mode === 'insights' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-500" /> {language === 'es' ? 'Recomendaciones Estratégicas' : 'Strategic Insights'}
                            </h4>
                            <p className="text-xs text-gray-600 mb-4">
                                {language === 'es' ? 'Oportunidades de negocio y tácticas matemáticas calculadas desde el flujo topológico de conexiones.' : 'Mathematical recommendations derived from graph topology analysis.'}
                            </p>

                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <h5 className="text-xs font-bold text-blue-900 mb-1">{language === 'es' ? 'Oportunidades Híbridas (Edge / OT)' : 'High-Value OT Targets'}</h5>
                                    <p className="text-[11px] text-blue-800">
                                        {language === 'es'
                                            ? `Hemos detectado matemáticamente ${identifyHybridIntegrators(PARTNER_DATABASE).length} integradores que operan orgánicamente saltando entre el piso de planta industrial y los centros de datos corporativos. Son prospectos estelares de HPE para infraestructura Edge y WiFi.`
                                            : `${identifyHybridIntegrators(PARTNER_DATABASE).length} Integrators identified acting as hybrid bridges between IT data centers and OT floors. Prioritize them for Edge Computing pitches.`}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                                    <h5 className="text-xs font-bold text-purple-900 mb-1">{language === 'es' ? 'Oportunidad de Virtualización y Nube' : 'Virtualization Opportunity'}</h5>
                                    <p className="text-[11px] text-purple-800">
                                        {language === 'es'
                                            ? `Encontramos ${PARTNER_DATABASE.filter(p => !p.virtualization && p.technology_domain.includes('IT')).length} partners de tecnología clásica que poseen altas conexiones pero no tienen registros modernos de Virtualización. Este es terreno virgen excelente para empujar soluciones de VMware o entornos híbridos.`
                                            : `${PARTNER_DATABASE.filter(p => !p.virtualization && p.technology_domain.includes('IT')).length} IT Partners are heavily connected but lack Virtualization capabilities. Prime targets for VMware/HCI expansion.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
