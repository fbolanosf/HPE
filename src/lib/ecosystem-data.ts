import { Partner, TechnologyDomain, PARTNER_DATABASE } from './partner-intelligence-data';

export type EntityType = 'Partner' | 'Vendor' | 'Technology' | 'Industry' | 'Region';
export type RelationType = 'USES' | 'IMPLEMENTS' | 'SERVES' | 'OPERATES_IN' | 'PROVIDES' | 'USED_IN';

export interface EcosystemRelationship {
    id: string;
    source_type: EntityType;
    source_id: string; // Name or ID
    target_type: EntityType;
    target_id: string; // Name or ID
    relation_type: RelationType;
    confidence: number;
}

// ── VENDORS TO TECHNOLOGY MAPPING ──────────────────────────────
export const VENDOR_TECHNOLOGY_MAP: Record<string, string[]> = {
    'VMware': ['Virtualization', 'Hybrid Cloud', 'HCI'],
    'HPE': ['Datacenter Infrastructure', 'Hybrid Cloud', 'HCI', 'Virtualization'],
    'Dell': ['Datacenter Infrastructure', 'HCI'],
    'Nutanix': ['HCI', 'Virtualization', 'Hybrid Cloud'],
    'Veeam': ['Backup & Disaster Recovery'],
    'PureStorage': ['Datacenter Infrastructure'],
    'Siemens': ['PLC Programming', 'SCADA Integration', 'Industrial IoT', 'Digital Manufacturing'],
    'Rockwell Automation': ['PLC Programming', 'SCADA Integration', 'MES Integration', 'Industrial IoT'],
    'Schneider Electric': ['SCADA Integration', 'Industrial IoT', 'Historian Systems'],
    'ABB': ['PLC Programming', 'Industrial Robotics', 'SCADA Integration'],
    'Cisco': ['Industrial Networking', 'Datacenter Infrastructure', 'Industrial Cybersecurity'],
    'Honeywell': ['SCADA Integration', 'Industrial Cybersecurity', 'Historian Systems'],
};

// ── TECHNOLOGY TO INDUSTRY MAPPING ─────────────────────────────
export const TECHNOLOGY_INDUSTRY_MAP: Record<string, string[]> = {
    'SCADA Integration': ['Manufacturing', 'Energy', 'Oil & Gas', 'Mining'],
    'PLC Programming': ['Manufacturing', 'Energy', 'Mining'],
    'Industrial IoT': ['Manufacturing', 'Oil & Gas', 'Mining', 'Logistics'],
    'MES Integration': ['Manufacturing'],
    'Virtualization': ['Finance', 'Retail', 'Manufacturing', 'Energy'],
    'Hybrid Cloud': ['Finance', 'Retail', 'Logistics', 'Energy'],
    'Datacenter Infrastructure': ['Finance', 'Retail', 'Telecom'],
    'Backup & Disaster Recovery': ['Finance', 'Retail', 'Energy'],
};

