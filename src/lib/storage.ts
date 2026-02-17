export const STORAGE_KEYS = {
    ASSESSMENT_RESULTS: 'hpe_toolkit_assessment',
    FINANCIAL_RESULTS: 'hpe_toolkit_financial',
};

export function saveAssessmentResults(data: any) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ASSESSMENT_RESULTS, JSON.stringify(data));
    }
}

export function getAssessmentResults() {
    if (typeof window !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_RESULTS);
        return data ? JSON.parse(data) : null;
    }
    return null;
}

export function saveFinancialResults(data: any) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.FINANCIAL_RESULTS, JSON.stringify(data));
    }
}

export function getFinancialResults() {
    if (typeof window !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.FINANCIAL_RESULTS);
        return data ? JSON.parse(data) : null;
    }
    return null;
}
