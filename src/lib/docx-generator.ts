import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, ShadingType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { getAssessmentResults, getFinancialResults, getComparatorResults, getAllChartImages } from './storage';

export interface ProposalOptions {
    includeGap: boolean;
    includeFinancial: boolean;
    includeComparator: boolean;
}

// ── Color Constants ──────────────────────────────────────────────────
const HPE_GREEN = '01A982';
const HPE_DARK = '1B1B1B';
const GRAY_600 = '4B5563';
const GRAY_400 = '9CA3AF';
const WHITE = 'FFFFFF';
const TABLE_HEADER_BG = '0D2137';
const TABLE_ALT_BG = 'F0FAF7';
const RED_LIGHT = 'FEE2E2';
const RED_TEXT = 'DC2626';
const YELLOW_LIGHT = 'FEF3C7';
const YELLOW_TEXT = '92400E';
const GREEN_LIGHT = 'D1FAE5';
const GREEN_TEXT = '065F46';

// ── Main Export Function ─────────────────────────────────────────────
export async function generateProposalDocument(options: ProposalOptions) {
    const assessment = options.includeGap ? getAssessmentResults() : null;
    const financial = options.includeFinancial ? getFinancialResults() : null;
    const comparator = options.includeComparator ? getComparatorResults() : null;
    const chartImages = getAllChartImages();
    const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

    let sectionNumber = 0;
    const children: any[] = [];

    // ═══════════════════════════════════════════════════════════════════
    // COVER PAGE
    // ═══════════════════════════════════════════════════════════════════
    children.push(
        emptyParagraph(800),
        styledParagraph('PROPUESTA TÉCNICO-ECONÓMICA', { size: 48, bold: true, color: HPE_DARK, alignment: AlignmentType.CENTER, spacingAfter: 100 }),
        styledParagraph('Transformación de Infraestructura Digital', { size: 28, color: GRAY_600, alignment: AlignmentType.CENTER, spacingAfter: 60 }),
        horizontalLine(),
        emptyParagraph(200),
        styledParagraph('Hewlett Packard Enterprise', { size: 32, bold: true, color: HPE_GREEN, alignment: AlignmentType.CENTER, spacingAfter: 400 }),
        emptyParagraph(200),
        coverField('Preparado para:', '[Nombre del Cliente]'),
        coverField('Preparado por:', '[Nombre del Ejecutivo HPE]'),
        coverField('Fecha:', dateStr),
        coverField('Clasificación:', 'Confidencial'),
        emptyParagraph(400),
        styledParagraph('Hewlett Packard Enterprise | Servicios de Consultoría', { size: 16, color: GRAY_400, alignment: AlignmentType.CENTER, italics: true }),
    );

    // ═══════════════════════════════════════════════════════════════════
    // TABLE OF CONTENTS (text-based)
    // ═══════════════════════════════════════════════════════════════════
    children.push(
        sectionTitle('Contenido', true),
    );
    let tocNum = 0;
    if (assessment?.detailedResults?.length) {
        tocNum++;
        children.push(tocEntry(`${tocNum}. Análisis de Brecha (GAP Analysis)`));
        children.push(tocEntry(`   ${tocNum}.1 Score de Madurez por Dimensión`));
        children.push(tocEntry(`   ${tocNum}.2 Hallazgos Detallados y Soluciones HPE`));
    }
    if (financial?.metrics) {
        tocNum++;
        children.push(tocEntry(`${tocNum}. Análisis Financiero (TCO & ROI)`));
        children.push(tocEntry(`   ${tocNum}.1 Métricas Clave`));
        children.push(tocEntry(`   ${tocNum}.2 Proyección de Costos Acumulados`));
    }
    if (comparator?.comparisons?.length) {
        tocNum++;
        children.push(tocEntry(`${tocNum}. Análisis Competitivo`));
        children.push(tocEntry(`   ${tocNum}.1 Comparativa por Criterio`));
        children.push(tocEntry(`   ${tocNum}.2 Resumen de Ventajas`));
    }
    tocNum++;
    children.push(tocEntry(`${tocNum}. Conclusión y Próximos Pasos`));
    children.push(emptyParagraph(200));

    // ═══════════════════════════════════════════════════════════════════
    // EXECUTIVE SUMMARY
    // ═══════════════════════════════════════════════════════════════════
    children.push(
        sectionTitle('Resumen Ejecutivo', true),
        bodyText('El presente documento consolida los hallazgos y recomendaciones derivados de un análisis integral de la infraestructura tecnológica del cliente. El estudio abarca las siguientes dimensiones:'),
        emptyParagraph(100),
    );

    if (assessment?.detailedResults?.length) {
        children.push(bulletPoint('Análisis de Brecha (GAP)', 'Identificación de áreas críticas de mejora y soluciones HPE alineadas.'));
    }
    if (financial?.metrics) {
        children.push(bulletPoint('Análisis Financiero (TCO/ROI)', 'Proyección de costos comparativa y retorno de inversión.'));
    }
    if (comparator?.comparisons?.length) {
        children.push(bulletPoint('Análisis Competitivo', `Comparativa técnica: HPE ${comparator.solutionName} vs ${comparator.competitorName} ${comparator.competitorSolution}.`));
    }

    // Quick summary stats box
    children.push(emptyParagraph(200));
    const summaryRows: TableRow[] = [];
    if (assessment?.detailedResults?.length) {
        const solutions = [...new Set(assessment.detailedResults.map((r: any) => r.solution))] as string[];
        const overallScore = assessment.radarData?.overallScore ?? '—';
        summaryRows.push(summaryStatRow('Brechas Detectadas', String(assessment.detailedResults.length), 'Soluciones HPE', String(solutions.length)));
        summaryRows.push(summaryStatRow('Score General', `${overallScore}%`, 'Horizonte', `${assessment.radarData?.horizon ?? '—'} meses`));
    }
    if (financial?.metrics) {
        summaryRows.push(summaryStatRow('Ahorro Total 5Y', formatCurrency(financial.metrics.totalSavings), 'ROI', `${financial.metrics.roi.toFixed(1)}%`));
        summaryRows.push(summaryStatRow('VPN', formatCurrency(financial.metrics.npv), 'Payback', 'Inmediato (OpEx)'));
    }
    if (comparator?.comparisons?.length) {
        const hpeWins = comparator.comparisons.filter((c: any) => c.hpeIsBetter).length;
        summaryRows.push(summaryStatRow('Ventajas HPE', `${hpeWins} de ${comparator.comparisons.length}`, 'vs.', `${comparator.competitorName} ${comparator.competitorSolution}`));
    }
    if (summaryRows.length > 0) {
        children.push(
            new Table({
                rows: summaryRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: thinBorders('E5E7EB'),
            }),
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // SECTION: GAP ANALYSIS
    // ═══════════════════════════════════════════════════════════════════
    if (assessment?.detailedResults?.length) {
        sectionNumber++;
        children.push(
            sectionTitle(`${sectionNumber}. Análisis de Brecha (GAP Analysis)`, true),
            bodyText('El análisis GAP evalúa la distancia entre el estado actual de la infraestructura y el estado futuro deseado. Se identifican brechas críticas y se recomiendan soluciones HPE específicas para cerrar cada una.'),
            emptyParagraph(100),
        );

        // ── Radar Chart Image ───────────────────────────────────────────
        if (chartImages['assessment_radar']) {
            children.push(
                styledParagraph('Gráfica de Radar — Score de Madurez', { bold: true, size: 22, spacingAfter: 60, color: GRAY_600 }),
                chartImageParagraph(chartImages['assessment_radar'], 550, 400),
                emptyParagraph(200),
            );
        }

        // ── Radar Chart Data as Score Table ─────────────────────────────
        if (assessment.radarData) {
            const rd = assessment.radarData;
            children.push(
                styledParagraph(`${sectionNumber}.1 Score de Madurez por Dimensión`, { bold: true, size: 24, spacingAfter: 100 }),
                bodyText(`Puntuación general: ${rd.overallScore}% — Horizonte de mejora: ${rd.horizon} meses`),
                emptyParagraph(60),
            );

            const radarHeader = new TableRow({
                tableHeader: true,
                children: [
                    headerCell('Dimensión', 30),
                    headerCell('Estado Actual', 18),
                    headerCell('Prom. Industria', 18),
                    headerCell(`Objetivo HPE (${rd.horizon}m)`, 18),
                    headerCell('Brecha', 16),
                ],
            });

            const radarRows = rd.categories.map((cat: string, idx: number) => {
                const current = Math.round(rd.currentScores[idx]);
                const industry = Math.round(rd.industryAvg[idx]);
                const target = Math.round(rd.targetScores[idx]);
                const gap = target - current;
                const gapColor = gap > 30 ? RED_TEXT : gap > 15 ? YELLOW_TEXT : GREEN_TEXT;
                const gapBg = gap > 30 ? RED_LIGHT : gap > 15 ? YELLOW_LIGHT : GREEN_LIGHT;

                return new TableRow({
                    children: [
                        dataCell(cat, true, idx % 2 === 1),
                        scoreCell(current, idx % 2 === 1),
                        scoreCell(industry, idx % 2 === 1),
                        scoreCell(target, idx % 2 === 1, HPE_GREEN),
                        new TableCell({
                            children: [new Paragraph({
                                children: [new TextRun({ text: `+${gap}pp`, bold: true, size: 18, color: gapColor })],
                                alignment: AlignmentType.CENTER,
                                spacing: { before: 20, after: 20 },
                            })],
                            shading: { type: ShadingType.SOLID, color: gapBg, fill: gapBg },
                            margins: cellMargins(),
                        }),
                    ],
                });
            });

            children.push(createTable([radarHeader, ...radarRows]));
            children.push(emptyParagraph(200));
        }

        // ── Summary by Solution ─────────────────────────────────────────
        const solutionCounts: Record<string, number> = {};
        assessment.detailedResults.forEach((r: any) => {
            solutionCounts[r.solution] = (solutionCounts[r.solution] || 0) + 1;
        });

        children.push(
            styledParagraph('Resumen por Solución HPE:', { bold: true, size: 20, spacingAfter: 100 }),
        );
        Object.entries(solutionCounts).forEach(([solution, count]) => {
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: '●  ', color: HPE_GREEN, size: 20 }),
                    new TextRun({ text: solution, bold: true, size: 20 }),
                    new TextRun({ text: ` — ${count} brecha${count > 1 ? 's' : ''}`, size: 20, color: GRAY_600 }),
                ],
                spacing: { after: 60 },
                indent: { left: 360 },
            }));
        });
        children.push(emptyParagraph(200));

        // ── Detail Table ────────────────────────────────────────────────
        children.push(
            styledParagraph(`${sectionNumber}.2 Hallazgos Detallados y Soluciones HPE`, { bold: true, size: 24, spacingAfter: 100 }),
        );

        const gapHeader = new TableRow({
            tableHeader: true,
            children: [
                headerCell('#', 6),
                headerCell('Dimensión', 16),
                headerCell('Hallazgo / Brecha', 30),
                headerCell('Estado Futuro Deseado', 28),
                headerCell('Solución HPE', 20),
            ],
        });

        const gapRows = assessment.detailedResults.map((item: any, idx: number) =>
            new TableRow({
                children: [
                    dataCell(String(idx + 1), true, idx % 2 === 1),
                    dataCell(item.category || '', true, idx % 2 === 1),
                    dataCell(item.gap || item.answer || '', false, idx % 2 === 1),
                    dataCell(item.futureState || '', false, idx % 2 === 1),
                    dataCell(item.solution || '', true, idx % 2 === 1, HPE_GREEN),
                ],
            })
        );

        children.push(createTable([gapHeader, ...gapRows]));

        // ── Eisenhower Matrix Image ──────────────────────────────────
        if (chartImages['assessment_eisenhower']) {
            children.push(
                emptyParagraph(200),
                styledParagraph('Matriz de Priorización (Eisenhower)', { bold: true, size: 22, spacingAfter: 60, color: GRAY_600 }),
                chartImageParagraph(chartImages['assessment_eisenhower'], 560, 420),
            );
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // SECTION: FINANCIAL ANALYSIS
    // ═══════════════════════════════════════════════════════════════════
    if (financial?.metrics) {
        sectionNumber++;
        children.push(
            sectionTitle(`${sectionNumber}. Análisis Financiero (TCO & ROI)`, true),
            bodyText('El siguiente análisis compara el Costo Total de Propiedad (TCO) de tres escenarios: infraestructura tradicional on-premise, migración completa a nube pública, y la propuesta HPE GreenLake como modelo "as-a-Service".'),
            emptyParagraph(100),
        );

        // ── Key Metrics Cards ────────────────────────────────────────
        children.push(
            styledParagraph(`${sectionNumber}.1 Métricas Clave`, { bold: true, size: 24, spacingAfter: 100 }),
        );

        const metricsRow = new TableRow({
            children: [
                metricCell('Ahorro Total (5 Años)', formatCurrency(financial.metrics.totalSavings)),
                metricCell('ROI', `${financial.metrics.roi.toFixed(1)}%`),
                metricCell('Valor Presente Neto', formatCurrency(financial.metrics.npv)),
            ],
        });

        children.push(
            new Table({
                rows: [metricsRow],
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: thinBorders('E5E7EB'),
            }),
            emptyParagraph(200),
        );

        // ── Financial Line Chart Image ───────────────────────────────
        if (chartImages['financial_line']) {
            children.push(
                styledParagraph('Gráfica de Proyección de Costos Acumulados', { bold: true, size: 22, spacingAfter: 60, color: GRAY_600 }),
                chartImageParagraph(chartImages['financial_line'], 560, 340),
                emptyParagraph(200),
            );
        }

        // ── Yearly Comparison Table ──────────────────────────────────
        if (financial.yearlyData?.length) {
            children.push(
                styledParagraph(`${sectionNumber}.2 Proyección de Costos Acumulados`, { bold: true, size: 24, spacingAfter: 100 }),
            );

            const yearHeader = new TableRow({
                tableHeader: true,
                children: [
                    headerCell('Año', 10),
                    headerCell('Infraestructura Tradicional', 22),
                    headerCell('Nube Pública', 22),
                    headerCell('HPE GreenLake', 22),
                    headerCell('Ahorro vs Trad.', 12),
                    headerCell('Ahorro vs Cloud', 12),
                ],
            });

            const yearRows = financial.yearlyData.map((yr: any, idx: number) =>
                new TableRow({
                    children: [
                        dataCell(`Año ${yr.year}`, true, idx % 2 === 1),
                        dataCell(formatCurrency(yr.traditionalCumulative), false, idx % 2 === 1),
                        dataCell(formatCurrency(yr.cloudCumulative), false, idx % 2 === 1),
                        dataCell(formatCurrency(yr.greenlakeCumulative), true, idx % 2 === 1, HPE_GREEN),
                        dataCell(formatCurrency(yr.savingsVsTraditional), false, idx % 2 === 1, GREEN_TEXT),
                        dataCell(formatCurrency(yr.savingsVsCloud), false, idx % 2 === 1, GREEN_TEXT),
                    ],
                })
            );

            children.push(createTable([yearHeader, ...yearRows]));
            children.push(emptyParagraph(100));

            // Show additional solutions if selected
            const lastYear = financial.yearlyData[financial.yearlyData.length - 1];
            const selectedSols = lastYear?.selectedSolutions || financial.metrics.selectedSolutions || [];
            if (selectedSols.length > 0) {
                children.push(
                    styledParagraph('Soluciones Adicionales Incluidas (Costo Acumulado Final):', { bold: true, size: 20, spacingAfter: 100 }),
                );

                const solLabels: Record<string, string> = {
                    'morpheus': 'HPE Morpheus VME',
                    'vmEssentials': 'HPE VM Essentials',
                    'zerto': 'HPE Zerto',
                    'opsRamp': 'HPE OpsRamp',
                    'pcbeBusiness': 'PCBE Business Edition',
                    'pcbeEnterprise': 'PCBE Enterprise Edition',
                    'storeOnce': 'HPE StoreOnce',
                };

                const solValues: Record<string, number> = {
                    'morpheus': lastYear.morpheusCumulative,
                    'vmEssentials': lastYear.vmEssentialsCumulative,
                    'zerto': lastYear.zertoCumulative,
                    'opsRamp': lastYear.opsRampCumulative,
                    'pcbeBusiness': lastYear.pcbeBusinessCumulative,
                    'pcbeEnterprise': lastYear.pcbeEnterpriseCumulative,
                    'storeOnce': lastYear.storeOnceCumulative,
                };

                selectedSols.forEach((sol: string) => {
                    if (solLabels[sol] && solValues[sol] !== undefined) {
                        children.push(new Paragraph({
                            children: [
                                new TextRun({ text: '●  ', color: HPE_GREEN, size: 20 }),
                                new TextRun({ text: solLabels[sol], bold: true, size: 20 }),
                                new TextRun({ text: `: ${formatCurrency(solValues[sol])}`, size: 20, color: GRAY_600 }),
                            ],
                            spacing: { after: 60 },
                            indent: { left: 360 },
                        }));
                    }
                });
                children.push(emptyParagraph(100));
            }
        }

        children.push(
            bodyText('La propuesta HPE GreenLake ofrece un modelo de consumo flexible (OpEx) que elimina el sobreaprovisionamiento, reduce el riesgo financiero y permite escalar la infraestructura según demanda real con capacidad de buffer incluida.'),
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // SECTION: COMPETITIVE ANALYSIS
    // ═══════════════════════════════════════════════════════════════════
    if (comparator?.comparisons?.length) {
        sectionNumber++;
        children.push(
            sectionTitle(`${sectionNumber}. Análisis Competitivo`, true),
            bodyText(`Comparativa técnico-comercial entre HPE ${comparator.solutionName} y ${comparator.competitorName} ${comparator.competitorSolution}. Se evalúan criterios en las categorías de: Negocio, Funcional, Financiero, Técnico y Precios.`),
            emptyParagraph(100),
        );

        // ── Comparator Matrix Image ─────────────────────────────────
        if (chartImages['comparator_matrix']) {
            children.push(
                emptyParagraph(200),
                styledParagraph('Captura Visual — Matriz Competitiva', { bold: true, size: 22, spacingAfter: 60, color: GRAY_600 }),
                chartImageParagraph(chartImages['comparator_matrix'], 560, 400),
            );
        }

        // ── Topology Diagram Image ──────────────────────────────────
        if (chartImages['comparator_topology']) {
            children.push(
                emptyParagraph(200),
                styledParagraph('Captura Visual — Diagrama Topológico', { bold: true, size: 22, spacingAfter: 60, color: GRAY_600 }),
                chartImageParagraph(chartImages['comparator_topology'], 560, 400),
                bodyText(`La arquitectura de ${comparator.solutionName} está diseñada para reducir la complejidad mediante la unificación de capas, mientras que ${comparator.competitorName} a menudo requiere componentes discretos adicionales para lograr la misma funcionalidad, aumentando los puntos de falla y la complejidad de gestión.`),
            );
        }

        // ── Comparison Table ─────────────────────────────────────────
        children.push(
            styledParagraph(`${sectionNumber}.1 Comparativa por Criterio`, { bold: true, size: 24, spacingAfter: 100 }),
        );

        const compHeader = new TableRow({
            tableHeader: true,
            children: [
                headerCell('Categoría', 14),
                headerCell('Criterio', 14),
                headerCell(`HPE ${comparator.solutionName}`, 22),
                headerCell(`${comparator.competitorName} (${comparator.competitorSolution})`, 22),
                headerCell('Ventaja HPE', 28),
            ],
        });

        const compRows = comparator.comparisons.map((comp: any, idx: number) => {
            const isHPE = comp.hpeIsBetter;
            return new TableRow({
                children: [
                    categoryBadgeCell(comp.category || '', idx % 2 === 1),
                    dataCell(comp.feature || '', true, idx % 2 === 1),
                    new TableCell({
                        children: [new Paragraph({
                            children: [
                                new TextRun({ text: isHPE ? '✓ ' : '', color: HPE_GREEN, size: 18, bold: true }),
                                new TextRun({ text: comp.hpe || '', size: 18, color: isHPE ? HPE_GREEN : '333333', bold: isHPE }),
                            ],
                            spacing: { before: 20, after: 20 },
                        })],
                        shading: cellShading(idx % 2 === 1),
                        margins: cellMargins(),
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            children: [
                                new TextRun({ text: !isHPE ? '✓ ' : '', color: RED_TEXT, size: 18, bold: true }),
                                new TextRun({ text: comp.competitor || '', size: 18, color: !isHPE ? RED_TEXT : '333333', bold: !isHPE }),
                            ],
                            spacing: { before: 20, after: 20 },
                        })],
                        shading: cellShading(idx % 2 === 1),
                        margins: cellMargins(),
                    }),
                    dataCell(comp.hpeAdvantage || '', false, idx % 2 === 1),
                ],
            });
        });

        children.push(createTable([compHeader, ...compRows]));
        children.push(emptyParagraph(200));

        // ── Summary ──────────────────────────────────────────────────
        children.push(
            styledParagraph(`${sectionNumber}.2 Resumen de Ventajas`, { bold: true, size: 24, spacingAfter: 100 }),
        );

        const hpeWins = comparator.comparisons.filter((c: any) => c.hpeIsBetter).length;
        const total = comparator.comparisons.length;

        // Score box
        const scoreRow = new TableRow({
            children: [
                metricCell('Criterios Evaluados', String(total)),
                metricCell('Ventajas HPE', `${hpeWins} / ${total}`),
                metricCell('Tasa de Superioridad', `${Math.round((hpeWins / total) * 100)}%`),
            ],
        });
        children.push(
            new Table({
                rows: [scoreRow],
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: thinBorders('E5E7EB'),
            }),
            emptyParagraph(200),
        );

        // Category breakdown
        const categoryBreakdown: Record<string, { wins: number; total: number }> = {};
        comparator.comparisons.forEach((c: any) => {
            if (!categoryBreakdown[c.category]) categoryBreakdown[c.category] = { wins: 0, total: 0 };
            categoryBreakdown[c.category].total++;
            if (c.hpeIsBetter) categoryBreakdown[c.category].wins++;
        });

        children.push(styledParagraph('Desglose por Categoría:', { bold: true, size: 20, spacingAfter: 100 }));
        Object.entries(categoryBreakdown).forEach(([cat, data]) => {
            const pct = Math.round((data.wins / data.total) * 100);
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: pct === 100 ? '✓ ' : '○ ', color: pct === 100 ? HPE_GREEN : GRAY_400, size: 20, bold: true }),
                    new TextRun({ text: cat, bold: true, size: 20 }),
                    new TextRun({ text: ` — ${data.wins}/${data.total} criterios favorables (${pct}%)`, size: 20, color: GRAY_600 }),
                ],
                spacing: { after: 60 },
                indent: { left: 360 },
            }));
        });

        children.push(
            emptyParagraph(100),
            bodyText(`HPE ${comparator.solutionName} demuestra ventajas claras en ${hpeWins} de ${total} criterios evaluados, posicionándose como la alternativa superior para este escenario.`),
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // CONCLUSION
    // ═══════════════════════════════════════════════════════════════════
    sectionNumber++;
    children.push(
        sectionTitle(`${sectionNumber}. Conclusión y Próximos Pasos`, true),
        bodyText('Basándose en los hallazgos de este análisis, recomendamos los siguientes pasos:'),
        emptyParagraph(60),
        numberedStep(1, 'Validación técnica mediante una Prueba de Concepto (PoC) con las soluciones priorizadas.'),
        numberedStep(2, 'Diseño de arquitectura detallada y plan de migración por fases.'),
        numberedStep(3, 'Presentación de propuesta económica formal con modelo de financiamiento HPE Financial Services.'),
        numberedStep(4, 'Definición de SLAs, cronograma de implementación y equipo de proyecto.'),
        emptyParagraph(400),
        horizontalLine(),
        styledParagraph('© Hewlett Packard Enterprise | Documento Confidencial', { size: 16, color: GRAY_400, alignment: AlignmentType.CENTER, italics: true }),
    );

    // ═══════════════════════════════════════════════════════════════════
    // BUILD & SAVE
    // ═══════════════════════════════════════════════════════════════════
    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: { font: 'Calibri', size: 20 },
                },
            },
        },
        sections: [{
            properties: {
                page: {
                    margin: { top: 1440, bottom: 1440, left: 1296, right: 1296 },
                },
            },
            children,
        }],
    });

    const blob = await Packer.toBlob(doc);
    const safeDateStr = new Date().toISOString().split('T')[0];
    saveAs(blob, `Propuesta_HPE_${safeDateStr}.docx`);
}

