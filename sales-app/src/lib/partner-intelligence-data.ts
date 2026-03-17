// ============================================================
// Partner Intelligence — Data Model, Scoring Engine & Dataset
// HPE Sales Specialist Toolkit
// ============================================================

export type TechnologyDomain = 'IT' | 'OT' | 'IT_OT_HYBRID';

export type PartnerType =
    | 'vendor'
    | 'distributor'
    | 'system_integrator'
    | 'reseller'
    | 'managed_service_provider'
    | 'consultancy'
    | 'csp'
    | 'retailer'
    | 'industrial_integrator'
    | 'engineering_company'
    | 'automation_integrator';

export type HPECertification = 
    | 'Triple Platinum Plus'
    | 'Platinum'
    | 'Gold'
    | 'Silver'
    | 'Business Partner'
    | 'None';

export type OpportunityTier = 'High' | 'Medium' | 'Low';

import { PersistenceService } from './persistence-service';

export interface Partner {
    // ── Identity ──────────────────────────────────────────────
    id: string;
    company_name: string;
    country: string;
    city: string;
    region: 'LATAM' | 'North America' | 'Europe' | 'APAC' | 'Middle East';
    website: string;
    linkedin?: string;
    partner_type: PartnerType;
    technology_domain: TechnologyDomain;
    company_size: 'Small' | 'Medium' | 'Large' | 'Enterprise';
    estimated_employees: number;

    // ── IT Vendors ────────────────────────────────────────────
    vmware_partner: boolean;
    vxrail_partner: boolean;
    dell_partner: boolean;
    hpe_partner: boolean;
    nutanix_partner: boolean;
    cisco_partner: boolean;
    microsoft_partner: boolean;
    aws_partner: boolean;
    google_cloud_partner: boolean;
    veeam_partner: boolean;
    purestorage_partner: boolean;
    juniper_partner: boolean;

    // ── OT Vendors ────────────────────────────────────────────
    siemens_partner: boolean;
    rockwell_partner: boolean;
    schneider_partner: boolean;
    abb_partner: boolean;
    honeywell_partner: boolean;
    emerson_partner: boolean;
    aveva_partner: boolean;
    yokogawa_partner: boolean;

    // ── IT Specializations ────────────────────────────────────
    virtualization: boolean;
    hci: boolean;
    datacenter_infrastructure: boolean;
    hybrid_cloud: boolean;
    cloud_migration: boolean;
    backup_and_disaster_recovery: boolean;
    observability: boolean;
    container_platforms: boolean;
    edge_computing: boolean;

    // ── OT Specializations ────────────────────────────────────
    scada_integration: boolean;
    plc_programming: boolean;
    mes_integration: boolean;
    industrial_iot: boolean;
    industrial_networking: boolean;
    process_control: boolean;
    industrial_cybersecurity: boolean;
    historian_systems: boolean;
    digital_manufacturing: boolean;
    industrial_data_platforms: boolean;

    // ── Industries Served ─────────────────────────────────────
    manufacturing: boolean;
    mining: boolean;
    oil_and_gas: boolean;
    energy: boolean;
    utilities: boolean;
    food_and_beverage: boolean;
    pharmaceutical: boolean;
    water_and_wastewater: boolean;
    transportation: boolean;
    smart_cities: boolean;
    retail: boolean;
    healthcare: boolean;
    finance: boolean;
    telecommunications: boolean;
    public_sector: boolean;
    defense: boolean;
    tourism: boolean;
    shipping: boolean;

    // ── Optional enrichment ───────────────────────────────────
    hpe_certification: HPECertification;
    description?: string;
    key_projects?: string[];

    // ── Expansion v8.1 (OEM & Portfolio) ──────────────────────
    other_oem_brands?: string;
    hpe_virtualization_products?: string;
    tech_brands_by_category?: string;
}

// ============================================================
// HPE OPPORTUNITY SCORING ENGINE & WEIGHTS
// ============================================================

export type ScoreWeights = Record<string, number>;

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
    // IT signals
    vmware_partner: 5,
    vxrail_partner: 5,
    dell_partner: 3,
    virtualization: 3,
    hybrid_cloud: 2,
    datacenter_infrastructure: 2,
    hci: 2,
    nutanix_partner: 2,
    veeam_partner: 2,
    purestorage_partner: 2,
    juniper_partner: 2,
    cloud_migration: 1,
    backup_and_disaster_recovery: 1,

    // OT signals
    industrial_iot: 4,
    industrial_networking: 4,
    scada_integration: 3,
    mes_integration: 3,
    edge_computing: 3,
    industrial_cybersecurity: 2,
    digital_manufacturing: 2,
    industrial_data_platforms: 2,
    historian_systems: 1,
    plc_programming: 1,

    // Industry vertical bonus
    manufacturing: 1,
    oil_and_gas: 1,
    mining: 1,
    energy: 1,

    // Penalty
    hpe_partner: -5,
};

export function getCustomWeights(): ScoreWeights {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('hpe_score_weights');
        if (stored) return JSON.parse(stored);
    }
    return { ...DEFAULT_SCORE_WEIGHTS };
}

export function saveCustomWeights(weights: ScoreWeights) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('hpe_score_weights', JSON.stringify(weights));
    }
}

export interface ScoreResult {
    score: number;
    tier: OpportunityTier;
    breakdown: { label: string; value: number }[];
}

export function scorePartner(p: Partner, customWeights?: ScoreWeights): ScoreResult {
    const weights = customWeights || getCustomWeights();
    const breakdown: { label: string; value: number }[] = [];
    let total = 0;

    const add = (label: string, value: number) => {
        if (value !== 0) {
            breakdown.push({ label, value });
            total += value;
        }
    };

    // IT signals
    if (p.vmware_partner) add('VMware Partner', weights.vmware_partner ?? 0);
    if (p.vxrail_partner) add('VxRail Partner', weights.vxrail_partner ?? 0);
    if (p.dell_partner) add('Dell Infrastructure', weights.dell_partner ?? 0);
    if (p.virtualization) add('Virtualization Services', weights.virtualization ?? 0);
    if (p.hybrid_cloud) add('Hybrid Cloud', weights.hybrid_cloud ?? 0);
    if (p.datacenter_infrastructure) add('Datacenter Services', weights.datacenter_infrastructure ?? 0);
    if (p.hci) add('HCI Expertise', weights.hci ?? 0);
    if (p.nutanix_partner) add('Nutanix Partner', weights.nutanix_partner ?? 0);
    if (p.veeam_partner) add('Veeam Partner', weights.veeam_partner ?? 0);
    if (p.purestorage_partner) add('PureStorage Partner', weights.purestorage_partner ?? 0);
    if (p.juniper_partner) add('Juniper Partner', weights.juniper_partner ?? 0);
    if (p.cloud_migration) add('Cloud Migration', weights.cloud_migration ?? 0);
    if (p.backup_and_disaster_recovery) add('Backup & DR', weights.backup_and_disaster_recovery ?? 0);

    // OT signals
    if (p.industrial_iot) add('Industrial IoT', weights.industrial_iot ?? 0);
    if (p.industrial_networking) add('Industrial Networking', weights.industrial_networking ?? 0);
    if (p.scada_integration) add('SCADA Integration', weights.scada_integration ?? 0);
    if (p.mes_integration) add('MES Integration', weights.mes_integration ?? 0);
    if (p.edge_computing) add('Edge Computing', weights.edge_computing ?? 0);
    if (p.industrial_cybersecurity) add('Industrial Cybersecurity', weights.industrial_cybersecurity ?? 0);
    if (p.digital_manufacturing) add('Digital Manufacturing', weights.digital_manufacturing ?? 0);
    if (p.industrial_data_platforms) add('Industrial Data Platforms', weights.industrial_data_platforms ?? 0);
    if (p.historian_systems) add('Historian Systems', weights.historian_systems ?? 0);
    if (p.plc_programming) add('PLC Programming', weights.plc_programming ?? 0);

    // Industry vertical bonus
    if (p.manufacturing) add('Manufacturing Vertical', weights.manufacturing ?? 0);
    if (p.oil_and_gas) add('Oil & Gas Vertical', weights.oil_and_gas ?? 0);
    if (p.mining) add('Mining Vertical', weights.mining ?? 0);
    if (p.energy) add('Energy Vertical', weights.energy ?? 0);

    // Penalty
    if (p.hpe_partner) add('Already HPE Partner (−)', weights.hpe_partner ?? 0);

    const tier: OpportunityTier =
        total >= 14 ? 'High' : total >= 7 ? 'Medium' : 'Low';

    return { score: Math.max(0, total), tier, breakdown };
}

