'use client';

import { useState } from 'react';
import { ASSESSMENT_QUESTIONS, Question, AnswerOption } from '@/lib/assessment-data';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import AssessmentResults from './AssessmentResults';

export default function AssessmentWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isComplete, setIsComplete] = useState(false);

    const question = ASSESSMENT_QUESTIONS[currentStep];
    const totalSteps = ASSESSMENT_QUESTIONS.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const handleAnswer = (optionId: string) => {
        setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    };

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsComplete(true);
            console.log('Assessment Complete:', answers);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (isComplete) {
        return (
            <AssessmentResults
                answers={answers}
                onReset={() => {
                    setIsComplete(false);
                    setCurrentStep(0);
                    setAnswers({});
                }}
            />
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                    <span>Pregunta {currentStep + 1} de {totalSteps}</span>
                    <span>{Math.round(progress)}% Completado</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-brand-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${progress}%`, backgroundColor: '#01A982' }} // HPE Green
                    ></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6 md:p-8">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-4 uppercase tracking-wide">
                        {question.category.replace('-', ' ')}
                    </span>

                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                        {question.text}
                    </h2>

                    <div className="space-y-3">
                        {question.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleAnswer(option.id)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center group
                  ${answers[question.id] === option.id
                                        ? 'border-[#01A982] bg-green-50 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0
                  ${answers[question.id] === option.id ? 'border-[#01A982]' : 'border-gray-300 group-hover:border-gray-400'}`}
                                >
                                    {answers[question.id] === option.id && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#01A982]" />
                                    )}
                                </div>
                                <span className={`text-gray-700 ${answers[question.id] === option.id ? 'font-medium text-gray-900' : ''}`}>
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={`flex items-center text-sm font-medium px-4 py-2 rounded-md
              ${currentStep === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Anterior
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!answers[question.id]}
                        className={`flex items-center text-sm font-bold px-6 py-2.5 rounded-md transition-colors shadow-sm
              ${!answers[question.id]
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#01A982] text-white hover:bg-[#008f6d]'}`}
                    >
                        {currentStep === totalSteps - 1 ? 'Finalizar' : 'Siguiente'}
                        {currentStep !== totalSteps - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
