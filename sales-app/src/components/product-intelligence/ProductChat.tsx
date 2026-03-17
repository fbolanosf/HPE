'use client';

import { useState, useRef, useEffect } from 'react';
import { 
    Send, 
    Bot, 
    User, 
    Loader2, 
    Sparkles, 
    Maximize2, 
    Minimize2,
    Download,
    PlusCircle,
    MessageSquare,
    Brain,
    FileText,
    FileSpreadsheet,
    Presentation,
    FileDown
} from 'lucide-react';
import { ChatMessage } from '@/lib/product-portfolio-data';
import { getGeminiResponse } from '@/lib/gemini-service';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { ChatExportService, ExportDiagram } from '@/lib/chat-export-service';
import React, { memo } from 'react';

// Initialize Mermaid with Elite "Big 4" settings
if (typeof window !== 'undefined') {
    mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
            primaryColor: '#01A982',
            primaryTextColor: '#ffffff',
            primaryBorderColor: '#018a6a',
            lineColor: '#425563',
            secondaryColor: '#FF8300',
            tertiaryColor: '#f9f9f9',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            clusterBkg: '#f8fafc',
            clusterBorder: '#cbd5e1',
            edgeLabelBackground: '#ffffff'
        },
        themeCSS: `
            .node rect, .node circle, .node polygon, .node path { 
                stroke-width: 2px !important;
                filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
            }
            .cluster rect {
                fill: #f8fafc !important;
                stroke: #cbd5e1 !important;
                stroke-width: 2px !important;
                stroke-dasharray: 4 !important;
                rx: 16px !important;
                margin: 20px !important;
            }
            .edgePath path {
                stroke-width: 3.5px !important;
                stroke: #64748b !important; /* Re-added !important to ensure visibility */
            }
            .label {
                font-family: 'Inter', sans-serif !important;
                font-weight: 700 !important;
                letter-spacing: -0.01em !important;
                fill: #1e293b !important;
            }
        `,
        flowchart: {
            htmlLabels: false, // Ensure robust SVG-to-Canvas capture
            curve: 'stepAfter', // Clean orthogonal lines
            padding: 40, // Breathing room for labels
            useMaxWidth: true,
            rankSpacing: 180, // Vertical space to avoid overlaps
            nodeSpacing: 160, // Horizontal space for symmetry
            ranker: 'network-simplex',
            defaultInterpolation: 'step'
        } as any,
        securityLevel: 'loose'
    } as any);
}

// Memoized Mermaid Renderer Component
const MermaidChart = memo(({ chart }: { chart: string }) => {
    const [svg, setSvg] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);
    // Stable ID for rendering to avoid infinite loops
    const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);
    const id = idRef.current;

    useEffect(() => {
        let isMounted = true;
        const render = async () => {
            try {
                // Clear previous to avoid flickering
                const { svg: renderedSvg } = await mermaid.render(id, chart);
                if (isMounted) setSvg(renderedSvg);
            } catch (error) {
                console.error('Mermaid render error:', error);
            }
        };
        render();
        return () => { isMounted = false; };
    }, [chart, id]);

    const handleDownload = async () => {
        if (!svg) return;
        try {
            console.log("Iniciando descarga ligera de imagen...");
            // NATIVE SVG-TO-CANVAS (Zero CPU Overhead)
            const img = new Image();
            const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const bbox = containerRef.current?.getBoundingClientRect();
                // 4x Resolution for "Print Quality"
                const scale = 4;
                canvas.width = (bbox?.width || 800) * scale;
                canvas.height = (bbox?.height || 600) * scale;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const link = document.createElement('a');
                    link.download = `HPE-Big4-Architecture-${Date.now()}.png`;
                    link.href = canvas.toDataURL('image/png', 1.0);
                    link.click();
                }
                URL.revokeObjectURL(url);
                console.log("Descarga completada.");
            };
            img.src = url;
        } catch (e: any) {
            console.error('Download error:', e);
            alert("Error al descargar: " + e.message);
        }
    };

    return (
        <div className="relative group my-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/10 to-teal-600/10 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div 
                ref={containerRef}
                className="relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl overflow-x-auto flex justify-center mermaid-capture transition-all duration-300 group-hover:border-teal-200"
                dangerouslySetInnerHTML={{ __html: svg }}
            />
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white shadow-2xl rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all active:scale-95 border border-white/10"
                >
                    <Download className="h-3 w-3" /> Descargar PNG High-Res
                </button>
            </div>
        </div>
    );
});