// ============================================================
// MULTI-CRITERIA PARTNER SEARCH
// ============================================================

export interface PartnerFilters {
    query?: string;
    country?: string;
    region?: string;
    technology_domain?: TechnologyDomain | 'ALL';
    partner_type?: PartnerType | 'ALL';
    industry?:
    | 'manufacturing' | 'mining' | 'oil_and_gas' | 'energy' | 'utilities'
    | 'food_and_beverage' | 'pharmaceutical' | 'water_and_wastewater'
    | 'transportation' | 'smart_cities' | 'retail' | 'healthcare' | 'finance'
    | 'telecommunications' | 'public_sector' | 'ALL';
    vendor?: string;
    opportunity_tier?: OpportunityTier | 'ALL';
    excludeHPEPartners?: boolean;
}

export function searchPartners(
    partners: Partner[],
    filters: PartnerFilters
): Partner[] {
    return partners.filter((p) => {
        // Text search
        if (filters.query) {
            const q = filters.query.toLowerCase();
            if (
                !p.company_name.toLowerCase().includes(q) &&
                !p.country.toLowerCase().includes(q) &&
                !(p.description ?? '').toLowerCase().includes(q)
            ) return false;
        }

        if (filters.country && p.country !== filters.country) return false;
        if (filters.region && filters.region !== 'ALL' && p.region !== filters.region) return false;
        if (
            filters.technology_domain &&
            filters.technology_domain !== 'ALL' &&
            p.technology_domain !== filters.technology_domain
        ) return false;
        if (
            filters.partner_type &&
            filters.partner_type !== 'ALL' &&
            p.partner_type !== filters.partner_type
        ) return false;

        // Industry filter
        if (filters.industry && filters.industry !== 'ALL') {
            if (!p[filters.industry as keyof Partner]) return false;
        }

        // Vendor detection
        if (filters.vendor) {
            const v = filters.vendor.toLowerCase();
            const vendorMap: Record<string, keyof Partner> = {
                vmware: 'vmware_partner', vxrail: 'vxrail_partner', dell: 'dell_partner',
                hpe: 'hpe_partner', nutanix: 'nutanix_partner', cisco: 'cisco_partner',
                microsoft: 'microsoft_partner', aws: 'aws_partner', google: 'google_cloud_partner',
                veeam: 'veeam_partner', purestorage: 'purestorage_partner', juniper: 'juniper_partner',
                siemens: 'siemens_partner', rockwell: 'rockwell_partner',
                schneider: 'schneider_partner', abb: 'abb_partner',
                honeywell: 'honeywell_partner', emerson: 'emerson_partner',
                aveva: 'aveva_partner', yokogawa: 'yokogawa_partner',
            };
            const key = Object.keys(vendorMap).find((k) => v.includes(k));
            if (key && !p[vendorMap[key]]) return false;
        }

        // Opportunity tier filter
        if (filters.opportunity_tier && filters.opportunity_tier !== 'ALL') {
            const { tier } = scorePartner(p);
            if (tier !== filters.opportunity_tier) return false;
        }

        if (filters.excludeHPEPartners && p.hpe_partner) return false;

        return true;
    }).sort((a, b) => a.company_name.localeCompare(b.company_name));
}

// ============================================================
// SAMPLE PARTNER DATASET (~30 partners — IT, OT, Hybrid)
// ============================================================

export const BASE: Omit<Partner,
    'id' | 'company_name' | 'country' | 'city' | 'region' | 'website' |
    'partner_type' | 'technology_domain' | 'company_size' | 'estimated_employees' | 'hpe_certification'
> = {
    linkedin: undefined,
    vmware_partner: false, vxrail_partner: false, dell_partner: false,
    hpe_partner: false, nutanix_partner: false, cisco_partner: false,
    microsoft_partner: false, aws_partner: false, google_cloud_partner: false,
    veeam_partner: false, purestorage_partner: false, juniper_partner: false,
    siemens_partner: false, rockwell_partner: false, schneider_partner: false,
    abb_partner: false, honeywell_partner: false, emerson_partner: false,
    aveva_partner: false, yokogawa_partner: false,
    virtualization: false, hci: false, datacenter_infrastructure: false,
    hybrid_cloud: false, cloud_migration: false, backup_and_disaster_recovery: false,
    observability: false, container_platforms: false, edge_computing: false,
    scada_integration: false, plc_programming: false, mes_integration: false,
    industrial_iot: false, industrial_networking: false, process_control: false,
    industrial_cybersecurity: false, historian_systems: false,
    digital_manufacturing: false, industrial_data_platforms: false,
    manufacturing: false, mining: false, oil_and_gas: false, energy: false,
    utilities: false, food_and_beverage: false, pharmaceutical: false,
    water_and_wastewater: false, transportation: false, smart_cities: false,
    retail: false, healthcare: false, finance: false,
    telecommunications: false, public_sector: false,
    defense: false, tourism: false, shipping: false,
    other_oem_brands: '',
    hpe_virtualization_products: '',
    tech_brands_by_category: '',
};

