/**
 * customer-apollo-data.ts
 * Relational data extension for Apollo.io intelligence.
 * Descoupled from main customer-intelligence-data to prevent regressions.
 */

export interface ApolloContact {
    id: string; // Apollo internal ID
    name: string;
    first_name: string;
    last_name: string;
    title: string;
    headline?: string;
    photo_url?: string;
    city?: string;
    state?: string;
    country?: string;
    has_email: boolean;  // Signal from free search
    has_phone: boolean;  // Signal from free search
    email?: string;
    linkedin_url?: string;
    is_enriched: boolean;
    seniority: string;
    department: string;
    is_fallback: boolean;
}

export interface ApolloTechnicalProfile {
    customerId: string; // Link to main Customer database
    organization_id?: string; // Apollo internal Org ID
    technology_names: string[];
    intent_strength?: 'High' | 'Medium' | 'Low';
    short_description?: string;
    long_description?: string;
    keywords?: string[];
    annual_revenue?: number;
    revenue_string?: string;
    total_funding?: string;
    founded_year?: number;
    headcount?: number;
    it_headcount?: number;
    logo_url?: string;
    hq_city?: string;
    hq_state?: string;
    hq_country?: string;
    industry?: string;
    phone?: string;
    linkedin_url_company?: string;
    twitter_url?: string;
    facebook_url?: string;
    contacts: ApolloContact[];
    last_sync: string;
}

export interface CreditConsumptionLog {
    timestamp: string;
    customerId: string;
    action: 'bulk_enrich_companies' | 'bulk_match_contacts';
    credits_spent: number;
    remaining_estimate?: number;
}

// In-memory store for relational extensions (isolated)
export const APOLLO_EXTENSIONS: Record<string, ApolloTechnicalProfile> = {};

// Consumption logs
export const CREDIT_LOGS: CreditConsumptionLog[] = [];

// Helper to get or init an extension
export function getApolloExtension(customerId: string): ApolloTechnicalProfile {
    if (!APOLLO_EXTENSIONS[customerId]) {
        APOLLO_EXTENSIONS[customerId] = {
            customerId,
            technology_names: [],
            contacts: [],
            last_sync: new Date().toISOString()
        };
    }
    return APOLLO_EXTENSIONS[customerId];
}
