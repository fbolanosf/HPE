'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Bubble } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Grid3X3 } from 'lucide-react';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

// Distinct color palette for up to 20 solutions
const DISTINCT_COLORS = [
    '#01A982', '#0D5265', '#E4002B', '#FF8300', '#7630EA',
    '#00739D', '#F5A623', '#32DAC8', '#C50084', '#425563',
    '#2563EB', '#059669', '#DC2626', '#7C3AED', '#D97706',
    '#0891B2', '#4F46E5', '#CA8A04', '#DB2777', '#0D9488',
];

// Solution metadata for positioning on the matrix
const SOLUTION_METADATA: Record<string, {
    businessImpact: number;
    complexity: number;
    roi: number;
    maturity: number;
}> = {
    'HPE Alletra dHCI': { businessImpact: 85, complexity: 40, roi: 80, maturity: 85 },
    'HPE Alletra MP': { businessImpact: 80, complexity: 35, roi: 75, maturity: 90 },
    'HPE Alletra 9000': { businessImpact: 90, complexity: 55, roi: 85, maturity: 90 },
    'HPE SimpliVity': { businessImpact: 75, complexity: 30, roi: 70, maturity: 85 },
    'HPE Synergy': { businessImpact: 70, complexity: 60, roi: 65, maturity: 80 },
    'HPE Morpheus': { businessImpact: 85, complexity: 45, roi: 80, maturity: 75 },
    'HPE VM Essentials': { businessImpact: 80, complexity: 25, roi: 85, maturity: 70 },
    'HPE Zerto': { businessImpact: 90, complexity: 35, roi: 90, maturity: 90 },
    'HPE OpsRamp': { businessImpact: 75, complexity: 30, roi: 75, maturity: 80 },
    'HPE InfoSight': { businessImpact: 70, complexity: 15, roi: 80, maturity: 95 },
    'HPE GreenLake': { businessImpact: 95, complexity: 50, roi: 90, maturity: 85 },
    'HPE GreenLake Hybrid Cloud': { businessImpact: 88, complexity: 48, roi: 82, maturity: 80 },
    'HPE GreenLake for Backup (SaaS)': { businessImpact: 78, complexity: 25, roi: 78, maturity: 82 },
    'HPE GreenLake Platform ID': { businessImpact: 72, complexity: 20, roi: 68, maturity: 78 },
    'HPE Aruba ClearPass': { businessImpact: 80, complexity: 45, roi: 70, maturity: 85 },
    'HPE Data Protection': { businessImpact: 85, complexity: 30, roi: 75, maturity: 85 },
    'HPE StoreOnce': { businessImpact: 80, complexity: 30, roi: 80, maturity: 90 },
    'HPE StoreOnce Catalyst': { businessImpact: 76, complexity: 28, roi: 76, maturity: 88 },
    'HPE OneView': { businessImpact: 78, complexity: 35, roi: 72, maturity: 88 },
    'HPE iLO Amplifier': { businessImpact: 65, complexity: 20, roi: 65, maturity: 85 },
    'HPE Edgeline': { businessImpact: 70, complexity: 40, roi: 68, maturity: 75 },
    'HPE Ezmeral Data Fabric': { businessImpact: 82, complexity: 55, roi: 74, maturity: 72 },
    'HPE DSCC (Data Ops)': { businessImpact: 82, complexity: 30, roi: 78, maturity: 78 },
    'HPE Solutions for Scality': { businessImpact: 75, complexity: 40, roi: 70, maturity: 75 },
    'HPE Financial Services': { businessImpact: 70, complexity: 10, roi: 75, maturity: 95 },
    'GreenLake': { businessImpact: 95, complexity: 50, roi: 90, maturity: 85 },
};

type XAxisMode = 'complexity' | 'roi' | 'maturity';

interface EisenhowerMatrixProps {
    detailedResults: {
        category: string;
        question: string;
        answer: string;
        gap: string;
        futureState: string;
        solution: string;
    }[];
}

export interface EisenhowerMatrixRef {
    getCanvasElement: () => HTMLCanvasElement | null;
}

