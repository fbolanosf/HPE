// ============================================================
// Customer Intelligence — Data Model, Scoring Engine & Dataset
// HPE Sales Specialist Toolkit v7.0.0
// Focus: End-User prospects for HPE Virtualization solutions
// ============================================================

export type CustomerSize = 'SMB' | 'Mid-Market' | 'Enterprise' | 'Large Enterprise';
export type CustomerTier = 'Hot' | 'Warm' | 'Cold';
export type HypervisorInUse = 'VMware' | 'Hyper-V' | 'Microsoft Hyper-V' | 'Nutanix' | 'KVM/OpenStack' | 'Mixed' | 'None/Bare Metal';
export type CloudAdoption = 'On-Premise Only' | 'Hybrid' | 'Multi-Cloud' | 'Cloud-First';

import { PersistenceService } from './persistence-service';

export interface CustomerContact {
    id: string;
    name: string;
    title: string;
    email: string;
    phone: string;
}

export interface Customer {
    // ── Identity ──────────────────────────────────────────────
    id: string;
    company_name: string;
    country: string;
    city: string;
    region: 'LATAM' | 'North America' | 'Europe' | 'APAC' | 'Middle East';
    website: string;
    industry: string;
    company_size: CustomerSize;
    estimated_employees: number;
    estimated_servers: number;

    // ── Current IT Infrastructure ─────────────────────────────
    current_hypervisor: HypervisorInUse;
    cloud_adoption: CloudAdoption;
    vmware_version_eol: boolean;          // Running EOL VMware version (6.x, 7.x)
    vmware_license_renewal_due: boolean;  // VMware renewal coming in next 12 months
    broadcom_pricing_impact: boolean;     // Affected by Broadcom price increases
    nutanix_user: boolean;
    microsoft_hyper_v_user: boolean;
    on_prem_datacenter: boolean;
    edge_infrastructure: boolean;

    // ── IT Spending Signals ───────────────────────────────────
    digital_transformation_initiative: boolean;
    datacenter_refresh_cycle: boolean;    // Hardware >5yo due for refresh
    cloud_repatriation_interest: boolean; // Moving workloads back from public cloud
    cost_optimization_priority: boolean;
    green_it_initiative: boolean;

    // ── Industries / Verticals ────────────────────────────────
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
    education: boolean;
    media: boolean;

    // ── HPE Relationship ──────────────────────────────────────
    existing_hpe_hardware: boolean;       // Already uses HPE servers/storage
    hpe_greenlake_interest: boolean;
    hpe_contact_established: boolean;

    // ── Enrichment ────────────────────────────────────────────
    description?: string;
    pain_points?: string[];
    latitude?: number;
    longitude?: number;
    address?: string;

    // ── Advanced Metadata ─────────────────────────────────────
    logo_url?: string;
    short_description?: string;
    it_headcount?: number;
    annual_revenue?: number;
    revenue_string?: string;
    tech_stack?: string[];

    // ── Contact Information ──────────────────────────────────
    contacts?: CustomerContact[];
    contact_name?: string;    // Legacy
    contact_title?: string;   // Legacy
    contact_email?: string;   // Legacy
    contact_phone?: string;   // Legacy
}

// ============================================================
// HPE CUSTOMER SCORING ENGINE
// Signals that indicate likelihood to adopt HPE VM Essentials
// ============================================================

export interface CustomerScoreResult {
    score: number;
    tier: CustomerTier;
    breakdown: { label: string; value: number }[];
}

const CUSTOMER_SCORE_WEIGHTS: Record<string, number> = {
    // Strongest signals (VMware migration triggers)
    vmware_license_renewal_due: 8,
    broadcom_pricing_impact: 8,
    vmware_version_eol: 6,

    // Infrastructure modernization
    datacenter_refresh_cycle: 5,
    cloud_repatriation_interest: 5,
    cost_optimization_priority: 4,
    on_prem_datacenter: 3,

    // Existing HPE relationship
    existing_hpe_hardware: 5,
    hpe_greenlake_interest: 4,
    hpe_contact_established: 3,

    // Digital transformation
    digital_transformation_initiative: 3,
    edge_infrastructure: 3,
    green_it_initiative: 2,

    // Other hypervisor (convertible)
    nutanix_user: 3,
    microsoft_hyper_v_user: 2,

    // Industry verticals with active virtualization budgets
    finance: 2,
    healthcare: 2,
    manufacturing: 2,
    telecommunications: 2,
    public_sector: 1,
    energy: 1,
};

export function scoreCustomer(c: Customer): CustomerScoreResult {
    const breakdown: { label: string; value: number }[] = [];
    let total = 0;

    const add = (label: string, key: string) => {
        const val = CUSTOMER_SCORE_WEIGHTS[key] ?? 0;
        if (val !== 0 && (c as unknown as Record<string, unknown>)[key]) {
            breakdown.push({ label, value: val });
            total += val;
        }
    };

    add('Renovación VMware pendiente', 'vmware_license_renewal_due');
    add('Impacto precios Broadcom', 'broadcom_pricing_impact');
    add('Versión VMware en EOL', 'vmware_version_eol');
    add('Refresh de datacenter pendiente', 'datacenter_refresh_cycle');
    add('Repatriación desde nube pública', 'cloud_repatriation_interest');
    add('Optimización de costos IT', 'cost_optimization_priority');
    add('Datacenter on-premise activo', 'on_prem_datacenter');
    add('Infraestructura HPE existente', 'existing_hpe_hardware');
    add('Interés en HPE GreenLake', 'hpe_greenlake_interest');
    add('Contacto HPE establecido', 'hpe_contact_established');
    add('Iniciativa de transformación digital', 'digital_transformation_initiative');
    add('Infraestructura edge activa', 'edge_infrastructure');
    add('Iniciativa Green IT', 'green_it_initiative');
    add('Usuario Nutanix (migrable)', 'nutanix_user');
    add('Usuario Hyper-V (migrable)', 'microsoft_hyper_v_user');
    add('Vertical: Finanzas', 'finance');
    add('Vertical: Salud', 'healthcare');
    add('Vertical: Manufactura', 'manufacturing');
    add('Vertical: Telecomunicaciones', 'telecommunications');
    add('Vertical: Sector Público', 'public_sector');
    add('Vertical: Energía', 'energy');

    const tier: CustomerTier = total >= 18 ? 'Hot' : total >= 9 ? 'Warm' : 'Cold';
    return { score: Math.max(0, total), tier, breakdown };
}

