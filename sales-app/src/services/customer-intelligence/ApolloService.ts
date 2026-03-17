import axios from 'axios';
import { ApolloTechnicalProfile, ApolloContact, CREDIT_LOGS } from '../../lib/customer-apollo-data';
import { persistEnrichedData } from '../../lib/apollo-enriched-data';

const APOLLO_BASE_URL = 'https://api.apollo.io/v1';

// We'll use a type-safe interface for the internal service
export class ApolloService {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private get headers() {
        return {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'X-Api-Key': this.apiKey
        };
    }

    /**
     * syncCustomerData: Persists enriched corporate data to the local side-car store.
     */
    async syncCustomerData(customerId: string, data: Partial<ApolloTechnicalProfile>): Promise<boolean> {
        try {
            persistEnrichedData(customerId, data);
            return true;
        } catch (error) {
            console.error('ApolloService.syncCustomerData failed:', error);
            return false;
        }
    }

    /**
     * bulkEnrichCompanies: v1/organizations/bulk_enrich
     * Consumes credits: Yes (Organization Credits)
     */
    async bulkEnrichCompanies(domains: string[]): Promise<any[]> {
        try {
            const response = await axios.post(`${APOLLO_BASE_URL}/organizations/bulk_enrich`, {
                domains: domains
            }, { headers: this.headers });
            this.logConsumption('N/A', 'bulk_enrich_companies', 0);
            return response.data?.organizations || [];
        } catch (error) {
            console.error('ApolloService.bulkEnrichCompanies failed:', error);
            throw error;
        }
    }

    /**
     * discoverContacts: v1/mixed_people/api_search
     * Search for IT/Infra profiles using tiered filters and localized terms.
     */
    async discoverContacts(domain: string, companyName?: string, organizationId?: string): Promise<ApolloContact[]> {
        const isLatamOrIberia = domain.endsWith('.mx') || domain.endsWith('.es') || domain.endsWith('.co') || domain.endsWith('.br') || domain.endsWith('.cl') || domain.endsWith('.ar');
        
        const baseKeywords = 'infrastructure, cloud, virtualization, datacenter, IT director, systems manager, infrastructure manager';
        const localKeywords = isLatamOrIberia ? ', Director de Tecnología, Infraestructura, Sistemas, Redes, Gerente de TI' : '';
        const q_keywords = baseKeywords + localKeywords;
        
        const person_titles = ['IT', 'Infrastructure', 'Datacenter', 'Cloud', 'Technology', 'Systems', 'Sistemas', 'Infraestructura', 'CIO', 'CTO', 'Engineering'];

        const performSearch = async (params: any, label: string) => {
            try {
                console.log(`Apollo Discovery Attempt (${label}):`, params);
                const response = await axios.post(`${APOLLO_BASE_URL}/mixed_people/api_search`, {
                    person_seniorities: ['senior', 'manager', 'director', 'vice_president', 'c_level'],
                    contact_email_status: ['verified', 'likely_to_engage'], // Increase signal-to-noise
                    ...params
                }, { headers: this.headers });
                
                const count = response.data?.people?.length || 0;
                console.log(`Apollo Discovery Result (${label}): Found ${count} people`);
                return response.data?.people || [];
            } catch (err: any) {
                console.error(`Apollo search failed (${label}):`, err.response?.status, err.response?.data || err.message);
                const errorCode = err.response?.data?.error_code;
                if (err.response?.status === 401 || err.response?.status === 403 || errorCode === 'API_INACCESSIBLE') {
                    throw new Error('API_PLAN_RESTRICTED');
                }
                return [];
            }
        };

        try {
            let people = [];

            // Tier 0: Direct Org ID Search (Most Precise)
            if (organizationId) {
                people = await performSearch({
                    organization_ids: [organizationId],
                    person_departments: ['information_technology', 'engineering'],
                    q_keywords
                }, 'Org ID');
            }

            // Tier 1: Domain + Departments + Keywords + Titles (Strict)
            if (people.length === 0) {
                people = await performSearch({ 
                    q_organization_domains_list: [domain], // Using the array parameter from docs
                    person_departments: ['information_technology', 'engineering'],
                    q_keywords,
                    person_titles
                }, 'Strict Domain');
            }

            // Tier 2: Domain + Departments (Broader)
            if (people.length === 0) {
                people = await performSearch({ 
                    q_organization_domains_list: [domain],
                    person_departments: ['information_technology', 'engineering']
                }, 'Broad Domain (Depts only)');
            }

            // Tier 3: Company Name Fallback (If provided)
            if (people.length === 0 && companyName) {
                people = await performSearch({ 
                    q_organization_name: companyName,
                    person_departments: ['information_technology', 'engineering']
                }, 'Company Name Fallback');
                if (people.length > 0) {
                    people = people.map((p: any) => ({ ...p, is_fallback: true }));
                }
            }

            // Tier 4: Super Broad (Domain only, no filters except seniority)
            if (people.length === 0) {
                people = await performSearch({ q_organization_domains_list: [domain] }, 'Ultra-Broad Domain');
            }
            
            return people.map((p: any) => ({
                id: p.id,
                name: p.name,
                first_name: p.first_name,
                last_name: p.last_name,
                title: p.title,
                headline: p.headline,
                photo_url: p.photo_url,
                city: p.city,
                state: p.state,
                country: p.country,
                has_email: !!(p.has_email || p.email),
                has_phone: !!(p.has_direct_phone || p.has_phone),
                seniority: p.seniority,
                department: p.departments?.[0] || 'IT',
                is_enriched: false,
                is_fallback: p.is_fallback || false
            }));
        } catch (error: any) {
            console.error('ApolloService.discoverContacts definitive failure:', error);
            throw error; // Let the caller know about API key issues
        }
    }

    /**
     * bulkEnrichContacts: v1/people/bulk_match
     * Consumes Contact Credits (Emails/LinkedIn)
     */
    async enrichContacts(apolloIds: string[], customerId: string): Promise<ApolloContact[]> {
        try {
            const response = await axios.post(`${APOLLO_BASE_URL}/people/bulk_match`, {
                person_ids: apolloIds
            }, { headers: this.headers });
            
            this.logConsumption(customerId, 'bulk_match_contacts', apolloIds.length);
            
            return (response.data?.matches || []).map((m: any) => ({
                id: m.id,
                name: m.name,
                first_name: m.first_name,
                last_name: m.last_name,
                title: m.title,
                headline: m.headline,
                photo_url: m.photo_url,
                city: m.city,
                state: m.state,
                country: m.country,
                has_email: !!(m.has_email || m.email),
                has_phone: !!(m.has_direct_phone || m.has_phone),
                email: m.email,
                linkedin_url: m.linkedin_url,
                seniority: m.seniority,
                department: m.departments?.[0] || 'IT',
                is_enriched: !!m.email,
                is_fallback: false
            }));
        } catch (error) {
            console.error('ApolloService.enrichContacts failed:', error);
            throw error;
        }
    }

    private logConsumption(customerId: string, action: any, credits: number) {
        CREDIT_LOGS.push({
            timestamp: new Date().toISOString(),
            customerId,
            action,
            credits_spent: credits
        });
    }
}