export const PARTNER_DATABASE: Partner[] = [
    // ── IT Integrators ─────────────────────────────────────────
    {
        hpe_certification: "Gold", ...BASE, id: 'p001', company_name: 'Axtel Enterprises', country: 'Mexico',
        city: 'Monterrey', region: 'LATAM', website: 'axtel.com.mx',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Large', estimated_employees: 3200,
        vmware_partner: true, vxrail_partner: true, dell_partner: true,
        cisco_partner: true, microsoft_partner: true,
        virtualization: true, hci: true, datacenter_infrastructure: true,
        hybrid_cloud: true, cloud_migration: true,
        manufacturing: true, energy: true,
        description: 'Integrador IT líder en México con fuertes competencias VMware y VxRail.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p002', company_name: 'Telmex Soluciones', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'telmex.com',
        partner_type: 'managed_service_provider', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 12000,
        vmware_partner: true, cisco_partner: true, aws_partner: true,
        microsoft_partner: true,
        virtualization: true, hybrid_cloud: true, cloud_migration: true,
        observability: true, backup_and_disaster_recovery: true,
        telecommunications: true, public_sector: true, finance: true, retail: true,
        description: 'MSP de gran escala con portafolio cloud híbrido.',
    },
    {
        hpe_certification: "Platinum", ...BASE, id: 'p003', company_name: 'Ingram Micro Colombia', country: 'Colombia',
        city: 'Bogotá', region: 'LATAM', website: 'ingrammicro.com',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 2500,
        vmware_partner: true, dell_partner: true, nutanix_partner: true,
        hpe_partner: true, cisco_partner: true, microsoft_partner: true,
        virtualization: true, hci: true, datacenter_infrastructure: true,
        description: 'Distribuidor mayorista con amplio portafolio IT incluyendo HPE.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p_ingram_mx', company_name: 'Ingram Micro México', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'ingrammicro.com.mx',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 1500,
        vmware_partner: true, dell_partner: true, hpe_partner: true, cisco_partner: true,
        other_oem_brands: 'VERITAS, Cisco, Dell, Microsoft, VMware',
        hpe_virtualization_products: 'HPE VM Essentials, HPE GreenLake, HPE Alletra Storage MP',
        tech_brands_by_category: 'VERITAS para Disaster Recovery, Cisco para Networking',
        description: 'Mayorista líder con capacidades avanzadas en virtualización y protección de datos.',
    },
    {
        hpe_certification: "Silver", ...BASE, id: 'p004', company_name: 'Sievert TI', country: 'Brazil',
        city: 'São Paulo', region: 'LATAM', website: 'sievert.com.br',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 450,
        vmware_partner: true, vxrail_partner: true, dell_partner: true,
        virtualization: true, hci: true, datacenter_infrastructure: true,
        backup_and_disaster_recovery: true,
        manufacturing: true, pharmaceutical: true,
        description: 'Especialista VMware y VxRail en Brasil con foco en manufactura.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p005', company_name: 'Globant Infrastructure', country: 'Argentina',
        city: 'Buenos Aires', region: 'LATAM', website: 'globant.com',
        partner_type: 'consultancy', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 25000,
        aws_partner: true, google_cloud_partner: true, microsoft_partner: true,
        hybrid_cloud: true, cloud_migration: true, container_platforms: true,
        observability: true,
        description: 'Firma de consultoría cloud-native con capacidades multi-cloud.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p006', company_name: 'Nexxt Solutions', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'nexxt.com.co',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 120,
        cisco_partner: true, vmware_partner: true,
        datacenter_infrastructure: true, virtualization: true,
        description: 'Reseller Cisco y VMware en mercado SMB de Chile.',
    },
    {
        hpe_certification: "Platinum", ...BASE, id: 'p007', company_name: 'Logicalis LATAM', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'la.logicalis.com',
        partner_type: 'managed_service_provider', technology_domain: 'IT',
        company_size: 'Large', estimated_employees: 4000,
        vmware_partner: true, cisco_partner: true, microsoft_partner: true,
        nutanix_partner: true, hpe_partner: false,
        virtualization: true, hybrid_cloud: true, observability: true,
        backup_and_disaster_recovery: true, container_platforms: true,
        manufacturing: true, utilities: true, transportation: true, telecommunications: true, finance: true,
        description: 'MSP con presencia panregional. Fuerte en VMware y Cisco.',
    },

    // ── OT Integrators ─────────────────────────────────────────
    {
        hpe_certification: "None", ...BASE, id: 'p008', company_name: 'Automatización Industrial Monterrey', country: 'Mexico',
        city: 'Monterrey', region: 'LATAM', website: 'aimty.com.mx',
        partner_type: 'automation_integrator', technology_domain: 'OT',
        company_size: 'Small', estimated_employees: 85,
        siemens_partner: true, rockwell_partner: true,
        scada_integration: true, plc_programming: true, process_control: true,
        manufacturing: true, food_and_beverage: true,
        description: 'Integrador industrial especializado en PLC Siemens y Rockwell en manufactura.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p009', company_name: 'ControlSys de México', country: 'Mexico',
        city: 'Querétaro', region: 'LATAM', website: 'controlsys.com.mx',
        partner_type: 'automation_integrator', technology_domain: 'OT',
        company_size: 'Medium', estimated_employees: 210,
        siemens_partner: true, schneider_partner: true,
        scada_integration: true, mes_integration: true, historian_systems: true,
        process_control: true, plc_programming: true,
        manufacturing: true, pharmaceutical: true, food_and_beverage: true,
        description: 'System integrator MES/SCADA con proyectos en manufactura farmacéutica.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p010', company_name: 'IDS Ingeniería', country: 'Colombia',
        city: 'Medellín', region: 'LATAM', website: 'ids.com.co',
        partner_type: 'industrial_integrator', technology_domain: 'OT',
        company_size: 'Medium', estimated_employees: 320,
        siemens_partner: true, abb_partner: true, honeywell_partner: true,
        scada_integration: true, process_control: true, plc_programming: true,
        industrial_cybersecurity: true, utilities: true, energy: true, oil_and_gas: true,
        description: 'Integrador SCADA líder en sector energía y utilities en Colombia.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p011', company_name: 'Process Solutions Brazil', country: 'Brazil',
        city: 'Rio de Janeiro', region: 'LATAM', website: 'processsolutions.com.br',
        partner_type: 'industrial_integrator', technology_domain: 'OT',
        company_size: 'Large', estimated_employees: 780,
        honeywell_partner: true, emerson_partner: true, yokogawa_partner: true,
        aveva_partner: true,
        scada_integration: true, process_control: true, historian_systems: true,
        industrial_data_platforms: true, mes_integration: true,
        oil_and_gas: true, energy: true, pharmaceutical: true,
        description: 'Integrador de proceso para oil & gas con DCS Honeywell y AVEVA.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p012', company_name: 'Intelcon Industrial', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'intelcon.cl',
        partner_type: 'industrial_integrator', technology_domain: 'OT',
        company_size: 'Medium', estimated_employees: 260,
        siemens_partner: true, rockwell_partner: true,
        scada_integration: true, plc_programming: true, process_control: true,
        mining: true, energy: true, water_and_wastewater: true,
        description: 'Especialista en SCADA minero y utilities en Chile.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p013', company_name: 'Tecnomatic Argentina', country: 'Argentina',
        city: 'Buenos Aires', region: 'LATAM', website: 'tecnomatic.com.ar',
        partner_type: 'automation_integrator', technology_domain: 'OT',
        company_size: 'Small', estimated_employees: 75,
        schneider_partner: true, abb_partner: true,
        plc_programming: true, process_control: true, industrial_networking: true,
        manufacturing: true, oil_and_gas: true,
        description: 'Automatización de procesos industriales con Schneider y ABB.',
    },

    // ── IT/OT Hybrid Integrators ───────────────────────────────
    {
        hpe_certification: "None", ...BASE, id: 'p014', company_name: 'ProA Technology', country: 'Mexico',
        city: 'Guadalajara', region: 'LATAM', website: 'proatechnology.com.mx',
        partner_type: 'system_integrator', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Medium', estimated_employees: 380,
        vmware_partner: true, cisco_partner: true, siemens_partner: true,
        virtualization: true, datacenter_infrastructure: true, industrial_networking: true,
        industrial_iot: true, edge_computing: true, scada_integration: true,
        manufacturing: true, food_and_beverage: true,
        description: 'Integrador híbrido IT/OT con fuerte componente edge computing industrial.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p015', company_name: 'Wara Technologies', country: 'Peru',
        city: 'Lima', region: 'LATAM', website: 'waratec.pe',
        partner_type: 'system_integrator', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Medium', estimated_employees: 185,
        dell_partner: true, vmware_partner: true, rockwell_partner: true,
        schneider_partner: true,
        virtualization: true, hci: true, scada_integration: true,
        industrial_iot: true, industrial_networking: true, edge_computing: true,
        mining: true, energy: true,
        description: 'Integrador híbrido IT/OT con proyectos mineros y energía en Perú y Bolivia.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p016', company_name: 'Grupo Assa Latam', country: 'Colombia',
        city: 'Bogotá', region: 'LATAM', website: 'grupoassa.com',
        partner_type: 'consultancy', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Large', estimated_employees: 1800,
        microsoft_partner: true, aws_partner: true, siemens_partner: true,
        aveva_partner: true,
        hybrid_cloud: true, cloud_migration: true, digital_manufacturing: true,
        industrial_iot: true, industrial_data_platforms: true, mes_integration: true,
        manufacturing: true, oil_and_gas: true, energy: true,
        description: 'Consultora digital con práctica Industry 4.0 y cloud híbrido.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p017', company_name: 'Soluciones i4.0 México', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'soluciones-i40.mx',
        partner_type: 'system_integrator', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Small', estimated_employees: 95,
        rockwell_partner: true, microsoft_partner: true,
        industrial_iot: true, digital_manufacturing: true, edge_computing: true,
        industrial_data_platforms: true, mes_integration: true,
        manufacturing: true, food_and_beverage: true,
        description: '¡Start-up de industria 4.0 con foco en edge analytics y MES.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p018', company_name: 'Ingetech Ecuador', country: 'Ecuador',
        city: 'Quito', region: 'LATAM', website: 'ingetech.ec',
        partner_type: 'industrial_integrator', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Small', estimated_employees: 65,
        siemens_partner: true, cisco_partner: true,
        scada_integration: true, industrial_networking: true, datacenter_infrastructure: true,
        oil_and_gas: true, utilities: true,
        description: 'Integrador OT con capacidades de redes industriales y datacenter básico.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p019', company_name: 'IIoT Solutions México', country: 'Mexico',
        city: 'Monterrey', region: 'LATAM', website: 'iiotsolutions.com.mx',
        partner_type: 'system_integrator', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Small', estimated_employees: 130,
        rockwell_partner: true, microsoft_partner: true, aws_partner: true,
        industrial_iot: true, edge_computing: true, industrial_data_platforms: true,
        industrial_networking: true, cloud_migration: true,
        manufacturing: true, oil_and_gas: true,
        description: 'Especialista IIoT con capacidades de conectividad edge-to-cloud.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p020', company_name: 'CyberOT Chile', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'cyberot.cl',
        partner_type: 'consultancy', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Small', estimated_employees: 55,
        industrial_cybersecurity: true, scada_integration: true, industrial_networking: true,
        datacenter_infrastructure: true, observability: true,
        mining: true, energy: true, utilities: true,
        description: 'Boutique de ciberseguridad IT/OT convergida para industrias críticas.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p021', company_name: 'TechPetro Services', country: 'Colombia',
        city: 'Bogotá', region: 'LATAM', website: 'techpetro.co',
        partner_type: 'engineering_company', technology_domain: 'OT',
        company_size: 'Medium', estimated_employees: 420,
        honeywell_partner: true, emerson_partner: true,
        scada_integration: true, process_control: true, historian_systems: true,
        industrial_cybersecurity: true,
        oil_and_gas: true, energy: true,
        description: 'Firma de ingeniería especializada en DCS y control de proceso para oil & gas.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p022', company_name: 'Xytech industrial', country: 'Brazil',
        city: 'Curitiba', region: 'LATAM', website: 'xytech.ind.br',
        partner_type: 'automation_integrator', technology_domain: 'OT',
        company_size: 'Medium', estimated_employees: 195,
        siemens_partner: true, rockwell_partner: true, abb_partner: true,
        plc_programming: true, scada_integration: true, mes_integration: true,
        manufacturing: true, food_and_beverage: true, pharmaceutical: true,
        description: 'Integrador industrial con cobertura nacional en Brasil.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p023', company_name: 'Infracloud Perú', country: 'Peru',
        city: 'Lima', region: 'LATAM', website: 'infracloud.pe',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 110,
        vmware_partner: true, dell_partner: true, nutanix_partner: true,
        virtualization: true, hci: true, backup_and_disaster_recovery: true,
        mining: true, oil_and_gas: true,
        description: 'Integrador IT enfocado en sectores extractivos en Perú.',
    },
    {
        hpe_certification: "Silver", ...BASE, id: 'p024', company_name: 'BML Networking', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'bml.com.mx',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 280,
        cisco_partner: true, vmware_partner: true, microsoft_partner: true,
        hpe_partner: true,
        datacenter_infrastructure: true, virtualization: true, observability: true,
        description: 'Partner HPE activo en México. Fuerte en networking y datacenter.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p025', company_name: 'DigitalPlant Argentina', country: 'Argentina',
        city: 'Córdoba', region: 'LATAM', website: 'digitalplant.com.ar',
        partner_type: 'system_integrator', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Small', estimated_employees: 88,
        schneider_partner: true, aveva_partner: true, microsoft_partner: true,
        scada_integration: true, mes_integration: true, digital_manufacturing: true,
        industrial_data_platforms: true, edge_computing: true,
        manufacturing: true, food_and_beverage: true,
        description: 'Integrador de planta digital con AVEVA y Schneider.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p026', company_name: 'DataCenter DPR Monterrey', country: 'Mexico',
        city: 'Monterrey', region: 'LATAM', website: 'dpr.com.mx',
        partner_type: 'managed_service_provider', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 340,
        vmware_partner: true, vxrail_partner: true, dell_partner: true, nutanix_partner: true,
        virtualization: true, hci: true, datacenter_infrastructure: true,
        hybrid_cloud: true, backup_and_disaster_recovery: true,
        manufacturing: true, transportation: true,
        description: 'MSP con datacenter propio en Monterrey. Fuerte en VxRail y HCI.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p027', company_name: 'Systemia Venezuela', country: 'Venezuela',
        city: 'Caracas', region: 'LATAM', website: 'systemia.com.ve',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 70,
        dell_partner: true, vmware_partner: true,
        virtualization: true, datacenter_infrastructure: true,
        oil_and_gas: true, energy: true,
        description: 'Integrador IT local con enfoque en sector energético venezolano.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p028', company_name: 'Pacific Edge Solutions', country: 'Chile',
        city: 'Antofagasta', region: 'LATAM', website: 'pacificedge.cl',
        partner_type: 'system_integrator', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Small', estimated_employees: 60,
        cisco_partner: true, rockwell_partner: true,
        industrial_networking: true, edge_computing: true, industrial_iot: true,
        datacenter_infrastructure: true,
        mining: true, energy: true,
        description: 'Integrador de edge computing y redes industriales para minería en el norte de Chile.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p029', company_name: 'Enersis Soluciones Digitales', country: 'Mexico',
        city: 'Mérida', region: 'LATAM', website: 'enersis.mx',
        partner_type: 'engineering_company', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Small', estimated_employees: 115,
        siemens_partner: true, microsoft_partner: true,
        scada_integration: true, industrial_iot: true, industrial_data_platforms: true,
        edge_computing: true, cloud_migration: true,
        energy: true, utilities: true,
        description: 'Firma de ingeniería en transición digital para utilities en el sureste de México.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p030', company_name: 'Datalink Bolivia', country: 'Bolivia',
        city: 'Santa Cruz de la Sierra', region: 'LATAM', website: 'datalink.bo',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 45,
        dell_partner: true, microsoft_partner: true,
        datacenter_infrastructure: true, backup_and_disaster_recovery: true,
        oil_and_gas: true,
        description: 'Reseller IT en Bolivia con fuerte presencia en sector hidrocarburos.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p031', company_name: 'Integratto Tecnologia', country: 'Brazil',
        city: 'Goiânia', region: 'LATAM', website: 'integratto.com.br',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 150,
        dell_partner: true, vmware_partner: true, microsoft_partner: true, veeam_partner: true,
        datacenter_infrastructure: true, virtualization: true, backup_and_disaster_recovery: true,
        description: 'Especialistas en infraestructura IT, cloud y protección de datos en Brasil.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p032', company_name: 'Green', country: 'Brazil',
        city: 'São Paulo', region: 'LATAM', website: 'green.com.br',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 200,
        microsoft_partner: true, cisco_partner: true,
        datacenter_infrastructure: true, hybrid_cloud: true,
        description: 'Green IT Solutions - enfocado en infraestructura y servicios cloud sustentables.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p033', company_name: 'eSoft', country: 'Peru',
        city: 'Lima', region: 'LATAM', website: 'esoftglobaltech.com',
        partner_type: 'consultancy', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 50,
        microsoft_partner: true, aws_partner: true,
        cloud_migration: true,
        description: 'Consultora de modernización y soluciones cloud.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p034', company_name: 'Andes Digital', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'andesdigital.com',
        partner_type: 'consultancy', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 80,
        aws_partner: true, vmware_partner: true,
        cloud_migration: true, hybrid_cloud: true, container_platforms: true,
        description: 'Especialistas en migración cloud (AWS) y modernización de infraestructuras (VMware/RedHat).',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p035', company_name: 'Green ITS', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'greenits.com',
        partner_type: 'consultancy', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 30,
        cisco_partner: true,
        datacenter_infrastructure: true,
        description: 'Consultoría en TI sustentable e infraestructura verde.',
    },
    {
        hpe_certification: "Triple Platinum Plus", ...BASE, id: 'p036', company_name: 'Scanda', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'gruposcanda.com',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Large', estimated_employees: 1200,
        microsoft_partner: true, cisco_partner: true, vmware_partner: true, hpe_partner: true,
        datacenter_infrastructure: true, hybrid_cloud: true, virtualization: true, cloud_migration: true,
        finance: true, manufacturing: true, retail: true,
        description: 'Grupo Scanda es un referente mexicano en integración empresarial TI.',
    },
    {
        hpe_certification: "Gold", ...BASE, id: 'p037', company_name: 'INACOM de México', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'inacom.com.mx',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 250,
        hpe_partner: true, dell_partner: true, microsoft_partner: true, cisco_partner: true,
        datacenter_infrastructure: true, virtualization: true, backup_and_disaster_recovery: true,
        public_sector: true, finance: true,
        description: 'Mayorista e integrador histórico en México, provisión de hardware y licenciamiento IT.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p038', company_name: 'GBM', country: 'Costa Rica',
        city: 'San José', region: 'LATAM', website: 'gbm.net',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 2500,
        cisco_partner: true, vmware_partner: true, microsoft_partner: true, nutanix_partner: true,
        datacenter_infrastructure: true, hybrid_cloud: true, virtualization: true, cloud_migration: true,
        finance: true, retail: true, telecommunications: true, public_sector: true,
        description: 'Gigante integrador IT centroamericano con fuerte alianza regional (IBM, Cisco, VMware).',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p039', company_name: 'NGeek', country: 'Colombia',
        city: 'Bogotá', region: 'LATAM', website: 'ngeek.net',
        partner_type: 'managed_service_provider', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 60,
        aws_partner: true, microsoft_partner: true,
        hybrid_cloud: true, datacenter_infrastructure: true, cloud_migration: true,
        description: 'MSP con capacidades en optimización y aseguraración de nubes híbridas en Colombia y Perú.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p040', company_name: 'RYC', country: 'Mexico',
        city: 'Ciudad Nezahualcóyotl', region: 'LATAM', website: 'rycmx.com',
        partner_type: 'managed_service_provider', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 45,
        cisco_partner: true,
        datacenter_infrastructure: true, edge_computing: true,
        description: 'RYC Redes y Comunicaciones provee soporte IT y soluciones robustas de networking.',
    },
    {
        hpe_certification: "Gold", ...BASE, id: 'p041', company_name: 'iCorp', country: 'Mexico',
        city: 'Querétaro', region: 'LATAM', website: 'icorp.com.mx',
        partner_type: 'managed_service_provider', technology_domain: 'IT',
        company_size: 'Large', estimated_employees: 600,
        microsoft_partner: true, cisco_partner: true, hpe_partner: true, aws_partner: true, google_cloud_partner: true,
        datacenter_infrastructure: true, cloud_migration: true, hybrid_cloud: true,
        manufacturing: true, finance: true, retail: true,
        description: 'Gran proveedor MSP mexicano con foco global en administración delegada de IT y help desk.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p042', company_name: 'INT / Intelligence & Technology', country: 'Mexico',
        city: 'Monterrey', region: 'LATAM', website: 'int.com.mx',
        partner_type: 'consultancy', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 120,
        aws_partner: true, microsoft_partner: true,
        hybrid_cloud: true, cloud_migration: true,
        description: 'Consultoría en transformación digital, IA y modernización de infraestructura TI.',
    },
    {
        hpe_certification: "Silver", ...BASE, id: 'p043', company_name: 'Iterati', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'iterati.com.mx',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 75,
        microsoft_partner: true, aws_partner: true, vmware_partner: true, hpe_partner: true,
        cloud_migration: true, hybrid_cloud: true, backup_and_disaster_recovery: true,
        description: 'Integrador IT y Cloud focalizado en seguridad, respaldo e infraestructuras heterogéneas.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p044', company_name: 'MES Automation', country: 'Mexico',
        city: 'Querétaro', region: 'LATAM', website: 'mesautomation.com',
        partner_type: 'industrial_integrator', technology_domain: 'OT',
        company_size: 'Medium', estimated_employees: 150,
        rockwell_partner: true, aveva_partner: true, siemens_partner: true,
        mes_integration: true, scada_integration: true, industrial_iot: true,
        manufacturing: true, food_and_beverage: true, pharmaceutical: true,
        description: 'Pioneros en Manufactura 4.0, integración de capas MES y automatización industrial en LATAM.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p045', company_name: 'Brute Force Security', country: 'Brazil',
        city: 'São Paulo', region: 'LATAM', website: 'bruteforce.com.br',
        partner_type: 'managed_service_provider', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 35,
        cisco_partner: true, microsoft_partner: true,
        observability: true, edge_computing: true,
        finance: true,
        description: 'Servicios gestionados de Ciberseguridad e Infraestructura (MSSP) enfocado en resiliencia.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p046', company_name: 'Fast Technologies', country: 'Argentina',
        city: 'Buenos Aires', region: 'LATAM', website: '',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 40,
        hpe_partner: true, dell_partner: true, vmware_partner: true,
        datacenter_infrastructure: true, virtualization: true,
        description: 'Provisión ágil de licenciamiento e infraestructura base.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p047', company_name: 'P2P Tech Solutions', country: 'Colombia',
        city: 'Bogotá', region: 'LATAM', website: 'p2pbusinesstech.com',
        partner_type: 'managed_service_provider', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 25,
        microsoft_partner: true,
        datacenter_infrastructure: true,
        description: 'Soluciones IT y soporte integral para SMBs.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p048', company_name: 'IT Technology', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: '',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 20,
        hpe_partner: true, microsoft_partner: true,
        datacenter_infrastructure: true,
        description: 'Distribución y provisión de equipamiento e integraciones IT.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p049', company_name: 'Linware', country: 'Argentina',
        city: 'Buenos Aires', region: 'LATAM', website: 'linware.com.ar',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 55,
        vmware_partner: true, veeam_partner: true, microsoft_partner: true,
        virtualization: true, backup_and_disaster_recovery: true, hci: true,
        description: 'Boutique referente en Argentina para hiperconvergencia, virtualización y Veeam Backup.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p050', company_name: 'Xolsa', country: 'Mexico',
        city: 'Monterrey', region: 'LATAM', website: 'xolsa.com',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 30,
        cisco_partner: true,
        datacenter_infrastructure: true, edge_computing: true,
        description: 'Integraciones tecnológicas corporativas y conectividad de datacenters.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p051', company_name: 'Data Client', country: 'Colombia',
        city: 'Medellín', region: 'LATAM', website: 'clientsdata.com',
        partner_type: 'consultancy', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 40,
        aws_partner: true, microsoft_partner: true,
        hybrid_cloud: true, cloud_migration: true,
        finance: true, retail: true,
        description: 'Advisory en migraciones de datos aceleradas y gobierno de información cloud.',
    },
    {
        hpe_certification: "Platinum", ...BASE, id: 'p052', company_name: 'Adistec', country: 'United States',
        city: 'Miami', region: 'LATAM', website: 'adistec.com',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 1100,
        vmware_partner: true, veeam_partner: true, cisco_partner: true, nutanix_partner: true,
        virtualization: true, backup_and_disaster_recovery: true, datacenter_infrastructure: true, hci: true, cloud_migration: true,
        description: 'Uno de los Super-Mayoristas IT (VAD) panregionales más influyentes de LATAM.',
    },

    // ── Southern Europe Partners ──────────────────────────────
    {
        hpe_certification: "Silver", ...BASE, id: 'p053', company_name: 'Centria Tecnología', country: 'Spain',
        city: 'Madrid', region: 'Europe', website: 'centria.es',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 150,
        hpe_partner: true, vmware_partner: true, veeam_partner: true,
        virtualization: true, datacenter_infrastructure: true, cloud_migration: true,
        finance: true, public_sector: true,
        description: 'Official HPE partner in Spain, providing comprehensive IT infrastructure and consulting.',
    },
    {
        hpe_certification: "Platinum", ...BASE, id: 'p054', company_name: 'ABAST', country: 'Spain',
        city: 'Barcelona', region: 'Europe', website: 'abast.es',
        partner_type: 'managed_service_provider', technology_domain: 'IT',
        company_size: 'Large', estimated_employees: 450,
        hpe_partner: true, dell_partner: true, vmware_partner: true, aws_partner: true,
        virtualization: true, hybrid_cloud: true, cloud_migration: true, datacenter_infrastructure: true,
        manufacturing: true, healthcare: true,
        description: 'Global provider of IT services focusing on cloud migration and cybersecurity.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p055', company_name: 'MZeroNetwork Srl', country: 'Italy',
        city: 'Milan', region: 'Europe', website: 'mzeronetwork.it',
        partner_type: 'managed_service_provider', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 80,
        hpe_partner: true, vmware_partner: true, microsoft_partner: true,
        virtualization: true, backup_and_disaster_recovery: true, hybrid_cloud: true,
        finance: true, telecommunications: true,
        description: 'System management and consulting for corporate ICT infrastructures and Cloud.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p056', company_name: 'Ates Informatica', country: 'Italy',
        city: 'Verona', region: 'Europe', website: 'atesinformatica.it',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 60,
        hpe_partner: true, cisco_partner: true, vmware_partner: true,
        virtualization: true, industrial_networking: true, datacenter_infrastructure: true,
        manufacturing: true, transportation: true,
        description: 'System integrator specializing in virtualization, networking, and managed IT.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p057', company_name: 'Logicalis Portugal', country: 'Portugal',
        city: 'Lisbon', region: 'Europe', website: 'pt.logicalis.com',
        partner_type: 'system_integrator', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Large', estimated_employees: 250,
        hpe_partner: true, cisco_partner: true, microsoft_partner: true,
        virtualization: true, hybrid_cloud: true, edge_computing: true, industrial_iot: true,
        manufacturing: true, telecommunications: true, smart_cities: true,
        description: 'Comprehensive IT/OT services including hybrid data center and edge computing.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p058', company_name: 'IBSCY Ltd', country: 'Cyprus',
        city: 'Limassol', region: 'Europe', website: 'ibscy.com',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 45,
        hpe_partner: true, microsoft_partner: true, dell_partner: true,
        virtualization: true, datacenter_infrastructure: true, hybrid_cloud: true,
        finance: true, shipping: true, public_sector: true,
        description: 'Leading IT infrastructure solutions provider in Cyprus and Greece.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p059', company_name: 'Digimark', country: 'Greece',
        city: 'Athens', region: 'Europe', website: 'digimark.gr',
        partner_type: 'managed_service_provider', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 70,
        hpe_partner: true, cisco_partner: true, microsoft_partner: true,
        virtualization: true, datacenter_infrastructure: true, backup_and_disaster_recovery: true,
        retail: true, finance: true, healthcare: true,
        description: 'Managed service provider focusing on SMB digital transformation and HPE servers.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p060', company_name: 'SinzerAD', country: 'Andorra',
        city: 'Andorra la Vella', region: 'Europe', website: 'sinzerad.ad',
        partner_type: 'consultancy', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 15,
        microsoft_partner: true, hpe_partner: true,
        cloud_migration: true, datacenter_infrastructure: true,
        retail: true, finance: true,
        description: 'Specialized in Microsoft services and hybrid infrastructure creation in Andorra.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p061', company_name: 'SHI San Marino', country: 'San Marino',
        city: 'San Marino', region: 'Europe', website: 'shi.com',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 10,
        hpe_partner: true, dell_partner: true, vmware_partner: true,
        virtualization: true, datacenter_infrastructure: true, backup_and_disaster_recovery: true,
        public_sector: true, finance: true,
        description: 'Global systems integrator serving the San Marino region with award-winning HPE coverage.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p062', company_name: 'Smart Technologies Malta', country: 'Malta',
        city: 'Birkirkara', region: 'Europe', website: 'stmalta.com',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 55,
        hpe_partner: true, dell_partner: true, vmware_partner: true,
        virtualization: true, datacenter_infrastructure: true, hybrid_cloud: true,
        finance: true, healthcare: true, tourism: true,
        description: 'Malta leading system integrator with a strong emphasis on HPE server and storage solutions.',
    },

    // ── Middle East Partners ──────────────────────────────────
    {
        hpe_certification: "None", ...BASE, id: 'p063', company_name: 'Malam Team', country: 'Israel',
        city: 'Petah Tikva', region: 'Middle East', website: 'malamteam.com',
        partner_type: 'system_integrator', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Enterprise', estimated_employees: 4000,
        hpe_partner: true, dell_partner: true, vmware_partner: true, siemens_partner: true,
        virtualization: true, scada_integration: true, industrial_cybersecurity: true, hybrid_cloud: true,
        manufacturing: true, defense: true, energy: true, utilities: true,
        description: 'Major Israeli IT/OT services provider with extensive GreenLake and industrial integration.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p064', company_name: 'Siraj Technologies', country: 'Israel',
        city: 'Beersheba', region: 'Middle East', website: 'siraj-tech.com',
        partner_type: 'industrial_integrator', technology_domain: 'OT',
        company_size: 'Small', estimated_employees: 30,
        industrial_iot: true, edge_computing: true, mes_integration: true, industrial_networking: true,
        manufacturing: true, water_and_wastewater: true,
        description: 'Specialized in seamless IIoT edge device onboarding and industrial data platforms.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p065', company_name: 'Unit One Group', country: 'Gaza Strip',
        city: 'Gaza City', region: 'Middle East', website: 'unitone.ps',
        partner_type: 'managed_service_provider', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 120,
        cloud_migration: true, datacenter_infrastructure: true, virtualization: true,
        public_sector: true, telecommunications: true,
        description: 'Resilient IT services firm in Gaza specializing in ICT infrastructure and modernization.',
    },
    // ── Europe & Middle East Partners (v5.8.0 Expansion) ────────
    // España / Andorra
    {
        hpe_certification: "None", ...BASE, id: 'p101', company_name: 'TD SYNNEX Spain', country: 'Spain',
        city: 'Barcelona', region: 'Europe', website: 'es.tdsynnex.com',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 1500,
        vmware_partner: true, dell_partner: true, hpe_partner: true, cisco_partner: true, microsoft_partner: true,
        virtualization: true, datacenter_infrastructure: true, hybrid_cloud: true,
        description: 'Distribuidor global líder con amplia cobertura en España y Andorra.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p102', company_name: 'Ingram Micro Spain', country: 'Spain',
        city: 'Madrid', region: 'Europe', website: 'es.ingrammicro.com',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 1200,
        vmware_partner: true, dell_partner: true, hpe_partner: true, nutanix_partner: true, cisco_partner: true,
        virtualization: true, hci: true, datacenter_infrastructure: true,
        description: 'Uno de los mayores mayoristas de tecnología en la península ibérica.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p103', company_name: 'Arrow ECS Spain', country: 'Spain',
        city: 'Madrid', region: 'Europe', website: 'arrow.com/ecs/es/',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Large', estimated_employees: 500,
        vmware_partner: true, dell_partner: true, veeam_partner: true, purestorage_partner: true,
        virtualization: true, datacenter_infrastructure: true, backup_and_disaster_recovery: true,
        description: 'Especialista en soluciones de infraestructura y seguridad corporativa.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p104', company_name: 'V-Valley Spain', country: 'Spain',
        city: 'Madrid', region: 'Europe', website: 'v-valley.es',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Large', estimated_employees: 300,
        hpe_partner: true, cisco_partner: true, veeam_partner: true,
        datacenter_infrastructure: true, backup_and_disaster_recovery: true,
        description: 'Mayorista de valor añadido del Grupo Esprinet especializado en soluciones complejas.',
    },
    // Portugal
    {
        hpe_certification: "None", ...BASE, id: 'p105', company_name: 'TD SYNNEX Portugal', country: 'Portugal',
        city: 'Lisboa', region: 'Europe', website: 'pt.tdsynnex.com',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Large', estimated_employees: 400,
        vmware_partner: true, dell_partner: true, hpe_partner: true, cisco_partner: true,
        virtualization: true, datacenter_infrastructure: true,
        description: 'Distribuidor tecnológico principal en el mercado portugués.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p106', company_name: 'Ingram Micro PT', country: 'Portugal',
        city: 'Lisboa', region: 'Europe', website: 'pt.ingrammicro.com',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 250,
        vmware_partner: true, dell_partner: true, hpe_partner: true,
        virtualization: true, datacenter_infrastructure: true,
        description: 'Distribuidor mayorista con fuerte presencia en soluciones de centro de datos.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p107', company_name: 'Arrow ECS Portugal', country: 'Portugal',
        city: 'Lisboa', region: 'Europe', website: 'arrow.com/ecs/pt/',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 150,
        veeam_partner: true, purestorage_partner: true, vmware_partner: true,
        backup_and_disaster_recovery: true, virtualization: true,
        description: 'Foco en servicios de valor y almacenamiento avanzado en Portugal.',
    },
    // Italia / San Marino
    {
        hpe_certification: "Platinum", ...BASE, id: 'p108', company_name: 'Computer Gross', country: 'Italy',
        city: 'Empoli', region: 'Europe', website: 'computergross.it',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 1000,
        hpe_partner: true, dell_partner: true, vmware_partner: true, cisco_partner: true, microsoft_partner: true,
        virtualization: true, datacenter_infrastructure: true, hybrid_cloud: true,
        description: 'Líder en Italia con fuerte enfoque en soluciones de valor y HPE.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p109', company_name: 'Esprinet V-Valley', country: 'Italy',
        city: 'Vimercate', region: 'Europe', website: 'v-valley.com',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 1800,
        hpe_partner: true, dell_partner: true, cisco_partner: true,
        datacenter_infrastructure: true, virtualization: true,
        description: 'El mayor distribuidor en el sur de Europa con operaciones extensas en Italia.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p110', company_name: 'Ingegnos-TD SYNNEX IT', country: 'Italy',
        city: 'Milán', region: 'Europe', website: 'it.tdsynnex.com',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 900,
        vmware_partner: true, microsoft_partner: true, aws_partner: true,
        cloud_migration: true, hybrid_cloud: true, virtualization: true,
        description: 'Presencia masiva en IT tradicional y servicios cloud en Italia.',
    },
    // Grecia / Chipre
    {
        hpe_certification: "Triple Platinum Plus", ...BASE, id: 'p111', company_name: 'Logicom Public Ltd', country: 'Greece',
        city: 'Atenas', region: 'Europe', website: 'logicom.net',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 800,
        hpe_partner: true, cisco_partner: true, microsoft_partner: true, dell_partner: true,
        datacenter_infrastructure: true, cloud_migration: true,
        description: 'Líder regional indiscutible para Grecia, Chipre y el sudeste europeo.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p112', company_name: 'Info Quest Technologies', country: 'Greece',
        city: 'Atenas', region: 'Europe', website: 'infoquest.gr',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Large', estimated_employees: 600,
        vmware_partner: true, dell_partner: true, microsoft_partner: true,
        virtualization: true, hybrid_cloud: true,
        description: 'Pionero en Grecia con fuertes capacidades de servicios gestionados e integración.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p113', company_name: 'Westnet', country: 'Greece',
        city: 'Atenas', region: 'Europe', website: 'westnet.gr',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 200,
        microsoft_partner: true, hpe_partner: true,
        datacenter_infrastructure: true,
        description: 'Distribuidor dinámico con foco en movilidad y centro de datos.',
    },
    // Israel
    {
        hpe_certification: "None", ...BASE, id: 'p114', company_name: 'C-Data', country: 'Israel',
        city: 'Petah Tikva', region: 'Middle East', website: 'c-data.co.il',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Large', estimated_employees: 300,
        dell_partner: true, microsoft_partner: true, hpe_partner: true, veeam_partner: true,
        virtualization: true, datacenter_infrastructure: true,
        description: 'Mayorista de gran escala en Israel con portafolio amplio de infraestructura.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p115', company_name: 'Visual D.G. LTD', country: 'Israel',
        city: 'Beersheba', region: 'Middle East', website: 'visualdg.co.il',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 150,
        vmware_partner: true, cisco_partner: true,
        virtualization: true, datacenter_infrastructure: true,
        description: 'Especialista en networking y virtualización para el mercado israelí.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p116', company_name: 'Safad Engineering', country: 'Israel',
        city: 'Safed', region: 'Middle East', website: 'safad.co.il',
        partner_type: 'engineering_company', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Small', estimated_employees: 80,
        siemens_partner: true, scada_integration: true, industrial_networking: true,
        manufacturing: true, energy: true,
        description: 'Firma de ingeniería israelí enfocada en automatización y sistemas de control.',
    },
    // Malta
    {
        hpe_certification: "None", ...BASE, id: 'p117', company_name: 'Systec Ltd', country: 'Malta',
        city: 'Birkirkara', region: 'Europe', website: 'systec.com.mt',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 100,
        hpe_partner: true, vmware_partner: true, veeam_partner: true,
        virtualization: true, datacenter_infrastructure: true,
        description: 'Principal integrador en Malta con fuerte herencia en sistemas HPE.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p118', company_name: 'Fortune Technologies', country: 'Malta',
        city: 'Santa Venera', region: 'Europe', website: 'fortunemalta.com',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 50,
        microsoft_partner: true, dell_partner: true,
        datacenter_infrastructure: true,
        description: 'Socio de hardware y licencias para SMB en Malta.',
    },
    // Franja de Gaza
    {
        hpe_certification: "None", ...BASE, id: 'p119', company_name: 'Logicom Gaza (via Jordan)', country: 'Gaza Strip',
        city: 'Gaza City', region: 'Middle East', website: 'logicom.net',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 40,
        cisco_partner: true, microsoft_partner: true,
        telecommunications: true, public_sector: true,
        description: 'Operaciones de suministro regional para infraestructura crítica en Gaza.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p120', company_name: 'BCI Mobile Solutions', country: 'Gaza Strip',
        city: 'Gaza City', region: 'Middle East', website: 'bcismarttech.com',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 120,
        microsoft_partner: true, hpe_partner: true,
        telecommunications: true, healthcare: true,
        description: 'Líder local en telecomunicaciones y soluciones de red avanzada para Palestina y Gaza.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p066', company_name: 'HexaCIT', country: 'Gaza Strip',
        city: 'Gaza City', region: 'Middle East', website: 'hexacit.com',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 45,
        microsoft_partner: true, datacenter_infrastructure: true,
        retail: true, healthcare: true,
        description: 'Local system integrator providing software development and IT infrastructure support.',
    },
    // ── Batch Intake (v5.8.1) ─────────────────────────────────
    {
        hpe_certification: "Platinum", ...BASE, id: 'p121', company_name: 'Seidor', country: 'Spain',
        city: 'Barcelona', region: 'Europe', website: 'seidor.com',
        partner_type: 'system_integrator', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Enterprise', estimated_employees: 7500,
        hpe_partner: true, microsoft_partner: true, aws_partner: true,
        virtualization: true, hybrid_cloud: true, cloud_migration: true, datacenter_infrastructure: true,
        manufacturing: true, retail: true, healthcare: true,
        description: 'Consultora tecnológica global con fuerte especialización en SAP (S/4HANA), Cloud y Transformación Digital.',
    },
    {
        hpe_certification: "Platinum", ...BASE, id: 'p122', company_name: 'Ibermática (Ayesa)', country: 'Spain',
        city: 'San Sebastián', region: 'Europe', website: 'ibermatica.com',
        partner_type: 'managed_service_provider', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 12000,
        hpe_partner: true, dell_partner: true, microsoft_partner: true, vmware_partner: true,
        virtualization: true, backup_and_disaster_recovery: true, hybrid_cloud: true,
        public_sector: true, finance: true, manufacturing: true,
        description: 'Líder en servicios IT y digitalización en España, parte del grupo Ayesa, con amplia herencia en HPE.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p123', company_name: 'Lutech', country: 'Italy',
        city: 'Milan', region: 'Europe', website: 'lutech.group',
        partner_type: 'system_integrator', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Large', estimated_employees: 3500,
        hpe_partner: true, cisco_partner: true, vmware_partner: true,
        virtualization: true, industrial_networking: true, hybrid_cloud: true, industrial_cybersecurity: true,
        manufacturing: true, finance: true, telecommunications: true,
        description: 'Líder italiano en transformación digital con fuerte foco en Cloud, Ciberseguridad e Infraestructura.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p124', company_name: 'Var Group', country: 'Italy',
        city: 'Empoli', region: 'Europe', website: 'vargroup.it',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Large', estimated_employees: 3700,
        hpe_partner: true, dell_partner: true, microsoft_partner: true,
        virtualization: true, datacenter_infrastructure: true, cloud_migration: true,
        retail: true, manufacturing: true, food_and_beverage: true,
        description: 'Socio estratégico para la digitalización de empresas en Italia (SAP, IT, Cloud y Digital Workspace).',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p125', company_name: 'UniSystems', country: 'Greece',
        city: 'Athens', region: 'Europe', website: 'unisystems.com',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Large', estimated_employees: 1200,
        hpe_partner: true, dell_partner: true, cisco_partner: true, microsoft_partner: true,
        virtualization: true, datacenter_infrastructure: true, hybrid_cloud: true,
        finance: true, public_sector: true, telecommunications: true,
        description: 'Principal integrador de sistemas en Grecia especializado en banca, finanzas y sector público.',
    },
    {
        hpe_certification: "None", ...BASE, id: 'p126', company_name: 'Bynet', country: 'Israel',
        city: 'Tel Aviv', region: 'Middle East', website: 'bynet.co.il',
        partner_type: 'system_integrator', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Large', estimated_employees: 1300,
        hpe_partner: true, cisco_partner: true, juniper_partner: true,
        virtualization: true, industrial_networking: true, hybrid_cloud: true, datacenter_infrastructure: true,
        defense: true, telecommunications: true, healthcare: true,
        description: 'Líder israelí en integración de redes, seguridad y computación para infraestructuras críticas.',
    },
];