// Markdown component factory to handle exports
const createMarkdownComponents = (onExportTable?: (content: string) => void) => ({
    code({ node, inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '');
        if (!inline && match && match[1] === 'mermaid') {
            return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
        }
        return (
            <code className={`${className} bg-slate-100 px-1 py-0.5 rounded text-slate-800`} {...props}>
                {children}
            </code>
        );
    },
    h1: ({ children }: any) => <h1 className="text-2xl font-black text-slate-900 mb-4 mt-6 tracking-tight border-b-2 border-teal-500 pb-1 inline-block">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-bold text-slate-800 mb-3 mt-5 tracking-tight">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-bold text-teal-700 mb-2 mt-4">{children}</h3>,
    p: ({ children }: any) => <p className="mb-4 last:mb-0 text-slate-700 leading-relaxed font-medium">{children}</p>,
    ul: ({ children }: any) => <ul className="list-none space-y-2 mb-4 ml-2">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal space-y-2 mb-4 ml-6 text-slate-700">{children}</ol>,
    li: ({ children }: any) => (
        <li className="flex gap-3 items-start group">
            <span className="h-5 w-5 rounded-full bg-[#01A982]/10 text-[#01A982] flex items-center justify-center text-[10px] font-black group-hover:bg-[#01A982] group-hover:text-white transition-all shrink-0 mt-0.5">•</span>
            <span>{children}</span>
        </li>
    ),
    blockquote: ({ children }: any) => (
        <div className="border-l-4 border-[#01A982] bg-[#01A982]/5 p-4 rounded-r-2xl my-6 text-slate-700 italic font-medium shadow-sm">
            {children}
        </div>
    ),
    table: ({ children, node }: any) => {
        const handleExportTable = () => {
            if (onExportTable) {
                // Better heuristic: find all text in the table subtree
                const rows = node.children.filter((n: any) => n.type === 'element' && n.tagName === 'tr' || n.tagName === 'thead' || n.tagName === 'tbody');
                let tableText = '';
                
                const processNode = (n: any): string => {
                    if (n.type === 'text') return n.value;
                    if (n.children) return n.children.map(processNode).join('');
                    return '';
                };

                // Reconstruct table markdown for the exporter
                const headers = node.children.find((n: any) => n.tagName === 'thead')?.children.find((n: any) => n.tagName === 'tr')?.children.filter((n: any) => n.tagName === 'th');
                const bodyRows = node.children.find((n: any) => n.tagName === 'tbody')?.children.filter((n: any) => n.tagName === 'tr');

                if (headers) {
                    tableText += '| ' + headers.map((h: any) => processNode(h)).join(' | ') + ' |\n';
                    tableText += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
                }
                if (bodyRows) {
                    bodyRows.forEach((r: any) => {
                        const cells = r.children.filter((c: any) => c.tagName === 'td');
                        tableText += '| ' + cells.map((c: any) => processNode(c)).join(' | ') + ' |\n';
                    });
                }

                if (tableText) onExportTable(tableText);
                else onExportTable(node.children.map(processNode).join(' ')); // Fallback
            }
        };

        return (
            <div className="my-8 relative group/table">
                <div className="overflow-x-auto border border-slate-200 rounded-3xl shadow-sm bg-white p-1">
                    <table className="w-full text-[11px] text-left text-slate-600 border-collapse">
                        {children}
                    </table>
                </div>
                <button 
                    onClick={handleExportTable}
                    className="absolute -top-3 -right-3 bg-white border border-slate-200 shadow-xl p-2 rounded-xl text-[#01A982] hover:bg-[#01A982] hover:text-white transition-all opacity-0 group-hover/table:opacity-100 flex items-center gap-2 text-[10px] font-bold"
                >
                    <FileSpreadsheet className="h-3 w-3" /> EXCEL
                </button>
            </div>
        );
    },
    th: ({ children }: any) => <th className="px-6 py-4 bg-slate-50 font-black text-slate-900 uppercase tracking-widest text-[9px] border-b border-slate-100">{children}</th>,
    td: ({ children }: any) => <td className="px-6 py-4 border-t border-slate-50">{children}</td>
});