// ============================================================
// CUSTOMER SEARCH & FILTER ENGINE
// ============================================================

export interface CustomerFilters {
    query?: string;
    country?: string;
    region?: string;
    industry?: string;
    company_size?: CustomerSize | 'ALL';
    current_hypervisor?: HypervisorInUse | 'ALL';
    cloud_adoption?: CloudAdoption | 'ALL';
    tier?: CustomerTier | 'ALL';
    broadcom_impact?: boolean;
    has_hpe_hardware?: boolean;
}

export function searchCustomers(customers: Customer[], filters: CustomerFilters): Customer[] {
    return customers.filter((c) => {
        if (filters.query) {
            const q = filters.query.toLowerCase();
            if (
                !c.company_name.toLowerCase().includes(q) &&
                !c.country.toLowerCase().includes(q) &&
                !c.industry.toLowerCase().includes(q) &&
                !(c.description ?? '').toLowerCase().includes(q)
            ) return false;
        }
        if (filters.country && c.country !== filters.country) return false;
        if (filters.region && filters.region !== 'ALL' && c.region !== filters.region) return false;
        if (filters.company_size && filters.company_size !== 'ALL' && c.company_size !== filters.company_size) return false;
        if (filters.current_hypervisor && filters.current_hypervisor !== 'ALL' && c.current_hypervisor !== filters.current_hypervisor) return false;
        if (filters.cloud_adoption && filters.cloud_adoption !== 'ALL' && c.cloud_adoption !== filters.cloud_adoption) return false;
        if (filters.industry && filters.industry !== 'ALL' && !c.industry.toLowerCase().includes(filters.industry.toLowerCase())) return false;
        if (filters.broadcom_impact && !c.broadcom_pricing_impact) return false;
        if (filters.has_hpe_hardware && !c.existing_hpe_hardware) return false;
        if (filters.tier && filters.tier !== 'ALL') {
            if (scoreCustomer(c).tier !== filters.tier) return false;
        }
        return true;
    });
}

// ============================================================
// BASE TEMPLATE
// ============================================================
const BASE_CUSTOMER: Omit<Customer, 'id' | 'company_name' | 'country' | 'city' | 'region' | 'website' | 'industry' | 'company_size' | 'estimated_employees' | 'estimated_servers'> = {
    current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
    vmware_version_eol: false, vmware_license_renewal_due: false, broadcom_pricing_impact: false,
    nutanix_user: false, microsoft_hyper_v_user: false, on_prem_datacenter: true,
    edge_infrastructure: false, digital_transformation_initiative: false,
    datacenter_refresh_cycle: false, cloud_repatriation_interest: false,
    cost_optimization_priority: false, green_it_initiative: false,
    existing_hpe_hardware: false, hpe_greenlake_interest: false, hpe_contact_established: false,
    manufacturing: false, mining: false, oil_and_gas: false, energy: false,
    utilities: false, food_and_beverage: false, pharmaceutical: false,
    water_and_wastewater: false, transportation: false, smart_cities: false,
    retail: false, healthcare: false, finance: false, telecommunications: false,
    public_sector: false, education: false, media: false,
    contacts: [],
    logo_url: undefined, 
    short_description: undefined,
    it_headcount: undefined,
    annual_revenue: undefined,
    revenue_string: undefined,
    tech_stack: [],
};

