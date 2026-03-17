import { NextResponse } from 'next/server';
import { ApolloService } from '@/services/customer-intelligence/ApolloService';

/**
 * secure-apollo-proxy
 * Only exposes needed actions to the frontend.
 * API Key is kept server-side.
 */
export async function POST(request: Request) {
    const apiKey = process.env.APOLLO_API_KEY || 'lPLQB5UdLyjntpSMHXRynA'; // Fallback to provided key if env not set
    const service = new ApolloService(apiKey);
    
    try {
        const body = await request.json();
        const { action, params = {} } = body;

        if (!action) return NextResponse.json({ error: 'Missing action' }, { status: 400 });

        console.log(`Apollo Proxy Action: ${action}`, params);

        switch (action) {
            case 'discoverContacts':
                const contacts = await service.discoverContacts(params.domain, params.companyName, params.organizationId);
                return NextResponse.json({ contacts });
            
            case 'enrichContacts':
                if (!params.ids) throw new Error('Missing contact IDs');
                const enriched = await service.enrichContacts(params.ids, params.customerId);
                return NextResponse.json({ contacts: enriched });

            case 'bulkEnrichCompanies':
                if (!params.domains) throw new Error('Missing domains');
                const orgs = await service.bulkEnrichCompanies(params.domains);
                return NextResponse.json({ organizations: orgs });

            case 'syncCustomerData':
                const success = await service.syncCustomerData(params.customerId, params.data);
                return NextResponse.json({ success });

            default:
                return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Apollo Route Proxy Error:', error.message, error.response?.data);
        
        let status = 500;
        if (error.message === 'API_PLAN_RESTRICTED' || error.response?.status === 401 || error.response?.status === 403) {
            status = 401; // Unauthorized / Forbidden
        }
        
        // Use 402 for Payment Required (Plan Upgrade)
        if (error.message === 'API_PLAN_RESTRICTED') {
            status = 402;
        }

        return NextResponse.json({ 
            error: error.message,
            status: status,
            details: error.response?.data || 'No extra details'
        }, { status });
    }
}
