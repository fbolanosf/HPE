import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, ShadingType, ImageRun, Footer, Header, PageNumber } from 'docx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import pptxgen from 'pptxgenjs';
import * as XLSX from 'xlsx';

// ── Color Definitions (HPE & Executive Palette) ──────────────────────
const COLORS = {
    HPE_GREEN: '01A982',
    HPE_DARK: '1B1B1B',
    GRAY_600: '4B5563',
    GRAY_100: 'F3F4F6',
    WHITE: 'FFFFFF',
    ACCENT: '0073BB', 
    BG_LIGHT: 'F9FAFB'
};

export interface ExportDiagram {
    data: string;
    width: number;
    height: number;
}

export class ChatExportService {
    /**
     * Export to DOCX (Word) with Executive Styling
     */
    static async toDocx(content: string, diagrams: ExportDiagram[] = []) {
        const lines = content.split('\n');
        
        // --- Cover Page ---
        const coverPage: any[] = [
            new Paragraph({ spacing: { before: 2000 } }),
            new Paragraph({
                children: [new TextRun({ text: 'HPE CEREBRO', bold: true, size: 52, color: COLORS.HPE_GREEN })],
                alignment: AlignmentType.CENTER
            }),
            new Paragraph({
                children: [new TextRun({ text: 'INTELIGENCIA DE PRODUCTOS Y ESTRATEGIA', size: 24, color: COLORS.GRAY_600 })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 3000 }
            }),
            new Paragraph({
                children: [new TextRun({ text: `FECHA DE GENERACIÓN: ${new Date().toLocaleDateString()}`, size: 20 })],
                alignment: AlignmentType.CENTER
            }),
            new Paragraph({ pageBreakBefore: true })
        ];

        const mainContent: any[] = [];
        let currentTable: string[][] = [];
        let inTable = false;

        for (const line of lines) {
            if (line.startsWith('# ')) {
                mainContent.push(new Paragraph({
                    text: line.replace('# ', '').toUpperCase(),
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 },
                    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COLORS.HPE_GREEN, space: 8 } }
                }));
            } else if (line.startsWith('## ')) {
                mainContent.push(new Paragraph({
                    text: line.replace('## ', ''),
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 150 }
                }));
            } else if (line.startsWith('|') && line.includes('---')) {
                inTable = true;
                continue;
            } else if (line.startsWith('|')) {
                const cells = line.split('|')
                    .filter(c => c.trim() !== '')
                    .map(c => c.trim().replace(/\*\*/g, '')); // Sanitize Bold Markers
                if (cells.length > 0) currentTable.push(cells);
            } else {
                if (inTable && currentTable.length > 0) {
                    mainContent.push(this.createDocxTable(currentTable));
                    currentTable = [];
                    inTable = false;
                }
                if (line.trim()) {
                    mainContent.push(new Paragraph({
                        children: [new TextRun({ text: line.trim(), size: 22 })],
                        spacing: { after: 120 }
                    }));
                }
            }
        }

        // Diagrams
        for (const diag of diagrams) {
            try {
                const buffer = this.base64ToArrayBuffer(diag.data);
                const maxWidth = 550;
                const imgWidth = Math.min(diag.width, maxWidth);
                const imgHeight = (diag.height / diag.width) * imgWidth;

                mainContent.push(new Paragraph({
                    children: [new ImageRun({ 
                        data: buffer, 
                        transformation: { width: imgWidth, height: imgHeight }, 
                        type: 'png' 
                    })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400, after: 400 }
                }));
            } catch (e) {}
        }

        const doc = new Document({
            sections: [{
                headers: {
                    default: new Header({
                        children: [new Paragraph({
                            children: [new TextRun({ text: "HPE CEREBRO - CONFIDENCIAL", size: 16, color: COLORS.HPE_GREEN })],
                            alignment: AlignmentType.RIGHT
                        })]
                    })
                },
                footers: {
                    default: new Footer({
                        children: [new Paragraph({
                            children: [new TextRun({ text: "Página ", size: 16 }), new TextRun({ children: [PageNumber.CURRENT], size: 16 })],
                            alignment: AlignmentType.CENTER
                        })]
                    })
                },
                children: [...coverPage, ...mainContent]
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `HPE_Cerebro_Report_${this.getTimestamp()}.docx`);
    }

    /**
     * Export to PDF
     */
    static async toPdf(content: string, diagrams: ExportDiagram[] = []) {
        const doc = new jsPDF();
        let y = 30;
        const margin = 20; // Correct professional margins
        const pageWidth = 210;
        const contentWidth = pageWidth - (margin * 2);

        // --- Branding Header & Footer ---
        const drawHeader = () => {
            doc.setFillColor(1, 169, 130); // HPE Green
            doc.rect(0, 0, pageWidth, 18, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text("HPE SALES STRATEGY | REPORTE TÉCNICO EJECUTIVO", margin, 11);
            doc.setFont("helvetica", "normal");
            doc.text(new Date().toLocaleDateString(), pageWidth - margin, 11, { align: 'right' });
        };

        const drawFooter = (pageNumber: number) => {
            doc.setFontSize(8);
            doc.setTextColor(107, 114, 128); // Gray 500
            doc.text(`CONFIDENCIAL | HPE SALES INTELLIGENCE`, margin, 285);
            doc.text(`Página ${pageNumber}`, pageWidth - margin, 285, { align: 'right' });
        };

        let currentPage = 1;
        drawHeader();
        drawFooter(currentPage);
        doc.setTextColor(31, 41, 55); // Slate 800

        const lines = content.split('\n');
        let currentTable: string[][] = [];
        let inCodeBlock = false;
        let inReferencesSection = false;
        let diagramIndex = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line && !currentTable.length) { y += 4; continue; }

            // Page Break Safety (General)
            if (y > 270) {
                doc.addPage();
                currentPage++;
                drawHeader();
                drawFooter(currentPage);
                y = 30;
            }

            // 1. Handle Code Blocks & Diagram Injection
            if (line.startsWith('```')) {
                if (!inCodeBlock && line.includes('mermaid')) {
                        if (diagrams[diagramIndex]) {
                            const diag = diagrams[diagramIndex];
                            const imgWidth = contentWidth;
                            const imgHeight = (diag.height / diag.width) * imgWidth;
                            
                            // Diagrams need space (imgHeight + padding)
                            if (y + imgHeight > 270) { 
                                doc.addPage(); 
                                currentPage++; 
                                drawHeader(); 
                                drawFooter(currentPage); 
                                y = 30; 
                            }
                            try {
                                doc.addImage(diag.data, 'JPEG', margin, y, imgWidth, imgHeight, undefined, 'FAST');
                                y += imgHeight + 10;
                                diagramIndex++;
                            } catch (e) { console.error("PDF Image Error:", e); }
                        }
                }
                inCodeBlock = !inCodeBlock;
                continue;
            }
            if (inCodeBlock) continue;

            // 2. Handle Markdown Tables with autoTable
            if (line.startsWith('|')) {
                if (line.includes('---')) continue;
                const cells = line.split('|')
                    .filter(c => c.trim() !== '')
                    .map(c => c.trim().replace(/\*\*/g, '')); // Remove markdown bold
                if (cells.length > 0) currentTable.push(cells);
                
                const nextLine = lines[i+1]?.trim() || '';
                if (!nextLine.startsWith('|')) {
                    autoTable(doc, {
                        head: [currentTable[0]],
                        body: currentTable.slice(1),
                        startY: y,
                        margin: { left: margin, right: margin },
                        styles: { fontSize: 8, cellPadding: 3, font: 'helvetica' },
                        headStyles: { fillColor: [1, 169, 130], textColor: 255, fontStyle: 'bold' },
                        alternateRowStyles: { fillColor: [249, 250, 251] },
                        showHead: 'everyPage', // Repeat headers on each page
                        rowPageBreak: 'avoid', // Don't split rows across pages
                        didDrawPage: (data) => {
                            if (data.pageNumber > 1 && data.pageNumber > currentPage) {
                                currentPage = data.pageNumber;
                                drawHeader();
                                drawFooter(currentPage);
                            }
                        }
                    });
                    y = (doc as any).lastAutoTable.finalY + 12;
                    currentTable = [];
                }
                continue;
            }

            // 3. Handle Headers (with Lookahead)
            if (line.startsWith('#')) {
                const isH1 = line.startsWith('#') && !line.startsWith('##');
                const text = line.replace(/[#*]/g, '').trim().toUpperCase(); // Strip ALL # and *
                
                // LOOKAHEAD: If too close to bottom, move to next page
                if (y > 230) {
                    doc.addPage();
                    currentPage++;
                    drawHeader();
                    drawFooter(currentPage);
                    y = 30;
                }

                doc.setFont("helvetica", "bold");
                doc.setFontSize(isH1 ? 14 : 11);
                
                if (isH1) {
                    doc.setTextColor(1, 169, 130);
                    doc.line(margin, y + 2, pageWidth - margin, y + 2);
                    y += 3;
                } else {
                    doc.setTextColor(31, 41, 55);
                }
                
                doc.text(text, margin, y + 5);
                y += 14;
                doc.setFont("helvetica", "normal");
                doc.setTextColor(31, 41, 55);

                // Specifically track the References section for styling
                if (text.includes('REFERENCIAS') || text.includes('FUENTES')) {
                    inReferencesSection = true;
                } else {
                    inReferencesSection = false;
                }
                continue;
            }

            // 4. Regular Text (Sanitized, Justified & Inline Bold)
            if (line === '---' || line === '***' || line === '___') {
                y += 4;
                continue;
            }
            
            if (inReferencesSection) {
                doc.setFontSize(8.5);
                doc.setTextColor(75, 85, 99); // Gray 600 for footnotes
            } else {
                doc.setFontSize(10);
                doc.setTextColor(31, 41, 55);
            }

            const sanitized = line.replace(/[^\x20-\x7E\u00C0-\u00FF]/g, ' ');
            
            if (sanitized.trim()) {
                y = this.renderJustifiedTextWithBold(doc, sanitized, margin, y, contentWidth);
                y += 2;
            } else {
                y += 4;
            }
        }

        doc.save(`HPE_Executive_Report_${this.getTimestamp()}.pdf`);
    }

    /**
     * Export to XLS
     */
    static async toXls(content: string) {
        const wb = XLSX.utils.book_new();
        let tablesFound = 0;
        let currentTable: any[] = [];
        
        content.split('\n').forEach(line => {
            if (line.startsWith('|') && !line.includes('---')) {
                const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
                if (cells.length) currentTable.push(cells);
            } else if (currentTable.length) {
                const ws = XLSX.utils.aoa_to_sheet(currentTable);
                XLSX.utils.book_append_sheet(wb, ws, `Tabla ${++tablesFound}`);
                currentTable = [];
            }
        });

        if (tablesFound === 0) {
            const ws = XLSX.utils.aoa_to_sheet([["Contenido", content]]);
            XLSX.utils.book_append_sheet(wb, ws, "Resumen");
        }

        XLSX.writeFile(wb, `HPE_Cerebro_Data_${this.getTimestamp()}.xlsx`);
    }

    /**
     * Export to PPTX (Professional "Big 4" Aesthetic)
     */
    static async toPpt(content: string, diagrams: ExportDiagram[] = []) {
        const pptx = new pptxgen();
        pptx.layout = 'LAYOUT_16x9';

        // 1. Cover Slide
        const cover = pptx.addSlide();
        cover.background = { color: 'FFFFFF' };
        cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: COLORS.HPE_GREEN } });
        cover.addText("HPE CEREBRO", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: COLORS.HPE_GREEN });
        cover.addText("INTELIGENCIA ESTRATÉGICA\nDE PRODUCTOS", {
            x: 0, y: '40%', w: '100%', align: 'center', fontSize: 44, bold: true, color: '1B1B1B'
        });
        cover.addText(`Fecha: ${new Date().toLocaleDateString()}`, { x: 0, y: '85%', w: '100%', align: 'center', fontSize: 14, color: COLORS.GRAY_600 });

        // 2. Parse Content into Slides (Improved with Tables)
        const sections = content.split(/(?=^## )/m);
        for (const section of sections) {
            const lines = section.split('\n').filter(l => l.trim());
            if (lines.length === 0) continue;

            const title = lines[0].replace(/## |# /g, '');
            const bodyLines: string[] = [];
            const tables: string[][][] = [];
            let currentTable: string[][] = [];
            let inTable = false;

            lines.slice(1).forEach(line => {
                if (line.startsWith('|') && line.includes('---')) {
                    inTable = true;
                } else if (line.startsWith('|')) {
                    const cells = line.split('|')
                        .filter(c => c.trim() !== '')
                        .map(c => c.trim().replace(/\*\*/g, '')); // Remove Bold Markers
                    if (cells.length > 0) currentTable.push(cells);
                } else {
                    if (inTable && currentTable.length > 0) {
                        tables.push(currentTable);
                        currentTable = [];
                        inTable = false;
                    }
                    bodyLines.push(line);
                }
            });
            if (currentTable.length > 0) tables.push(currentTable);

            // Create Slide for Text
            const slide = pptx.addSlide();
            slide.background = { color: 'FFFFFF' };
            slide.addText(title, { x: 0.5, y: 0.3, w: 9, fontSize: 32, bold: true, color: COLORS.HPE_GREEN });
            
            if (bodyLines.length > 0) {
                slide.addText(bodyLines.join('\n'), {
                    x: 0.5, y: 1.2, w: 9, h: 3.5, fontSize: 16, color: '333333', valign: 'top'
                });
            }

            // If there's a table, create a dedicated slide for it
            tables.forEach(tableData => {
                const tSlide = pptx.addSlide();
                tSlide.addText(`${title} - Detalle`, { x: 0.5, y: 0.3, w: 9, fontSize: 24, bold: true, color: COLORS.HPE_GREEN });
                const rows = tableData.map((row, i) => 
                    row.map(cell => ({ 
                        text: cell, 
                        options: { 
                            fill: { color: i === 0 ? COLORS.HPE_GREEN : (i % 2 === 0 ? COLORS.GRAY_100 : COLORS.WHITE) },
                            color: i === 0 ? COLORS.WHITE : '333333',
                            bold: i === 0,
                            fontSize: 12
                        } 
                    }))
                );
                tSlide.addTable(rows, { x: 0.5, y: 1.0, w: 9, border: { type: 'solid', color: 'E5E7EB', pt: 1 } });
            });
        }

        // 3. Diagram Slides
        diagrams.forEach((diag, i) => {
            const slide = pptx.addSlide();
            slide.addText(`Arquitectura de Referencia ${i + 1}`, { x: 0.5, y: 0.3, fontSize: 28, bold: true, color: COLORS.HPE_GREEN });
            
            // Standard slide: 10 x 5.625 inches (16x9 default in pptxgenjs)
            const maxW = 9;
            const maxH = 4.5;
            let imgW = maxW;
            let imgH = (diag.height / diag.width) * imgW;
            
            if (imgH > maxH) {
                imgH = maxH;
                imgW = (diag.width / diag.height) * imgH;
            }
            
            slide.addImage({ 
                data: diag.data, 
                x: (10 - imgW) / 2, 
                y: 1.2, 
                w: imgW, 
                h: imgH 
            });
        });

        pptx.writeFile({ fileName: `HPE_Cerebro_Presentation_${this.getTimestamp()}.pptx` });
    }

    // --- Helpers ---
    private static createDocxTable(data: string[][]) {
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: data.map((row, idx) => new TableRow({
                children: row.map(cell => new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: cell, bold: idx === 0, color: idx === 0 ? COLORS.WHITE : COLORS.HPE_DARK, size: 20 })],
                        alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: idx === 0 ? COLORS.HPE_GREEN : (idx % 2 === 0 ? COLORS.GRAY_100 : COLORS.WHITE) }
                }))
            }))
        });
    }

    private static renderJustifiedTextWithBold(doc: jsPDF, text: string, x: number, y: number, width: number): number {
        const fontSize = doc.getFontSize();
        const lineHeight = fontSize * 0.5;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        
        // This is a complex task for jsPDF. We'll simulate justification by:
        // 1. Calculating full line widths
        // 2. Adjusting word spacing for all but the last line
        
        // First, get all segments with their styling
        const segments = parts.map(part => {
            const isBold = part.startsWith('**') && part.endsWith('**');
            return {
                text: isBold ? part.slice(2, -2) : part,
                bold: isBold
            };
        }).filter(s => s.text.length > 0);

        // Break segments into lines
        let currentLine: any[] = [];
        let currentLineWidth = 0;
        const lines: any[][] = [];

        segments.forEach(seg => {
            const words = seg.text.split(' ');
            words.forEach((word, idx) => {
                if (word === '' && idx > 0) return; // Skip extra spaces
                
                doc.setFont("helvetica", seg.bold ? "bold" : "normal");
                const wordWidth = doc.getTextWidth(word + ' ');
                
                if (currentLineWidth + wordWidth > width && currentLine.length > 0) {
                    lines.push(currentLine);
                    currentLine = [];
                    currentLineWidth = 0;
                }
                
                currentLine.push({ text: word, bold: seg.bold, width: wordWidth });
                currentLineWidth += wordWidth;
            });
        });
        if (currentLine.length > 0) lines.push(currentLine);

        // Render lines
        lines.forEach((line, lineIdx) => {
            const isLastLine = lineIdx === lines.length - 1;
            let currentX = x;
            
            // Calculate extra spacing for justification
            let extraSpace = 0;
            if (!isLastLine && line.length > 1) {
                const totalWordWidth = line.reduce((sum, w) => {
                    doc.setFont("helvetica", w.bold ? "bold" : "normal");
                    return sum + doc.getTextWidth(w.text);
                }, 0);
                extraSpace = (width - totalWordWidth) / (line.length - 1);
            } else {
                extraSpace = doc.getTextWidth(' ');
            }

            line.forEach((wordObj, wordIdx) => {
                doc.setFont("helvetica", wordObj.bold ? "bold" : "normal");
                doc.text(wordObj.text, currentX, y);
                currentX += doc.getTextWidth(wordObj.text) + extraSpace;
            });
            y += lineHeight + 2;
        });

        return y;
    }

    private static getTimestamp() { return new Date().toISOString().slice(0, 10); }

    private static base64ToArrayBuffer(base64: string) {
        const binaryString = window.atob(base64.split(',')[1]);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
}
