import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { getAssessmentResults, getFinancialResults } from './storage';

export async function generateProposalDocument() {
    const assessment = getAssessmentResults();
    const financial = getFinancialResults();
    const dateStr = new Date().toLocaleDateString();

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    // Title Page
                    new Paragraph({
                        text: "Propuesta de Transformación Digital HPE",
                        heading: HeadingLevel.TITLE,
                        alignment: "center",
                        spacing: { after: 300 },
                    }),
                    new Paragraph({
                        text: `Fecha: ${dateStr}`,
                        alignment: "center",
                        spacing: { after: 500 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Preparado para:",
                                bold: true,
                                break: 1,
                            }),
                            new TextRun({
                                text: " [Nombre del Cliente]",
                                break: 1,
                            }),
                        ],
                        spacing: { after: 800 },
                    }),

                    // Executive Summary
                    new Paragraph({
                        text: "Resumen Ejecutivo",
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 },
                    }),
                    new Paragraph({
                        text: "Basado en nuestro análisis de su infraestructura actual y objetivos de negocio, HPE propone una modernización estratégica utilizando soluciones de Nube Híbrida GreenLake y Almacenamiento Inteligente.",
                    }),

                    // Assessment Section
                    new Paragraph({
                        text: "1. Análisis de Brecha (GAP Analysis)",
                        heading: HeadingLevel.HEADING_1,
                        pageBreakBefore: true,
                        spacing: { before: 400, after: 200 },
                    }),
                    assessment ? new Paragraph({
                        text: "Resultados de la evaluación preliminar:",
                        spacing: { after: 200 },
                    }) : new Paragraph({ text: "No se encontraron datos de evaluación." }),

                    ...(assessment ? createAssessmentTable(assessment) : []),

                    // Financial Section
                    new Paragraph({
                        text: "2. Análisis Financiero (TCO & ROI)",
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 },
                    }),
                    financial ? new Paragraph({
                        children: [
                            new TextRun({
                                text: `Ahorro Total Estimado (5 Años): ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financial.metrics.totalSavings)}`,
                                bold: true,
                            }),
                            new TextRun({
                                text: `\nRetorno de Inversión (ROI): ${financial.metrics.roiUnknown.toFixed(1)}%`,
                                break: 1,
                            }),
                        ],
                        spacing: { after: 200 },
                    }) : new Paragraph({ text: "No se encontraron datos financieros." }),

                    new Paragraph({
                        text: "La propuesta de HPE GreenLake ofrece un modelo de consumo flexible (OpEx) que elimina el sobreaprovisionamiento y reduce el riesgo financiero.",
                        spacing: { before: 200 },
                    }),

                    // Conclusion
                    new Paragraph({
                        text: "Conclusión y Próximos Pasos",
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 },
                    }),
                    new Paragraph({
                        text: "Recomendamos proceder con una Prueba de Concepto (PoC) de HPE Alletra dHCI para validar el rendimiento y la facilidad de gestión.",
                    }),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Propuesta_HPE_${dateStr.replace(/\//g, '-')}.docx`);
}

function createAssessmentTable(assessmentData: any) {
    if (!assessmentData || !assessmentData.answers) return [];

    // Simple table transforming answers to rows
    const rows = Object.entries(assessmentData.answers).map(([key, val]) => {
        return new TableRow({
            children: [
                new TableCell({ children: [new Paragraph(key)], width: { size: 50, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph(String(val))], width: { size: 50, type: WidthType.PERCENTAGE } }),
            ],
        });
    });

    return [
        new Table({
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Pregunta", bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Respuesta / ID", bold: true })] })] }),
                    ],
                }),
                ...rows
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
        })
    ];
}
