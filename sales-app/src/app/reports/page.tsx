'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Download, ArrowLeft, CheckCircle, AlertCircle, BarChart3, Shield, Swords } from 'lucide-react';
import Link from 'next/link';
import { generateProposalDocument } from '@/lib/docx-generator';
import { getAssessmentResults, getFinancialResults, getComparatorResults, saveChartImage } from '@/lib/storage';
import TopologyDiagram from '@/components/charts/TopologyDiagram';
import { HPE_SOLUTIONS } from '@/lib/comparator-data';

export default function ReportsPage() {
    const [hasAssessment, setHasAssessment] = useState(false);
    const [hasFinancial, setHasFinancial] = useState(false);
    const [hasComparator, setHasComparator] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Topology capture state
    const topologyRef = useRef<HTMLDivElement>(null);
    const [topologyIds, setTopologyIds] = useState<{ solId: string, compId: string } | null>(null);
    const [isCapturingTopology, setIsCapturingTopology] = useState(false);
    const [debugImage, setDebugImage] = useState<string | null>(null);
    const [captureError, setCaptureError] = useState<string | null>(null);

    // Section toggles
    const [includeGap, setIncludeGap] = useState(true);
    const [includeFinancial, setIncludeFinancial] = useState(true);
    const [includeComparator, setIncludeComparator] = useState(true);

    useEffect(() => {
        const assessment = !!getAssessmentResults();
        const financial = !!getFinancialResults();
        const comparator = !!getComparatorResults();
        setHasAssessment(assessment);
        setHasFinancial(financial);
        setHasComparator(comparator);

        // Default toggles to match available data
        setIncludeGap(assessment);
        setIncludeFinancial(financial);
        setIncludeComparator(comparator);

        // Attempt to resolve IDs for Topology Diagram if comparator data exists
        if (comparator) {
            const savedComp = getComparatorResults();
            if (savedComp) {
                // Find solution ID
                const sol = Object.values(HPE_SOLUTIONS).find(s => s.name === savedComp.solutionName);
                if (sol) {
                    // Find competitor ID
                    const comp = sol.competitors.find(c => c.name === savedComp.competitorName);
                    if (comp) {
                        setTopologyIds({ solId: sol.id, compId: comp.id });
                        setIsCapturingTopology(true); // Start blocking
                    }
                }
            }
        }
    }, []);

    const captureTopology = async () => {
        if (!topologyIds || !topologyRef.current) return;

        setIsCapturingTopology(true);
        setCaptureError(null);
        setDebugImage(null);

        try {
            // Wait for render
            await new Promise(resolve => setTimeout(resolve, 1500));

            const html2canvas = (await import('html2canvas')).default;
            const element = topologyRef.current;

            console.log('Starting topology capture...', {
                width: element.offsetWidth,
                height: element.offsetHeight,
                top: element.offsetTop,
                left: element.offsetLeft
            });

            const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: true,
                useCORS: true,
                allowTaint: true,
            });

            const base64 = canvas.toDataURL('image/png');

            if (base64.length > 1000) { // Check for reasonable size
                saveChartImage('comparator_topology', base64);
                setDebugImage(base64);
                console.log('Topology chart proactively captured for report. Length:', base64.length);
            } else {
                throw new Error(`Capture too small (${base64.length} bytes). Element might be empty or hidden.`);
            }
        } catch (e: any) {
            console.error('Background capture of topology failed:', e);
            setCaptureError(e.message || String(e));
        } finally {
            setIsCapturingTopology(false); // Unblock
        }
    };

    // Effect to capture the topology diagram once rendered
    useEffect(() => {
        if (topologyIds) {
            captureTopology();
        }
    }, [topologyIds]);

    // Effect to check for persisted image on mount
    useEffect(() => {
        const storedImage = localStorage.getItem('chart_comparator_topology'); // Assuming saveChartImage uses this key
        if (storedImage) {
            setDebugImage(storedImage);
            console.log('Topology chart found in localStorage on mount.');
        }
    }, []);

    const hasAnyData = hasAssessment || hasFinancial || hasComparator;
    const hasAnySelected = (includeGap && hasAssessment) || (includeFinancial && hasFinancial) || (includeComparator && hasComparator);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await generateProposalDocument({
                includeGap: includeGap && hasAssessment,
                includeFinancial: includeFinancial && hasFinancial,
                includeComparator: includeComparator && hasComparator,
            });
        } catch (error) {
            console.error("Error generating document:", error);
            alert("Hubo un error al generar el reporte. Por favor intente nuevamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const modules = [
        {
            key: 'gap',
            label: 'Evaluación de Necesidades (GAP)',
            description: 'Análisis de brechas, hallazgos y soluciones HPE recomendadas.',
            icon: Shield,
            hasData: hasAssessment,
            included: includeGap,
            setIncluded: setIncludeGap,
            link: '/assessment',
            linkLabel: 'Ir a Evaluación',
        },
        {
            key: 'financial',
            label: 'Análisis Financiero (TCO/ROI)',
            description: 'Proyección financiera, ahorros y retorno de inversión.',
            icon: BarChart3,
            hasData: hasFinancial,
            included: includeFinancial,
            setIncluded: setIncludeFinancial,
            link: '/financial',
            linkLabel: 'Ir a Financiero',
        },
        {
            key: 'comparator',
            label: 'Análisis Competitivo',
            description: 'Comparativa HPE vs competidores por criterios clave.',
            icon: Swords,
            hasData: hasComparator,
            included: includeComparator,
            setIncluded: setIncludeComparator,
            link: '/comparator',
            linkLabel: 'Ir a Comparador',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/" className="inline-flex items-center text-gray-500 hover:text-[#01A982] mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Inicio
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Generación de Propuestas
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Seleccione los módulos a incluir y exporte un informe ejecutivo profesional en formato Word editable (.docx).
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Módulos Disponibles</h3>
                        <p className="text-sm text-gray-500 mb-6">Active o desactive cada sección para personalizar su propuesta.</p>

                        <div className="space-y-3">
                            {modules.map((mod) => {
                                const Icon = mod.icon;
                                return (
                                    <div
                                        key={mod.key}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${mod.hasData && mod.included
                                            ? 'border-[#01A982] bg-[#01A982]/5'
                                            : mod.hasData
                                                ? 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                                : 'border-gray-100 bg-gray-50/50 opacity-60'
                                            }`}
                                        onClick={() => mod.hasData && mod.setIncluded(!mod.included)}
                                    >
                                        <div className="flex items-center flex-1">
                                            {/* Toggle */}
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-4 transition-all ${mod.hasData && mod.included
                                                ? 'bg-[#01A982] border-[#01A982]'
                                                : 'border-gray-300 bg-white'
                                                }`}>
                                                {mod.hasData && mod.included && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Icon */}
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${mod.hasData ? 'bg-[#01A982]/10' : 'bg-gray-100'
                                                }`}>
                                                <Icon className={`w-5 h-5 ${mod.hasData ? 'text-[#01A982]' : 'text-gray-400'}`} />
                                            </div>

                                            {/* Text */}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-gray-900">{mod.label}</h4>
                                                    {mod.hasData ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Listo
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            Sin datos
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-0.5">{mod.description}</p>
                                            </div>
                                        </div>

                                        {/* Link to complete module */}
                                        {!mod.hasData && (
                                            <Link
                                                href={mod.link}
                                                className="text-sm text-[#01A982] font-medium hover:underline whitespace-nowrap ml-4"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {mod.linkLabel} →
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="border-t border-gray-100 p-8 flex flex-col items-center bg-gray-50/50">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !hasAnySelected || isCapturingTopology}
                            className={`
                                flex items-center justify-center px-10 py-4 rounded-xl text-lg font-bold text-white transition-all shadow-md
                                ${isGenerating || !hasAnySelected || isCapturingTopology
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-[#01A982] hover:bg-[#008f6d] hover:shadow-lg transform hover:-translate-y-1'}
                            `}
                        >
                            <Download className="w-6 h-6 mr-3" />
                            {isGenerating ? 'Generando Documento...' : isCapturingTopology ? 'Preparando gráficos...' : 'Descargar Propuesta .DOCX'}
                        </button>
                        {!hasAnySelected && (
                            <p className="text-red-500 text-sm mt-3">
                                Debe completar y seleccionar al menos un módulo para generar el reporte.
                            </p>
                        )}
                        <p className="text-xs text-gray-400 mt-3">
                            El documento generado es editable. Puede agregar logos del cliente y ajustar textos.
                        </p>
                    </div>

                    {/* Generating Message (Replaces Debug Panel) */}
                    {isCapturingTopology && (
                        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-800">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800 mr-3"></div>
                            <span className="font-medium">Preparando gráficos de alta resolución... Por favor espere.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden Topology Capture for DOCX */}
            {/* Kept visible but transparent and behind content to ensure html2canvas capture works */}
            {topologyIds && (
                <div
                    ref={topologyRef}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '1200px',
                        backgroundColor: '#ffffff',
                        zIndex: -100, // Deep behind content
                        opacity: 0, // Invisible to user, visible to DOM
                        pointerEvents: 'none',
                        visibility: 'visible',
                    }}
                >
                    <div className="p-8">
                        <TopologyDiagram
                            selectedSolutionId={topologyIds.solId}
                            selectedCompetitorId={topologyIds.compId}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