// ============================================================
// CUSTOMER DATABASE — ~35 Prospects (LATAM + Europe)
// ============================================================
export const CUSTOMER_DATABASE: Customer[] = [
    {
        ...BASE_CUSTOMER, id: 'c023', company_name: 'Aeropuertos y Servicios Auxiliares (ASA)', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'asa.gob.mx',
        industry: 'Transporte / Sector Público', company_size: 'Enterprise', estimated_employees: 8500, estimated_servers: 350,
        current_hypervisor: 'VMware', cloud_adoption: 'On-Premise Only',
        vmware_version_eol: true, broadcom_pricing_impact: true, datacenter_refresh_cycle: true,
        on_prem_datacenter: true, existing_hpe_hardware: true,
        public_sector: true, transportation: true,
        latitude: 19.4326, longitude: -99.1332,
        description: 'Organismo operador de aeropuertos federales. Infraestructura VMware crítica para operaciones.',
        pain_points: ['Alta disponibilidad 99.99%', 'EOL crítico de hypervisor'],
    },
    {
        ...BASE_CUSTOMER, id: 'c048', company_name: 'América Móvil (Claro/Telcel)', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'americamovil.com',
        industry: 'Telecomunicaciones', company_size: 'Large Enterprise', estimated_employees: 180000, estimated_servers: 25000,
        current_hypervisor: 'Mixed', cloud_adoption: 'Multi-Cloud',
        broadcom_pricing_impact: true, hpe_greenlake_interest: true, telecommunications: true,
        description: 'Global telco giant. Complex NFV/SDN environments.',
        pain_points: ['Escalating NFV costs on VMware', 'Vendor lock-in'],
    },
    {
        ...BASE_CUSTOMER, id: 'c047', company_name: 'Antofagasta Minerals', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'aminerals.cl',
        industry: 'Minería', company_size: 'Large Enterprise', estimated_employees: 6000, estimated_servers: 400,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, edge_infrastructure: true, mining: true,
        description: 'Major copper producer. Early adopter of industrial digital tech.',
        pain_points: ['Remote site management', 'Increasing virtualization TCO'],
    },
    {
        ...BASE_CUSTOMER, id: 'c032', company_name: 'Axtel Industries (Industrias México)', country: 'Mexico',
        city: 'Monterrey', region: 'LATAM', website: 'axtelindustries.com',
        industry: 'Manufactura / Tecnología Industrial', company_size: 'Enterprise', estimated_employees: 2400, estimated_servers: 180,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, existing_hpe_hardware: true, edge_infrastructure: true,
        datacenter_refresh_cycle: true,
        manufacturing: true,
        latitude: 25.6866, longitude: -100.3161,
        description: 'Fabricante de soluciones industriales. Fuerte uso de HPE en el piso de producción.',
        pain_points: ['Migración de VMware en MES', 'Relación HPE sin explotar en virtualización'],
    },
    {
        ...BASE_CUSTOMER, id: 'c037', company_name: 'Banco de Bogotá', country: 'Colombia',
        city: 'Bogotá', region: 'LATAM', website: 'bancodebogota.com',
        industry: 'Finanzas', company_size: 'Large Enterprise', estimated_employees: 14000, estimated_servers: 800,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, cost_optimization_priority: true, finance: true,
        description: 'Oldest commercial bank in Colombia. Focused on modernization.',
        pain_points: ['Infrastructure consolidation', 'Cost reduction targets'],
    },
    {
        ...BASE_CUSTOMER, id: 'c034', company_name: 'Banco de Crédito del Perú (BCP)', country: 'Peru',
        city: 'Lima', region: 'LATAM', website: 'viabcp.com',
        industry: 'Finanzas', company_size: 'Large Enterprise', estimated_employees: 17000, estimated_servers: 1200,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, datacenter_refresh_cycle: true, finance: true,
        description: 'Peru\'s largest bank. Critical infrastructure on VMware.',
        pain_points: ['Escalating licensing costs', 'Legacy hardware refresh'],
    },
    {
        ...BASE_CUSTOMER, id: 'c036', company_name: 'Banco Galicia', country: 'Argentina',
        city: 'Buenos Aires', region: 'LATAM', website: 'galicia.ar',
        industry: 'Finanzas', company_size: 'Large Enterprise', estimated_employees: 6000, estimated_servers: 500,
        current_hypervisor: 'VMware', cloud_adoption: 'On-Premise Only',
        broadcom_pricing_impact: true, vmware_version_eol: true, finance: true,
        description: 'Major Argentine private bank. High on-premise density.',
        pain_points: ['EOL version support', 'Budget constraints due to inflation'],
    },
    {
        ...BASE_CUSTOMER, id: 'c035', company_name: 'Banco Santander Chile', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'santander.cl',
        industry: 'Finanzas', company_size: 'Large Enterprise', estimated_employees: 11000, estimated_servers: 950,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, existing_hpe_hardware: true, finance: true,
        description: 'Leading bank in Chile. Evaluating virtualization alternatives.',
        pain_points: ['Contract renewal with Broadcom', 'HCI evaluation'],
    },
    {
        ...BASE_CUSTOMER, id: 'c016', company_name: 'Banco Santander España', country: 'Spain',
        city: 'Madrid', region: 'Europe', website: 'bancosantander.es',
        industry: 'Banca y Finanzas', company_size: 'Large Enterprise', estimated_employees: 200000, estimated_servers: 15000,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, vmware_license_renewal_due: true, cloud_repatriation_interest: true,
        cost_optimization_priority: true, existing_hpe_hardware: true, green_it_initiative: true,
        finance: true,
        latitude: 40.4530, longitude: -3.6883,
        description: 'Banco global con operaciones masivas en Europa y LATAM. VMware consolidado globalmente.',
        pain_points: ['Impacto multi-millonario de Broadcom', 'Presión ESG para reducir consumo datacenter'],
    },
    {
        ...BASE_CUSTOMER, id: 'c003', company_name: 'Bancolombia', country: 'Colombia',
        city: 'Medellín', region: 'LATAM', website: 'bancolombia.com',
        industry: 'Banca y Finanzas', company_size: 'Large Enterprise', estimated_employees: 27000, estimated_servers: 1800,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, vmware_license_renewal_due: true, on_prem_datacenter: true,
        datacenter_refresh_cycle: true, green_it_initiative: true, existing_hpe_hardware: true,
        finance: true,
        latitude: 6.2442, longitude: -75.5812,
        description: 'Banco líder en Colombia con fuerte adopción VMware. Comprometido con Green IT y modernización.',
        pain_points: ['Licencias VMware duplicadas post-Broadcom', 'Renovación de servidores Gen10'],
    },
    {
        ...BASE_CUSTOMER, id: 'c001', company_name: 'Banorte', country: 'Mexico',
        city: 'Monterrey', region: 'LATAM', website: 'banorte.com',
        industry: 'Banca y Finanzas', company_size: 'Large Enterprise', estimated_employees: 28000, estimated_servers: 2500,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        vmware_license_renewal_due: true, broadcom_pricing_impact: true, vmware_version_eol: true,
        on_prem_datacenter: true, datacenter_refresh_cycle: true,
        existing_hpe_hardware: true, cost_optimization_priority: true,
        finance: true,
        latitude: 25.6866, longitude: -100.3161,
        description: 'Segundo banco más grande de México. Amplia infraestructura VMware afectada por nuevos precios Broadcom.',
        pain_points: ['Aumento de costos Broadcom +40%', 'EOL de ESXi 7.x', 'Refresh de hardware en 2025'],
    },
    {
        ...BASE_CUSTOMER, id: 'c055', company_name: 'Bupa Chile', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'bupa.cl',
        industry: 'Salud', company_size: 'Enterprise', estimated_employees: 9000, estimated_servers: 400,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, cost_optimization_priority: true, healthcare: true,
        description: 'Global health provider division. High standards for data protection.',
        pain_points: ['Security overhead', 'Infrastructure cost control'],
    },
    {
        ...BASE_CUSTOMER, id: 'c028', company_name: 'Caixabank', country: 'Spain',
        city: 'Valencia', region: 'Europe', website: 'caixabank.es',
        industry: 'Banca y Finanzas', company_size: 'Large Enterprise', estimated_employees: 45000, estimated_servers: 3200,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, vmware_license_renewal_due: true, existing_hpe_hardware: true,
        cost_optimization_priority: true, digital_transformation_initiative: true,
        finance: true,
        latitude: 39.4699, longitude: -0.3763,
        description: 'Tercer banco más grande de España. Fuerte relación con HPE en hardware.',
        pain_points: ['Costos Broadcom bloqueando presupuesto de innovación', 'Necesidad de escalabilidad HCI'],
    },
    {
        ...BASE_CUSTOMER, id: 'c004', company_name: 'CEMEX', country: 'Mexico',
        city: 'Monterrey', region: 'LATAM', website: 'cemex.com',
        industry: 'Manufactura / Construcción', company_size: 'Large Enterprise', estimated_employees: 45000, estimated_servers: 3500,
        current_hypervisor: 'Mixed', cloud_adoption: 'Hybrid',
        vmware_version_eol: true, broadcom_pricing_impact: true, on_prem_datacenter: true,
        edge_infrastructure: true, datacenter_refresh_cycle: true, digital_transformation_initiative: true,
        cost_optimization_priority: true, existing_hpe_hardware: true,
        manufacturing: true,
        latitude: 25.6866, longitude: -100.3161,
        description: 'Gigante cementera global con operaciones industriales y datacenters en múltiples países.',
        pain_points: ['Hypervisores heterogéneos', 'Costos de edge computing', 'Refresh de infraestructura global'],
    },
    {
        ...BASE_CUSTOMER, id: 'c040', company_name: 'Cencosud', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'cencosud.com',
        industry: 'Retail', company_size: 'Large Enterprise', estimated_employees: 140000, estimated_servers: 3200,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, existing_hpe_hardware: true, retail: true,
        description: 'Pan-regional retail giant. Significant server footprint.',
        pain_points: ['Multi-country IT management', 'Modernizing supply chain IT'],
    },
    {
        ...BASE_CUSTOMER, id: 'c014', company_name: 'CFE (Comisión Federal de Electricidad)', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'cfe.mx',
        industry: 'Energía / Utilities', company_size: 'Large Enterprise', estimated_employees: 75000, estimated_servers: 4500,
        current_hypervisor: 'VMware', cloud_adoption: 'On-Premise Only',
        vmware_license_renewal_due: true, broadcom_pricing_impact: true, on_prem_datacenter: true,
        edge_infrastructure: true, datacenter_refresh_cycle: true, existing_hpe_hardware: true,
        energy: true, utilities: true,
        latitude: 19.4326, longitude: -99.1332,
        description: 'Empresa eléctrica estatal de México. SCADA y sistemas de control sobre infraestructura VMware.',
        pain_points: ['Infraestructura crítica con alta disponibilidad', 'EOL VMware en plantas generadoras'],
    },
    {
        ...BASE_CUSTOMER, id: 'c054', company_name: 'Christus Muguerza', country: 'Mexico',
        city: 'Monterrey', region: 'LATAM', website: 'christusmuguerza.com.mx',
        industry: 'Salud', company_size: 'Enterprise', estimated_employees: 7000, estimated_servers: 350,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, existing_hpe_hardware: true, healthcare: true,
        description: 'Private Catholic health system in Mexico. Digital hospital vision.',
        pain_points: ['Modernizing patient portals', 'Licensing TCO'],
    },
    {
        ...BASE_CUSTOMER, id: 'c011', company_name: 'Claro Colombia', country: 'Colombia',
        city: 'Bogotá', region: 'LATAM', website: 'claro.com.co',
        industry: 'Telecomunicaciones', company_size: 'Large Enterprise', estimated_employees: 9000, estimated_servers: 1200,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, vmware_license_renewal_due: true, digital_transformation_initiative: true,
        existing_hpe_hardware: true, cloud_repatriation_interest: true,
        telecommunications: true,
        latitude: 4.7110, longitude: -74.0721,
        description: 'Operador de telecomunicaciones Claro en Colombia. Evaluando VNF sobre plataformas modernas.',
        pain_points: ['Consolidación de plataformas VNF', 'Costos Broadcom en infraestructura SDN'],
    },
    {
        ...BASE_CUSTOMER, id: 'c015', company_name: 'Codelco', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'codelco.com',
        industry: 'Minería', company_size: 'Large Enterprise', estimated_employees: 30000, estimated_servers: 1800,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, on_prem_datacenter: true, edge_infrastructure: true,
        datacenter_refresh_cycle: true, digital_transformation_initiative: true,
        existing_hpe_hardware: true, cost_optimization_priority: true,
        mining: true,
        latitude: -33.4489, longitude: -70.6693,
        description: 'Mayor empresa cuprífera del mundo. Infraestructura edge en minas remotas del desierto de Atacama.',
        pain_points: ['Conectividad edge en sitios remotos', 'Costos de licenciamiento minero VMware'],
    },
    {
        ...BASE_CUSTOMER, id: 'c022', company_name: 'Coppel', country: 'Mexico',
        city: 'Culiacán', region: 'LATAM', website: 'coppel.com',
        industry: 'Retail / Fintech', company_size: 'Enterprise', estimated_employees: 62000, estimated_servers: 800,
        current_hypervisor: 'VMware', cloud_adoption: 'On-Premise Only',
        broadcom_pricing_impact: true, datacenter_refresh_cycle: true, cost_optimization_priority: true,
        on_prem_datacenter: true,
        retail: true, finance: true,
        latitude: 24.8091, longitude: -107.3940,
        description: 'Tienda departamental y servicios financieros. Altamente dependiente de VMware on-premise.',
        pain_points: ['Dependencia total de VMware', 'Sin plan cloud activo'],
    },
    {
        ...BASE_CUSTOMER, id: 'c007', company_name: 'Ecopetrol', country: 'Colombia',
        city: 'Bogotá', region: 'LATAM', website: 'ecopetrol.com.co',
        industry: 'Oil & Gas', company_size: 'Large Enterprise', estimated_employees: 18000, estimated_servers: 1600,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, on_prem_datacenter: true, existing_hpe_hardware: true,
        edge_infrastructure: true, digital_transformation_initiative: true,
        oil_and_gas: true, energy: true,
        latitude: 4.7110, longitude: -74.0721,
        description: 'Empresa nacional de petróleo de Colombia. Fuerte compromiso con digitalización industrial.',
        pain_points: ['Infraestructura edge en campos remotos', 'Costos Broadcom inesperados'],
    },
    {
        ...BASE_CUSTOMER, id: 'c026', company_name: 'Embraer', country: 'Brazil',
        city: 'São Paulo', region: 'LATAM', website: 'embraer.com',
        industry: 'Manufactura / Aeronáutica', company_size: 'Large Enterprise', estimated_employees: 22000, estimated_servers: 1900,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, vmware_license_renewal_due: true, edge_infrastructure: true,
        datacenter_refresh_cycle: true, digital_transformation_initiative: true,
        manufacturing: true,
        latitude: -23.5505, longitude: -46.6333,
        description: 'Fabricante de aeronaves. Entornos de diseño CAD/CAM y simulación altamente virtualizados.',
        pain_points: ['Workloads GPU intensivos', 'Costos de licencias Broadcom en HPC'],
    },
    {
        ...BASE_CUSTOMER, id: 'c025', company_name: 'ENAP (Empresa Nacional del Petróleo)', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'enap.cl',
        industry: 'Oil & Gas', company_size: 'Enterprise', estimated_employees: 3500, estimated_servers: 420,
        current_hypervisor: 'Nutanix', cloud_adoption: 'On-Premise Only',
        nutanix_user: true, datacenter_refresh_cycle: true, on_prem_datacenter: true,
        existing_hpe_hardware: true, cost_optimization_priority: true,
        oil_and_gas: true, energy: true,
        latitude: -33.4489, longitude: -70.6693,
        description: 'Empresa estatal chilena de petróleo. Evaluando consolidar sobre plataforma más integrada con HPE.',
        pain_points: ['Soporte Nutanix costoso', 'Integración con hardware HPE existente deficiente'],
    },
    {
        ...BASE_CUSTOMER, id: 'c030', company_name: 'ENDESA España', country: 'Spain',
        city: 'Madrid', region: 'Europe', website: 'endesa.com',
        industry: 'Energía / Utilities', company_size: 'Large Enterprise', estimated_employees: 13000, estimated_servers: 1500,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, on_prem_datacenter: true, edge_infrastructure: true,
        existing_hpe_hardware: true, green_it_initiative: true,
        energy: true, utilities: true,
        latitude: 40.4168, longitude: -3.7038,
        description: 'Empresa eléctrica líder en España e Italia. Infraestructura edge en subestaciones eléctricas.',
        pain_points: ['Gestión de edge en subestaciones', 'Costos Broadcom en infraestructura crítica'],
    },
    {
        ...BASE_CUSTOMER, id: 'c051', company_name: 'Entel', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'entel.cl',
        industry: 'Telecomunicaciones', company_size: 'Large Enterprise', estimated_employees: 8000, estimated_servers: 1100,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, digital_transformation_initiative: true, telecommunications: true,
        description: 'Chilean telco pioneer. Strong focus on CX and digitalization.',
        pain_points: ['Modernizing core network', 'Budget efficiency'],
    },
    {
        ...BASE_CUSTOMER, id: 'c056', company_name: 'EPM (Empresas Públicas de Medellín)', country: 'Colombia',
        city: 'Medellín', region: 'LATAM', website: 'epm.com.co',
        industry: 'Servicios Públicos', company_size: 'Large Enterprise', estimated_employees: 7000, estimated_servers: 1400,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, existing_hpe_hardware: true, public_sector: true, utilities: true,
        description: 'Multi-utility giant. Critical infrastructure for energy and water.',
        pain_points: ['Regulated budget constraints', 'High availability for SCADA'],
    },
    {
        ...BASE_CUSTOMER, id: 'c024', company_name: 'Falabella', country: 'Chile',
        city: 'Santiago', region: 'LATAM', website: 'falabella.com',
        industry: 'Retail', company_size: 'Large Enterprise', estimated_employees: 50000, estimated_servers: 1100,
        current_hypervisor: 'Mixed', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, digital_transformation_initiative: true,
        cost_optimization_priority: true, cloud_repatriation_interest: true,
        retail: true, finance: true,
        latitude: -33.4489, longitude: -70.6693,
        description: 'Retailer panregional con presencia en Chile, Perú, Colombia y Argentina.',
        pain_points: ['Infraestructura heterogénea difícil de gestionar', 'Costos cloud elevados'],
    },
    {
        ...BASE_CUSTOMER, id: 'c039', company_name: 'FEMSA (OXXO)', country: 'Mexico',
        city: 'Monterrey', region: 'LATAM', website: 'femsa.com',
        industry: 'Consumo Masivo', company_size: 'Large Enterprise', estimated_employees: 300000, estimated_servers: 4500,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, edge_infrastructure: true, retail: true,
        description: 'Largest beverage and convenience store operator. Huge edge needs.',
        pain_points: ['Managing 20k+ OXXO nodes', 'Broadcom licensing at scale'],
    },
    {
        ...BASE_CUSTOMER, id: 'c029', company_name: 'Ferrovial', country: 'Spain',
        city: 'Madrid', region: 'Europe', website: 'ferrovial.com',
        industry: 'Construcción / Infraestructura', company_size: 'Large Enterprise', estimated_employees: 23000, estimated_servers: 980,
        current_hypervisor: 'Microsoft Hyper-V', cloud_adoption: 'Hybrid',
        microsoft_hyper_v_user: true, datacenter_refresh_cycle: true, digital_transformation_initiative: true,
        cost_optimization_priority: true,
        manufacturing: true,
        latitude: 40.4168, longitude: -3.7038,
        description: 'Constructora global con múltiples proyectos de infraestructura en EEUU y Europa.',
        pain_points: ['Hyper-V sin soporte enterprise adecuado', 'Crecimiento de workloads no planificado'],
    },
    {
        ...BASE_CUSTOMER, id: 'c005', company_name: 'Grupo Bimbo', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'grupobimbo.com',
        industry: 'Manufactura / Alimentos', company_size: 'Large Enterprise', estimated_employees: 140000, estimated_servers: 2200,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, vmware_license_renewal_due: true,
        existing_hpe_hardware: true, cost_optimization_priority: true,
        manufacturing: true, food_and_beverage: true,
        latitude: 19.4326, longitude: -99.1332,
        description: 'Mayor panificadora del mundo. IT centralizada en VMware en 33 países.',
        pain_points: ['Costos Broadcom en múltiples países', 'Necesidad de plataforma unificada'],
    },
    {
        ...BASE_CUSTOMER, id: 'c002', company_name: 'Grupo Financiero BBVA Mexico', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'bbva.mx',
        industry: 'Banca y Finanzas', company_size: 'Large Enterprise', estimated_employees: 35000, estimated_servers: 4200,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        vmware_license_renewal_due: true, broadcom_pricing_impact: true,
        cost_optimization_priority: true, digital_transformation_initiative: true,
        cloud_repatriation_interest: true, existing_hpe_hardware: true,
        finance: true,
        latitude: 19.4326, longitude: -99.1332,
        description: 'Operaciones masivas de datos y core bancario en VMware. Evaluando alternativas post-Broadcom.',
        pain_points: ['Costos de licenciamiento insostenibles', 'Necesidad de workloads híbridos'],
    },
    {
        ...BASE_CUSTOMER, id: 'c009', company_name: 'Grupo HM Hospitales', country: 'Spain',
        city: 'Madrid', region: 'Europe', website: 'hmhospitales.com',
        industry: 'Salud', company_size: 'Enterprise', estimated_employees: 8000, estimated_servers: 380,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, vmware_license_renewal_due: true, existing_hpe_hardware: true,
        healthcare: true,
        latitude: 40.4168, longitude: -3.7038,
        description: 'Red hospitalaria española. Evaluando alternativas a VMware tras cambio de modelo Broadcom.',
        pain_points: ['GDPR + localización de datos', 'Renovación inminente de licencias VMware'],
    },
    {
        ...BASE_CUSTOMER, id: 'c042', company_name: 'Grupo Éxito', country: 'Colombia',
        city: 'Envigado', region: 'LATAM', website: 'grupoexito.com.co',
        industry: 'Retail', company_size: 'Large Enterprise', estimated_employees: 35000, estimated_servers: 900,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, cost_optimization_priority: true, retail: true,
        description: 'Leading retailer in Colombia. Part of GPA/Casino group.',
        pain_points: ['OPEX reduction', 'Infrastructure agility'],
    },
    {
        ...BASE_CUSTOMER, id: 'c008', company_name: 'Hospital Ángeles', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'hospitalesangeles.com',
        industry: 'Salud', company_size: 'Enterprise', estimated_employees: 12000, estimated_servers: 450,
        current_hypervisor: 'VMware', cloud_adoption: 'On-Premise Only',
        vmware_license_renewal_due: true, on_prem_datacenter: true, datacenter_refresh_cycle: true,
        cost_optimization_priority: true,
        healthcare: true,
        latitude: 19.4326, longitude: -99.1332,
        description: 'Red hospitalaria privada líder en México. VMware para HIS y sistemas críticos.',
        pain_points: ['Cumplimiento HIPAA/NOM-024', 'Costos de licencias médicas + VMware'],
    },
    {
        ...BASE_CUSTOMER, id: 'c019', company_name: 'Iberdrola', country: 'Spain',
        city: 'Bilbao', region: 'Europe', website: 'iberdrola.com',
        industry: 'Energía / Utilities', company_size: 'Large Enterprise', estimated_employees: 42000, estimated_servers: 3000,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, on_prem_datacenter: true, edge_infrastructure: true,
        existing_hpe_hardware: true, green_it_initiative: true, cost_optimization_priority: true,
        energy: true, utilities: true,
        latitude: 43.2630, longitude: -2.9350,
        description: 'Energética global líder en renovables. Fuerte componente edge en parques eólicos y solares.',
        pain_points: ['Infraestructura edge en parques remotos', 'Compromiso de sostenibilidad IT'],
    },
    {
        ...BASE_CUSTOMER, id: 'c012', company_name: 'IMSS (Instituto Mexicano del Seguro Social)', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'imss.gob.mx',
        industry: 'Sector Público / Salud', company_size: 'Large Enterprise', estimated_employees: 450000, estimated_servers: 8000,
        current_hypervisor: 'VMware', cloud_adoption: 'On-Premise Only',
        vmware_version_eol: true, broadcom_pricing_impact: true, datacenter_refresh_cycle: true,
        on_prem_datacenter: true, cost_optimization_priority: true,
        public_sector: true, healthcare: true,
        latitude: 19.4326, longitude: -99.1332,
        description: 'Institución de seguridad social más grande de Latinoamérica. Infraestructura masiva en VMware.',
        pain_points: ['Presupuesto público limitado', 'EOL crítico de versiones VMware', 'Requisito de soberanía de datos'],
    },
    {
        ...BASE_CUSTOMER, id: 'c033', company_name: 'Itaú Unibanco', country: 'Brazil',
        city: 'São Paulo', region: 'LATAM', website: 'itau.com.br',
        industry: 'Finanzas', company_size: 'Large Enterprise', estimated_employees: 99000, estimated_servers: 8500,
        current_hypervisor: 'VMware', cloud_adoption: 'Multi-Cloud',
        broadcom_pricing_impact: true, vmware_license_renewal_due: true, finance: true,
        description: 'Largest financial conglomerate in the Southern Hemisphere. Massive VMware footprint.',
        pain_points: ['Broadcom pricing volatility', 'Hybrid cloud complexity'],
    },
    {
        ...BASE_CUSTOMER, id: 'c041', company_name: 'Magazine Luiza', country: 'Brazil',
        city: 'Franca', region: 'LATAM', website: 'magazineluiza.com.br',
        industry: 'Retail', company_size: 'Large Enterprise', estimated_employees: 40000, estimated_servers: 1500,
        current_hypervisor: 'Mixed', cloud_adoption: 'Cloud-First',
        digital_transformation_initiative: true, retail: true,
        description: 'Brazilian retail powerhouse. High level of digital maturity.',
        pain_points: ['Integrating physical/digital systems', 'Cloud cost management'],
    },
    {
        ...BASE_CUSTOMER, id: 'c017', company_name: 'Mapfre', country: 'Spain',
        city: 'Madrid', region: 'Europe', website: 'mapfre.es',
        industry: 'Seguros', company_size: 'Large Enterprise', estimated_employees: 35000, estimated_servers: 2200,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, vmware_license_renewal_due: true,
        existing_hpe_hardware: false, cost_optimization_priority: true,
        finance: true,
        latitude: 40.4168, longitude: -3.7038,
        description: 'Aseguradora global líder española. Afectada severamente por reestructura de precios Broadcom.',
        pain_points: ['Renegociación de contratos VMware', 'Necesidad de plataforma más económica'],
    },
    {
        ...BASE_CUSTOMER, id: 'c038', company_name: 'Mercado Libre', country: 'Argentina',
        city: 'Buenos Aires', region: 'LATAM', website: 'mercadolibre.com',
        industry: 'E-commerce', company_size: 'Large Enterprise', estimated_employees: 30000, estimated_servers: 6000,
        current_hypervisor: 'KVM/OpenStack', cloud_adoption: 'Cloud-First',
        digital_transformation_initiative: true, cloud_repatriation_interest: true, retail: true,
        description: 'The Amazon of LATAM. Massive scale, heavily automated.',
        pain_points: ['Public cloud egress costs', 'Managing specialized workloads'],
    },
    {
        ...BASE_CUSTOMER, id: 'c031', company_name: 'Mercadona', country: 'Spain',
        city: 'Valencia', region: 'Europe', website: 'mercadona.es',
        industry: 'Retail / Distribución', company_size: 'Large Enterprise', estimated_employees: 95000, estimated_servers: 1800,
        current_hypervisor: 'VMware', cloud_adoption: 'On-Premise Only',
        vmware_license_renewal_due: true, broadcom_pricing_impact: true,
        on_prem_datacenter: true, datacenter_refresh_cycle: true, cost_optimization_priority: true,
        retail: true,
        latitude: 39.4699, longitude: -0.3763,
        description: 'Mayor supermercado de España. Totalmente on-premise con VMware en logística y punto de venta.',
        pain_points: ['Dependencia total VMware', 'Renovación de licencias con impacto multi-millonario'],
    },
    {
        ...BASE_CUSTOMER, id: 'c050', company_name: 'Millicom (Tigo)', country: 'Luxembourg/Regional',
        city: 'Millicom (Regional)', region: 'LATAM', website: 'millicom.com',
        industry: 'Telecomunicaciones', company_size: 'Large Enterprise', estimated_employees: 21000, estimated_servers: 1800,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, vmware_license_renewal_due: true, telecommunications: true,
        description: 'Leading provider in Central and South America.',
        pain_points: ['Standardizing across 9 countries', 'Broadcom impact on core services'],
    },
    {
        ...BASE_CUSTOMER, id: 'c027', company_name: 'Natura &Co', country: 'Brazil',
        city: 'São Paulo', region: 'LATAM', website: 'naturaeco.com',
        industry: 'Retail / Cosméticos', company_size: 'Large Enterprise', estimated_employees: 36000, estimated_servers: 750,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, cost_optimization_priority: true, green_it_initiative: true,
        cloud_repatriation_interest: true,
        retail: true,
        latitude: -23.5505, longitude: -46.6333,
        description: 'Multinacional de cosméticos con fuerte agenda ESG. Buscando reducir huella de carbono del datacenter.',
        pain_points: ['Compromisos ESG y consumo energético de VMware', 'Costos Broadcom vs presupuesto sostenible'],
    },
    {
        ...BASE_CUSTOMER, id: 'c043', company_name: 'Petrobras', country: 'Brazil',
        city: 'Rio de Janeiro', region: 'LATAM', website: 'petrobras.com.br',
        industry: 'Energía',
        company_size: 'Large Enterprise', estimated_employees: 45000, estimated_servers: 1200,
        current_hypervisor: 'Mixed', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, existing_hpe_hardware: true, energy: true, oil_and_gas: true,
        description: 'Global energy giant. Massive HPC and virtualization requirements.',
        pain_points: ['Data sovereignty', 'Broadcom impact on research clusters'],
    },
    {
        ...BASE_CUSTOMER, id: 'c006', company_name: 'Petrobras Distribuidora', country: 'Brazil',
        city: 'Rio de Janeiro', region: 'LATAM', website: 'br.distribuidora.com.br',
        industry: 'Oil & Gas', company_size: 'Large Enterprise', estimated_employees: 15000, estimated_servers: 2800,
        current_hypervisor: 'VMware', cloud_adoption: 'On-Premise Only',
        vmware_license_renewal_due: true, broadcom_pricing_impact: true, vmware_version_eol: true,
        on_prem_datacenter: true, datacenter_refresh_cycle: true, cost_optimization_priority: true,
        oil_and_gas: true,
        latitude: -22.9068, longitude: -43.1729,
        description: 'División distribución de Petrobras. Infraestructura crítica VMware on-premise.',
        pain_points: ['EOL ESXi 7.x inminente', 'Presión regulatoria de localización de datos'],
    },
    {
        ...BASE_CUSTOMER, id: 'c053', company_name: 'Rede D\'Or São Luiz', country: 'Brazil',
        city: 'São Paulo', region: 'LATAM', website: 'rededor.com.br',
        industry: 'Salud', company_size: 'Large Enterprise', estimated_employees: 50000, estimated_servers: 2200,
        current_hypervisor: 'VMware', cloud_adoption: 'On-Premise Only',
        broadcom_pricing_impact: true, vmware_license_renewal_due: true, healthcare: true,
        description: 'Biggest hospital network in Brazil. Highly critical HIS systems.',
        pain_points: ['Availability vs Cost', 'Compliance data localization'],
    },
    {
        ...BASE_CUSTOMER, id: 'c021', company_name: 'Repsol', country: 'Spain',
        city: 'Madrid', region: 'Europe', website: 'repsol.com',
        industry: 'Oil & Gas', company_size: 'Large Enterprise', estimated_employees: 27000, estimated_servers: 2400,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, existing_hpe_hardware: true,
        on_prem_datacenter: true, cloud_repatriation_interest: true,
        oil_and_gas: true, energy: true,
        latitude: 40.4168, longitude: -3.7038,
        description: 'Multinacional energética española. Iniciativas de transformación digital activas.',
        pain_points: ['Consolidación de datacenters globales', 'Presión de costos post-Broadcom'],
    },
    {
        ...BASE_CUSTOMER, id: 'c020', company_name: 'SEAT Volkswagen Group Spain', country: 'Spain',
        city: 'Barcelona', region: 'Europe', website: 'seat.es',
        industry: 'Manufactura / Automotriz', company_size: 'Large Enterprise', estimated_employees: 16000, estimated_servers: 1400,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        vmware_license_renewal_due: true, broadcom_pricing_impact: true, datacenter_refresh_cycle: true,
        digital_transformation_initiative: true, edge_infrastructure: true,
        manufacturing: true,
        latitude: 41.3851, longitude: 2.1734,
        description: 'Planta automotriz con fuerte componente IT/OT convergido. Proceso de digitalización activo.',
        pain_points: ['VMware en líneas de producción inteligentes', 'Costos de licencias en fábricas'],
    },
    {
        ...BASE_CUSTOMER, id: 'c018', company_name: 'Telecom Italia (TIM)', country: 'Italy',
        city: 'Rome', region: 'Europe', website: 'tim.it',
        industry: 'Telecomunicaciones', company_size: 'Large Enterprise', estimated_employees: 45000, estimated_servers: 3800,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, vmware_license_renewal_due: true,
        digital_transformation_initiative: true, cloud_repatriation_interest: true,
        telecommunications: true,
        latitude: 41.9028, longitude: 12.4964,
        description: 'Operador telco italiano. Evaluando migración de NFV/VNF desde VMware a alternativas.',
        pain_points: ['Costos NFV en alza', 'Roadmap de migración a Open RAN'],
    },
    {
        ...BASE_CUSTOMER, id: 'c049', company_name: 'Telefónica (Movistar)', country: 'Spain',
        city: 'Madrid', region: 'Europe', website: 'telefonica.com',
        industry: 'Telecomunicaciones', company_size: 'Large Enterprise', estimated_employees: 110000, estimated_servers: 20000,
        current_hypervisor: 'Mixed', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, cloud_repatriation_interest: true, telecommunications: true,
        description: 'Tier 1 Global telco. Significant presence in LATAM/Europe.',
        pain_points: ['Network virtualization budget pressure', 'Capex-to-Opex shift'],
    },
    {
        ...BASE_CUSTOMER, id: 'c046', company_name: 'Ternium', country: 'Argentina',
        city: 'Buenos Aires', region: 'LATAM', website: 'ternium.com',
        industry: 'Siderurgia', company_size: 'Large Enterprise', estimated_employees: 20000, estimated_servers: 1100,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, manufacturing: true,
        description: 'Leading flat steel producer in LATAM. Strong industrial focus.',
        pain_points: ['Plant-floor virtualization costs', 'System reliability'],
    },
    {
        ...BASE_CUSTOMER, id: 'c052', company_name: 'TIM Brasil', country: 'Brazil',
        city: 'Rio de Janeiro', region: 'LATAM', website: 'tim.com.br',
        industry: 'Telecomunicaciones', company_size: 'Large Enterprise', estimated_employees: 9000, estimated_servers: 2500,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, cloud_repatriation_interest: true, telecommunications: true,
        description: 'Leading mobile operator in Brazil. High data density.',
        pain_points: ['Scalability costs', 'Broadcom renewall pressure'],
    },
    {
        ...BASE_CUSTOMER, id: 'c013', company_name: 'Universidad Nacional Autónoma de México (UNAM)', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'unam.mx',
        industry: 'Educación', company_size: 'Large Enterprise', estimated_employees: 38000, estimated_servers: 600,
        current_hypervisor: 'KVM/OpenStack', cloud_adoption: 'Hybrid',
        on_prem_datacenter: true, cost_optimization_priority: true, digital_transformation_initiative: true,
        green_it_initiative: true,
        public_sector: true, education: true,
        latitude: 19.3326, longitude: -99.1832,
        description: 'Universidad pública más grande de LATAM. Infraestructura HPC y clusters KVM para investigación.',
        pain_points: ['Soporte y operación de OpenStack', 'Escalabilidad para cargas HPC'],
    },
    {
        ...BASE_CUSTOMER, id: 'c045', company_name: 'Vale', country: 'Brazil',
        city: 'Rio de Janeiro', region: 'LATAM', website: 'vale.com',
        industry: 'Minería', company_size: 'Large Enterprise', estimated_employees: 75000, estimated_servers: 5000,
        current_hypervisor: 'VMware', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, edge_infrastructure: true, mining: true,
        description: 'One of the world\'s largest mining companies. High focus on I4.0.',
        pain_points: ['Edge computing in remote mines', 'Sustainability goals for datacenters'],
    },
    {
        ...BASE_CUSTOMER, id: 'c010', company_name: 'Walmart Mexico (WALMEX)', country: 'Mexico',
        city: 'Mexico City', region: 'LATAM', website: 'walmex.com.mx',
        industry: 'Retail', company_size: 'Large Enterprise', estimated_employees: 230000, estimated_servers: 5500,
        current_hypervisor: 'Mixed', cloud_adoption: 'Hybrid',
        broadcom_pricing_impact: true, on_prem_datacenter: true, edge_infrastructure: true,
        cost_optimization_priority: true, datacenter_refresh_cycle: true,
        retail: true,
        latitude: 19.4326, longitude: -99.1332,
        description: 'Mayor retailer en México. Infraestructura masiva de edge en tiendas y DC central.',
        pain_points: ['Edge computing en 2000+ tiendas', 'Costos multi-vendor difíciles de controlar'],
    },
    {
        ...BASE_CUSTOMER, id: 'c044', company_name: 'YPF', country: 'Argentina',
        city: 'Buenos Aires', region: 'LATAM', website: 'ypf.com',
        industry: 'Energía', company_size: 'Large Enterprise', estimated_employees: 20000, estimated_servers: 2200,
        current_hypervisor: 'VMware', cloud_adoption: 'On-Premise Only',
        broadcom_pricing_impact: true, datacenter_refresh_cycle: true, energy: true, oil_and_gas: true,
        description: 'National energy company of Argentina. Critical industrial infrastructure.',
        pain_points: ['Forex challenges with licensing', 'Aging hardware in field operations'],
    },];

