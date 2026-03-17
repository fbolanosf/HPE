import { ApolloTechnicalProfile } from './customer-apollo-data';

/**
 * APOLLO_ENRICHED_REGISTRY: 
 * Stores enriched corporate data for customers to avoid polluting the core database.
 * This acts as a relational "side-car" table.
 */
export const APOLLO_ENRICHED_REGISTRY: Record<string, Partial<ApolloTechnicalProfile>> = {};

/**
 * Adds or updates enriched data for a specific customer.
 */
export function persistEnrichedData(customerId: string, data: Partial<ApolloTechnicalProfile>) {
    APOLLO_ENRICHED_REGISTRY[customerId] = {
        ...(APOLLO_ENRICHED_REGISTRY[customerId] || {}),
        ...data,
        last_sync: new Date().toISOString()
    };
    console.log(`[ApolloStore] Data persisted for customer ${customerId}`);
}

/**
 * Retrieves enriched data for a specific customer.
 */
export function getEnrichedData(customerId: string): Partial<ApolloTechnicalProfile> | null {
    return APOLLO_ENRICHED_REGISTRY[customerId] || null;
}
