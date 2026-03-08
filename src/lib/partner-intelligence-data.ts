// ============================================================
// Partner Intelligence — Data Model, Scoring Engine & Dataset
// HPE Sales Specialist Toolkit
// ============================================================

export type TechnologyDomain = 'IT' | 'OT' | 'IT_OT_HYBRID';

export type PartnerType =
    | 'system_integrator'
    | 'reseller'
    | 'consulting_firm'
    | 'managed_service_provider'
    | 'industrial_integrator'
    | 'engineering_company'
    | 'automation_integrator';

export type OpportunityTier = 'High' | 'Medium' | 'Low';

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

    // ── Optional enrichment ───────────────────────────────────
    description?: string;
    key_projects?: string[];
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
    });
}

// ============================================================
// SAMPLE PARTNER DATASET (~30 partners — IT, OT, Hybrid)
// ============================================================

export const BASE: Omit<Partner,
    'id' | 'company_name' | 'country' | 'city' | 'region' | 'website' |
    'partner_type' | 'technology_domain' | 'company_size' | 'estimated_employees'
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
};

export const PARTNER_DATABASE: Partner[] = [
    // ── IT Integrators ─────────────────────────────────────────
    {
        ...BASE, id: 'p001', company_name: 'Axtel Enterprises', country: 'Mexico',
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
        ...BASE, id: 'p002', company_name: 'Telmex Soluciones', country: 'Mexico',
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
        ...BASE, id: 'p003', company_name: 'Ingram Micro Colombia', country: 'Colombia',
        city: 'Bogotá', region: 'LATAM', website: 'ingrammicro.com',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 2500,
        vmware_partner: true, dell_partner: true, nutanix_partner: true,
        hpe_partner: true, cisco_partner: true, microsoft_partner: true,
        virtualization: true, hci: true, datacenter_infrastructure: true,
        description: 'Distribuidor mayorista con amplio portafolio IT incluyendo HPE.',
    },
    {
        ...BASE, id: 'p004', company_name: 'Sievert TI', country: 'Brazil',
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
        ...BASE, id: 'p005', company_name: 'Globant Infrastructure', country: 'Argentina',
        city: 'Buenos Aires', region: 'LATAM', website: 'globant.com',
        partner_type: 'consulting_firm', technology_domain: 'IT',
        company_size: 'Enterprise', estimated_employees: 25000,
        aws_partner: true, google_cloud_partner: true, microsoft_partner: true,
        hybrid_cloud: true, cloud_migration: true, container_platforms: true,
        observability: true,
        description: 'Firma de consultoría cloud-native con capacidades multi-cloud.',
    },
    {
        ...BASE, id: 'p006', company_name: 'Nexxt Solutions', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'nexxt.com.co',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 120,
        cisco_partner: true, vmware_partner: true,
        datacenter_infrastructure: true, virtualization: true,
        description: 'Reseller Cisco y VMware en mercado SMB de Chile.',
    },
    {
        ...BASE, id: 'p007', company_name: 'Logicalis LATAM', country: 'Mexico',
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
        ...BASE, id: 'p008', company_name: 'Automatización Industrial Monterrey', country: 'Mexico',
        city: 'Monterrey', region: 'LATAM', website: 'aimty.com.mx',
        partner_type: 'automation_integrator', technology_domain: 'OT',
        company_size: 'Small', estimated_employees: 85,
        siemens_partner: true, rockwell_partner: true,
        scada_integration: true, plc_programming: true, process_control: true,
        manufacturing: true, food_and_beverage: true,
        description: 'Integrador industrial especializado en PLC Siemens y Rockwell en manufactura.',
    },
    {
        ...BASE, id: 'p009', company_name: 'ControlSys de México', country: 'Mexico',
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
        ...BASE, id: 'p010', company_name: 'IDS Ingeniería', country: 'Colombia',
        city: 'Medellín', region: 'LATAM', website: 'ids.com.co',
        partner_type: 'industrial_integrator', technology_domain: 'OT',
        company_size: 'Medium', estimated_employees: 320,
        siemens_partner: true, abb_partner: true, honeywell_partner: true,
        scada_integration: true, process_control: true, plc_programming: true,
        industrial_cybersecurity: true, utilities: true, energy: true, oil_and_gas: true,
        description: 'Integrador SCADA líder en sector energía y utilities en Colombia.',
    },
    {
        ...BASE, id: 'p011', company_name: 'Process Solutions Brazil', country: 'Brazil',
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
        ...BASE, id: 'p012', company_name: 'Intelcon Industrial', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'intelcon.cl',
        partner_type: 'industrial_integrator', technology_domain: 'OT',
        company_size: 'Medium', estimated_employees: 260,
        siemens_partner: true, rockwell_partner: true,
        scada_integration: true, plc_programming: true, process_control: true,
        mining: true, energy: true, water_and_wastewater: true,
        description: 'Especialista en SCADA minero y utilities en Chile.',
    },
    {
        ...BASE, id: 'p013', company_name: 'Tecnomatic Argentina', country: 'Argentina',
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
        ...BASE, id: 'p014', company_name: 'ProA Technology', country: 'Mexico',
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
        ...BASE, id: 'p015', company_name: 'Wara Technologies', country: 'Peru',
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
        ...BASE, id: 'p016', company_name: 'Grupo Assa Latam', country: 'Colombia',
        city: 'Bogotá', region: 'LATAM', website: 'grupoassa.com',
        partner_type: 'consulting_firm', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Large', estimated_employees: 1800,
        microsoft_partner: true, aws_partner: true, siemens_partner: true,
        aveva_partner: true,
        hybrid_cloud: true, cloud_migration: true, digital_manufacturing: true,
        industrial_iot: true, industrial_data_platforms: true, mes_integration: true,
        manufacturing: true, oil_and_gas: true, energy: true,
        description: 'Consultora digital con práctica Industry 4.0 y cloud híbrido.',
    },
    {
        ...BASE, id: 'p017', company_name: 'Soluciones i4.0 México', country: 'Mexico',
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
        ...BASE, id: 'p018', company_name: 'Ingetech Ecuador', country: 'Ecuador',
        city: 'Quito', region: 'LATAM', website: 'ingetech.ec',
        partner_type: 'industrial_integrator', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Small', estimated_employees: 65,
        siemens_partner: true, cisco_partner: true,
        scada_integration: true, industrial_networking: true, datacenter_infrastructure: true,
        oil_and_gas: true, utilities: true,
        description: 'Integrador OT con capacidades de redes industriales y datacenter básico.',
    },
    {
        ...BASE, id: 'p019', company_name: 'IIoT Solutions México', country: 'Mexico',
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
        ...BASE, id: 'p020', company_name: 'CyberOT Chile', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'cyberot.cl',
        partner_type: 'consulting_firm', technology_domain: 'IT_OT_HYBRID',
        company_size: 'Small', estimated_employees: 55,
        industrial_cybersecurity: true, scada_integration: true, industrial_networking: true,
        datacenter_infrastructure: true, observability: true,
        mining: true, energy: true, utilities: true,
        description: 'Boutique de ciberseguridad IT/OT convergida para industrias críticas.',
    },
    {
        ...BASE, id: 'p021', company_name: 'TechPetro Services', country: 'Colombia',
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
        ...BASE, id: 'p022', company_name: 'Xytech industrial', country: 'Brazil',
        city: 'Curitiba', region: 'LATAM', website: 'xytech.ind.br',
        partner_type: 'automation_integrator', technology_domain: 'OT',
        company_size: 'Medium', estimated_employees: 195,
        siemens_partner: true, rockwell_partner: true, abb_partner: true,
        plc_programming: true, scada_integration: true, mes_integration: true,
        manufacturing: true, food_and_beverage: true, pharmaceutical: true,
        description: 'Integrador industrial con cobertura nacional en Brasil.',
    },
    {
        ...BASE, id: 'p023', company_name: 'Infracloud Perú', country: 'Peru',
        city: 'Lima', region: 'LATAM', website: 'infracloud.pe',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 110,
        vmware_partner: true, dell_partner: true, nutanix_partner: true,
        virtualization: true, hci: true, backup_and_disaster_recovery: true,
        mining: true, oil_and_gas: true,
        description: 'Integrador IT enfocado en sectores extractivos en Perú.',
    },
    {
        ...BASE, id: 'p024', company_name: 'BML Networking', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'bml.com.mx',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Medium', estimated_employees: 280,
        cisco_partner: true, vmware_partner: true, microsoft_partner: true,
        hpe_partner: true,
        datacenter_infrastructure: true, virtualization: true, observability: true,
        description: 'Partner HPE activo en México. Fuerte en networking y datacenter.',
    },
    {
        ...BASE, id: 'p025', company_name: 'DigitalPlant Argentina', country: 'Argentina',
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
        ...BASE, id: 'p026', company_name: 'DataCenter DPR Monterrey', country: 'Mexico',
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
        ...BASE, id: 'p027', company_name: 'Systemia Venezuela', country: 'Venezuela',
        city: 'Caracas', region: 'LATAM', website: 'systemia.com.ve',
        partner_type: 'system_integrator', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 70,
        dell_partner: true, vmware_partner: true,
        virtualization: true, datacenter_infrastructure: true,
        oil_and_gas: true, energy: true,
        description: 'Integrador IT local con enfoque en sector energético venezolano.',
    },
    {
        ...BASE, id: 'p028', company_name: 'Pacific Edge Solutions', country: 'Chile',
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
        ...BASE, id: 'p029', company_name: 'Enersis Soluciones Digitales', country: 'Mexico',
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
        ...BASE, id: 'p030', company_name: 'Datalink Bolivia', country: 'Bolivia',
        city: 'Santa Cruz de la Sierra', region: 'LATAM', website: 'datalink.bo',
        partner_type: 'reseller', technology_domain: 'IT',
        company_size: 'Small', estimated_employees: 45,
        dell_partner: true, microsoft_partner: true,
        datacenter_infrastructure: true, backup_and_disaster_recovery: true,
        oil_and_gas: true,
        description: 'Reseller IT en Bolivia con fuerte presencia en sector hidrocarburos.',
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

export const PARTNER_TYPE_LABEL: Record<PartnerType, string> = {
    system_integrator: 'System Integrator',
    reseller: 'Reseller',
    consulting_firm: 'Consulting Firm',
    managed_service_provider: 'MSP',
    industrial_integrator: 'Industrial Integrator',
    engineering_company: 'Engineering Company',
    automation_integrator: 'Automation Integrator',
};

export const addPartnerToDatabase = (partner: Partner) => {
    PARTNER_DATABASE.unshift(partner); // Add to top of memory list

    // Persist to LocalStorage
    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('hpe_custom_partners');
            let custom: Partner[] = [];
            if (stored) {
                custom = JSON.parse(stored);
            }
            custom.unshift(partner);
            localStorage.setItem('hpe_custom_partners', JSON.stringify(custom));
        } catch (e) {
            console.error('Error saving to LocalStorage', e);
        }
    }
};

