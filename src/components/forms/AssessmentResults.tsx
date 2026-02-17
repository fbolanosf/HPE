'use client';

import { useEffect, useState, useRef } from 'react';
import { saveAssessmentResults } from '@/lib/storage';
import { ASSESSMENT_QUESTIONS, Question } from '@/lib/assessment-data';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';
import { Download, Clock, RefreshCw, FileText, CheckCircle, AlertTriangle, Home } from 'lucide-react';
import EisenhowerMatrix, { EisenhowerMatrixRef } from '@/components/charts/EisenhowerMatrix';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

interface AssessmentResultsProps {
    answers: Record<string, string>;
    onReset: () => void;
}

export default function AssessmentResults({ answers, onReset }: AssessmentResultsProps) {
    const router = useRouter();
    const [horizon, setHorizon] = useState<'12' | '24' | '36'>('12');
    const dashboardRef = useRef<HTMLDivElement>(null);
    const eisenhowerRef = useRef<EisenhowerMatrixRef>(null);
    const eisenhowerContainerRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false); // To handle loading state

    // Categories mapping
    const categories = [
        { id: 'infrastructure', label: 'Eficiencia Infraestructura' },
        { id: 'agility', label: 'Agilidad Operativa' },
        { id: 'cloud-strategy', label: 'Estrategia Nube' },
        { id: 'data-resilience', label: 'Resiliencia Datos' },
        { id: 'security', label: 'Ciberseguridad' },
        { id: 'financial', label: 'Eficiencia Financiera' },
    ];

    // Verify data consistency (Schema Migration Check)
    const hasInvalidKeys = Object.keys(answers).some(key => !ASSESSMENT_QUESTIONS.find(q => q.id === key));

    if (hasInvalidKeys) {
        return (
            <div className="max-w-xl mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg border-l-4 border-yellow-500 text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Actualización de Versión Necesaria</h2>
                <p className="text-gray-600 mb-6">
                    Se han detectado datos de una versión anterior del cuestionario.
                    Para ver el nuevo análisis detallado de 6 dimensiones, es necesario reiniciar la evaluación.
                </p>
                <button
                    onClick={onReset}
                    className="inline-flex items-center px-6 py-3 bg-[#01A982] text-white rounded-lg hover:bg-[#008f6d] font-bold shadow-md transition-all"
                >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Actualizar y Reiniciar
                </button>
            </div>
        );
    }

    // Calculate scores and collect details
    const scores: Record<string, number> = {};
    const maxScores: Record<string, number> = {};
    const detailedResults: any[] = [];

    // Initialize scores
    categories.forEach(c => {
        scores[c.id] = 0;
        maxScores[c.id] = 0;
    });

    Object.entries(answers).forEach(([qId, oId]) => {
        const q = ASSESSMENT_QUESTIONS.find(q => q.id === qId);
        const o = q?.options.find(opt => opt.id === oId);

        if (q && o) {
            scores[q.category] += o.score;
            maxScores[q.category] += 10;

            // Only add to matrix if score is not perfect (gap exists)
            if (o.score < 10) {
                detailedResults.push({
                    category: q.categoryLabel,
                    question: q.text,
                    answer: o.label,
                    gap: o.gap,
                    futureState: o.futureState,
                    solution: o.hpeSolution
                });
            }
        }
    });

    // Normalize scores
    const normScores = categories.map(c => {
        const raw = scores[c.id];
        const max = maxScores[c.id];
        return max > 0 ? (raw / max) * 100 : 0;
    });

    const overallScore = Math.round(normScores.reduce((a, b) => a + b, 0) / categories.length);

    // Industry & Target Logic
    const industryAvg = [60, 50, 55, 65, 50, 40]; // Estimated averages
    const improvementFactor = horizon === '12' ? 1.25 : horizon === '24' ? 1.45 : 1.7;
    const targetScores = normScores.map(s => Math.min(100, Math.max(s * improvementFactor + 15, 80)));

    // Build solution-to-number mapping for Eisenhower cross-reference
    // Uses the same ordering as the EisenhowerMatrix component (order of first appearance)
    const solutionNumberMap: Record<string, number> = {};
    let solCounter = 1;
    detailedResults.forEach(r => {
        if (!solutionNumberMap[r.solution]) {
            solutionNumberMap[r.solution] = solCounter++;
        }
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            saveAssessmentResults({ answers, scores, detailedResults });
        }
    }, [answers]);

    // Chart Data
    const chartData = {
        labels: categories.map(c => c.label),
        datasets: [
            {
                label: 'Estado Actual',
                data: normScores,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: '#EF4444',
                borderWidth: 2,
            },
            {
                label: 'Promedio Industria',
                data: industryAvg,
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                borderColor: '#6B7280',
                borderWidth: 1,
                borderDash: [5, 5],
            },
            {
                label: `Objetivo HPE (${horizon} meses)`,
                data: targetScores,
                backgroundColor: 'rgba(1, 169, 130, 0.2)',
                borderColor: '#01A982',
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        scales: {
            r: {
                angleLines: { color: '#E5E7EB' },
                grid: { color: '#E5E7EB' },
                pointLabels: { font: { size: 11, weight: 'bold' } },
                suggestedMin: 0,
                suggestedMax: 100,
            }
        },
        plugins: {
            legend: { position: 'top' as const },
        }
    };

    const handleExportPDF = async () => {
        if (!dashboardRef.current) return;

        try {
            console.log("Starting PDF export with robust cloning...");
            // 1. Create a deep clone for manipulation
            const original = dashboardRef.current;
            const clone = original.cloneNode(true) as HTMLElement;

            // 2. Wrap in a hidden container to ensure layout stability during capture
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '-10000px';
            container.style.left = '-10000px';
            container.style.width = `${original.offsetWidth}px`;
            // Ensure white background for the capture
            container.style.backgroundColor = '#ffffff';
            document.body.appendChild(container);
            container.appendChild(clone);

            // 3. Manually copy Canvas content (cloneNode doesn't copy canvas state)
            const originalCanvases = original.querySelectorAll('canvas');
            const cloneCanvases = clone.querySelectorAll('canvas');
            originalCanvases.forEach((orig, i) => {
                const dest = cloneCanvases[i];
                const ctx = dest.getContext('2d');
                if (ctx) {
                    ctx.drawImage(orig, 0, 0);
                }
            });

            // 4. Recursive Sanitization function to replace Lab/Oklch colors
            const sanitizeNode = (node: Element) => {
                if (!(node instanceof HTMLElement) && !(node instanceof SVGElement)) return;

                const style = window.getComputedStyle(node);

                const colorProps = [
                    'color', 'background-color',
                    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
                    'outline-color', 'text-decoration-color',
                    'fill', 'stroke'
                ];

                // Simple props
                colorProps.forEach(prop => {
                    const val = style.getPropertyValue(prop);
                    if (val && (val.includes('lab(') || val.includes('oklch('))) {
                        // Intelligent fallback
                        if (prop.includes('background')) {
                            (node as HTMLElement).style.setProperty(prop, '#ffffff', 'important');
                        } else if (prop.includes('border') || prop.includes('outline')) {
                            (node as HTMLElement).style.setProperty(prop, '#e5e7eb', 'important'); // gray
                        } else {
                            (node as HTMLElement).style.setProperty(prop, '#000000', 'important');
                        }
                    }
                });

                // Complex props (box-shadow)
                const shadow = style.getPropertyValue('box-shadow');
                if (shadow && (shadow.includes('lab(') || shadow.includes('oklch('))) {
                    (node as HTMLElement).style.setProperty('box-shadow', 'none', 'important');
                }

                // Remove filters that might use colors
                if (style.filter !== 'none') {
                    (node as HTMLElement).style.setProperty('filter', 'none', 'important');
                }

                // Special handling for the HPE primary color if it was lost
                if (node.classList.contains('text-[#01A982]')) {
                    (node as HTMLElement).style.color = '#01A982';
                }

                Array.from(node.children).forEach(sanitizeNode);
            };

            // Apply sanitization to the entire clone tree
            sanitizeNode(clone);

            // Wait a moment for DOM to settle
            await new Promise(resolve => setTimeout(resolve, 300));

            // 5. Generate Canvas from the sanitized clone
            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: original.scrollWidth,
                windowHeight: original.scrollHeight
            });

            // 6. Cleanup DOM
            document.body.removeChild(container);

            console.log("Canvas created successfully");
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Add the Chart/Summary Image
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Calculate where the image ends to start the table
            let finalY = pdfHeight + 10;

            // Check if image is too tall for one page (rare for this top section but possible)
            if (pdfHeight > 280) {
                pdf.addPage();
                finalY = 20;
            }

            // --- Render Native PDF Table using detailedResults ---
            // This handles pagination, margins, and repeating headers automatically
            const tableBody = detailedResults.map(item => [
                String(solutionNumberMap[item.solution] || ''),
                item.category,
                `Actual: ${item.answer}\n${item.gap}`, // Combine for cleaner look
                item.futureState,
                item.solution
            ]);

            autoTable(pdf, {
                startY: finalY,
                head: [['#', 'Dimensión', 'Hallazgo / Brecha', 'Estado Futuro Deseado', 'Solución HPE']],
                body: tableBody,
                theme: 'grid',
                styles: {
                    fontSize: 9,
                    cellPadding: 4,
                    overflow: 'linebreak'
                },
                headStyles: {
                    fillColor: [1, 169, 130], // HPE Green #01A982
                    textColor: 255,
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' }, // # number
                    1: { cellWidth: 35, fontStyle: 'bold' }, // Dimension
                    2: { cellWidth: 43 }, // Gap
                    3: { cellWidth: 43 }, // Future
                    4: { cellWidth: 38, fontStyle: 'bold', textColor: [1, 169, 130] } // Solution (Green text)
                },
                didDrawPage: (data) => {
                    // Header on new pages if needed
                },
                margin: { top: 20 }
            });

            // --- Eisenhower Matrix for PDF ---
            if (eisenhowerContainerRef.current) {
                try {
                    const eisClone = eisenhowerContainerRef.current.cloneNode(true) as HTMLElement;
                    // Remove the ignore attribute from the clone root so html2canvas renders it
                    eisClone.removeAttribute('data-html2canvas-ignore');
                    // Remove no-print elements from children
                    eisClone.querySelectorAll('[data-html2canvas-ignore]').forEach(el => el.remove());
                    eisClone.querySelectorAll('.no-print').forEach(el => el.remove());

                    const eisContainer = document.createElement('div');
                    eisContainer.style.position = 'absolute';
                    eisContainer.style.top = '-10000px';
                    eisContainer.style.left = '-10000px';
                    eisContainer.style.width = `${eisenhowerContainerRef.current.offsetWidth}px`;
                    eisContainer.style.backgroundColor = '#ffffff';
                    document.body.appendChild(eisContainer);
                    eisContainer.appendChild(eisClone);

                    // Copy canvas content for the chart
                    const origCanvases = eisenhowerContainerRef.current.querySelectorAll('canvas');
                    const cloneCanvases = eisClone.querySelectorAll('canvas');
                    origCanvases.forEach((orig, i) => {
                        const dest = cloneCanvases[i];
                        if (dest) {
                            const ctx = dest.getContext('2d');
                            if (ctx) ctx.drawImage(orig, 0, 0);
                        }
                    });

                    sanitizeNode(eisClone);
                    await new Promise(resolve => setTimeout(resolve, 200));

                    const eisCanvas = await html2canvas(eisClone, {
                        scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff',
                        windowWidth: eisenhowerContainerRef.current.scrollWidth,
                        windowHeight: eisenhowerContainerRef.current.scrollHeight
                    });

                    document.body.removeChild(eisContainer);

                    const eisImgData = eisCanvas.toDataURL('image/png');
                    const eisImgWidth = pdfWidth - 20; // 10mm margin each side
                    const eisImgHeight = (eisCanvas.height * eisImgWidth) / eisCanvas.width;

                    // Add Eisenhower on a new page
                    pdf.addPage();
                    pdf.setFontSize(16);
                    pdf.setTextColor(1, 169, 130);
                    pdf.text('Matriz de Priorizaci\u00f3n de Soluciones', 10, 15);
                    pdf.addImage(eisImgData, 'PNG', 10, 22, eisImgWidth, eisImgHeight);
                } catch (eisErr) {
                    console.warn('Could not capture Eisenhower matrix for PDF:', eisErr);
                }
            }

            pdf.save('HPE_Transformation_Plan.pdf');

        } catch (e: any) {
            console.error("PDF Export Error:", e);
            alert(`Error exportando PDF: ${e.message || e}`);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-8 bg-white" ref={dashboardRef}>
            {/* Header */}
            <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#01A982] flex items-center">
                        <FileText className="w-8 h-8 mr-2" />
                        Plan de Transformación Digital
                    </h1>
                    <p className="text-gray-500 mt-1">Análisis de Brechas y Hoja de Ruta Tecnológica</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Puntaje de Madurez</p>
                    <div className="text-5xl font-black text-gray-900">{overallScore}/100</div>
                </div>
            </div>

            {/* Executive Summary & Radar */}
            <div className="grid lg:grid-cols-2 gap-12 mb-12">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col justify-center">
                    <div className="h-[450px] w-full">
                        <Radar data={chartData} options={chartOptions as any} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" /> Resumen Ejecutivo
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            {(() => {
                                const criticalAreas = categories
                                    .map(c => ({ label: c.label, score: (scores[c.id] / maxScores[c.id]) * 100 }))
                                    .filter(c => c.score < 60)
                                    .sort((a, b) => a.score - b.score)
                                    .map(c => c.label);

                                if (overallScore < 50) {
                                    return `La evaluación revela un estado de madurez inicial. Se han detectado brechas críticas, especialmente en ${criticalAreas.slice(0, 2).join(' y ')}, que representan riesgos operativos significativos. Se recomienda una estrategia de modernización prioritaria para mitigar deuda técnica y habilitar agilidad empresarial.`;
                                } else if (overallScore < 75) {
                                    return `El entorno presenta una madurez media con oportunidades claras de optimización. Si bien hay bases sólidas, la persistencia de desafíos en ${criticalAreas.length ? criticalAreas[0] : 'ciertas áreas operativas'} sugiere la necesidad de adoptar tecnologías de automatización y gestión unificada para escalar eficientemente.`;
                                } else {
                                    return `Nivel de madurez avanzado, posicionado para la innovación. La infraestructura es robusta; el siguiente paso es enfocar esfuerzos en FinOps y optimización continua de cargas de trabajo para maximizar el retorno de inversión en la nube híbrida.`;
                                }
                            })()}
                        </p>
                    </div>

                    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200 no-print" data-html2canvas-ignore>
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Horizonte de Planificación:</span>
                        </div>
                        <select
                            value={horizon}
                            onChange={(e) => setHorizon(e.target.value as any)}
                            className="bg-gray-50 border-gray-300 rounded-md text-sm focus:ring-[#01A982] focus:border-[#01A982]"
                        >
                            <option value="12">Corto Plazo (12 Meses)</option>
                            <option value="24">Mediano Plazo (24 Meses)</option>
                            <option value="36">Largo Plazo (36 Meses)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Transformation Matrix */}
            <div className="mb-12" data-html2canvas-ignore="true">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <AlertTriangle className="w-6 h-6 mr-2 text-amber-500" />
                    Matriz de Brechas y Soluciones
                </h2>

                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-10">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensión</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hallazgo / Brecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Futuro Deseado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#01A982] uppercase tracking-wider font-bold">Solución HPE</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {detailedResults.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-4 text-center text-xs font-bold text-gray-400">{solutionNumberMap[item.solution] || ''}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.category}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="font-semibold text-red-600 mb-1">Actual: {item.answer}</div>
                                        <div className="italic text-gray-500">{item.gap}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{item.futureState}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-[#01A982]">{item.solution}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Eisenhower Priority Matrix */}
            <div ref={eisenhowerContainerRef} data-html2canvas-ignore="true">
                <EisenhowerMatrix ref={eisenhowerRef} detailedResults={detailedResults} />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 mt-8 pt-8 border-t border-gray-200 no-print" data-html2canvas-ignore>
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                    <Home className="w-5 h-5 mr-2" />
                    Menú Principal
                </button>
                <button
                    onClick={onReset}
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Reiniciar Evaluación
                </button>
                <button
                    onClick={handleExportPDF}
                    className="flex items-center px-6 py-3 bg-[#01A982] text-white rounded-lg hover:bg-[#008f6d] font-bold shadow-lg transition-transform hover:-translate-y-0.5"
                >
                    <Download className="w-5 h-5 mr-2" />
                    Descargar Informe Ejecutivo (PDF)
                </button>
            </div>
        </div>
    );
}
