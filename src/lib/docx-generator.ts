import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, ShadingType } from 'docx';
import { saveAs } from 'file-saver';
import { getAssessmentResults, getFinancialResults, getComparatorResults } from './storage';

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

// ── Main Export Function ─────────────────────────────────────────────
export async function generateProposalDocument(options: ProposalOptions) {
    const assessment = options.includeGap ? getAssessmentResults() : null;
    const financial = options.includeFinancial ? getFinancialResults() : null;
    const comparator = options.includeComparator ? getComparatorResults() : null;
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
    // EXECUTIVE SUMMARY
    // ═══════════════════════════════════════════════════════════════════
    children.push(
        sectionTitle('Resumen Ejecutivo', true),
        bodyText('El presente documento consolida los hallazgos y recomendaciones derivados de un análisis integral de la infraestructura tecnológica del cliente. El estudio abarca las siguientes dimensiones:'),
        emptyParagraph(100),
    );

    // List included sections
    if (assessment) {
        children.push(bulletPoint('Análisis de Brecha (GAP)', 'Identificación de áreas críticas de mejora y soluciones HPE alineadas.'));
    }
    if (financial) {
        children.push(bulletPoint('Análisis Financiero (TCO/ROI)', 'Proyección de costos comparativa y retorno de inversión.'));
    }
    if (comparator) {
        children.push(bulletPoint('Análisis Competitivo', `Comparativa técnica: HPE ${comparator.solutionName} vs ${comparator.competitorName} ${comparator.competitorSolution}.`));
    }

    // Quick summary stats
    children.push(emptyParagraph(200));
    const statsRuns: TextRun[] = [];
    if (assessment?.detailedResults) {
        const solutions = [...new Set(assessment.detailedResults.map((r: any) => r.solution))] as string[];
        statsRuns.push(
            new TextRun({ text: `Brechas identificadas: `, bold: true, size: 20 }),
            new TextRun({ text: `${assessment.detailedResults.length}`, color: HPE_GREEN, bold: true, size: 20 }),
            new TextRun({ text: `  ·  Soluciones HPE: `, bold: true, size: 20 }),
            new TextRun({ text: `${solutions.length}`, color: HPE_GREEN, bold: true, size: 20 }),
        );
    }
    if (financial?.metrics) {
        const fmt = formatCurrency;
        if (statsRuns.length > 0) statsRuns.push(new TextRun({ text: '  ·  ', size: 20 }));
        statsRuns.push(
            new TextRun({ text: `Ahorro 5Y: `, bold: true, size: 20 }),
            new TextRun({ text: fmt(financial.metrics.totalSavings), color: HPE_GREEN, bold: true, size: 20 }),
            new TextRun({ text: `  ·  ROI: `, bold: true, size: 20 }),
            new TextRun({ text: `${financial.metrics.roi.toFixed(1)}%`, color: HPE_GREEN, bold: true, size: 20 }),
        );
    }
    if (statsRuns.length > 0) {
        children.push(new Paragraph({ children: statsRuns, spacing: { after: 300 }, shading: { type: ShadingType.SOLID, color: 'F0FAF7', fill: 'F0FAF7' } }));
    }

    // ═══════════════════════════════════════════════════════════════════
    // SECTION 1: GAP ANALYSIS
    // ═══════════════════════════════════════════════════════════════════
    if (assessment?.detailedResults?.length) {
        sectionNumber++;
        children.push(
            sectionTitle(`${sectionNumber}. Análisis de Brecha (GAP Analysis)`, true),
            bodyText('El análisis GAP evalúa la distancia entre el estado actual de la infraestructura y el estado futuro deseado. A continuación se detallan los hallazgos con las soluciones HPE recomendadas para cerrar cada brecha.'),
            emptyParagraph(100),
        );

        // Summary by solution
        const solutionCounts: Record<string, number> = {};
        assessment.detailedResults.forEach((r: any) => {
            solutionCounts[r.solution] = (solutionCounts[r.solution] || 0) + 1;
        });

        children.push(
            styledParagraph('Resumen por Solución HPE:', { bold: true, size: 20, spacingAfter: 100 }),
        );

        Object.entries(solutionCounts).forEach(([solution, count]) => {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: '●  ', color: HPE_GREEN, size: 20 }),
                        new TextRun({ text: solution, bold: true, size: 20 }),
                        new TextRun({ text: ` — ${count} brecha${count > 1 ? 's' : ''} identificada${count > 1 ? 's' : ''}`, size: 20, color: GRAY_600 }),
                    ],
                    spacing: { after: 60 },
                    indent: { left: 360 },
                })
            );
        });

        children.push(emptyParagraph(200));

        // Detail table
        const headerRow = new TableRow({
            tableHeader: true,
            children: [
                headerCell('#', 6),
                headerCell('Dimensión', 16),
                headerCell('Hallazgo / Brecha', 30),
                headerCell('Estado Futuro Deseado', 28),
                headerCell('Solución HPE', 20),
            ],
        });

        const dataRows = assessment.detailedResults.map((item: any, idx: number) =>
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

        children.push(createTable([headerRow, ...dataRows]));
    }

    // ═══════════════════════════════════════════════════════════════════
    // SECTION 2: FINANCIAL ANALYSIS
    // ═══════════════════════════════════════════════════════════════════
    if (financial?.metrics) {
        sectionNumber++;
        const fmt = formatCurrency;

        children.push(
            sectionTitle(`${sectionNumber}. Análisis Financiero (TCO & ROI)`, true),
            bodyText('El siguiente análisis compara el Costo Total de Propiedad (TCO) de la infraestructura actual, una migración completa a nube pública, y la propuesta HPE GreenLake como modelo "as-a-Service" on-premise.'),
            emptyParagraph(100),
        );

        // Key Metrics Box
        children.push(
            styledParagraph('Métricas Clave:', { bold: true, size: 22, spacingAfter: 100 }),
        );

        const metricsRow = new TableRow({
            children: [
                metricCell('Ahorro Total (5 Años)', fmt(financial.metrics.totalSavings)),
                metricCell('ROI', `${financial.metrics.roi.toFixed(1)}%`),
                metricCell('VPN', fmt(financial.metrics.npv)),
            ],
        });

        children.push(
            new Table({
                rows: [metricsRow],
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: noBorders(),
            }),
            emptyParagraph(200),
        );

        // Yearly comparison table
        if (financial.yearlyData?.length) {
            children.push(
                styledParagraph('Proyección de Costos Acumulados:', { bold: true, size: 20, spacingAfter: 100 }),
            );

            const yearHeader = new TableRow({
                tableHeader: true,
                children: [
                    headerCell('Año', 15),
                    headerCell('Infraestructura Tradicional', 28),
                    headerCell('Nube Pública', 28),
                    headerCell('HPE GreenLake', 29),
                ],
            });

            const yearRows = financial.yearlyData.map((yr: any, idx: number) =>
                new TableRow({
                    children: [
                        dataCell(`Año ${yr.year}`, true, idx % 2 === 1),
                        dataCell(fmt(yr.traditionalCumulative), false, idx % 2 === 1),
                        dataCell(fmt(yr.cloudCumulative), false, idx % 2 === 1),
                        dataCell(fmt(yr.greenlakeCumulative), true, idx % 2 === 1, HPE_GREEN),
                    ],
                })
            );

            children.push(createTable([yearHeader, ...yearRows]));
            children.push(emptyParagraph(100));
        }

        children.push(
            bodyText('La propuesta HPE GreenLake ofrece un modelo de consumo flexible (OpEx) que elimina el sobreaprovisionamiento, reduce el riesgo financiero y permite escalar la infraestructura según demanda real con capacidad de buffer incluida.'),
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // SECTION 3: COMPETITIVE ANALYSIS
    // ═══════════════════════════════════════════════════════════════════
    if (comparator?.comparisons?.length) {
        sectionNumber++;
        children.push(
            sectionTitle(`${sectionNumber}. Análisis Competitivo`, true),
            bodyText(`A continuación se presenta la comparativa técnico-comercial entre la solución HPE ${comparator.solutionName} y ${comparator.competitorName} ${comparator.competitorSolution}.`),
            emptyParagraph(100),
        );

        // Competition table
        const compHeader = new TableRow({
            tableHeader: true,
            children: [
                headerCell('Categoría', 14),
                headerCell('Criterio', 16),
                headerCell(`HPE ${comparator.solutionName}`, 25),
                headerCell(`${comparator.competitorName} (${comparator.competitorSolution})`, 25),
                headerCell('Ventaja HPE', 20),
            ],
        });

        const compRows = comparator.comparisons.map((comp: any, idx: number) =>
            new TableRow({
                children: [
                    dataCell(comp.category || '', true, idx % 2 === 1),
                    dataCell(comp.feature || '', true, idx % 2 === 1),
                    dataCell(comp.hpe || '', false, idx % 2 === 1, comp.hpeIsBetter ? HPE_GREEN : undefined),
                    dataCell(comp.competitor || '', false, idx % 2 === 1),
                    dataCell(comp.hpeAdvantage || '', false, idx % 2 === 1),
                ],
            })
        );

        children.push(createTable([compHeader, ...compRows]));
        children.push(emptyParagraph(100));

        // Count advantages
        const hpeWins = comparator.comparisons.filter((c: any) => c.hpeIsBetter).length;
        const total = comparator.comparisons.length;
        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: `HPE ${comparator.solutionName} demuestra ventajas claras en `, size: 20 }),
                    new TextRun({ text: `${hpeWins} de ${total}`, bold: true, size: 20, color: HPE_GREEN }),
                    new TextRun({ text: ` criterios evaluados, posicionándose como la alternativa superior para este escenario.`, size: 20 }),
                ],
                spacing: { after: 200 },
            })
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // CONCLUSION
    // ═══════════════════════════════════════════════════════════════════
    children.push(
        sectionTitle('Conclusión y Próximos Pasos', true),
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
                    margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch = 1440 twips
                },
            },
            children,
        }],
    });

    const blob = await Packer.toBlob(doc);
    const safeDateStr = new Date().toISOString().split('T')[0];
    saveAs(blob, `Propuesta_HPE_${safeDateStr}.docx`);
}