// Memoized Message Item Component
const MessageItem = memo(({ message, onExport }: { message: ChatMessage, onExport?: (format: 'docx' | 'pdf' | 'xls' | 'ppt', specificContent?: string) => void }) => {
    const components = createMarkdownComponents((tableContent) => onExport?.('xls', tableContent));

    return (
        <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 message-container group`}>
            <div className={`max-w-[85%] flex flex-col items-${message.role === 'user' ? 'end' : 'start'}`}>
                <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${message.role === 'user' ? 'bg-[#01A982] text-white' : 'bg-[#01A982] text-white'}`}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed markdown-body-content ${message.role === 'user' ? 'bg-[#F1F9F7] border border-[#01A982]/10 text-slate-800 rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={components as any}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </div>

                {message.role === 'assistant' && onExport && (
                    <div className="flex gap-2 mt-3 ml-11 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button 
                            onClick={() => onExport('docx')}
                            className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
                            title="Generar Propuesta Word"
                        >
                            <FileText className="h-3.5 w-3.5" /> WORD
                        </button>
                        <button 
                            onClick={() => onExport('pdf')}
                            className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-600 hover:text-red-600 hover:border-red-200 hover:shadow-md transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
                            title="Generar Resumen PDF"
                        >
                            <FileDown className="h-3.5 w-3.5" /> PDF
                        </button>
                        <button 
                            onClick={() => onExport('ppt')}
                            className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-600 hover:text-orange-600 hover:border-orange-200 hover:shadow-md transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
                            title="Generar Presentación PPTX"
                        >
                            <Presentation className="h-3.5 w-3.5" /> PPTX
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

// Memoized Input Component to ISOATE state and avoid full-chat re-renders on keystroke
const ChatInput = memo(({ onSend, isLoading }: { onSend: (text: string) => void, isLoading: boolean }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        onSend(input);
        setInput('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-4">
            <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu consulta estratégica o solicita un diagrama..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-inner"
            />
            <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-teal-600 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all shadow-lg hover:shadow-teal-500/20 active:scale-95"
            >
                <Send className="h-5 w-5" />
            </button>
        </form>
    );
});

export default function ProductChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hola, soy **HPE CEREBRO**. Tu motor de inteligencia de productos. Estoy aquí para apoyarte en lo que necesites. ¿Cómo puedo apoyarte?',
            timestamp: new Date().toLocaleTimeString()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isFullView, setIsFullView] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (text: string) => {
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const chatHistory = messages
                .filter((m, idx) => !(idx === 0 && m.role === 'assistant'))
                .map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    content: m.content
                }));
            
            const responseText = await getGeminiResponse(text, chatHistory);

            const assistantMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (error: any) {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `⚠️ **Error de Conexión:** ${error.message || 'No pude contactar al motor de IA en este momento.'}`,
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (format: 'docx' | 'pdf' | 'xls' | 'ppt', messageIndex?: number, specificContent?: string) => {
        console.log(`Iniciando exportación a ${format.toUpperCase()}...`);
        // Find the specific message or use the last one
        let targetMsg: ChatMessage | undefined;
        let targetMsgElement: Element | null = null;

        if (messageIndex !== undefined && messages[messageIndex]) {
            targetMsg = messages[messageIndex];
            const messageElements = document.querySelectorAll('.message-container');
            targetMsgElement = messageElements[messageIndex];
        } else {
            targetMsg = [...messages].reverse().find(m => m.role === 'assistant');
            const messageElements = document.querySelectorAll('.message-container');
            targetMsgElement = messageElements[messageElements.length - 1];
        }

        if (!targetMsg) return;

        // Use specific content if provided (e.g., for single table export)
        const exportContent = specificContent || targetMsg.content;

        setIsExporting(true);
        
        // STABILIZATION DELAY: Wait for Mermaid to settle
        await new Promise(r => setTimeout(r, 700));

        try {
            const diagrams: ExportDiagram[] = [];
            if (targetMsgElement) {
                // ONLY capture SVGs inside the markdown content, ignore avatars/icons
                const contentArea = targetMsgElement.querySelector('.markdown-body-content');
                const svgs = contentArea ? contentArea.querySelectorAll('svg') : targetMsgElement.querySelectorAll('.mermaid svg');
                
                for (const svgEl of Array.from(svgs)) {
                    // ROBUST CAPTURE: Ensure proper serialization and scaling
                    const serializer = new XMLSerializer();
                    let svgString = serializer.serializeToString(svgEl);
                    
                    // Cleanup for browser compatibility (remove potentially problematic namespaces)
                    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
                        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
                    }
                    
                    const canvas = document.createElement('canvas');
                    const svgSize = svgEl.getBoundingClientRect();
                    const scale = 2; // High-res capture for reports
                    
                    // Safety check for invalid dimensions
                    const width = Math.max(svgSize.width, 100);
                    const height = Math.max(svgSize.height, 100);
                    
                    canvas.width = width * scale;
                    canvas.height = height * scale;
                    
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        const img = new Image();
                        // Encode to base64 to avoid URL.createObjectURL issues in certain headers
                        const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
                        const url = `data:image/svg+xml;base64,${svgBase64}`;
                        
                        try {
                            await new Promise((resolve, reject) => {
                                img.onload = () => {
                                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                    resolve(null);
                                };
                                img.onerror = () => reject(new Error("Failed to load SVG for export"));
                                img.src = url;
                                // Timeout fallback
                                setTimeout(() => resolve(null), 1000);
                            });
                            
                            const jpegData = canvas.toDataURL('image/jpeg', 0.95);
                            if (jpegData.startsWith('data:image/jpeg')) {
                                diagrams.push({
                                    data: jpegData,
                                    width: width,
                                    height: height
                                });
                            }
                        } catch (e) {
                            console.warn("Skipping diagram due to capture error:", e);
                        }
                    }
                }
            }

            switch (format) {
                case 'docx': await ChatExportService.toDocx(exportContent, diagrams); break;
                case 'pdf': await ChatExportService.toPdf(exportContent, diagrams); break;
                case 'xls': await ChatExportService.toXls(exportContent); break;
                case 'ppt': await ChatExportService.toPpt(exportContent, diagrams); break;
            }
        } catch (e: any) {
            console.error("Export error:", e);
            alert("Error al exportar (" + format.toUpperCase() + "): " + (e.message || e));
        } finally {
            setIsExporting(false);
        }
    };

    const clearChat = () => {
        if (window.confirm('¿Quieres limpiar el historial de chat?')) {
            setMessages([messages[0]]);
        }
    };

    return (
        <div className={`flex flex-col bg-white border border-slate-200 shadow-2xl transition-all duration-500 overflow-hidden ${isFullView ? 'fixed inset-4 z-50 rounded-[2.5rem]' : 'h-[700px] rounded-[2.5rem] relative'}`}>
            {/* Header */}
            <header className="bg-[#01A982] px-6 py-4 flex items-center justify-between border-b border-teal-600">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl shadow-lg backdrop-blur-sm">
                        <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                            HPE CEREBRO <Sparkles className="h-3 w-3 text-white animate-pulse" />
                            {isExporting && (
                                <span className="ml-2 flex items-center gap-1.5 px-2 py-0.5 bg-white/20 rounded-md text-[9px] animate-pulse">
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> GENERANDO
                                </span>
                            )}
                        </h3>
                        <p className="text-[10px] text-white/80 font-medium">Motor de Inteligencia de Productos</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={clearChat}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider border border-white/10"
                        title="Nueva Conversación"
                    >
                        <PlusCircle className="h-3.5 w-3.5" /> Nuevo
                    </button>
                    <button 
                        onClick={() => setIsFullView(!isFullView)}
                        className="p-1.5 hover:bg-white/10 text-white rounded-lg transition-all"
                        title={isFullView ? "Salir de Pantalla Completa" : "Pantalla Completa"}
                    >
                        {isFullView ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
                {messages.map((m, idx) => (
                    <MessageItem key={m.id} message={m} onExport={(format, content) => handleExport(format, idx, content)} />
                ))}
                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                            <Loader2 className="h-4 w-4 text-teal-600 animate-spin" />
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Consultando Cerebro IA...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100">
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
        </div>
    );
}
