import AssessmentWizard from '@/components/forms/AssessmentWizard';

export default function AssessmentPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Evaluación de Infraestructura
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Analice el estado actual de su entorno de TI para identificar oportunidades de optimización con soluciones HPE.
                    </p>
                </div>

                <AssessmentWizard />
            </div>
        </div>
    );
}