export const updatePartnerInDatabase = (id: string, updatedFields: Partial<Partner>) => {
    // 1. Update RAM memory List
    const index = PARTNER_DATABASE.findIndex(p => p.id === id);
    if (index !== -1) {
        PARTNER_DATABASE[index] = { ...PARTNER_DATABASE[index], ...updatedFields };
    }

    // 2. Persist to LocalStorage (Overwrite)
    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('hpe_custom_partners');
            if (stored) {
                let custom: Partner[] = JSON.parse(stored);
                const customIndex = custom.findIndex(p => p.id === id);
                if (customIndex !== -1) {
                    custom[customIndex] = { ...custom[customIndex], ...updatedFields };
                    localStorage.setItem('hpe_custom_partners', JSON.stringify(custom));
                } else if (index !== -1) {
                    // Si el partner era del base mock inicial pero el usuario lo editó
                    // lo clonamos hacia los custom_partners para que la edición sobreviva recargas.
                    custom.unshift(PARTNER_DATABASE[index]);
                    localStorage.setItem('hpe_custom_partners', JSON.stringify(custom));
                }
            } else if (index !== -1) {
                // Instanciar local storage si el primero que editaron fue un mock base
                localStorage.setItem('hpe_custom_partners', JSON.stringify([PARTNER_DATABASE[index]]));
            }
        } catch (e) {
            console.error('Error updating LocalStorage', e);
        }
    }
};
