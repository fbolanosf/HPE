export const STORAGE_KEYS = {
    ASSESSMENT_RESULTS: 'hpe_toolkit_assessment',
    FINANCIAL_RESULTS: 'hpe_toolkit_financial',
    COMPARATOR_RESULTS: 'hpe_toolkit_comparator',
    CHART_IMAGES: 'hpe_toolkit_charts',
};

export function saveChartImage(chartKey: string, base64Data: string) {
    if (typeof window !== 'undefined') {
        try {
            const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHART_IMAGES) || '{}');
            existing[chartKey] = base64Data;
            localStorage.setItem(STORAGE_KEYS.CHART_IMAGES, JSON.stringify(existing));
        } catch (e) {
            // localStorage might be full, silently fail
            console.warn('Could not save chart image:', chartKey, e);
        }
    }
}

export function getChartImage(chartKey: string): string | null {
    if (typeof window !== 'undefined') {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHART_IMAGES) || '{}');
            return data[chartKey] || null;
        } catch {
            return null;
        }
    }
    return null;
}

export function getAllChartImages(): Record<string, string> {
    if (typeof window !== 'undefined') {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHART_IMAGES) || '{}');
        } catch {
            return {};
        }
    }
    return {};
}

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

export function saveComparatorResults(data: any) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.COMPARATOR_RESULTS, JSON.stringify(data));
    }
}

export function getComparatorResults() {
    if (typeof window !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.COMPARATOR_RESULTS);
        return data ? JSON.parse(data) : null;
    }
    return null;
}
