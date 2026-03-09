'use client';

import { useState } from 'react';
import { FinancialInput } from '@/lib/financial-calculations';
import { Calculator } from 'lucide-react';

interface FinancialInputFormProps {
    onCalculate: (data: any) => void;
}

export default function FinancialInputForm({ onCalculate }: FinancialInputFormProps) {
    const [formData, setFormData] = useState({
        // Traditional
        currentHardwareCost: 50000,
        currentPowerCost: 1200,
        currentDatacenterCost: 800,
        currentAdminCost: 3500,

        // Cloud
        cloudMonthlyCost: 4500,
        cloudMigrationCost: 15000,
        cloudEgressCost: 300,

        // GreenLake
        greenlakeMonthlyCommit: 3800,
        greenlakeBufferUsage: 500,
        greenlakeServicesCost: 1000,

        // New Solutions (Software/OpEx)
        morpheusMonthlyCost: 1200,
        vmEssentialsMonthlyCost: 600,
        zertoMonthlyCost: 800,
        opsRampMonthlyCost: 1500,

        // Selection State (Local UI state mapped to final output)
        selectedSolutions: ['greenlake', 'morpheus', 'vmEssentials', 'zerto', 'opsRamp'],

        // General
        durationYears: 5,
        discountRate: 0.08,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) }));
    };

    const handleSelectionChange = (solution: string, checked: boolean) => {
        setFormData(prev => {
            const current = new Set(prev.selectedSolutions);
            if (checked) current.add(solution);
            else current.delete(solution);
            return { ...prev, selectedSolutions: Array.from(current) };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCalculate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            {/* Decorative Background Element - Scaled down */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#01A982]/5 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

            <div className="relative mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center text-[#01A982] mb-1">
                    <div className="p-2 bg-[#01A982]/10 rounded-lg mr-3">
                        <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 tracking-tight leading-tight">Variables Financieras</h2>
                    </div>
                </div>
                <p className="text-xs text-gray-500 font-medium ml-11">Configure los parámetros para el análisis</p>
            </div>

            <div className="space-y-4">

                {/* Sección Tradicional */}
                <div className="group bg-white rounded-xl border border-gray-200 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
                    <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-red-50 to-transparent rounded-t-xl flex items-center">
                        <div className="w-1 h-4 bg-red-500 rounded-full mr-2 shadow-sm"></div>
                        <h3 className="font-bold text-sm text-gray-800">Infraestructura Tradicional</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <InputGroup label="Hardware (Capex/3 años)" name="currentHardwareCost" value={formData.currentHardwareCost} onChange={handleChange} prefix="$" />
                        <InputGroup label="Energía (Mensual)" name="currentPowerCost" value={formData.currentPowerCost} onChange={handleChange} prefix="$" />
                        <InputGroup label="Datacenter (Mensual)" name="currentDatacenterCost" value={formData.currentDatacenterCost} onChange={handleChange} prefix="$" />
                        <InputGroup label="Admin TI (Mensual)" name="currentAdminCost" value={formData.currentAdminCost} onChange={handleChange} prefix="$" />
                    </div>
                </div>

                {/* Sección Nube Pública */}
                <div className="group bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                    <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-transparent rounded-t-xl flex items-center">
                        <div className="w-1 h-4 bg-blue-500 rounded-full mr-2 shadow-sm"></div>
                        <h3 className="font-bold text-sm text-gray-800">Alternativa Nube Pública</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <InputGroup label="Mensual (Compute+Storage)" name="cloudMonthlyCost" value={formData.cloudMonthlyCost} onChange={handleChange} prefix="$" />
                        <InputGroup label="Egress (Salida Datos)" name="cloudEgressCost" value={formData.cloudEgressCost} onChange={handleChange} prefix="$" />
                        <InputGroup label="Migración (One-time)" name="cloudMigrationCost" value={formData.cloudMigrationCost} onChange={handleChange} prefix="$" />
                    </div>
                </div>



                {/* Sección Soluciones HPE (Premium Selection) */}
                <div className="group bg-white rounded-xl border border-purple-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
                    <div className="p-3 border-b border-purple-100 bg-purple-50 rounded-t-xl flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-1 h-4 bg-purple-500 rounded-full mr-2 shadow-sm"></div>
                            <h3 className="font-bold text-sm text-gray-800">Soluciones HPE (Seleccionar)</h3>
                        </div>
                    </div>
                    <div className="p-3 space-y-2">
                        <SelectableInputGroup
                            label="GreenLake (As-a-Service)"
                            name="greenlakeMonthlyCommit"
                            value={formData.greenlakeMonthlyCommit}
                            onChange={handleChange}
                            checked={formData.selectedSolutions.includes('greenlake')}
                            onCheck={(c) => handleSelectionChange('greenlake', c)}
                        />
                        <SelectableInputGroup
                            label="Morpheus"
                            name="morpheusMonthlyCost"
                            value={formData.morpheusMonthlyCost}
                            onChange={handleChange}
                            checked={formData.selectedSolutions.includes('morpheus')}
                            onCheck={(c) => handleSelectionChange('morpheus', c)}
                        />
                        <SelectableInputGroup
                            label="VM Essentials"
                            name="vmEssentialsMonthlyCost"
                            value={formData.vmEssentialsMonthlyCost}
                            onChange={handleChange}
                            checked={formData.selectedSolutions.includes('vmEssentials')}
                            onCheck={(c) => handleSelectionChange('vmEssentials', c)}
                        />
                        <SelectableInputGroup
                            label="Zerto"
                            name="zertoMonthlyCost"
                            value={formData.zertoMonthlyCost}
                            onChange={handleChange}
                            checked={formData.selectedSolutions.includes('zerto')}
                            onCheck={(c) => handleSelectionChange('zerto', c)}
                        />
                        <SelectableInputGroup
                            label="OpsRamp"
                            name="opsRampMonthlyCost"
                            value={formData.opsRampMonthlyCost}
                            onChange={handleChange}
                            checked={formData.selectedSolutions.includes('opsRamp')}
                            onCheck={(c) => handleSelectionChange('opsRamp', c)}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 mt-4">
                <button
                    type="submit"
                    className="w-full relative group overflow-hidden rounded-xl bg-[#01A982] px-4 py-3 text-white shadow-lg shadow-[#01A982]/30 transition-all hover:bg-[#008f6d] hover:shadow-xl hover:shadow-[#01A982]/40 active:translate-y-0.5"
                >
                    <div className="relative flex items-center justify-center font-bold text-base tracking-wide">
                        <span className="mr-2">CALCULAR</span>
                        <Calculator className="w-4 h-4 transition-transform group-hover:rotate-12" />
                    </div>
                </button>
            </div>
        </form>
    );
}

function InputGroup({ label, name, value, onChange, prefix = "$", highlight = false }: {
    label: string, name: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, prefix?: string, highlight?: boolean
}) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
            <div className="relative rounded-lg shadow-sm transition-all duration-200 group-hover:shadow-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className={`${highlight ? 'text-[#01A982]' : 'text-gray-400'} font-medium sm:text-sm`}>{prefix}</span>
                </div>
                <input
                    type="number"
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`block w-full rounded-lg pl-7 pr-3 py-2.5 sm:text-sm font-semibold transition-colors
                        ${highlight
                            ? 'border-[#01A982] ring-1 ring-[#01A982]/20 focus:ring-[#01A982] focus:border-[#01A982] bg-[#01A982]/5 text-[#01A982]'
                            : 'border-gray-200 focus:border-[#01A982] focus:ring-[#01A982] text-gray-900 bg-gray-50/50 focus:bg-white'
                        } outline-none`}
                    placeholder="0.00"
                />
            </div>
        </div>
    );
}