const EisenhowerMatrix = forwardRef<EisenhowerMatrixRef, EisenhowerMatrixProps>(
    ({ detailedResults }, ref) => {
        const [xAxisMode, setXAxisMode] = useState<XAxisMode>('complexity');
        const chartRef = useRef<any>(null);

        useImperativeHandle(ref, () => ({
            getCanvasElement: () => {
                return chartRef.current?.canvas || null;
            }
        }));

        // Aggregate unique solutions and their frequency (bubble size)
        const solutionCounts: Record<string, number> = {};
        detailedResults.forEach(r => {
            solutionCounts[r.solution] = (solutionCounts[r.solution] || 0) + 1;
        });

        const uniqueSolutions = Object.keys(solutionCounts);

        // Build solution-to-breaches mapping for cross-reference
        const solutionBreaches: Record<string, { category: string; gap: string }[]> = {};
        detailedResults.forEach(r => {
            if (!solutionBreaches[r.solution]) solutionBreaches[r.solution] = [];
            solutionBreaches[r.solution].push({ category: r.category, gap: r.gap });
        });

        // Dimension color mapping for badges
        const dimensionColors: Record<string, string> = {
            'Eficiencia Infraestructura': '#DC2626',
            'Agilidad Operativa': '#F59E0B',
            'Estrategia Nube': '#3B82F6',
            'Resiliencia Datos': '#8B5CF6',
            'Ciberseguridad': '#EF4444',
            'Eficiencia Financiera': '#10B981',
        };

        const getDimensionColor = (cat: string): string => {
            return dimensionColors[cat] || '#6B7280';
        };

        const xAxisLabels: Record<XAxisMode, string> = {
            complexity: 'Dificultad de Implementación →',
            roi: 'Retorno de Inversión (ROI) →',
            maturity: 'Madurez Tecnológica →',
        };

        const xAxisButtonLabels: Record<XAxisMode, string> = {
            complexity: 'Dificultad',
            roi: 'ROI',
            maturity: 'Madurez',
        };

        // Build data points with numbered indices
        const dataPoints = uniqueSolutions.map((sol, index) => {
            const meta = SOLUTION_METADATA[sol];
            const count = solutionCounts[sol];
            const color = DISTINCT_COLORS[index % DISTINCT_COLORS.length];

            if (!meta) {
                return {
                    x: 50 + Math.random() * 30,
                    y: 50 + Math.random() * 30,
                    r: 12 + count * 5,
                    number: index + 1,
                    label: sol,
                    color,
                    count,
                };
            }

            let xVal: number;
            switch (xAxisMode) {
                case 'complexity':
                    xVal = 100 - meta.complexity;
                    break;
                case 'roi':
                    xVal = meta.roi;
                    break;
                case 'maturity':
                    xVal = meta.maturity;
                    break;
            }

            return {
                x: xVal,
                y: meta.businessImpact,
                r: 12 + count * 5,
                number: index + 1,
                label: sol,
                color,
                count,
            };
        });

        const chartData = {
            datasets: dataPoints.map(pt => ({
                label: String(pt.number),
                data: [{ x: pt.x, y: pt.y, r: pt.r }],
                backgroundColor: pt.color + '44',
                borderColor: pt.color,
                borderWidth: 2.5,
                hoverBackgroundColor: pt.color + '88',
                hoverBorderWidth: 3,
            })),
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: 30, right: 20, bottom: 10, left: 10 }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: xAxisLabels[xAxisMode],
                        font: { size: 13, weight: 'bold' as const },
                        color: '#374151',
                    },
                    grid: {
                        color: (ctx: any) => ctx.tick.value === 50 ? '#9CA3AF' : '#F3F4F6',
                        lineWidth: (ctx: any) => ctx.tick.value === 50 ? 2 : 1,
                    },
                    ticks: {
                        callback: (val: any) => val === 0 ? 'Bajo' : val === 50 ? '' : val === 100 ? 'Alto' : '',
                        font: { size: 11 },
                        color: '#9CA3AF',
                    },
                },
                y: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: '↑ Impacto de Negocio',
                        font: { size: 13, weight: 'bold' as const },
                        color: '#374151',
                    },
                    grid: {
                        color: (ctx: any) => ctx.tick.value === 50 ? '#9CA3AF' : '#F3F4F6',
                        lineWidth: (ctx: any) => ctx.tick.value === 50 ? 2 : 1,
                    },
                    ticks: {
                        callback: (val: any) => val === 0 ? 'Bajo' : val === 50 ? '' : val === 100 ? 'Alto' : '',
                        font: { size: 11 },
                        color: '#9CA3AF',
                    },
                },
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleFont: { size: 14, weight: 'bold' as const },
                    bodyFont: { size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        title: (items: any[]) => {
                            const idx = items[0]?.datasetIndex;
                            return idx !== undefined ? dataPoints[idx]?.label : '';
                        },
                        label: (item: any) => {
                            const idx = item.datasetIndex;
                            const pt = dataPoints[idx];
                            const breaches = solutionBreaches[uniqueSolutions[idx]] || [];
                            const dims = [...new Set(breaches.map(b => b.category))].join(', ');
                            return [
                                `Impacto de Negocio: ${item.parsed.y}%`,
                                `${xAxisLabels[xAxisMode].replace(' →', '')}: ${item.parsed.x}%`,
                                `Brechas: ${pt?.count || 1}`,
                                `Dimensiones: ${dims}`,
                            ];
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: '#111827',
                    font: { size: 11, weight: 'bold' as const },
                    anchor: 'center' as const,
                    align: 'center' as const,
                    formatter: (_: any, ctx: any) => {
                        return dataPoints[ctx.datasetIndex]?.number || '';
                    },
                }
            },
        };

        // Quadrant labels (no emoticons)
        const quadrantLabels = [
            { text: 'QUICK WINS', top: '14px', right: 'auto', bottom: 'auto', left: '20px', color: '#059669' },
            { text: 'PROYECTOS ESTRATÉGICOS', top: '14px', right: '20px', bottom: 'auto', left: 'auto', color: '#01A982' },
            { text: 'EVALUAR / DIFERIR', top: 'auto', right: 'auto', bottom: '14px', left: '20px', color: '#9CA3AF' },
            { text: 'MEJORA CONTINUA', top: 'auto', right: '20px', bottom: '14px', left: 'auto', color: '#6366F1' },
        ];

        if (uniqueSolutions.length === 0) return null;

        return (
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <Grid3X3 className="w-6 h-6 mr-2 text-[#01A982]" />
                    Matriz de Priorización de Soluciones
                </h2>
                <p className="text-sm text-gray-500 mb-1">
                    Posicionamiento de cada solución HPE identificada según su impacto de negocio y el eje seleccionado.
                </p>
                <p className="text-xs text-gray-400 mb-4 italic">
                    El tamaño del círculo es proporcional al número de brechas que la solución aborda.
                </p>

                {/* X-Axis Selector */}
                <div className="flex items-center space-x-2 mb-4 no-print" data-html2canvas-ignore>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Eje X:</span>
                    {(Object.keys(xAxisButtonLabels) as XAxisMode[]).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setXAxisMode(mode)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${xAxisMode === mode
                                ? 'bg-[#01A982] text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {xAxisButtonLabels[mode]}
                        </button>
                    ))}
                </div>

                {/* Chart Container */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 relative">
                    {/* Quadrant Background Colors */}
                    <div className="absolute inset-4 pointer-events-none" style={{ zIndex: 0 }}>
                        <div className="grid grid-cols-2 grid-rows-2 w-full h-full rounded-lg overflow-hidden">
                            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}></div>
                            <div style={{ backgroundColor: 'rgba(1, 169, 130, 0.07)' }}></div>
                            <div style={{ backgroundColor: 'rgba(156, 163, 175, 0.05)' }}></div>
                            <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}></div>
                        </div>
                    </div>

                    {/* Quadrant Labels */}
                    {quadrantLabels.map((q, i) => (
                        <div
                            key={i}
                            className="absolute text-[10px] font-bold uppercase tracking-wider pointer-events-none"
                            style={{
                                top: q.top,
                                right: q.right,
                                bottom: q.bottom,
                                left: q.left,
                                color: q.color,
                                zIndex: 1,
                                padding: '4px 8px',
                                opacity: 0.8,
                            }}
                        >
                            {q.text}
                        </div>
                    ))}

                    <div className="relative" style={{ height: '420px', zIndex: 2 }}>
                        <Bubble
                            ref={chartRef}
                            data={chartData}
                            options={chartOptions as any}
                            plugins={[ChartDataLabels as any]}
                        />
                    </div>
                </div>

                {/* Numbered Legend */}
                <div style={{ marginTop: '20px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #F3F4F6', padding: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Referencias</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {dataPoints.map((pt, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10" fill={pt.color + '33'} stroke={pt.color} strokeWidth="2" />
                                    <text x="12" y="12" textAnchor="middle" dominantBaseline="central" fill={pt.color} fontSize="10" fontWeight="700">{pt.number}</text>
                                </svg>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#1F2937' }}>{pt.label}</span>
                                <span style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0 }}>
                                    ({pt.count} {pt.count === 1 ? 'brecha' : 'brechas'})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
);

EisenhowerMatrix.displayName = 'EisenhowerMatrix';
export default EisenhowerMatrix;
