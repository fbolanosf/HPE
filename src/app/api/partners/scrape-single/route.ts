import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Partner } from '@/lib/partner-intelligence-data';

// Helper to determine active boolean flags based on text
function containsKeyword(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase();
    return keywords.some(k => lowerText.includes(k.toLowerCase()));
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url, company_name, country } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Normalize URL
        let fetchUrl = url.trim();
        if (!fetchUrl.startsWith('http://') && !fetchUrl.startsWith('https://')) {
            fetchUrl = 'https://' + fetchUrl;
        }

        const res = await axios.get(fetchUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        const $ = cheerio.load(res.data);

        // Extract plain text from meaningful tags
        const title = $('title').text() || '';
        const metaDesc = $('meta[name="description"]').attr('content') || '';
        // Extract paragraph text but limit to avoid massive payloads
        const paragraphs = $('p, h1, h2, h3, li, span').map((_, el) => $(el).text()).get().join(' ').substring(0, 15000);

        const fullText = `${title} ${metaDesc} ${paragraphs}`;

        // Infer Vendors (IT & OT)
        const vmware_partner = containsKeyword(fullText, ['vmware', 'vcenter', 'vsphere', 'esxi']);
        const vxrail_partner = containsKeyword(fullText, ['vxrail']);
        const hpe_partner = containsKeyword(fullText, ['hpe', 'hewlett packard enterprise', 'aruba', 'nimble', 'greenlake', 'proliant']);
        const dell_partner = containsKeyword(fullText, ['dell', 'emc', 'dell emc', 'poweredge']);
        const nutanix_partner = containsKeyword(fullText, ['nutanix', 'ahv']);
        const cisco_partner = containsKeyword(fullText, ['cisco', 'meraki', 'hyperflex']);
        const microsoft_partner = containsKeyword(fullText, ['microsoft', 'azure', 'hyper-v']);
        const aws_partner = containsKeyword(fullText, ['aws', 'amazon web services']);
        const google_cloud_partner = containsKeyword(fullText, ['google cloud', 'gcp']);

        const siemens_partner = containsKeyword(fullText, ['siemens', 'tia portal', 'simatic']);
        const rockwell_partner = containsKeyword(fullText, ['rockwell', 'allen-bradley', 'factorytalk']);
        const schneider_partner = containsKeyword(fullText, ['schneider electric', 'wonderware', 'ecostruxure']);
        const abb_partner = containsKeyword(fullText, ['abb', 'ability', '800xa']);
        const honeywell_partner = containsKeyword(fullText, ['honeywell', 'experion']);
        const emerson_partner = containsKeyword(fullText, ['emerson', 'deltav']);
        const aveva_partner = containsKeyword(fullText, ['aveva']);

        // Infer Virtualization and Scope
        const virtualization = containsKeyword(fullText, ['virtualization', 'virtualización', 'vmware', 'hyper-v', 'nutanix']);
        const hci = containsKeyword(fullText, ['hci', 'hyperconverged', 'hiperconvergencia', 'vxrail', 'nutanix', 'simplivity']);
        const datacenter_infrastructure = containsKeyword(fullText, ['datacenter', 'data center', 'centro de datos', 'servers', 'servidores', 'storage', 'almacenamiento']);
        const hybrid_cloud = containsKeyword(fullText, ['hybrid cloud', 'nube híbrida']);
        const cloud_migration = containsKeyword(fullText, ['cloud migration', 'migración', 'nube']);
        const backup_and_disaster_recovery = containsKeyword(fullText, ['backup', 'respaldo', 'disaster recovery', 'drp', 'recuperación de desastres', 'veeam']);
        const container_platforms = containsKeyword(fullText, ['containers', 'contenedores', 'kubernetes', 'docker', 'tanzu', 'openshift']);

        // Infer Industries
        const manufacturing = containsKeyword(fullText, ['manufacturing', 'manufactura', 'fábrica', 'producción']);
        const energy = containsKeyword(fullText, ['energy', 'energía', 'eléctrica', 'generación']);
        const oil_and_gas = containsKeyword(fullText, ['oil', 'gas', 'petróleo']);
        const food_and_beverage = containsKeyword(fullText, ['food', 'beverage', 'alimentos', 'bebidas']);
        const mining = containsKeyword(fullText, ['mining', 'minería']);
        const utilities = containsKeyword(fullText, ['utilities', 'servicios públicos', 'agua']);
        const pharmaceutical = containsKeyword(fullText, ['pharmaceutical', 'pharma', 'farmacéutica']);
        const telecommunications = containsKeyword(fullText, ['telecom', 'telecommunications', 'telecomunicaciones']);
        const finance = containsKeyword(fullText, ['finance', 'bank', 'banca', 'finanzas', 'financiero']);
        const healthcare = containsKeyword(fullText, ['health', 'salud', 'hospital', 'clínica']);
        const retail = containsKeyword(fullText, ['retail', 'comercio', 'tiendas']);
        const public_sector = containsKeyword(fullText, ['public sector', 'government', 'gobierno', 'sector público']);
        const transportation = containsKeyword(fullText, ['transport', 'logistics', 'transporte', 'logística']);

        // Determine Domain (IT, OT, HYBRID)
        let domain: "IT" | "OT" | "IT_OT_HYBRID" = "IT";
        const hasIT = vmware_partner || hpe_partner || dell_partner || nutanix_partner || cisco_partner || microsoft_partner || aws_partner || google_cloud_partner;
        const hasOT = siemens_partner || rockwell_partner || schneider_partner || abb_partner || honeywell_partner || emerson_partner || aveva_partner;

        if (hasIT && hasOT) domain = "IT_OT_HYBRID";
        else if (hasOT && !hasIT) domain = "OT";
        else domain = "IT";

        // Build inferred profile
        const inferredProfile: Partial<Partner> = {
            company_name: company_name || title.substring(0, 50).split('-')[0].trim(),
            country: country || 'Desconocido',
            city: 'Auto-descubierto',
            region: 'LATAM', // Default
            website: url,
            partner_type: hasOT ? 'system_integrator' : 'reseller',
            technology_domain: domain,
            estimated_employees: 50, // Default baseline
            // IT Vendors
            vmware_partner, vxrail_partner, hpe_partner, dell_partner,
            nutanix_partner, cisco_partner, microsoft_partner, aws_partner, google_cloud_partner,
            // OT Vendors
            siemens_partner, rockwell_partner, schneider_partner, abb_partner,
            honeywell_partner, emerson_partner, aveva_partner, yokogawa_partner: false,
            // Soluciones
            virtualization, hci, datacenter_infrastructure, hybrid_cloud,
            cloud_migration, backup_and_disaster_recovery, container_platforms,
            // Industrias
            manufacturing, energy, oil_and_gas, mining, utilities, food_and_beverage,
            pharmaceutical, transportation, telecommunications, finance, healthcare,
            retail, public_sector
        };

        return NextResponse.json(inferredProfile);
    } catch (error: any) {
        console.error('Scraping error:', error.message);
        return NextResponse.json({ error: 'Failed to access the provided website. They might be blocking automated requests or the URL is invalid.' }, { status: 500 });
    }
}
