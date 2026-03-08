import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { getEcosystemConcentration, ECOSYSTEM_RELATIONSHIPS } from '@/lib/ecosystem-data';

export default function IndustryEcosystem() {
    const data = useMemo(() => getEcosystemConcentration(ECOSYSTEM_RELATIONSHIPS), []);

    // Format for Recharts
    const chartData = useMemo(() => {
        return data.topIndustries.map(([ind, count]) => ({
            name: ind,
            partners: count
        }));
    }, [data.topIndustries]);

    return (
        <div className="flex flex-col h-full space-y-6">
            <div>
                <h3 className="text-sm font-bold text-gray-800">Industry Footprint Matrix</h3>
                <p className="text-xs text-gray-500">
                    Mide la cobertura vertical del ecosistema. Identifica qué industrias tienen mayor volumen de partners especializados (ej. Manufactura vs Retail).
                </p>
            </div>

            <div className="h-[400px] w-full border border-gray-100 rounded-xl bg-gray-50/50 p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 130, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }} axisLine={false} tickLine={false} width={130} />
                        <RechartsTooltip
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar
                            dataKey="partners"
                            radius={[0, 4, 4, 0]}
                            barSize={24}
                            animationDuration={1500}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={'#f59e0b'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                {chartData.slice(0, 3).map((v, i) => (
                    <div key={v.name} className="flex flex-col bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Top {i + 1} Vertical</span>
                        <div className="flex items-end gap-2">
                            <span className="text-xl font-black text-gray-800">{v.name}</span>
                            <span className="text-sm font-medium text-amber-600 mb-0.5">{v.partners} Part.</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