// ── Helper Functions ─────────────────────────────────────────────────

function formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
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

// ── Table Helpers ────────────────────────────────────────────────────

function headerCell(text: string, widthPct: number) {
    return new TableCell({
        children: [new Paragraph({
            children: [new TextRun({ text, bold: true, color: WHITE, size: 18, font: 'Calibri' })],
            spacing: { before: 40, after: 40 },
        })],
        width: { size: widthPct, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: TABLE_HEADER_BG, fill: TABLE_HEADER_BG },
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
    });
}

function dataCell(text: string, bold: boolean = false, altRow: boolean = false, color?: string) {
    const bg = altRow ? TABLE_ALT_BG : WHITE;
    return new TableCell({
        children: [new Paragraph({
            children: [new TextRun({ text, bold, size: 18, color: color || '333333', font: 'Calibri' })],
            spacing: { before: 20, after: 20 },
        })],
        shading: { type: ShadingType.SOLID, color: bg, fill: bg },
        margins: { top: 30, bottom: 30, left: 80, right: 80 },
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
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
        },
    });
}

function createTable(rows: TableRow[]) {
    return new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
        },
    });
}

function noBorders() {
    return {
        top: { style: BorderStyle.NONE, size: 0 },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
        insideHorizontal: { style: BorderStyle.NONE, size: 0 },
        insideVertical: { style: BorderStyle.NONE, size: 0 },
    };
}