// ── 1. GENERATE RELATIONSHIPS ENGINE ───────────────────────────
export function generateEcosystemRelationships(partners: Partner[]): EcosystemRelationship[] {
    const relationships: EcosystemRelationship[] = [];
    const relSet = new Set<string>();

    const addRel = (srcType: EntityType, srcId: string, tgtType: EntityType, tgtId: string, rel: RelationType, conf: number = 1.0) => {
        const id = `${srcType}:${srcId}->${rel}->${tgtType}:${tgtId}`;
        if (!relSet.has(id)) {
            relSet.add(id);
            relationships.push({ id, source_type: srcType, source_id: srcId, target_type: tgtType, target_id: tgtId, relation_type: rel, confidence: conf });
        }
    };

    // VENDOR -> PROVIDES -> TECHNOLOGY
    Object.entries(VENDOR_TECHNOLOGY_MAP).forEach(([vendor, techs]) => {
        techs.forEach(tech => {
            addRel('Vendor', vendor, 'Technology', tech, 'PROVIDES');
        });
    });

    // TECHNOLOGY -> USED_IN -> INDUSTRY
    Object.entries(TECHNOLOGY_INDUSTRY_MAP).forEach(([tech, industries]) => {
        industries.forEach(ind => {
            addRel('Technology', tech, 'Industry', ind, 'USED_IN');
        });
    });

    // Analyse each Partner
    partners.forEach(p => {
        const pName = p.company_name;

        // Partner -> OPERATES_IN -> Region
        addRel('Partner', pName, 'Region', p.region, 'OPERATES_IN', 1.0);

        // Partner -> SERVES -> Industry (Generics based on OT focus if true)
        if (p.manufacturing) addRel('Partner', pName, 'Industry', 'Manufacturing', 'SERVES', 1.0);
        if (p.energy) addRel('Partner', pName, 'Industry', 'Energy', 'SERVES', 1.0);
        if (p.oil_and_gas) addRel('Partner', pName, 'Industry', 'Oil & Gas', 'SERVES', 1.0);
        if (p.mining) addRel('Partner', pName, 'Industry', 'Mining', 'SERVES', 1.0);

        // Partner -> USES -> Vendor
        const vendorsMapping: Record<keyof Partner, string> = {
            'vmware_partner': 'VMware',
            'vxrail_partner': 'VxRail',
            'dell_partner': 'Dell',
            'hpe_partner': 'HPE',
            'nutanix_partner': 'Nutanix',
            'veeam_partner': 'Veeam',
            'purestorage_partner': 'PureStorage',
            'juniper_partner': 'Juniper',
            'cisco_partner': 'Cisco',
            'microsoft_partner': 'Microsoft',
            'aws_partner': 'AWS',
            'google_cloud_partner': 'Google Cloud',
            'siemens_partner': 'Siemens',
            'rockwell_partner': 'Rockwell Automation',
            'schneider_partner': 'Schneider Electric',
            'abb_partner': 'ABB',
            'honeywell_partner': 'Honeywell',
            'emerson_partner': 'Emerson',
            'aveva_partner': 'AVEVA',
            'yokogawa_partner': 'Yokogawa',
        } as unknown as Record<keyof Partner, string>;

        Object.entries(vendorsMapping).forEach(([key, vendorName]) => {
            if (p[key as keyof Partner]) {
                addRel('Partner', pName, 'Vendor', vendorName, 'USES', 1.0);
            }
        });

        // Partner -> IMPLEMENTS -> Technology
        const techMapping: Record<keyof Partner, string> = {
            'virtualization': 'Virtualization',
            'hci': 'HCI',
            'datacenter_infrastructure': 'Datacenter Infrastructure',
            'hybrid_cloud': 'Hybrid Cloud',
            'cloud_migration': 'Cloud Migration',
            'backup_and_disaster_recovery': 'Backup & Disaster Recovery',
            'container_platforms': 'Container Platforms',
            'industrial_iot': 'Industrial IoT',
            'industrial_networking': 'Industrial Networking',
            'scada_integration': 'SCADA Integration',
            'mes_integration': 'MES Integration',
            'edge_computing': 'Edge Computing',
            'industrial_cybersecurity': 'Industrial Cybersecurity',
            'digital_manufacturing': 'Digital Manufacturing',
            'industrial_data_platforms': 'Industrial Data Platforms',
            'historian_systems': 'Historian Systems',
            'plc_programming': 'PLC Programming',
            'robotics_automation': 'Industrial Robotics',
        } as unknown as Record<keyof Partner, string>;

        Object.entries(techMapping).forEach(([key, techName]) => {
            if (p[key as keyof Partner]) {
                addRel('Partner', pName, 'Technology', techName, 'IMPLEMENTS', 1.0);
            }
        });
    });

    return relationships;
}

// Global cached relationships
export const ECOSYSTEM_RELATIONSHIPS = generateEcosystemRelationships(PARTNER_DATABASE);

// ── 2. HYBRID IT/OT IDENTIFICATION ────────────────────────────
export function identifyHybridIntegrators(partners: Partner[]): Partner[] {
    return partners.filter(p => p.technology_domain === 'IT_OT_HYBRID');
}

