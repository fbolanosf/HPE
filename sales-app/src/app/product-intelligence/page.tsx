'use client';

import ProductChat from '@/components/product-intelligence/ProductChat';
import { ArrowLeft, Sparkles, Brain } from 'lucide-react';
import Link from 'next/link';

export default function ProductIntelligencePage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-100 selection:text-teal-900">
            {/* Minimalist Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/" 
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="h-8 w-[1px] bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <div className="bg-teal-500 p-2 rounded-xl shadow-lg shadow-teal-500/20">
                                <Brain className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">
                                    Product Intelligence Hub
                                </h1>
                                <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-1">
                                    v8.3.0 Experimental
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full border border-teal-100">
                        <Sparkles className="h-3 w-3 text-teal-600 animate-pulse" />
                        <span className="text-[10px] font-black text-teal-700 uppercase tracking-tighter">AI Expert Online</span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-10 text-center space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter sm:text-4xl">
                        Expert <span className="text-teal-600">Strategy</span> Bot
                    </h2>
                    <p className="text-slate-500 text-sm max-w-xl mx-auto font-medium">
                        Consulta técnica avanzada, comparativas de TCO y diseño de arquitecturas HPE mediante inteligencia artificial.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <ProductChat />
                </div>
                
                <footer className="mt-12 text-center">
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                        Powered by RPO Engine & Google Gemini
                    </p>
                </footer>
            </main>
        </div>
    );
}