/**
 * Initializes the database from persistent storage.
 * Performs a smart merge to avoid losing user-added data (like contacts)
 * while keeping legacy hardcoded data up-to-date.
 */
export async function syncCustomerDatabase() {
    const persisted = await PersistenceService.load<Customer>('customers');
    if (persisted && persisted.length > 0) {
        // Create a map for quick lookup
        const persistedMap = new Map(persisted.map(c => [c.id, c]));

        // Update in-memory database with smart merge
        const mergedDatabase = CUSTOMER_DATABASE.map(staticCustomer => {
            const p = persistedMap.get(staticCustomer.id);
            if (!p) return staticCustomer;

            // Smart Merge: Preserve user-added properties (starting with contacts)
            return {
                ...staticCustomer, // Start with current static data (freshest hardcoded stuff)
                ...p,              // Overwrite with persistent data
                // Explicitly merge arrays that should accumulate or be preserved
                // We prioritize persistent data but fallback to static if persistence is empty
                contacts: (p.contacts && p.contacts.length > 0) ? p.contacts : (staticCustomer.contacts || [])
            };
        });

        // Add any customers that exist in persistence but NOT in the static DB (custom added customers)
        const staticIds = new Set(mergedDatabase.map(c => c.id));
        const onlyInPersisted = persisted.filter(p => !staticIds.has(p.id));

        const finalDatabase = [...mergedDatabase, ...onlyInPersisted];

        // Update the in-memory array reference content
        CUSTOMER_DATABASE.splice(0, CUSTOMER_DATABASE.length, ...finalDatabase);
        console.log(`[Persistence] Customer database synced (Smart Merge): ${finalDatabase.length} items.`);
    }
}
