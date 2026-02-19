'use client';

import { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { FinancialResult, ROIMetrics } from '@/lib/financial-calculations';
import { saveChartImage } from '@/lib/storage';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, TrendingUp, DollarSign, Wallet, FileText, CheckCircle } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface FinancialResultsDashboardProps {
    yearlyData: FinancialResult[];
    metrics: ROIMetrics;
}

export default function FinancialResultsDashboard({ yearlyData, metrics }: FinancialResultsDashboardProps) {
    const dashboardRef = useRef<HTMLDivElement>(null);
    const lineChartRef = useRef<any>(null);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    // Auto-capture line chart image for DOCX proposal
    useEffect(() => {
        const captureTimer = setTimeout(() => {
            if (lineChartRef.current) {
                try {
                    const base64 = lineChartRef.current.toBase64Image('image/png', 1);
                    if (base64 && base64.length > 100) {
                        saveChartImage('financial_line', base64);
                    }
                } catch (e) {
                    console.warn('Could not capture financial chart:', e);
                }
            }
        }, 2000);
        return () => clearTimeout(captureTimer);
    }, [yearlyData]);

    const handleExportPDF = async () => {
        if (!dashboardRef.current) return;

        try {
            console.log("Starting Financial PDF export (Hybrid Mode)...");

            // 1. Create Clone for Image Capture (Top Section)
            const original = dashboardRef.current;
            const clone = original.cloneNode(true) as HTMLElement;

            // Container for capture
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '-10000px';
            container.style.left = '-10000px';
            // 1100px gives good resolution but isn't as massive as 1200/1600
            container.style.width = '1100px';
            container.style.backgroundColor = '#ffffff';
            document.body.appendChild(container);

            // Remove buttons and table from clone
            const buttons = clone.querySelectorAll('button');
            buttons.forEach(btn => btn.remove());
            const webTable = clone.querySelector('#financial-detail-table');
            if (webTable) webTable.remove();

            // CLONE STYLING:
            // 1. Standard padding (reduced from p-8 but not zero)
            clone.classList.remove('p-8');
            clone.classList.add('p-6'); // Balanced padding

            // 2. Chart adjustments
            const chartKinds = clone.querySelectorAll('canvas');
            chartKinds.forEach(canvas => {
                const parent = canvas.parentElement?.parentElement;
                if (parent) {
                    // Ensure chart takes good width but respects container padding
                    parent.style.width = '100%';
                    parent.classList.remove('p-4', 'border', 'shadow-lg', 'mb-8'); // Remove existing styles
                    parent.classList.add('mb-4'); // Keep some bottom margin
                }
            });

            container.appendChild(clone);

            // Fix Canvas Copy & SCALE CHART
            const originalCanvases = original.querySelectorAll('canvas');
            const cloneCanvases = clone.querySelectorAll('canvas');
            originalCanvases.forEach((orig, i) => {
                const dest = cloneCanvases[i];
                // Copy original logical size
                dest.width = orig.width;
                dest.height = orig.height;

                // Force display style to be 100% width to fill the container
                dest.style.width = '100%';
                // Reduced height for 20% smaller look (was 500px)
                dest.style.height = '400px';

                const ctx = dest.getContext('2d');
                if (ctx) ctx.drawImage(orig, 0, 0);
            });

            // Sanitize Colors (Lab/Oklch removal)
            const sanitizeNode = (node: Element) => {
                if (!(node instanceof HTMLElement) && !(node instanceof SVGElement)) return;
                const style = window.getComputedStyle(node);
                const colorProps = ['color', 'background-color', 'border-color', 'fill', 'stroke'];
                colorProps.forEach(prop => {
                    const val = style.getPropertyValue(prop);
                    if (val && (val.includes('lab(') || val.includes('oklch('))) {
                        if (prop.includes('background')) (node as HTMLElement).style.setProperty(prop, '#ffffff', 'important');
                        else if (prop.includes('border')) (node as HTMLElement).style.setProperty(prop, '#e5e7eb', 'important');
                        else (node as HTMLElement).style.setProperty(prop, '#000000', 'important');
                    }
                });
                Array.from(node.children).forEach(sanitizeNode);
            };
            sanitizeNode(clone);

            // Wait for render
            await new Promise(resolve => setTimeout(resolve, 300));

            // Generate Image
            const canvas = await html2canvas(clone, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1100
            });
            document.body.removeChild(container);

            const imgData = canvas.toDataURL('image/png');

            // Create PDF (Portrait)
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // CENTER IMAGE WITH MARGINS
            const margin = 10; // 10mm margin each side
            const imgTargetWidth = pdfWidth - (margin * 2); // 190mm
            const imgTargetHeight = (canvas.height * imgTargetWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', margin, 10, imgTargetWidth, imgTargetHeight);

            // Dynamic Headers
            const headers = ['Periodo', 'Tradicional', 'Nube Pública', 'HPE GreenLake'];
            const selected = metrics.selectedSolutions || [];

            if (selected.includes('morpheus') || selected.includes('vmEssentials')) headers.push('Morpheus+VME');
            if (selected.includes('zerto')) headers.push('Zerto');
            if (selected.includes('opsRamp')) headers.push('OpsRamp');

            // Dynamic Body
            const tableBody = yearlyData.map(d => {
                const row = [
                    `Año ${d.year}`,
                    formatCurrency(d.traditionalCumulative),
                    formatCurrency(d.cloudCumulative),
                    formatCurrency(d.greenlakeCumulative),
                ];
                if (selected.includes('morpheus') || selected.includes('vmEssentials')) row.push(formatCurrency(d.morpheusIntegratedCumulative));
                if (selected.includes('zerto')) row.push(formatCurrency(d.zertoCumulative));
                if (selected.includes('opsRamp')) row.push(formatCurrency(d.opsRampCumulative));
                return row;
            });

            // Dynamic Footer (Total)
            const totalRow = [
                'TOTAL (5 Años)',
                formatCurrency(yearlyData[4].traditionalCumulative),
                formatCurrency(yearlyData[4].cloudCumulative),
                formatCurrency(yearlyData[4].greenlakeCumulative),
            ];
            if (selected.includes('morpheus') || selected.includes('vmEssentials')) totalRow.push(formatCurrency(yearlyData[4].morpheusIntegratedCumulative));
            if (selected.includes('zerto')) totalRow.push(formatCurrency(yearlyData[4].zertoCumulative));
            if (selected.includes('opsRamp')) totalRow.push(formatCurrency(yearlyData[4].opsRampCumulative));

            autoTable(pdf, {
                startY: imgTargetHeight + 20,
                head: [headers],
                body: tableBody,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [1, 169, 130], textColor: 255, fontStyle: 'bold' },
                foot: [totalRow],
                footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
            });

            pdf.save(`HPE_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err: any) {
            console.error("Failed to export PDF", err);
            alert(`Error al generar PDF: ${err.message || err}`);
        }
    };

    const selected = metrics.selectedSolutions || [];

    // Base datasets (Always shown)
    const baseDatasets = [
        {
            label: 'Tradicional (CapEx)',
            data: yearlyData.map(d => d.traditionalCumulative),
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.3,
            fill: true,
        },
        {
            label: 'Nube Pública (OpEx)',
            data: yearlyData.map(d => d.cloudCumulative),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: false,
        },
        {
            label: 'HPE GreenLake',
            data: yearlyData.map(d => d.greenlakeCumulative),
            borderColor: '#01A982', // HPE Green
            backgroundColor: 'rgba(1, 169, 130, 0.2)',
            tension: 0.3,
            fill: true,
        },
    ];

    // Conditional datasets
    if (selected.includes('morpheus') || selected.includes('vmEssentials')) {
        baseDatasets.push({
            label: 'Morpheus + VM Ess',
            data: yearlyData.map(d => d.morpheusIntegratedCumulative),
            borderColor: '#8B5CF6', // Purple
            // @ts-ignore
            borderDash: [5, 5],
            tension: 0.3,
            fill: false,
            backgroundColor: 'transparent',
        });
    }

    if (selected.includes('zerto')) {
        baseDatasets.push({
            label: 'Zerto (DR)',
            data: yearlyData.map(d => d.zertoCumulative),
            borderColor: '#F59E0B', // Orange
            // @ts-ignore
            borderDash: [5, 5],
            tension: 0.3,
            fill: false,
            backgroundColor: 'transparent',
        });
    }

    if (selected.includes('opsRamp')) {
        baseDatasets.push({
            label: 'OpsRamp',
            data: yearlyData.map(d => d.opsRampCumulative),
            borderColor: '#10B981', // Emerald
            // @ts-ignore
            borderDash: [2, 2],
            tension: 0.3,
            fill: false,
            backgroundColor: 'transparent',
        });
    }

    const chartData = {
        labels: yearlyData.map(d => `Año ${d.year}`),
        datasets: baseDatasets,
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: (value: any) => `$${value / 1000}k`
                }
            }
        }
    };

    // Executive Summary Logic
    const getSummary = () => {
        const roi = metrics.roi || 0;
        if (roi > 20) {
            return "El análisis proyecta un escenario financiero altamente positivo. La adopción del modelo HPE GreenLake reduce drásticamente el CapEx inicial, mejora el flujo de caja operativo y muestra un retorno de inversión superior al promedio del mercado.";
        } else if (roi > 0) {
            return "Se identifica una oportunidad de ahorro moderada. El modelo híbrido ofrece ventajas de agilidad y eliminación de sobreaprovisionamiento, aunque los beneficios financieros se consolidan a mediano plazo.";
        }
        return "El modelo requiere un análisis más profundo de costos indirectos para justificar la migración puramente financiera.";
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8" ref={dashboardRef}>

            {/* Header */}
            <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#01A982] flex items-center">
                        <TrendingUp className="w-8 h-8 mr-2" />
                        Análisis Financiero Ejecutivo
                    </h1>
                    <p className="text-gray-500 mt-1">Comparativa TCO y Proyección de Retorno de Inversión (ROI)</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Ahorro Total</p>
                    <div className="text-4xl font-black text-[#01A982]">{formatCurrency(metrics.totalSavings)}</div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* ROI Card */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-blue-900 font-bold uppercase text-sm">ROI Estimado</h3>
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-4xl font-extrabold text-blue-700">{(metrics.roi || 0).toFixed(1)}%</p>
                        <p className="text-blue-600 text-sm mt-1">Retorno sobre inversión</p>
                    </div>
                </div>

                {/* NPV Card */}
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-purple-900 font-bold uppercase text-sm">Valor Presente (NPV)</h3>
                            <Wallet className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-extrabold text-purple-700">{formatCurrency(metrics.npv)}</p>
                        <p className="text-purple-600 text-sm mt-1">A valor de dinero hoy</p>
                    </div>
                </div>

                {/* Payback Card (Custom or existing metric, using generic savings per month if needed or just Total Cost) */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-900 font-bold uppercase text-sm">Costo Total (5 Años)</h3>
                            <DollarSign className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="space-y-1 mt-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tradicional:</span>
                                <span className="font-semibold text-gray-700">{formatCurrency(yearlyData[4].traditionalCumulative)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">GreenLake:</span>
                                <span className="font-bold text-[#01A982]">{formatCurrency(yearlyData[4].greenlakeCumulative)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-green-50 rounded-xl p-6 mb-8 border border-green-100">
                <h3 className="text-[#01A982] font-bold mb-2 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Resumen del Analista
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                    {getSummary()}
                </p>
            </div>

            {/* Chart */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 mb-8">
                <h3 className="text-gray-900 font-bold mb-4 ml-2">Proyección de Flujo de Efectivo Acumulado</h3>
                <div className="h-[450px] w-full"> {/* Increased height for better visibility */}
                    <Line ref={lineChartRef} options={options} data={chartData} />
                </div>
            </div>

            {/* Detail Table (Visible in Web UI) */}
            <div id="financial-detail-table" className="mb-8 overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#01A982]">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Periodo</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Tradicional</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Cloud</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">GreenLake</th>

                            {(selected.includes('morpheus') || selected.includes('vmEssentials')) && (
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Morpheus+VME</th>
                            )}
                            {selected.includes('zerto') && (
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Zerto</th>
                            )}
                            {selected.includes('opsRamp') && (
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">OpsRamp</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {yearlyData.map((d, idx) => (
                            <tr key={d.year} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Año {d.year}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(d.traditionalCumulative)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(d.cloudCumulative)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#01A982]">{formatCurrency(d.greenlakeCumulative)}</td>

                                {(selected.includes('morpheus') || selected.includes('vmEssentials')) && (
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(d.morpheusIntegratedCumulative)}</td>
                                )}
                                {selected.includes('zerto') && (
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(d.zertoCumulative)}</td>
                                )}
                                {selected.includes('opsRamp') && (
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(d.opsRampCumulative)}</td>
                                )}
                            </tr>
                        ))}
                        {/* Total Row */}
                        <tr className="bg-gray-100 border-t-2 border-gray-300">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">TOTAL</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(yearlyData[4].traditionalCumulative)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(yearlyData[4].cloudCumulative)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-[#01A982]">{formatCurrency(yearlyData[4].greenlakeCumulative)}</td>

                            {(selected.includes('morpheus') || selected.includes('vmEssentials')) && (
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(yearlyData[4].morpheusIntegratedCumulative)}</td>
                            )}
                            {selected.includes('zerto') && (
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(yearlyData[4].zertoCumulative)}</td>
                            )}
                            {selected.includes('opsRamp') && (
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(yearlyData[4].opsRampCumulative)}</td>
                            )}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Export Button */}
            <div className="flex justify-end no-print" data-html2canvas-ignore>
                <button
                    onClick={handleExportPDF}
                    className="flex items-center px-6 py-3 bg-[#01A982] text-white rounded-lg hover:bg-[#008f6d] font-bold shadow-lg transition-transform hover:-translate-y-0.5"
                >
                    <Download className="w-5 h-5 mr-2" />
                    Descargar Informe Financiero (PDF)
                </button>
            </div>
        </div>
    );
}
