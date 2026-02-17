'use client';

import CompetitiveMatrix from '@/components/charts/CompetitiveMatrix';
import TopologyDiagram from '@/components/charts/TopologyDiagram';
import Link from 'next/link';
import { ArrowLeft, Server, Network } from 'lucide-react';
import { useState, useEffect } from 'react';
import { HPE_SOLUTIONS } from '@/lib/comparator-data';

export default function ComparatorPage() {
    const [activeTab, setActiveTab] = useState<'matrix' | 'topology'>('matrix');
    const [selectedSolutionId, setSelectedSolutionId] = useState<string>('morpheus');
    const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>('');

    const currentSolution = HPE_SOLUTIONS[selectedSolutionId];

    // Auto-select first competitor when solution changes
    useEffect(() => {
        if (currentSolution && currentSolution.competitors.length > 0) {
            setSelectedCompetitorId(currentSolution.competitors[0].id);
        }
    }, [selectedSolutionId, currentSolution]);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link href="/" className="inline-flex items-center text-gray-500 hover:text-[#01A982] mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Inicio
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Comparador de Soluciones
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Analice cómo las soluciones de <span className="text-[#01A982] font-bold">HPE</span> superan a la competencia en eficiencia, gestión y resiliencia.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-100 inline-flex">
                        <button
                            onClick={() => setActiveTab('matrix')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center
                ${activeTab === 'matrix'
                                    ? 'bg-[#01A982] text-white shadow'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            <Server className="w-4 h-4 mr-2" />
                            Matriz Competitiva
                        </button>
                        <button
                            onClick={() => setActiveTab('topology')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center
                ${activeTab === 'topology'
                                    ? 'bg-[#01A982] text-white shadow'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            <Network className="w-4 h-4 mr-2" />
                            Diagrama Topológico
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="transition-all duration-300 ease-in-out">
                    {activeTab === 'matrix' ? (
                        <CompetitiveMatrix
                            selectedSolutionId={selectedSolutionId}
                            selectedCompetitorId={selectedCompetitorId}
                            onSolutionChange={setSelectedSolutionId}
                            onCompetitorChange={setSelectedCompetitorId}
                        />
                    ) : (
                        <TopologyDiagram
                            selectedSolutionId={selectedSolutionId}
                            selectedCompetitorId={selectedCompetitorId}
                        />
                    )}
                </div>

            </div>
        </div>
    );
}