// ── 3. ECOSYSTEM CONCENTRATION ────────────────────────────────
export function getEcosystemConcentration(relationships: EcosystemRelationship[]) {
    const vendorCount: Record<string, number> = {};
    const techCount: Record<string, number> = {};
    const industryCount: Record<string, number> = {};

    relationships.forEach(rel => {
        if (rel.relation_type === 'USES' && rel.target_type === 'Vendor') {
            vendorCount[rel.target_id] = (vendorCount[rel.target_id] || 0) + 1;
        }
        if (rel.relation_type === 'IMPLEMENTS' && rel.target_type === 'Technology') {
            techCount[rel.target_id] = (techCount[rel.target_id] || 0) + 1;
        }
        if (rel.relation_type === 'SERVES' && rel.target_type === 'Industry') {
            industryCount[rel.target_id] = (industryCount[rel.target_id] || 0) + 1;
        }
    });

    const sortObject = (obj: Record<string, number>) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

    return {
        topVendors: sortObject(vendorCount),
        topTechnologies: sortObject(techCount),
        topIndustries: sortObject(industryCount)
    };
}

// ── 4. TECHNOLOGY OVERLAP (Vendors vs Technologies) ────────────
export function getTechnologyOverlap(relationships: EcosystemRelationship[]) {
    // Generate a heatmap data structure: rows=Vendors, cols=Technologies, value=Count of partners doing both
    const vendorPartners: Record<string, Set<string>> = {};
    const techPartners: Record<string, Set<string>> = {};

    // Maps
    relationships.forEach(r => {
        if (r.source_type === 'Partner') {
            if (r.target_type === 'Vendor' && r.relation_type === 'USES') {
                if (!vendorPartners[r.target_id]) vendorPartners[r.target_id] = new Set();
                vendorPartners[r.target_id].add(r.source_id);
            }
            if (r.target_type === 'Technology' && r.relation_type === 'IMPLEMENTS') {
                if (!techPartners[r.target_id]) techPartners[r.target_id] = new Set();
                techPartners[r.target_id].add(r.source_id);
            }
        }
    });

    const vendors = Object.keys(vendorPartners).sort();
    const technologies = Object.keys(techPartners).sort();

    const matrix = vendors.map(vendor => {
        const rowData: Record<string, number | string> = { id: vendor, vendor: vendor };
        technologies.forEach(tech => {
            const vSet = vendorPartners[vendor];
            const tSet = techPartners[tech];
            const overlap = new Set([...vSet].filter(x => tSet.has(x)));
            rowData[tech] = overlap.size;
        });
        return rowData;
    });

    return { matrix, vendors, technologies };
}

// ── 5. QUERY ENGINE CORE ──────────────────────────────────────
export function queryEcosystem(partners: Partner[], filters: {
    vendor?: string,
    technology?: string,
    industry?: string,
    region?: string,
    isHybrid?: boolean
}): Partner[] {
    let result = [...partners];

    if (filters.isHybrid !== undefined) {
        result = result.filter(p => filters.isHybrid ? p.technology_domain === 'IT_OT_HYBRID' : p.technology_domain !== 'IT_OT_HYBRID');
    }

    if (filters.region && filters.region !== 'ALL') {
        result = result.filter(p => p.region === filters.region);
    }

    // Mapping backwards to partner specific boolean fields for quick queries
    if (filters.vendor && filters.vendor !== 'ALL') {
        const rels = ECOSYSTEM_RELATIONSHIPS.filter(r => r.source_type === 'Partner' && r.target_type === 'Vendor' && r.target_id === filters.vendor);
        const pNames = new Set(rels.map(r => r.source_id));
        result = result.filter(p => pNames.has(p.company_name));
    }

    if (filters.technology && filters.technology !== 'ALL') {
        const rels = ECOSYSTEM_RELATIONSHIPS.filter(r => r.source_type === 'Partner' && r.target_type === 'Technology' && r.target_id === filters.technology);
        const pNames = new Set(rels.map(r => r.source_id));
        result = result.filter(p => pNames.has(p.company_name));
    }

    if (filters.industry && filters.industry !== 'ALL') {
        // Direct evaluation on the boolean property of the Partner object for 100% accuracy across all IT/OT industries (e.g. 'finance', 'manufacturing')
        result = result.filter(p => !!p[filters.industry as keyof Partner]);
    }

    return result;
}
