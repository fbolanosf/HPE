import Link from 'next/link';
import { BarChart3, Calculator, FileText, Server, Network } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-[#01A982] w-10 h-10 flex items-center justify-center text-white font-bold rounded">RPO</div>
            <h1 className="text-xl font-bold text-gray-900">Global Sales Specialist Toolkit</h1>
          </div>
          <div className="text-sm text-gray-500">v1.1.0</div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Channel <span className="text-[#01A982]">RPO</span> and Data Solutions Sales Toolkit
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Global assessment and partner intelligence platform for virtualization, storage, and HPE data solutions.
          </p>
          <p className="mt-3 text-xs text-gray-400 tracking-widest uppercase">Powered by RPO Engine · Managed by Francisco Bolaños</p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {/* Assessment Module */}
          <Link href="/assessment" className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#01A982] rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-[#01A982]">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-green-50 text-[#01A982] ring-4 ring-white">
                <BarChart3 className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium">
                <span className="absolute inset-0" aria-hidden="true" />
                Evaluación de Necesidades (Análisis GAP)
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Wizard interactivo por industria que evalúa el estado actual de su infraestructura IT e identifica brechas y oportunidades de optimización con soluciones HPE.
              </p>
            </div>
            <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
              </svg>
            </span>
          </Link>

          {/* Financial Module */}
          <Link href="/financial" className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-blue-500">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
                <Calculator className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                <span className="absolute inset-0" aria-hidden="true" />
                Análisis Financiero (TCO/ROI)
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Proyección de TCO a 5 años comparando infraestructura tradicional vs Nube Pública vs soluciones HPE (GreenLake, Morpheus, VM Essentials, Zerto, OpsRamp).
              </p>
            </div>
          </Link>

          {/* Comparator Module */}
          <Link href="/comparator" className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-purple-500">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
                <Server className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                <span className="absolute inset-0" aria-hidden="true" />
                Comparador de Soluciones
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Matriz competitiva de HPE vs competidores con comparación por categorías y diagramas de topología arquitectónica lado a lado.
              </p>
            </div>
          </Link>

          {/* Reports Module */}
          <Link href="/reports" className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-orange-500 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-orange-500">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-orange-50 text-orange-600 ring-4 ring-white">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                <span className="absolute inset-0" aria-hidden="true" />
                Generación de Propuesta
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Genera un informe ejecutivo en Word (.docx) consolidando los resultados del análisis GAP y la proyección financiera para presentar al cliente.
              </p>
            </div>
          </Link>

          {/* Partner Intelligence Module */}
          <Link href="/partner-intelligence" className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-indigo-500">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-600 ring-4 ring-white">
                <Network className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                <span className="absolute inset-0" aria-hidden="true" />
                Partner Intelligence (IT + OT)
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Mapa global de integradores IT y OT. Scoring automático de oportunidades HPE, análisis de ecosistemas de virtualización, automatización industrial e infraestructura edge.
              </p>
            </div>
          </Link>

        </div>
      </main>

      {/* Footer - IP Notice */}
      <footer className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200 pt-6 flex flex-col items-center space-y-1">
          <p className="text-[10px] text-gray-400 tracking-wide">
            © {new Date().getFullYear()} Francisco Bolaños · Todos los derechos reservados
          </p>
          <p className="text-[9px] text-gray-300 max-w-lg text-center leading-relaxed">
            Esta plataforma y su contenido constituyen propiedad intelectual protegida. Queda prohibida su reproducción, distribución o uso no autorizado sin consentimiento expreso del autor.
          </p>
        </div>
      </footer>
    </div>
  );
}
