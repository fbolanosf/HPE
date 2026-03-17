export interface ChatMessage {
    id: string;
    role: 'user' | 'model' | 'assistant';
    content: string;
    timestamp?: string;
}

export interface ProductPortfolioItem {
  id: string;
  name: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  useCases: string[];
}

export const PRODUCT_PORTFOLIO: ProductPortfolioItem[] = [
  {
    id: 'hpe-morpheus-vme',
    name: 'HPE Morpheus VM Essentials',
    description: 'Plataforma unificada de orquestación agnóstica y autoservicio para la gestión de nubes híbridas.',
    features: [
        'Aprovisionamiento en minutos vs semanas',
        'Gestión nativa multi-hypervisor',
        'FinOps y control de costos integrado',
        'Automatización no-code para usuarios de negocio'
    ],
    specs: {
        'Despliegue': 'Appliance ligero de un solo click',
        'Integraciones': '+100 nubes e infraestructuras locales',
        'Gobernanza': 'RBAC avanzado y políticas de cumplimiento dinámicas'
    },
    useCases: [
        'Migración de VMware a entornos heterogéneos',
        'Creación de catálogos de autoservicio IT',
        'Optimización de costos cloud'
    ]
  },
  {
    id: 'hpe-vm-essentials',
    name: 'HPE VM Essentials',
    description: 'Solución de virtualización enterprise desacoplada y rentable basada en KVM.',
    features: [
        'TCO hasta 5 veces menor que VMware',
        'Gestión simplificada sin appliances pesados',
        'Software-defined storage agnóstico',
        'Preparado para el futuro IA / Contenedores'
    ],
    specs: {
        'Hypervisor': 'KVM Enterprise optimizado por HPE',
        'Overhead': 'Consumo mínimo de recursos (< 2GB RAM)',
        'Resiliencia': 'Alta disponibilidad y migración en vivo nativas'
    },
    useCases: [
        'Reemplazo directo de vSphere',
        'Consolidación de servidores en el Edge',
        'Nube privada de bajo costo'
    ]
  },
  {
    id: 'hpe-simplivity',
    name: 'HPE SimpliVity',
    description: 'Infraestructura hiperconvergente (HCI) con aceleración por hardware para eficiencia de datos extrema.',
    features: [
        'Garantía de eficiencia 10:1',
        'Backup local de 1TB en menos de 60 segundos',
        'Gestión unificada desde vCenter',
        'Resiliencia integrada sin impacto en rendimiento'
    ],
    specs: {
        'Aceleración': 'Tarjeta FPGA dedicada (Data Virtualization Platform)',
        'IA': 'Integración nativa con HPE InfoSight',
        'Storage': 'Deduplicación y compresión inline global'
    },
    useCases: [
        'Cargas de trabajo VDI',
        'Infraestructura para el Edge y ROBO',
        'Backups locales instantáneos'
    ]
  },
  {
    id: 'hpe-zerto',
    name: 'HPE Zerto',
    description: 'Protección de datos continua (CDP) y movilidad de cargas multi-cloud.',
    features: [
        'RPO de segundos y RTO de minutos',
        'Replicación continua sin snapshots',
        'Orquestación total de recuperación de desastres',
        'Inmutabilidad contra Ransomware'
    ],
    specs: {
        'Arquitectura': 'Nativa de hypervisor (Scale-out)',
        'Granularidad': 'Recuperación a cualquier punto en el tiempo',
        'Cloud': 'Soporte nativo para AWS, Azure y GCP'
    },
    useCases: [
        'Protección contra Ransomware',
        'Estrategias de Disaster Recovery as a Service (DRaaS)',
        'Migración de nubes con tiempo de inactividad cero'
    ]
  },
  {
    id: 'hpe-opsramp',
    name: 'HPE OpsRamp',
    description: 'Plataforma de observabilidad y operaciones IT (AIOps) para entornos híbridos.',
    features: [
        'Visibilidad de punta a punta (Edge to Cloud)',
        'Reducción de ruido de alertas mediante IA',
        'Automatización de resolución de incidentes',
        'Gestión unificada de nubes e infraestructura on-prem'
    ],
    specs: {
        'Delivery': 'Plataforma SaaS multi-tenant',
        'Discovery': 'Mapeo de dependencias de aplicaciones automático',
        'Integración': 'Conexión con ServiceNow, Jira y herramientas devops'
    },
    useCases: [
        'Gestión de operaciones de TI híbridas',
        'Consolidación de herramientas de monitoreo',
        'Modernización de NOC mediante AIOps'
    ]
  },
  {
    id: 'hpe-greenlake',
    name: 'HPE GreenLake',
    description: 'La experiencia de la nube llevada a tus aplicaciones y datos, dondequiera que estén.',
    features: [
        'Modelo de pago por uso',
        'Escalabilidad bajo demanda',
        'Gestión simplificada vía GreenLake Cloud Platform',
        'Seguridad y control on-premise con agilidad cloud'
    ],
    specs: {
        'Modelo': 'As-a-Service',
        'Infraestructura': 'Cómputo, Almacenamiento y Redes',
        'Soporte': 'HPE Datacenter Care integrado'
    },
    useCases: [
        'Modernización de Data Center sin CAPEX',
        'Gestión de cargas de trabajo mixtas (VMs + K8s)',
        'Cumplimiento de soberanía de datos'
    ]
  }
];
