/**
 * PersistenceService
 * Handles synchronization between UI state, localStorage and server-side JSON files.
 */

export type PersistenceEntityType = 'customers' | 'partners' | 'apollo_registry' | 'product_assets' | 'excluded_assets' | 'product_knowledge_sources';

export class PersistenceService {
    /**
     * Loads entities from server, falls back to localStorage, then to null.
     */
    static async load<T>(type: PersistenceEntityType): Promise<T[] | null> {
        try {
            // 1. Try server-side first (SSR/Persistence Layer)
            const response = await fetch(`/api/persistence?type=${type}`);
            const result = await response.json();
            
            if (result.data) {
                // Also cache locally
                localStorage.setItem(`hpe_cache_${type}`, JSON.stringify(result.data));
                return result.data as T[];
            }
        } catch (e) {
            console.warn(`[Persistence] Server load failed for ${type}:`, e);
        }

        // 2. Fallback to localStorage
        if (typeof window !== 'undefined') {
            const local = localStorage.getItem(`hpe_cache_${type}`);
            if (local) {
                try {
                    return JSON.parse(local) as T[];
                } catch {
                    return null;
                }
            }
        }

        return null;
    }

    /**
     * Saves entities to both localStorage and server.
     */
    static async save<T>(type: PersistenceEntityType, data: T[]): Promise<boolean> {
        // Safety check: Don't allow saving empty or suspiciously small datasets if the previous state was large
        // (unless it's an explicit delete scenario, but here we prioritize conservation)
        if (!data || (type === 'customers' && data.length < 5)) {
            console.warn(`[Persistence] Blocked potentially destructive save for type "${type}". Data length: ${data?.length}`);
            return false;
        }

        // 1. Save locally immediately for responsive UI
        if (typeof window !== 'undefined') {
            localStorage.setItem(`hpe_cache_${type}`, JSON.stringify(data));
        }

        // 2. Sync to server
        try {
            const response = await fetch('/api/persistence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, data })
            });
            const result = await response.json();
            return result.success;
        } catch (e) {
            console.error(`[Persistence] Server save failed for ${type}:`, e);
            return false;
        }
    }
}
