'use client';

import { useState } from 'react';
import FinancialInputForm from '@/components/forms/FinancialInputForm';
import FinancialResultsDashboard from '@/components/charts/FinancialResultsDashboard';
import { calculateTCO, FinancialInput, FinancialResult, ROIMetrics } from '@/lib/financial-calculations';
import { saveFinancialResults } from '@/lib/storage';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FinancialPage() {
    const [results, setResults] = useState<{ yearlyData: FinancialResult[]; metrics: ROIMetrics } | null>(null);

    const handleCalculate = (data: FinancialInput) => {
        const calculatedResults = calculateTCO(data);
        setResults(calculatedResults);
        saveFinancialResults(calculatedResults);
        // Scroll to results
        setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link href="/" className="inline-flex items-center text-gray-500 hover:text-[#01A982] mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Inicio
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Análisis Financiero de TCO y ROI
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Compare los costos de una infraestructura tradicional vs. Nube Pública vs. soluciones <span className="text-[#01A982] font-bold">HPE</span> (GreenLake, Morpheus, VM Essentials, Zerto, OpsRamp).
                        Identifique ahorros potenciales y retorno de inversión.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Input Section */}
                    <div className="lg:col-span-4">
                        <FinancialInputForm onCalculate={handleCalculate} />
                    </div>

                    {/* Results Section */}
                    <div id="results-section" className="lg:col-span-8">
                        {results ? (
                            <FinancialResultsDashboard
                                yearlyData={results.yearlyData}
                                metrics={results.metrics}
                            />
                        ) : (
                            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                    <span className="text-2xl font-bold">$</span>
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">Esperando Datos</h3>
                                <p className="text-gray-500">
                                    Complete el formulario a la izquierda y presione "Calcular" para ver la proyección financiera.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
