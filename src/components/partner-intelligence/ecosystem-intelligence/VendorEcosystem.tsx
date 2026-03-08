import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { getEcosystemConcentration, ECOSYSTEM_RELATIONSHIPS } from '@/lib/ecosystem-data';

export default function VendorEcosystem() {
    const data = useMemo(() => getEcosystemConcentration(ECOSYSTEM_RELATIONSHIPS), []);

    // Format for Recharts
    const chartData = useMemo(() => {
        return data.topVendors.map(([vendor, count]) => ({
            name: vendor,
            partners: count
        }));
    }, [data.topVendors]);

    // Local color map to fall back on if GeoMap export is undefined for new vendors
    const LOCAL_VENDOR_COLORS: Record<string, string> = {
        'Siemens': '#009999',
        'Rockwell Automation': '#d62222',
        'Schneider Electric': '#3dcd58',
        'ABB': '#ff0000',
        'Honeywell': '#e5261f',
        'VMware': '#717074',
        'HPE': '#01A982',
        'Dell': '#007db8',
        'Cisco': '#0096d6',
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <div>
                <h3 className="text-sm font-bold text-gray-800">Vendor Market Penetration</h3>
                <p className="text-xs text-gray-500">
                    Concentración del ecosistema: Número total de Integradores que trabajan activamente con cada Fabricante.
                </p>
            </div>

            <div className="h-[400px] w-full border border-gray-100 rounded-xl bg-gray-50/50 p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }} axisLine={false} tickLine={false} width={120} />
                        <RechartsTooltip
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar
                            dataKey="partners"
                            radius={[0, 4, 4, 0]}
                            barSize={32}
                            animationDuration={1500}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={LOCAL_VENDOR_COLORS[entry.name] || '#94a3b8'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                {chartData.slice(0, 3).map((v, i) => (
                    <div key={v.name} className="flex flex-col bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Top {i + 1} Vendor</span>
                        <div className="flex items-end gap-2">
                            <span className="text-xl font-black text-gray-800">{v.name}</span>
                            <span className="text-sm font-medium text-[#01A982] mb-0.5">{v.partners} Partners</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