// Utility helpers
export const UNIQUE_COUNTRIES = [...new Set(PARTNER_DATABASE.map(p => p.country))].sort();
export const UNIQUE_REGIONS = [...new Set(PARTNER_DATABASE.map(p => p.region))].sort();

// Hydrate from LocalStorage so manual partners persist across reloads
if (typeof window !== 'undefined') {
    try {
        const stored = localStorage.getItem('hpe_custom_partners');
        if (stored) {
            const customPartners: Partner[] = JSON.parse(stored);
            customPartners.reverse().forEach(p => {
                if (!PARTNER_DATABASE.some(existing => existing.id === p.id)) {
                    PARTNER_DATABASE.unshift(p);
                }
            });
            // Re-calc unique countries just in case
            customPartners.forEach(p => {
                if (!UNIQUE_COUNTRIES.includes(p.country)) UNIQUE_COUNTRIES.push(p.country);
                if (!UNIQUE_REGIONS.includes(p.region)) UNIQUE_REGIONS.push(p.region);
            });
            UNIQUE_COUNTRIES.sort();
            UNIQUE_REGIONS.sort();
        }
    } catch (e) {
        console.error('Error hydrating partners from LocalStorage', e);
    }
}

export const DOMAIN_LABEL: Record<TechnologyDomain, string> = {
    IT: 'IT', OT: 'OT', IT_OT_HYBRID: 'IT/OT Hybrid',
};

