import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to clean strings
const clean = (s: string) => s?.replace(/\s+/g, ' ').trim() || '';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        // Industry-specific search simulation/scraping
        // In a real scenario, this would hit LinkedIn, Clearbit, or specialized directories.
        // For this demo, we simulate a sophisticated search that returns structured data.
        
        // We'll use a public search engine or a well-known directory as a base for the "feel" of scraping.
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' corporate profile industry headquarters')}`;
        
        // Note: Real scraping usually requires a proxy or a specialized service.
        // Here we simulate the result as if we had scraped a rich source.
        
        // Mocking sophisticated scraping results based on the query
        const mockResults: Record<string, any> = {
            'cemex': {
                company_name: 'CEMEX S.A.B. de C.V.',
                website: 'cemex.com',
                country: 'Mexico',
                city: 'Monterrey',
                region: 'LATAM',
                industry: 'Manufactura / Construcción',
                company_size: 'Large Enterprise',
                estimated_employees: 40000,
                description: 'Líder global en la industria de materiales para la construcción.',
                technical_signals: {
                    broadcom_impact: true,
                    vmware_user: true,
                    old_hardware: true,
                    hpe_presence: true,
                    cloud_repatriation: false
                }
            },
            'bbva': {
                company_name: 'BBVA México',
                website: 'bbva.mx',
                country: 'Mexico',
                city: 'Mexico City',
                region: 'LATAM',
                industry: 'Banca y Finanzas',
                company_size: 'Large Enterprise',
                estimated_employees: 35000,
                description: 'Institución financiera líder en el mercado mexicano.',
                technical_signals: {
                    broadcom_impact: true,
                    vmware_user: true,
                    old_hardware: false,
                    hpe_presence: false,
                    cloud_repatriation: true
                }
            },
            'claro': {
                company_name: 'Claro Colombia',
                website: 'claro.com.co',
                country: 'Colombia',
                city: 'Bogotá',
                region: 'LATAM',
                industry: 'Telecomunicaciones',
                company_size: 'Large Enterprise',
                estimated_employees: 15000,
                description: 'Principal operador de telecomunicaciones en Colombia.',
                technical_signals: {
                    broadcom_impact: true,
                    vmware_user: true,
                    old_hardware: true,
                    hpe_presence: true,
                    cloud_repatriation: false
                }
            },
            'ternium': {
                company_name: 'Ternium México',
                website: 'ternium.com',
                country: 'Mexico',
                city: 'Monterrey',
                region: 'LATAM',
                industry: 'Manufactura / Siderurgia',
                company_size: 'Large Enterprise',
                estimated_employees: 20000,
                description: 'Siderúrgica líder en América Latina con alta dependencia de infraestructura crítica.',
                technical_signals: {
                    broadcom_impact: true,
                    vmware_user: true,
                    old_hardware: true,
                    hpe_presence: true,
                    cloud_repatriation: false
                }
            }
        };

        const key = query.toLowerCase();
        let found = Object.entries(mockResults).find(([k]) => key.includes(k))?.[1];

        if (!found) {
            // Intelligent fallback based on industry and size
            const isLarge = query.length > 5;
            found = {
                company_name: query.split('.')[0].toUpperCase(),
                website: query.includes('.') ? query : `${query.toLowerCase().replace(/\s+/g, '')}.com`,
                country: 'Mexico',
                city: '',
                region: 'LATAM',
                industry: 'Servicios Corporativos',
                company_size: isLarge ? 'Enterprise' : 'SMB',
                estimated_employees: isLarge ? 5000 : 200,
                description: `Perfil generado dinámicamente para ${query}. Se detecta potencial de modernización.`,
                technical_signals: {
                    broadcom_impact: isLarge,
                    vmware_user: true,
                    old_hardware: isLarge,
                    hpe_presence: false,
                    cloud_repatriation: !isLarge
                }
            };
        }

        return NextResponse.json(found);

    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json({ error: 'Failed to scrape customer data' }, { status: 500 });
    }
}
