import React, { useMemo } from 'react';
import { getTechnologyOverlap, ECOSYSTEM_RELATIONSHIPS } from '@/lib/ecosystem-data';

export default function TechnologyOverlap() {
    const data = useMemo(() => getTechnologyOverlap(ECOSYSTEM_RELATIONSHIPS), []);

    const TARGET_TECH = useMemo(() => [
        'Virtualization',
        'HCI',
        'Hybrid Cloud',
        'Cloud Migration',
        'Container Platforms',
        'Backup & Disaster Recovery',
        'Datacenter Infrastructure'
    ], []);

    const filteredTechnologies = useMemo(() =>
        data.technologies.filter(t => TARGET_TECH.includes(t)),
        [data.technologies, TARGET_TECH]);

    // Color gradient for heatmap (white -> light green -> dark green)
    const getColor = (val: number, max: number) => {
        if (val === 0) return '#f8fafc';
        const intensity = 0.2 + (val / max) * 0.8;
        return `rgba(1, 169, 130, ${intensity})`; // HPE Green base
    };

    const maxVal = useMemo(() => {
        let max = 0;
        data.matrix.forEach(row => {
            filteredTechnologies.forEach(tech => {
                const count = row[tech] as number;
                if (count > max) max = count;
            });
        });
        return max;
    }, [data.matrix, filteredTechnologies]);

    return (
        <div className="flex flex-col h-full space-y-6">
            <div>
                <h3 className="text-sm font-bold text-gray-800">Technology Overlap Analysis</h3>
                <p className="text-xs text-gray-500">
                    Matriz de coincidencia: Indica el número de Integradores que trabajan con un **Vendor Específico** Y ademas implementan una **Tecnología Específica**.
                    Útil para identificar ecosistemas (ej. Partners de Siemens que también implementan Hybrid Cloud).
                </p>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl relative">
                <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold w-40 sticky left-0 bg-gray-50 z-20 border-r border-gray-200 align-bottom">
                                Vendor \ Technology
                            </th>
                            {filteredTechnologies.map(t => (
                                <th key={t} className="px-2 font-semibold align-bottom min-w-[50px] max-w-[50px]" style={{ height: '190px' }}>
                                    <div className="relative h-full w-full">
                                        <div className="absolute bottom-3 left-1/2 origin-bottom-left -rotate-45 whitespace-nowrap text-[11px] text-gray-700 tracking-wide">
                                            {t}
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.matrix.map((row, idx) => (
                            <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-medium bg-white sticky left-0 z-10 border-r border-gray-200">
                                    {row.vendor}
                                </td>
                                {filteredTechnologies.map(t => {
                                    const val = row[t] as number;
                                    return (
                                        <td
                                            key={t}
                                            className="p-1 text-center font-semibold text-gray-800"
                                        >
                                            <div
                                                className="w-full h-10 flex items-center justify-center rounded transition-all"
                                                style={{ backgroundColor: getColor(val, maxVal), color: val > (maxVal / 2) ? 'white' : 'inherit' }}
                                                title={`${val} partners use ${row.vendor} AND implement ${t}`}
                                            >
                                                {val > 0 ? val : '-'}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>Legend:</span>
                <div className="flex items-center gap-1"><div className="w-4 h-4 border border-gray-200 bg-slate-50" /> 0 Integrators</div>
                <div className="flex items-center gap-1"><div className="w-4 h-4" style={{ backgroundColor: 'rgba(1, 169, 130, 0.4)' }} /> Few Integrators</div>
                <div className="flex items-center gap-1"><div className="w-4 h-4" style={{ backgroundColor: 'rgba(1, 169, 130, 1)' }} /> High Overlap (Ecosystem Dominance)</div>
            </div>
        </div>
    );
}