export const PARTNER_TYPE_LABEL: Record<string, string> = {
    vendor: 'Fabricante (OEM / Vendor)',
    distributor: 'Distribuidor Mayorista (DISTI)',
    system_integrator: 'Integrador de Sistemas (SI)',
    reseller: 'Revendedor de Valor Agregado (VAR)',
    managed_service_provider: 'Proveedor de Servicios Gestionados (MSP)',
    consultancy: 'Consultoría Tecnológica',
    csp: 'Proveedor de Servicios en la Nube (CSP / SaaS)',
    retailer: 'Minorista / Retail',
    industrial_integrator: 'Integrador Industrial',
    engineering_company: 'Firma de Ingeniería',
    automation_integrator: 'Integrador de Automatización',
};

export const PARTNER_TYPE_DESCRIPTIONS: Record<string, string> = {
    vendor: 'Quien diseña y produce el hardware o software (ej. Dell, SAP).',
    distributor: 'El intermediario logístico y financiero que vende a otras empresas, no al usuario final.',
    system_integrator: 'Quien combina productos de varios fabricantes para crear una solución a medida (proyectos complejos).',
    reseller: 'Venta de productos con un servicio extra sencillo (instalación o soporte inicial).',
    managed_service_provider: 'Empresa que administra de forma remota la infraestructura de TI del cliente (mantenimiento continuo).',
    consultancy: 'Enfocada en estrategia y diseño de soluciones, a veces sin vender el equipo físico.',
    csp: 'Empresas que venden acceso a software o infraestructura por suscripción.',
    retailer: 'Venta directa al consumidor final o pequeñas empresas sin servicios complejos (ej. tiendas de computación).',
};

export const addPartnerToDatabase = (partner: Partner) => {
    PARTNER_DATABASE.unshift(partner); // Add to top of memory list
    PersistenceService.save('partners', PARTNER_DATABASE);
};

export const updatePartnerInDatabase = (id: string, updatedFields: Partial<Partner>) => {
    // 1. Update RAM memory List
    const index = PARTNER_DATABASE.findIndex(p => p.id === id);
    if (index !== -1) {
        PARTNER_DATABASE[index] = { ...PARTNER_DATABASE[index], ...updatedFields };
        PersistenceService.save('partners', PARTNER_DATABASE);
    }
};

/**
 * Initializes the database from persistent storage.
 */
export async function syncPartnerDatabase() {
    const persisted = await PersistenceService.load<Partner>('partners');
    if (persisted && persisted.length > 0) {
        // Update the in-memory array content without replacing the reference
        PARTNER_DATABASE.splice(0, PARTNER_DATABASE.length, ...persisted);
        console.log(`[Persistence] Partner database synced: ${persisted.length} items.`);
    }
}