function SelectableInputGroup({ label, name, value, onChange, checked, onCheck }: {
    label: string,
    name: string,
    value: number,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    checked: boolean,
    onCheck: (checked: boolean) => void
}) {
    return (
        <div
            className={`relative rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden
            ${checked
                    ? 'bg-purple-50/50 border-purple-500 shadow-md shadow-purple-500/10'
                    : 'bg-white border-gray-200 hover:border-purple-200'
                }`}
        >
            <div className="flex items-center justify-between p-3" onClick={() => onCheck(!checked)}>
                <div className="flex items-center">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${checked ? 'bg-purple-500 border-purple-500' : 'border-gray-300 bg-white'}`}>
                        {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-sm font-bold transition-colors ${checked ? 'text-purple-900' : 'text-gray-600'}`}>{label}</span>
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out border-t border-purple-100 ${checked ? 'max-h-20 opacity-100 p-3 bg-white' : 'max-h-0 opacity-0 p-0 border-none'}`}>
                <div className="relative rounded-lg shadow-inner">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-purple-500 text-sm font-bold">$</span>
                    </div>
                    <input
                        type="number"
                        name={name}
                        value={value}
                        onChange={onChange}
                        className="block w-full rounded-lg border-0 bg-purple-50 py-2 pl-7 text-gray-900 shadow-inner ring-1 ring-inset ring-purple-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm sm:leading-6"
                        placeholder="Costo Mensual"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        </div>
    );
}
