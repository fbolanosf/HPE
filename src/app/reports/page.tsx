'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { generateProposalDocument } from '@/lib/docx-generator';
import { getAssessmentResults, getFinancialResults } from '@/lib/storage';

export default function ReportsPage() {
    const [hasAssessment, setHasAssessment] = useState(false);
    const [hasFinancial, setHasFinancial] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        // Check for available data on mount
        setHasAssessment(!!getAssessmentResults());
        setHasFinancial(!!getFinancialResults());
    }, []);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await generateProposalDocument();
        } catch (error) {
            console.error("Error generating document:", error);
            alert("Hubo un error al generar el reporte. Por favor intente nuevamente.");
        } finally {
            setIsGenerating(false);
        }
    };

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
                        Exporte un informe ejecutivo completo en formato Word editable (.docx) incluyendo todos los análisis realizados.
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Estado de la Información</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    {hasAssessment ? (
                                        <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-yellow-500 mr-3" />
                                    )}
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Evaluación de Necesidades (GAP)</h4>
                                        <p className="text-sm text-gray-500">
                                            {hasAssessment ? 'Datos completados y listos.' : 'No se han detectado resultados recientes.'}
                                        </p>
                                    </div>
                                </div>
                                {!hasAssessment && (
                                    <Link href="/assessment" className="text-sm text-[#01A982] font-medium hover:underline">
                                        Ir a Evaluación
                                    </Link>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    {hasFinancial ? (
                                        <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-yellow-500 mr-3" />
                                    )}
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Análisis Financiero (TCO/ROI)</h4>
                                        <p className="text-sm text-gray-500">
                                            {hasFinancial ? 'Proyección financiera calculada.' : 'No se han detectado cálculos recientes.'}
                                        </p>
                                    </div>
                                </div>
                                {!hasFinancial && (
                                    <Link href="/financial" className="text-sm text-[#01A982] font-medium hover:underline">
                                        Ir a Financiero
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8 flex flex-col items-center">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || (!hasAssessment && !hasFinancial)}
                                className={`
                            flex items-center justify-center px-8 py-4 rounded-xl text-lg font-bold text-white transition-all shadow-md
                            ${isGenerating || (!hasAssessment && !hasFinancial)
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-[#01A982] hover:bg-[#008f6d] hover:shadow-lg transform hover:-translate-y-1'}
                        `}
                            >
                                <Download className="w-6 h-6 mr-3" />
                                {isGenerating ? 'Generando Documento...' : 'Descargar Propuesta .DOCX'}
                            </button>
                            {(!hasAssessment && !hasFinancial) && (
                                <p className="text-red-500 text-sm mt-3">
                                    Debe completar al menos un módulo para generar el reporte.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                        <p className="text-xs text-center text-gray-500">
                            El documento generado es editable. Puede agregar logos del cliente y ajustar textos antes de la presentación final.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
