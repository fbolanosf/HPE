'use client';

import { useState, useEffect, Fragment } from 'react';
import { HPE_SOLUTIONS, HPESolution, CompetitorProfile } from '@/lib/comparator-data';
import { Check, X, Trophy, ArrowRight, Zap, Shield, Server, Box, Activity, Cloud } from 'lucide-react';

const SOLUTION_ICONS: Record<string, any> = {
    'morpheus': Box,
    'vm-essentials': Server,
    'simplivity': Zap,
    'zerto': Shield,
    'opsramp': Activity,
    'greenlake': Cloud
};

interface CompetitiveMatrixProps {
    selectedSolutionId: string;
    selectedCompetitorId: string;
    onSolutionChange: (id: string) => void;
    onCompetitorChange: (id: string) => void;
}

export default function CompetitiveMatrix({
    selectedSolutionId,
    selectedCompetitorId,
    onSolutionChange,
    onCompetitorChange
}: CompetitiveMatrixProps) {
    // const [selectedSolutionId, setSelectedSolutionId] = useState<string>('morpheus'); // Lifted to parent
    // const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>(''); // Lifted to parent
    const [showAdvantage, setShowAdvantage] = useState(false);

    const currentSolution = HPE_SOLUTIONS[selectedSolutionId];
    const SolutionIcon = SOLUTION_ICONS[selectedSolutionId] || Box;

    // Auto-select effect removed as it is now in parent

    const currentCompetitor = currentSolution.competitors.find(c => c.id === selectedCompetitorId) || currentSolution.competitors[0];

    if (!currentSolution || !currentCompetitor) return <div>Cargando datos...</div>;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header & Controls */}
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col gap-6">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <span className="p-2 bg-[#01A982]/10 rounded-lg mr-3">
                                <SolutionIcon className="w-6 h-6 text-[#01A982]" />
                            </span>
                            Matriz Competitiva
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 ml-14">
                            Comparando <span className="font-bold text-[#01A982]">{currentSolution.name}</span> vs <span className="font-bold text-gray-700">{currentCompetitor.name}</span>
                        </p>
                    </div>

                    <div className="flex items-center bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setShowAdvantage(!showAdvantage)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showAdvantage ? 'bg-[#01A982]' : 'bg-gray-200'}`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showAdvantage ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                            Modo "HPE Advantage"
                        </span>
                    </div>
                </div>

                {/* Selection Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    {/* Solution Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Solución HPE
                        </label>
                        <select
                            value={selectedSolutionId}
                            onChange={(e) => onSolutionChange(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 py-2.5 pl-3 pr-10 text-base focus:border-[#01A982] focus:outline-none focus:ring-[#01A982] sm:text-sm bg-white border shadow-sm"
                        >
                            {Object.values(HPE_SOLUTIONS).map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-400 truncate">{currentSolution.description}</p>
                    </div>

                    {/* Competitor Selector */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 -ml-6 flex items-center justify-center hidden md:flex text-gray-300">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Competidor vs.
                        </label>
                        <select
                            value={selectedCompetitorId}
                            onChange={(e) => onCompetitorChange(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 py-2.5 pl-3 pr-10 text-base focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm bg-white border shadow-sm"
                        >
                            {currentSolution.competitors.map((c) => (
                                <option key={c.id} value={c.id}>{c.name} - {c.solution}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">
                                Característica / Criterio
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#01A982] uppercase tracking-wider w-1/3 bg-green-50/50 border-x border-green-100">
                                {currentSolution.name}
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-1/3">
                                {currentCompetitor.name} <span className="font-normal text-gray-500">({currentCompetitor.solution})</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {['Negocio', 'Funcional', 'Financiero', 'Técnico', 'Precios'].map((category) => {
                            const categoryItems = currentCompetitor.comparisons.filter(i => i.category === category);
                            if (categoryItems.length === 0) return null;

                            return (
                                <Fragment key={category}>
                                    {/* Category Header */}
                                    <tr className="bg-gray-100/50">
                                        <td colSpan={3} className="px-6 py-2 text-xs font-black text-gray-500 uppercase tracking-widest border-y border-gray-200">
                                            {category}
                                        </td>
                                    </tr>
                                    {/* Items */}
                                    {categoryItems.map((item, idx) => (
                                        <tr key={`${category}-${idx}`} className={`transition-colors ${showAdvantage && item.hpeIsBetter ? 'bg-green-50/20' : 'hover:bg-gray-50'}`}>
                                            <td className="px-6 py-4 whitespace-normal">
                                                <div className="text-sm font-bold text-gray-900 mb-0.5">{item.feature}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-normal bg-green-50/30 border-x border-green-100">
                                                <div className="flex items-start">
                                                    {showAdvantage ? (
                                                        <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                                                            <Trophy className="w-4 h-4 text-[#01A982]" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#01A982] mt-2 mr-3 flex-shrink-0"></div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm text-gray-900 font-bold">{item.hpe}</div>
                                                        {showAdvantage && item.hpeAdvantage && (
                                                            <div className="mt-2 text-xs text-[#01A982] font-medium bg-white p-2 rounded border border-green-100 shadow-sm">
                                                                <span className="font-bold">Por qué gana HPE:</span> {item.hpeAdvantage}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-normal">
                                                <div className="flex items-start">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 mr-3 flex-shrink-0"></div>
                                                    <div className="text-sm text-gray-600">{item.competitor}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-200 text-center text-xs text-gray-400">
                La información comparativa se basa en datos públicos y análisis técnicos internos.
            </div>
        </div>
    );
}