// ══════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════

function formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

function base64ToUint8Array(dataUri: string): Uint8Array {
    const base64 = dataUri.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function chartImageParagraph(dataUri: string, widthPx: number, heightPx: number) {
    try {
        const imageData = base64ToUint8Array(dataUri);
        return new Paragraph({
            children: [
                new ImageRun({
                    data: imageData,
                    transformation: {
                        width: widthPx,
                        height: heightPx,
                    },
                    type: 'png',
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        });
    } catch (e) {
        console.warn('Failed to embed chart image:', e);
        return new Paragraph({
            children: [new TextRun({ text: '[Gráfica no disponible — visite el módulo para capturar las gráficas]', italics: true, size: 18, color: GRAY_400 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        });
    }
}

function emptyParagraph(spacingAfter: number) {
    return new Paragraph({ text: '', spacing: { after: spacingAfter } });
}

function styledParagraph(text: string, opts: { size?: number; bold?: boolean; italics?: boolean; color?: string; alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]; spacingAfter?: number; spacingBefore?: number }) {
    return new Paragraph({
        children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, size: opts.size || 20, color: opts.color || HPE_DARK })],
        alignment: opts.alignment,
        spacing: { after: opts.spacingAfter || 0, before: opts.spacingBefore || 0 },
    });
}

function bodyText(text: string) {
    return new Paragraph({
        children: [new TextRun({ text, size: 20, color: GRAY_600 })],
        spacing: { after: 150 },
    });
}

function sectionTitle(text: string, pageBreak: boolean = false) {
    return new Paragraph({
        children: [new TextRun({ text, bold: true, size: 28, color: HPE_DARK })],
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: pageBreak,
        spacing: { before: 200, after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: HPE_GREEN, space: 8 } },
    });
}

function horizontalLine() {
    return new Paragraph({
        text: '',
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB', space: 1 } },
        spacing: { after: 200 },
    });
}

function coverField(label: string, value: string) {
    return new Paragraph({
        children: [
            new TextRun({ text: label + ' ', bold: true, size: 22, color: GRAY_600 }),
            new TextRun({ text: value, size: 22, color: HPE_DARK }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
    });
}

function bulletPoint(title: string, description: string) {
    return new Paragraph({
        children: [
            new TextRun({ text: '●  ', color: HPE_GREEN, size: 20 }),
            new TextRun({ text: title, bold: true, size: 20 }),
            new TextRun({ text: ` — ${description}`, size: 20, color: GRAY_600 }),
        ],
        spacing: { after: 80 },
        indent: { left: 360 },
    });
}

function numberedStep(num: number, text: string) {
    return new Paragraph({
        children: [
            new TextRun({ text: `${num}. `, bold: true, size: 20, color: HPE_GREEN }),
            new TextRun({ text, size: 20, color: GRAY_600 }),
        ],
        spacing: { after: 80 },
        indent: { left: 360 },
    });
}

function tocEntry(text: string) {
    return new Paragraph({
        children: [new TextRun({ text, size: 20, color: GRAY_600 })],
        spacing: { after: 60 },
        indent: { left: text.startsWith('   ') ? 720 : 360 },
    });
}

function summaryStatRow(label1: string, value1: string, label2: string, value2: string) {
    return new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: label1, size: 18, color: GRAY_600 })], spacing: { before: 20, after: 20 } })],
                width: { size: 25, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: 'F9FAFB', fill: 'F9FAFB' },
                margins: cellMargins(),
            }),
            new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: value1, bold: true, size: 18, color: HPE_GREEN })], spacing: { before: 20, after: 20 } })],
                width: { size: 25, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: 'F9FAFB', fill: 'F9FAFB' },
                margins: cellMargins(),
            }),
            new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: label2, size: 18, color: GRAY_600 })], spacing: { before: 20, after: 20 } })],
                width: { size: 25, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: 'F9FAFB', fill: 'F9FAFB' },
                margins: cellMargins(),
            }),
            new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: value2, bold: true, size: 18, color: HPE_GREEN })], spacing: { before: 20, after: 20 } })],
                width: { size: 25, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: 'F9FAFB', fill: 'F9FAFB' },
                margins: cellMargins(),
            }),
        ],
    });
}

// ── Table Helpers ────────────────────────────────────────────────────

function cellMargins() {
    return { top: 30, bottom: 30, left: 80, right: 80 };
}

function cellShading(alt: boolean) {
    const bg = alt ? TABLE_ALT_BG : WHITE;
    return { type: ShadingType.SOLID, color: bg, fill: bg };
}

function headerCell(text: string, widthPct: number) {
    return new TableCell({
        children: [new Paragraph({
            children: [new TextRun({ text, bold: true, color: WHITE, size: 18, font: 'Calibri' })],
            spacing: { before: 40, after: 40 },
        })],
        width: { size: widthPct, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: TABLE_HEADER_BG, fill: TABLE_HEADER_BG },
        margins: cellMargins(),
    });
}

function dataCell(text: string, bold: boolean = false, altRow: boolean = false, color?: string) {
    return new TableCell({
        children: [new Paragraph({
            children: [new TextRun({ text, bold, size: 18, color: color || '333333', font: 'Calibri' })],
            spacing: { before: 20, after: 20 },
        })],
        shading: cellShading(altRow),
        margins: cellMargins(),
    });
}

function scoreCell(value: number, altRow: boolean, color?: string) {
    return new TableCell({
        children: [new Paragraph({
            children: [new TextRun({ text: `${value}%`, bold: true, size: 18, color: color || '333333' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 20 },
        })],
        shading: cellShading(altRow),
        margins: cellMargins(),
    });
}

function categoryBadgeCell(text: string, altRow: boolean) {
    const categoryColors: Record<string, { bg: string; text: string }> = {
        'Negocio': { bg: 'DBEAFE', text: '1D4ED8' },
        'Funcional': { bg: 'E0E7FF', text: '4338CA' },
        'Financiero': { bg: 'D1FAE5', text: '065F46' },
        'Técnico': { bg: 'FEF3C7', text: '92400E' },
        'Precios': { bg: 'FCE7F3', text: '9D174D' },
    };
    const colors = categoryColors[text] || { bg: altRow ? TABLE_ALT_BG : WHITE, text: '333333' };

    return new TableCell({
        children: [new Paragraph({
            children: [new TextRun({ text, bold: true, size: 16, color: colors.text })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 20 },
        })],
        shading: { type: ShadingType.SOLID, color: colors.bg, fill: colors.bg },
        margins: cellMargins(),
    });
}

function metricCell(label: string, value: string) {
    return new TableCell({
        children: [
            new Paragraph({
                children: [new TextRun({ text: value, bold: true, size: 28, color: HPE_GREEN })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
            }),
            new Paragraph({
                children: [new TextRun({ text: label, size: 16, color: GRAY_600 })],
                alignment: AlignmentType.CENTER,
            }),
        ],
        width: { size: 33, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: 'F9FAFB', fill: 'F9FAFB' },
        margins: { top: 120, bottom: 120, left: 80, right: 80 },
    });
}

function createTable(rows: TableRow[]) {
    return new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: thinBorders('E5E7EB'),
    });
}

function thinBorders(color: string) {
    return {
        top: { style: BorderStyle.SINGLE, size: 1, color },
        bottom: { style: BorderStyle.SINGLE, size: 1, color },
        left: { style: BorderStyle.SINGLE, size: 1, color },
        right: { style: BorderStyle.SINGLE, size: 1, color },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color },
    };
}
