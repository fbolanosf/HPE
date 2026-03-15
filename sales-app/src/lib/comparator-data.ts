export interface TopologyLayer {
    name: string;
    components: string[];
    description: string;
    color?: string;
}

export interface TopologyData {
    layers: TopologyLayer[];
    summary: string;
}

export interface ComparisonFeature {
    category: 'Negocio' | 'Funcional' | 'Financiero' | 'Técnico' | 'Precios';
    feature: string;
    hpe: string;
    competitor: string;
    hpeAdvantage: string;
    hpeIsBetter: boolean;
}

export interface CompetitorProfile {
    id: string;
    name: string;
    solution: string;
    comparisons: ComparisonFeature[];
    topology?: TopologyData;
}

export interface HPESolution {
    id: string;
    name: string;
    description: string;
    competitors: CompetitorProfile[];
    topology?: TopologyData;
}

export const HPE_SOLUTIONS: Record<string, HPESolution> = {
    'morpheus': {
        id: 'morpheus',
        name: 'HPE Morpheus VME',
        description: 'Plataforma de gestión de nube híbrida agnóstica y orquestación diseñada específicamente para entornos modernos.',
        topology: {
            summary: 'Plataforma unificada de orquestación agnóstica y autoservicio.',
            layers: [
                { name: 'Portal', components: ['Morpheus UI', 'Self-Service Catalog', 'Persona-based Views', 'API/CLI Interface'], description: 'Panel único para todas las nubes y on-premise con dashboards personalizados.' },
                { name: 'Automatización', components: ['Automation Engine', 'Workflow Designer', 'Task Libraries', 'App Blueprinting'], description: 'Motor de automatización y aprovisionamiento rápido orientado a aplicaciones.' },
                { name: 'Gestión', components: ['Policy Engine', 'Role Based Access', 'Approval Workflows', 'FinOps/Costing'], description: 'Gobernanza completa, límites de consumo, cumplimiento y optimización de costos.' },
                { name: 'Infraestructura', components: ['VME Native', 'VMware', 'AWS/Azure/GCP', 'Nutanix', 'K8s'], description: 'Conectividad nativa con +100 tipos de nubes e infraestructura local.' }
            ]
        },
        competitors: [
            {
                id: 'aria-automation',
                name: 'VMware',
                solution: 'VMware Aria Automation (antes VMware vRealize)',
                topology: {
                    summary: 'Suite de automatización para vSphere y nubes públicas.',
                    layers: [
                        { name: 'Portal', components: ['Aria Automation Portal', 'Service Broker', 'Consumer UI'], description: 'Catálogo de servicios de VMware fragmentado por módulos.' },
                        { name: 'Automatización', components: ['vRealize Orchestrator', 'ABX / Python Tasks', 'Terraform Service'], description: 'Motor de flujos de trabajo pesado que requiere scripting avanzado.' },
                        { name: 'Gestión', components: ['Aria Operations', 'Config (SaltStack)', 'Logs', 'Identity Manager'], description: 'Gobernanza distribuida en múltiples appliances y configuraciones.' },
                        { name: 'Infraestructura', components: ['vSphere', 'VCF', 'Specific Cloud Proxies'], description: 'Optimizado para VMware con soporte limitado y complejo para terceros.' }
                    ]
                },
                comparisons: [
                    { category: 'Funcional', feature: 'Despliegue', hpe: 'Instalación en minutos', competitor: 'Semanas de configuración', hpeAdvantage: 'Morpheus es un appliance ligero; Aria requiere múltiples componentes pesados integrados.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Multi-Cloud', hpe: 'Agnóstico Real', competitor: 'VMware-Centric', hpeAdvantage: 'Gestión nativa de múltiples hypervisores sin penalización de rendimiento o costo.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Actualizaciones', hpe: 'One-Click Update', competitor: 'Actualizaciones complejas', hpeAdvantage: 'Mantenimiento simplificado del stack de orquestación.', hpeIsBetter: true }
                ]
            },
            {
                id: 'nutanix-ncm',
                name: 'Nutanix',
                solution: 'Nutanix Cloud Manager (Calm / Prism)',
                topology: {
                    summary: 'Gestión multicloud y automatización integrada.',
                    layers: [
                        { name: 'Portal', components: ['Prism Central', 'NCM Marketplace', 'Self-Service UI'], description: 'Consola unificada con enfoque en el ecosistema Nutanix.' },
                        { name: 'Automatización', components: ['NCM Self-Service (Calm)', 'DSL Blueprints', 'Runbooks'], description: 'Orquestación basada en blueprints y flujos de Nutanix Calm.' },
                        { name: 'Gestión', components: ['NCM Cost / Governance', 'Beam (Cost)', 'Flow (Net)'], description: 'Control de costos y seguridad de red multicloud.' },
                        { name: 'Infraestructura', components: ['AOS / AHV', 'ESXi', 'Cloud Connect'], description: 'Alto rendimiento sobre Nutanix, limitado en bare-metal de terceros.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Flexibilidad HW', hpe: 'Agnóstico total', competitor: 'Mejor con Nutanix HW', hpeAdvantage: 'Morpheus no tiene sesgo hacia un hardware específico de hypervisor.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Velocidad', hpe: 'Time-to-Value Inmediato', competitor: 'Modularidad extra', hpeAdvantage: 'Experiencia unificada vs. múltiples módulos que activar en Nutanix.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Licenciamiento', hpe: 'Simple por Instancia', competitor: 'Suscripciones por Nivel', hpeAdvantage: 'Costos predecibles y fáciles de escalar con Morpheus.', hpeIsBetter: true }
                ]
            },
            {
                id: 'cloudbolt-cmp',
                name: 'CloudBolt',
                solution: 'CloudBolt CMP',
                topology: {
                    summary: 'CMP enfocado en la simplicidad y el autoservicio.',
                    layers: [
                        { name: 'Portal', components: ['CloudBolt UI', 'Catalog Storefront', 'Guided Setup'], description: 'Frontend de autoservicio orientado a la facilidad de uso.' },
                        { name: 'Automatización', components: ['Orchestration Engine', 'Custom Actions', 'Shell/Python Runners'], description: 'Conectores para nubes y on-prem basados en plugins.' },
                        { name: 'Gestión', components: ['Cost & Compliance', 'Security Dashboard', 'Resource Limits'], description: 'Reportes de uso, seguridad y límites básicos de recursos.' },
                        { name: 'Infraestructura', components: ['VMware', 'Azure', 'AWS', 'OpenStack'], description: 'Soporte para hypervisores comunes y nubes públicas.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Catálogo', hpe: 'In-built Marketplace', competitor: 'Basado en Scripts', hpeAdvantage: 'Blueprints visuales listos para usar vs. necesidad de scripting manual extenso.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Integración', hpe: 'Nativa VME', competitor: 'Vía Conectores Genéricos', hpeAdvantage: 'Integración profunda y optimizada para HP VM Essentials.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Gobernanza', hpe: 'RBAC Avanzado', competitor: 'Básico', hpeAdvantage: 'Límites de cuotas y aprobación mucho más granulares en Morpheus.', hpeIsBetter: true }
                ]
            },
            {
                id: 'scalr-ent',
                name: 'Scalr',
                solution: 'Scalr',
                topology: {
                    summary: 'CMP enfocado en Terraform y arquitectura de nube.',
                    layers: [
                        { name: 'Portal', components: ['Scalr UI / API', 'Workspace View', 'Provisioning Dashboard'], description: 'Gestión de infraestructura con enfoque DevOps y IaC.' },
                        { name: 'Automatización', components: ['Terraform Engine', 'VCS Integration', 'Module Registry'], description: 'Aprovisionamiento basado estrictamente en flujos de Terraform.' },
                        { name: 'Gestión', components: ['Hierarchical Policy', 'OPA (Open Policy Agent)', 'Cost Control'], description: 'Políticas de cumplimiento mediante código (Policies as Code).' },
                        { name: 'Infraestructura', components: ['AWS', 'Azure', 'GCP', 'Oracle Cloud'], description: 'Fuerte enfoque en proveedores de nube pública.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'No-Code Provisioning', hpe: 'Visual & Easy', competitor: 'Code-First (Terraform)', hpeAdvantage: 'Permite autoservicio a usuarios que no saben programar infraestructura.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Foco en Ops', hpe: 'Full IT Operations', competitor: 'DevOps Centric', hpeAdvantage: 'Morpheus cubre todo el ciclo de vida, no solo el aprovisionamiento de código.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Costo Entrada', hpe: 'Costo Optimizado', competitor: 'Enterprise Only', hpeAdvantage: 'Mejor punto de entrada para empresas que están empezando su viaje cloud.', hpeIsBetter: true }
                ]
            },
            {
                id: 'platform9-k8s',
                name: 'Platform9',
                solution: 'Platform9 Managed Kubernetes / Private Cloud Director',
                topology: {
                    summary: 'SaaS de gestión para OpenStack y Kubernetes.',
                    layers: [
                        { name: 'Portal', components: ['Platform9 Console', 'Cluster UI', 'App Catalog'], description: 'SaaS operado centralmente para nubes distribuidas.' },
                        { name: 'Automatización', components: ['Managed Controller', 'K8s Operator', 'Bare-Metal Provisioner'], description: 'Control plane administrado de nubes y Kubernetes locales.' },
                        { name: 'Gestión', components: ['Monitoring & Patches', 'Identity Integration', 'Compliance Guard'], description: 'Gestión proactiva de parches y monitoreo como servicio.' },
                        { name: 'Infraestructura', components: ['Physical Servers', 'Edge Locations', 'Existing VM Clusters'], description: 'Aprovecha hardware existente on-prem o en el edge.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Control', hpe: 'Totalmente On-Prem option', competitor: 'Dependencia SaaS', hpeAdvantage: 'Morpheus puede funcionar 100% desconectado si es necesario.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Soporte VM', hpe: 'Nativo VM Essentials', competitor: 'OpenStack Centric', hpeAdvantage: 'Optimizado para cargas de VMs modernas sin la pesadez de OpenStack.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Predictibilidad', hpe: 'Licencia Fija', competitor: 'Revenue Share / Consumo', hpeAdvantage: 'Modelo de costos mucho más simple de presupuestar anualmente.', hpeIsBetter: true }
                ]
            },
            {
                id: 'ibm-turbonomic',
                name: 'IBM',
                solution: 'IBM Turbonomic / Cloud Automation',
                topology: {
                    summary: 'Optimización de recursos impulsada por IA.',
                    layers: [
                        { name: 'Portal', components: ['Turbonomic Console', 'Application View', 'Cluster Planner'], description: 'Visualización de recursos y topología de dependencias.' },
                        { name: 'Automatización', components: ['ARM (Resourcing Engine)', 'Action Orchestrator', 'Workload Placement'], description: 'Mueve y escala recursos automáticamente basándose en demanda.' },
                        { name: 'Gestión', components: ['Supply Chain Graph', 'Compliance Policies', 'Cost Forecasting'], description: 'Análisis profundo de dependencias e impacto en el costo.' },
                        { name: 'Infraestructura', components: ['VMTurbo / Connectors', 'Cloud Billing APIs'], description: 'Se integra con hypervisores y APIs de facturación para análisis.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Alcance', hpe: 'Orquestador Completo', competitor: 'Optimizador (Post-back)', hpeAdvantage: 'Morpheus crea el recurso; Turbonomic solo lo optimiza una vez creado.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Agilidad', hpe: 'Self-Service Provisioning', competitor: 'Resizing Focus', hpeAdvantage: 'Enfocado en la agilidad del desarrollador para obtener recursos nuevos.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'ROI', hpe: 'Inmediato (Ahorro Lic + Ops)', competitor: 'Ahorro a largo plazo', hpeAdvantage: 'Simplifica el stack eliminando capas de software innecesarias.', hpeIsBetter: true }
                ]
            },
            {
                id: 'flexera-one',
                name: 'Flexera',
                solution: 'Flexera One (RightScale)',
                topology: {
                    summary: 'Gestión de activos cloud y optimización de costos.',
                    layers: [
                        { name: 'Portal', components: ['Flexera One UI', 'Asset Dashboard', 'IT Visibility'], description: 'Hub de gestión de TI centralizado para visualizar todo el stack.' },
                        { name: 'Automatización', components: ['RightScale Engine', 'Governance Workflows', 'Cloud Management'], description: 'Gestión de infraestructura multi-nube y automatización de procesos.' },
                        { name: 'Gestión', components: ['Cloud Cost Optimization', 'Audit & Risk', 'Contract Mgmt'], description: 'Foco masivo en FinOps, gestión de riesgos y contratos.' },
                        { name: 'Infraestructura', components: ['Multi-Cloud Connectors', 'Software Discovery Agents'], description: 'Discovery de activos en nubes y data centers locales.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Especialización', hpe: 'Hybrid Cloud Ops', competitor: 'FinOps & Asset Management', hpeAdvantage: 'Morpheus es para operar la nube técnica, Flexera es más para el departamento financiero.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Despliegue local', hpe: 'Instalación fácil local', competitor: 'Purely SaaS', hpeAdvantage: 'Mejor integración con infraestructura física en el data center local.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Velocidad', hpe: 'Rapid App Provisioning', competitor: 'Discovery Focus', hpeAdvantage: 'Permite entregar servicios de TI un 80% más rápido.', hpeIsBetter: true }
                ]
            },
            {
                id: 'redhat-openshift-orchestration',
                name: 'Red Hat',
                solution: 'Red Hat OpenShift Platform (automation / hybrid cloud orchestration)',
                topology: {
                    summary: 'Orquestación híbrida centrada en contenedores y Linux.',
                    layers: [
                        { name: 'Portal', components: ['OpenShift Console', 'Developer Catalog', 'Admin UI'], description: 'Portal unificado para desarrolladores y administradores de clusters.' },
                        { name: 'Automatización', components: ['Ansible Automation Platform', 'K8s Operators', 'CI/CD Pipelines'], description: 'Orquestación nativa para K8s y automatización vía Ansible.' },
                        { name: 'Gestión', components: ['ACM (Advanced Cluster Mgmt)'], description: 'Gestión de flotas distribuidas de clusters y cumplimiento.' },
                        { name: 'Infraestructura', components: ['RHEL / CoreOS', 'Hybrid Cloud Providers', 'Bare Metal'], description: 'Soporte sobre Linux líder y proveedores de nube híbrida.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Foco Cargas', hpe: 'Dual (VMs + Containers)', competitor: 'Container-First', hpeAdvantage: 'Morpheus trata a las VMs como ciudadanos de primera clase, no como un add-on.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Lock-in', hpe: 'Independencia OS/Hypervisor', competitor: 'Stack Red Hat', hpeAdvantage: 'Libertad total de usar cualquier SO o hypervisor sin dependencia de Red Hat.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Complejidad', hpe: 'Suscripción unificada', competitor: 'Varios SKUs Necesarios', hpeAdvantage: 'Mucho más simple de comprar y renovar que el ecosistema Red Hat.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'vm-essentials': {
        id: 'vm-essentials',
        name: 'HPE VM Essentials',
        description: 'Virtualización empresarial moderna, desacoplada y rentable.',
        topology: {
            summary: 'Virtualización Enterprise basada en KVM con gestión simplificada y escalable.',
            layers: [
                { name: 'Gestión', components: ['VM Essentials UI', 'VME Manager', 'REST API', 'InfoSight AI Support'], description: 'Interfaz moderna y ligera para gestión de clusters KVM con soporte predictivo.' },
                { name: 'Virtualización', components: ['KVM Enterprise', 'Libvirt', 'DRS / High Availability', 'Live Migration'], description: 'Hypervisor optimizado y protegido por HPE con funciones de resiliencia empresarial.' },
                { name: 'Almacenamiento', components: ['NFS/iSCSI/FC/Local', 'Thin Provisioning', 'Snapshots/Clones', 'Storage Agnostic'], description: 'Aprovecha cualquier almacenamiento existente con gestión centralizada.' },
                { name: 'Hardware', components: ['HPE ProLiant Gen10/11', 'Apollo', 'Synergy', 'Standard x86 support'], description: 'Optimizado para hardware HPE pero con total flexibilidad para servidores x86.' }
            ]
        },
        competitors: [
            {
                id: 'vmware-vsphere',
                name: 'Broadcom/VMware',
                solution: 'VMware vSphere / VMware Cloud Foundation',
                topology: {
                    summary: 'Estándar tradicional con arquitectura distribuida compleja.',
                    layers: [
                        { name: 'Gestión', components: ['vCenter Server', 'vSphere Client', 'Aria Operations', 'Lifecycle Manager'], description: 'Consola central con múltiples dependencias de bases de datos y appliances.' },
                        { name: 'Virtualización', components: ['ESXi Hypervisor', 'vMotion / DRS', 'vSphere HA', 'Fault Tolerance'], description: 'Hypervisor propietario maduro con amplias funciones de misión crítica.' },
                        { name: 'Almacenamiento', components: ['VMFS / vVols', 'vSAN OSA/ESA', 'SIOC', 'Storage vMotion'], description: 'Sistema de archivos clusterizado propietario y complejo de administrar.' },
                        { name: 'Hardware', components: ['Certified HCL Nodes', 'Dell VxRail', 'HPE Synergy / ProLiant'], description: 'Hardware validado estrictamente mediante la lista de compatibilidad de VMware.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Incertidumbre de Proveedor', hpe: 'Estabilidad HPE', competitor: 'Adquisición Broadcom', hpeAdvantage: 'Elimina el riesgo de aumentos de precio y discontinuación de productos post-adquisición de Broadcom.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Gestión', hpe: 'UI Moderna y Simplificada', competitor: 'vCenter Complejo y Pesado', hpeAdvantage: 'Gestión unificada de KVM y VMware desde un solo panel sin requerir appliance de vCenter.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Licenciamiento', hpe: 'Flexible / Perpetuo', competitor: 'Suscripción Forzada por Core', hpeAdvantage: 'TCO hasta 5x menor. VME no fuerza bundles de software no utilizados como VCF.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Kernel del Hypervisor', hpe: 'KVM Nativo (Linux)', competitor: 'ESXi Propietario', hpeAdvantage: 'Base moderna linux-KVM preparada para el futuro vs kernel propietario de 20 años.', hpeIsBetter: true },
                    { category: 'Precios', feature: 'TCO a 3 Años', hpe: '30-50% Menor', competitor: 'Alto (Aumentos recientes)', hpeAdvantage: 'Elimina el "Impuesto VMware" manteniendo funcionalidades críticas (HA, Live Migration).', hpeIsBetter: true }
                ]
            },
            {
                id: 'microsoft-hyperv',
                name: 'Microsoft',
                solution: 'Microsoft Hyper-V / Azure Stack HCI (Azure Local)',
                topology: {
                    summary: 'Ecosistema híbrido entre Windows Server local y servicios de Azure.',
                    layers: [
                        { name: 'Gestión', components: ['Microsoft Azure Local', 'Admin Center', 'System Center (VMM)', 'Azure Arc'], description: 'Gestión fragmentada que requiere múltiples portales y conexión a la nube.' },
                        { name: 'Virtualización', components: ['Hyper-V Hypervisor', 'Failover Clustering', 'Shielded VMs', 'DDA Passthrough'], description: 'Virtualización integrada en Windows Server optimizada para el ecosistema Microsoft.' },
                        { name: 'Almacenamiento', components: ['S2D (Storage Spaces Direct)', 'ReFS', 'SMB Direct', 'Storage Replica'], description: 'Almacenamiento definido por software basado en servidores Windows.' },
                        { name: 'Hardware', components: ['Azure Stack HCI Systems', 'Certified Nodes', 'Validated HW'], description: 'Requiere hardware validado para la solución integrada Azure Local.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Lock-in Cloud', hpe: 'Independencia Total', competitor: 'Vínculo con Azure obligatorio', hpeAdvantage: 'VME opera 100% desconectado; Azure Stack HCI requiere conexión periódica a Azure para licenciamiento.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Gestión Unificada', hpe: 'VME UI Única', competitor: 'Fragmentada (SCVMM + WAC + Azure)', hpeAdvantage: 'VME unifica la gestión en una sola consola sin saltar entre 3 portales distintos.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Costos Ocultos', hpe: 'Todo Incluido', competitor: 'Suscripción Azure + Windows CALs', hpeAdvantage: 'Sin costos mensuales por core ni CALs ocultas. VME es predecible de inicio a fin.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Complejidad de OS', hpe: 'Appliance-like (Ligero)', competitor: 'Windows Server Full Stack', hpeAdvantage: 'Evita la gestión de parches, antivirus y seguridad de un OS de propósito general pesado.', hpeIsBetter: true },
                    { category: 'Precios', feature: 'Modelo de Consumo', hpe: 'Perpetuo o Suscripción Justa', competitor: 'Suscripción Mensual Obligatoria', hpeAdvantage: 'Flexibilidad real: elige si compras o suscribes, sin compromisos forzados a la nube.', hpeIsBetter: true }
                ]
            },
            {
                id: 'nutanix-ahv',
                name: 'Nutanix',
                solution: 'Nutanix Cloud Platform (AHV)',
                topology: {
                    summary: 'Plataforma HCI enterprise con hypervisor KVM optimizado.',
                    layers: [
                        { name: 'Gestión', components: ['Prism Central', 'Prism Element', 'Flow Security', 'Files/Objects'], description: 'Interfaz intuitiva pero requiere Controller VM (CVM) en cada nodo.' },
                        { name: 'Virtualización', components: ['AHV Hypervisor', 'Acropolis OS', 'ADS (Scheduling)', 'VM HA'], description: 'Distribución de KVM propietaria y bloqueada dentro del ecosistema Nutanix.' },
                        { name: 'Almacenamiento', components: ['DSF (Distributed Storage)', 'CVM Managed', 'Erasure Coding', 'Dedupe/Comp'], description: 'Almacenamiento resiliente que consume CPU y RAM significativa del host.' },
                        { name: 'Hardware', components: ['Nutanix NX', 'HPE DX', 'Dell XC', 'NC2 (Multi-cloud)'], description: 'Hardware pre-integrado o validado con fuerte dependencia del software AOS.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Libertad de Hardware', hpe: 'Abierto (ProLiant)', competitor: 'Validado/Appliance Lock-in', hpeAdvantage: 'VME corre en cualquier ProLiant estándar sin restricciones artificiales del stack HCI.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Integración con VMware', hpe: 'Gestión dual KVM + VMware', competitor: 'Solo AHV o VMware (separado)', hpeAdvantage: 'VME puede gestionar workloads VMware existentes durante la migración, suavizando la transición.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Overhead de Recursos', hpe: 'Ligero (<2 GB RAM)', competitor: 'Pesado (32+ GB RAM por CVM)', hpeAdvantage: 'No requiere dedicar 32GB+ RAM y vCPUs por nodo solo para la Controller VM de storage.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Arquitectura', hpe: 'Desacoplada (Compute ≠ Storage)', competitor: 'HCI Forzada (Todo junto)', hpeAdvantage: 'VME permite escalar cómputo y almacenamiento de forma independiente según la necesidad.', hpeIsBetter: true },
                    { category: 'Precios', feature: 'Licencia vs Suscripción', hpe: 'Perpetuo Disponible', competitor: 'Suscripción anual obligatoria', hpeAdvantage: 'Sin renovación forzosa: la licencia VME no expira ni degrada funcionalidad al vencer.', hpeIsBetter: true }
                ]
            },
            {
                id: 'citrix-xenserver',
                name: 'Citrix',
                solution: 'Citrix XenServer',
                topology: {
                    summary: 'Hypervisor optimizado para cargas de trabajo de escritorio virtual (VDI).',
                    layers: [
                        { name: 'Gestión', components: ['XenCenter Management', 'Pool Master', 'Citrix Cloud', 'Director'], description: 'Consola web y app nativa para gestión de pools de servidores Xen.' },
                        { name: 'Virtualización', components: ['XenServer Hypervisor', 'Live Migration', 'GPU Passthrough', 'PVS Support'], description: 'Basado en el proyecto Xen, líder en virtualización de GPUs y escritorios.' },
                        { name: 'Almacenamiento', components: ['Storage Repositories (SR)', 'IntelliCache', 'LVM over iSCSI/FC', 'NFS SR'], description: 'Optimizado para el aprovisionamiento rápido de imágenes de escritorio.' },
                        { name: 'Hardware', components: ['Standard x86', 'NVIDIA/Intel GPU Support', 'HCL HW'], description: 'Enfoque masivo en compatibilidad con aceleradoras gráficas.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Foco de Carga', hpe: 'General Purpose Enterprise', competitor: 'Especializado en VDI', hpeAdvantage: 'VME es una plataforma versátil para cualquier carga, no solo para escritorios.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Simplicidad', hpe: 'Gestión Ligera', competitor: 'Stack Complejo Citrix', hpeAdvantage: 'VME no requiere la pesada infraestructura de gestión que Citrix impone.', hpeIsBetter: true }
                ]
            },
            {
                id: 'redhat-virtualization',
                name: 'Red Hat',
                solution: 'Red Hat OpenShift Virtualization / Red Hat Virtualization',
                topology: {
                    summary: 'Virtualización nativa de contenedores basada en KVM y KubeVirt.',
                    layers: [
                        { name: 'Gestión', components: ['OpenShift Console', 'Advanced Cluster Mgmt', 'Ansible Platform'], description: 'Gestión moderna basada en Kubernetes para VMs y contenedores.' },
                        { name: 'Virtualización', components: ['KVM-based (KubeVirt)', 'Metal3 (Bare Metal)', 'Container-native VMs'], description: 'Ejecución de VMs dentro de pods de Kubernetes para modernización de apps.' },
                        { name: 'Almacenamiento', components: ['OpenShift Data Foundation', 'CSI Storage', 'OVN-Kubernetes'], description: 'Almacenamiento definido por software centrado en el ecosistema K8s.' },
                        { name: 'Hardware', components: ['RHEL-certified hardware', 'Hybrid Cloud', 'Bare Metal'], description: 'Hardware certificado por Red Hat con soporte para nube híbrida.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Curva de Aprendizaje', hpe: 'Familiar para admins VM', competitor: 'Requiere conocimientos K8s', hpeAdvantage: 'Permite a los administradores tradicionales operar sin aprender Kubernetes.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Costo de Licencia', hpe: 'Económico y Simple', competitor: 'Suscripción Premium OpenShift', hpeAdvantage: 'Mucho más accesible para empresas que solo buscan virtualización eficiente.', hpeIsBetter: true }
                ]
            },
            {
                id: 'proxmox-ve',
                name: 'Proxmox',
                solution: 'Proxmox VE',
                topology: {
                    summary: 'Solución open-source completa con hypervisor y contenedores LXC.',
                    layers: [
                        { name: 'Gestión', components: ['Proxmox Web GUI', 'Backup Server', 'Cluster Manager'], description: 'Interfaz web integrada sin necesidad de consola de gestión externa.' },
                        { name: 'Virtualización', components: ['KVM + LXC', 'Live Migration', 'pve-cluster', 'HA Manager'], description: 'Flexibilidad de usar VMs y contenedores ligeros en el mismo host.' },
                        { name: 'Almacenamiento', components: ['ZFS / Ceph (Embedded)', 'LVM-thin', 'Proxmox Shared storage'], description: 'Soporte nativo para sistemas de archivos avanzados y clusterizados.' },
                        { name: 'Hardware', components: ['Commodity Hardware', 'Standard x86', 'RAID support'], description: 'Capacidad de correr en casi cualquier hardware x86 del mercado.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Soporte Enterprise', hpe: 'Soporte Global 24x7', competitor: 'Soporte por suscripción básico', hpeAdvantage: 'Respaldo total de HPE con SLAs empresariales y repuestos locales.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Validación HW', hpe: 'Optimizado para ProLiant', competitor: 'Best-effort de comunidad', hpeAdvantage: 'Garantía de funcionamiento y rendimiento sobre la plataforma líder del mercado.', hpeIsBetter: true }
                ]
            },
            {
                id: 'platform9-director',
                name: 'Platform9',
                solution: 'Platform9 Private Cloud Director',
                topology: {
                    summary: 'Cloud privado gestionado como servicio (SaaS) con KVM.',
                    layers: [
                        { name: 'Gestión', components: ['Managed Controller (SaaS)', 'Cluster Orchestrator', 'App Catalog'], description: 'Plano de control operado por Platform9 de forma remota.' },
                        { name: 'Virtualización', components: ['KVM Enterprise', 'Managed OpenStack', 'Bare Metal Orchestrator'], description: 'Virtualización local gestionada centralmente desde la nube.' },
                        { name: 'Almacenamiento', components: ['Managed Block/Object', 'CSI Integrations', 'Network Agnostic'], description: 'Integración con almacenamiento externo gestionada vía APIs.' },
                        { name: 'Hardware', components: ['Existing x86 servers', 'Edge nodes', 'Bare Metal'], description: 'Uso de infraestructura existente con despliegue tipo cloud.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Soberanía de Datos', hpe: '100% Local / Air-gapped', competitor: 'Dependencia de Plano SaaS', hpeAdvantage: 'VME no requiere conexión externa para gestionar la infraestructura crítica.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Predictibilidad', hpe: 'Licencia Fija VME', competitor: 'Suscripción Variable SaaS', hpeAdvantage: 'Costos fijos sin sorpresas por consumo o con conectividad cloud.', hpeIsBetter: true }
                ]
            },
            {
                id: 'oracle-virtualization',
                name: 'Oracle',
                solution: 'Oracle Linux Virtualization / Oracle VM Server',
                topology: {
                    summary: 'Virtualización optimizada para bases de datos y aplicaciones Oracle.',
                    layers: [
                        { name: 'Gestión', components: ['Oracle VM Manager', 'OCI Cloud Console', 'Enterprise Manager'], description: 'Enfocado en la gestión del ciclo de vida de cargas Oracle.' },
                        { name: 'Virtualización', components: ['Oracle VM (Xen)', 'Oracle Linux KVM', 'Hard Partitioning'], description: 'Soporte estricto de particionamiento para cumplimiento de licencias Oracle.' },
                        { name: 'Almacenamiento', components: ['OCFS2', 'Virtual Disk Shared', 'FC / iSCSI / NFS'], description: 'Sistema de archivos de cluster optimizado para bases de datos.' },
                        { name: 'Hardware', components: ['Oracle PCA', 'Exadata', 'Oracle x86 Servers'], description: 'Optimizado para hardware específico de Oracle y sistemas de ingeniería.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Agnosticismo', hpe: 'Multi-carga / Multi-OS', competitor: 'Foco masivo en Oracle Stack', hpeAdvantage: 'VME es excelente para cualquier carga de trabajo, no solo bases de datos Oracle.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Flexibilidad', hpe: 'Licencia simple por host', competitor: 'Complejidad contractual Oracle', hpeAdvantage: 'Licenciamiento transparente y fácil de entender frente a las reglas de Oracle.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'simplivity': {
        id: 'simplivity',
        name: 'HPE SimpliVity',
        description: 'HCI Inteligente con garantía de eficiencia de datos extrema.',
        topology: {
            summary: 'Arquitectura "Todo en Uno" optimizada con aceleración por hardware para el borde y VDI.',
            layers: [
                { name: 'Gestión', components: ['HPE SimpliVity Plug-in', 'vCenter Server', 'HPE InfoSight (AI)', 'Federator Service'], description: 'Gestión global federada y centralizada nativa en vCenter con IA predictiva.' },
                { name: 'Virtualización', components: ['VMware vSphere (ESXi)', 'vMotion / DRS', 'VMware HA', 'Arbeits Station Support'], description: 'Hypervisor estándar de la industria con despliegue de VMs ultra-rápido.' },
                { name: 'Eficiencia de Datos', components: ['OmniStack Accelerator Card (FPGA)', 'DVP (Data Virtualization Platform)', 'Inline Dedupe & Compression'], description: 'Deduplicación y compresión inline garantizada 24x7 sin impacto en latencia o CPU.', color: '#01A982' },
                { name: 'Hardware', components: ['HPE ProLiant DL325/380', 'NVMe Storage', 'Redundant Power', 'HPE iLO 6'], description: 'Servidor x86 de alta resiliencia optimizado para densidades extremas de datos.' }
            ]
        },
        competitors: [
            {
                id: 'dell-vxrail',
                name: 'Dell',
                solution: 'VxRail',
                topology: {
                    summary: 'HCI basada en vSAN con integración profunda en el ecosistema de hardware Dell.',
                    layers: [
                        { name: 'Gestión', components: ['VxRail Manager', 'vCenter Server', 'Aria Operations', 'CloudIQ'], description: 'Interfaz para ciclo de vida automatizado y monitoreo de salud del hardware Dell.' },
                        { name: 'Virtualización', components: ['VMware vSphere (ESXi)', 'vSAN Witness', 'SDDC Manager'], description: 'Integración completa con el stack de VMware para virtualización robusta.' },
                        { name: 'Software Defined Storage', components: ['VMware vSAN (OSA/ESA)', 'vSAN File Service', 'Cache Tier', 'Capacity Tier'], description: 'Utiliza recursos de CPU y RAM de cada host para el procesamiento del almacenamiento.' },
                        { name: 'Hardware', components: ['Dell PowerEdge Nodes', 'SmartFabric Services', 'Internal SD Cards/SATADOM'], description: 'Servidores x86 configurados específicamente como nodos de cluster VxRail.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Garantía de Eficiencia', hpe: 'HyperGuarantee (10:1)', competitor: 'Sin garantía escrita', hpeAdvantage: 'Respaldado por ESG: Garantía de 90% de ahorro en capacidad o HPE pone el disco.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Backup Integrado', hpe: 'Nativo (Sin costo extra)', competitor: 'Requiere Data Protection Suite', hpeAdvantage: 'Backup local en segundos. Elimina la necesidad de Veeam/Avamar para operación básica.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Costo por VM', hpe: 'Menor (Gracias a Eficiencia)', competitor: 'Mayor (Más almacenamiento raw)', hpeAdvantage: 'ESG confirma ahorros del 49% en TCO frente a arquitecturas tradicionales.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Deduplicación', hpe: 'Inline, Global, FPGA', competitor: 'Post-proceso / Software', hpeAdvantage: 'Rendimiento garantizado: La deduplicación ocurre antes de escribir en disco.', hpeIsBetter: true },
                    { category: 'Precios', feature: 'Add-ons', hpe: 'Todo incluido', competitor: 'Múltiples licencias', hpeAdvantage: 'Sin sorpresas: WAN Optimization, Backup y DR incluidos en la licencia base.', hpeIsBetter: true }
                ]
            },
            {
                id: 'nutanix-nci',
                name: 'Nutanix',
                solution: 'Nutanix Cloud Infrastructure (NCI) / Nutanix Cloud Platform',
                topology: {
                    summary: 'Arquitectura distribuida basada en la ejecución de Controller VMs (CVM).',
                    layers: [
                        { name: 'Gestión', components: ['Prism Central', 'Prism Element', 'NCM (Multi-cloud)', 'Files-service'], description: 'Consola web intuitiva para gestión de clusters y servicios de datos.' },
                        { name: 'Virtualización', components: ['AHV (KVM based)', 'ESXi Support', 'VM High Availability'], description: 'Hypervisor nativo optimizado para una integración fluida con AOS.' },
                        { name: 'Storage Controller', components: ['CVM (Controller VM)', 'Medusa (Metadata)', 'Stargate (I/O)', 'Curator'], description: 'Software de storage distribuido que reside en una VM dedicada en cada nodo.' },
                        { name: 'Hardware', components: ['NX Series', 'HPE ProLiant (DX)', 'Dell (XC)', 'Cloud Nodes'], description: 'Compatibilidad con diversos vendors de hardware y nubes públicas.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Arquitectura de Datos', hpe: 'Hardware Acelerado (FPGA)', competitor: 'Software Defined (CPU/RAM)', hpeAdvantage: 'SimpliVity descarga el I/O a la tarjeta FPGA, liberando CPU para las aplicaciones.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Simplicidad', hpe: 'Gestión Unificada vCenter', competitor: 'Consolas Separadas', hpeAdvantage: 'Administración nativa desde vCenter sin saltar entre interfaces propietarias.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Backup & DR', hpe: 'Nativo Integrado', competitor: 'Software Add-on', hpeAdvantage: 'Backup local y remoto en segundos incluido sin costo de licenciamiento extra.', hpeIsBetter: true }
                ]
            },
            {
                id: 'azure-stack-hci',
                name: 'Microsoft',
                solution: 'Microsoft Azure Stack HCI / Azure Local',
                topology: {
                    summary: 'Arquitectura híbrida que extiende los servicios de Azure al centro de datos local.',
                    layers: [
                        { name: 'Gestión', components: ['Azure Arc', 'Windows Admin Center', 'Azure Portal', 'PowerShell'], description: 'Gestión centralizada desde la nube con soporte para operaciones locales base.' },
                        { name: 'Virtualización', components: ['Hyper-V Hypervisor', 'Azure Kubernetes Service', 'Virtual Desktop'], description: 'Software de virtualización optimizado para cargas de trabajo de Microsoft.' },
                        { name: 'Almacenamiento', components: ['Storage Spaces Direct (S2D)', 'ReFS', 'App-Service Storage'], description: 'Almacenamiento definido por software integrado directamente en el kernel del host.' },
                        { name: 'Hardware', components: ['Validated Nodes', 'Integrated Systems', 'Standard x86'], description: 'Requiere hardware certificado para asegurar la estabilidad del stack de Azure.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Independencia Cloud', hpe: 'Totalmente On-Prem', competitor: 'Dependencia Cloud Alta', hpeAdvantage: 'SimpliVity funciona sin conexión; Azure Stack HCI requiere conexión frecuente para licenciamiento.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Costo de Licencia', hpe: 'Capex / Perpetual opción', competitor: 'Suscripción por Core', hpeAdvantage: 'Evita los cargos mensuales recurrentes de Azure solo por usar tu propio hardware.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Resiliencia', hpe: 'HCI Nativo', competitor: 'Stack Complejo', hpeAdvantage: 'Arquitectura SimpliVity con deduplicación global vs S2D que requiere tuning constante.', hpeIsBetter: true }
                ]
            },
            {
                id: 'vmware-vsan',
                name: 'VMware',
                solution: 'VMware vSAN',
                topology: {
                    summary: 'HCI integrada en el hypervisor con opciones de arquitectura OSA y ESA.',
                    layers: [
                        { name: 'Gestión', components: ['vCenter Server', 'vSphere Client', 'vSAN Health', 'Aria'], description: 'Gestión nativa de almacenamiento desde la consola de virtualización conocida.' },
                        { name: 'Virtualización', components: ['VMware vSphere (ESXi)', 'vMotion', 'DRS', 'vLCM'], description: 'Capacidades completas de virtualización con gestión de ciclo de vida integrada.' },
                        { name: 'Almacenamiento', components: ['vSAN ESA / OSA', 'Sparse Objects', 'Dedupe/Comp (SW)', 'RAID 5/6'], description: 'Procesamiento de datos distribuido vía software consumiendo CPU de los hosts.' },
                        { name: 'Hardware', components: ['vSAN ReadyNodes', 'NVMe / SSD Tiering'], description: 'Requiere hardware en la lista de compatibilidad estricta de VMware.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Modelo de Soporte', hpe: 'HPE Punto Único', competitor: 'Soporte Fragmentado', hpeAdvantage: 'Soporte integral HPE para el stack completo vs lidiar con múltiples vendors.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Eficiencia de Datos', hpe: 'Acelerador FPGA', competitor: 'Software (CPU Host)', hpeAdvantage: 'SimpliVity mantiene el rendimiento de las apps mientras vSAN consume CPU para deduplicar.', hpeIsBetter: true }
                ]
            },
            {
                id: 'scale-computing',
                name: 'Scale Computing',
                solution: 'Scale Computing Platform',
                topology: {
                    summary: 'HCI ligera diseñada para el borde y PYMES basada en HyperCore.',
                    layers: [
                        { name: 'Gestión', components: ['HyperCore UI', 'Fleet Manager', 'REST API'], description: 'Interfaz ligera integrada en el cluster; gestión multi-sitio vía cloud.' },
                        { name: 'Virtualización', components: ['KVM (HyperCore)', 'Live Migration', 'Self-Healing'], description: 'Hypervisor basado en KVM altamente simplificado y embebido.' },
                        { name: 'Almacenamiento', components: ['SCRIBE (SDS)', 'Block Level Tiering', 'Thin Provisioning'], description: 'Sistema de almacenamiento definido por software de bajo overhead.' },
                        { name: 'Hardware', components: ['HE100 Series', 'HE500 Series', 'Tower/Rack x86'], description: 'Hardware de pequeño formato optimizado para entornos sin datacenter.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Escalabilidad', hpe: 'Enterprise Scale', competitor: 'Principalmente Edge/SMB', hpeAdvantage: 'SimpliVity escala hasta el core DC con rendimiento garantizado; Scale es nicho.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Eficiencia', hpe: 'Dedupe Global HW', competitor: 'Software básico', hpeAdvantage: 'Ahorro de espacio masivo en backup y storage gracias a la tarjeta aceleradora.', hpeIsBetter: true }
                ]
            },
            {
                id: 'starwind-hca',
                name: 'StarWind',
                solution: 'StarWind HyperConverged Appliance / StarWind HCA',
                topology: {
                    summary: 'Solución HCI centrada en el almacenamiento compartido de alta disponibilidad.',
                    layers: [
                        { name: 'Gestión', components: ['StarWind Command Center', 'VMC', 'Integración vCenter'], description: 'Gestión unificada de almacenamiento y virtualización mediante consola web.' },
                        { name: 'Virtualización', components: ['VMware vSphere', 'Microsoft Hyper-V'], description: 'Soporta los hypervisores líderes del mercado de forma nativa.' },
                        { name: 'Almacenamiento', components: ['Virtual SAN (VSAN)', 'Write-back Cache', 'StarWind VSAN CVM'], description: 'Capa de abstracción que crea almacenamiento compartido entre solo dos nodos.' },
                        { name: 'Hardware', components: ['Standard Rack Servers', 'Dell/HPE OEM', 'StarWind Nodes'], description: 'Aprovecha servidores estándar x86 con configuración mínima.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Presencia Global', hpe: 'Líder de Mercado HW', competitor: 'Nicho SW-Defined', hpeAdvantage: 'Respaldo de un líder global con cadena de suministro y soporte 24x7 real.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Protección de Datos', hpe: 'Backup en Segundos', competitor: 'Replicación estándar', hpeAdvantage: 'Capacidad nativa de snapshot/backup ultrarrápido sin impacto en producción.', hpeIsBetter: true }
                ]
            },
            {
                id: 'stormagic-svsan',
                name: 'StorMagic',
                solution: 'StorMagic SvSAN',
                topology: {
                    summary: 'Almacenamiento virtual ligero optimizado para clusters de solo 2 nodos.',
                    layers: [
                        { name: 'Gestión', components: ['StorMagic Dashboard', 'vCenter Plugin'], description: 'Interfaz simple para aprovisionamiento de storage virtual.' },
                        { name: 'Virtualización', components: ['Hyper-V', 'vSphere', 'KVM'], description: 'Compatibilidad multi-hypervisor para máxima flexibilidad.' },
                        { name: 'Almacenamiento', components: ['SvSAN VSA', 'Neutral Storage Host', 'Mirroring Sync'], description: 'Appliance virtual que espejo datos entre nodos para alta disponibilidad.' },
                        { name: 'Hardware', components: ['Cualquier x86', 'Bajo Consumo', 'Edge Servers'], description: 'Corre en hardware de muy bajos recursos, ideal para el borde extremo.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Capacidad Enterprise', hpe: 'Full Data Services', competitor: 'Storage Especializado', hpeAdvantage: 'SimpliVity ofrece backup, dedupe global y DR; StorMagic es solo storage compartido.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Velocidad de Recuperación', hpe: 'Restauración 1TB < 60s', competitor: 'Horas (Legacy restore)', hpeAdvantage: 'Recuperación ante fallos casi instantánea gracias a la arquitectura de datos.', hpeIsBetter: true }
                ]
            },
            {
                id: 'cisco-hyperflex',
                name: 'Cisco',
                solution: 'Cisco HyperFlex',
                topology: {
                    summary: 'Infraestructura hiperconvergente con integración profunda en redes Cisco UCS.',
                    layers: [
                        { name: 'Gestión', components: ['Cisco Intersight', 'HX Connect', 'vCenter Plugin'], description: 'Gestión basada en la nube (SaaS) u on-premise mediante Intersight.' },
                        { name: 'Virtualización', components: ['VMware vSphere', 'HX Data Platform'], description: 'Hypervisor con capa de software Springpath para gestión de archivos.' },
                        { name: 'Networking', components: ['Fabric Interconnects', 'VIC Adapters', 'Nexus Switches'], description: 'Requiere hardware de red propietario para la interconexión del cluster.' },
                        { name: 'Hardware', components: ['Cisco UCS B-Series/C-Series'], description: 'Hardware de servidores blade o rack exclusivo de Cisco.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Longevidad', hpe: 'Roadmap HPE HCI', competitor: 'Transición a Nutanix', hpeAdvantage: 'Certidumbre total sobre el futuro del producto frente a la alianza Cisco-Nutanix.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Costo de Red', hpe: 'Switches estándar', competitor: 'Fabric Interconnects', hpeAdvantage: 'Ahorro masivo en CAPEX al no requerir FI ni switches Nexus obligatorios.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'zerto': {
        id: 'zerto',
        name: 'HPE Zerto',
        description: 'Protección de datos continua y movilidad de cargas de trabajo.',
        topology: {
            summary: 'Protección Continua de Datos (CDP) nativa basada en hypervisor para RPOs de segundos.',
            layers: [
                { name: 'Gestión', components: ['Zerto Virtual Manager (ZVM)', 'Zerto Analytics', 'Multi-Site Manager', 'REST API'], description: 'Gestión centralizada multi-cloud con análisis predictivo y orquestación nativa.' },
                { name: 'Data Mover', components: ['VRA (Virtual Replication Appliance)', 'Scale-out Architecture', 'Hypervisor Interceptor'], description: 'Appliance ligero que replica escrituras en tiempo real sin snapshots y con impacto cero.' },
                { name: 'Journaling', components: ['Elastic Journal', 'Point-in-time Recovery', 'Any-point (Seconds)', 'Intelligent Tiering'], description: 'Historial de cambios granular que permite recuperar a cualquier segundo antes de un incidente.' },
                { name: 'Infraestructura', components: ['VMware vSphere', 'Microsoft Hyper-V', 'AWS / Azure / GCP', 'S3/Azure Blob'], description: 'Protección agnóstica entre nubes privadas, públicas y almacenamiento de objetos.' }
            ]
        },
        competitors: [
            {
                id: 'veeam-data-platform',
                name: 'Veeam',
                solution: 'Veeam Data Platform',
                topology: {
                    summary: 'Arquitectura de backup tradicional basada en snapshots de VMware/Hyper-V.',
                    layers: [
                        { name: 'Gestión', components: ['Backup & Replication Server', 'Veeam ONE', 'Enterprise Manager'], description: 'Servidor central que coordina programación y gestión de catálogos.' },
                        { name: 'Procesamiento', components: ['Veeam Proxy', 'Data Mover', 'Scale-out Repository'], description: 'Servidores intermedios que leen datos y aplican deduplicación/compresión lógica.' },
                        { name: 'Captura', components: ['VMware/Hyper-V Snapshot', 'Changed Block Tracking', 'Veeam Agent'], description: 'Depende de la creación de snapshots del hypervisor (Stun) para capturar datos.' },
                        { name: 'Almacenamiento', components: ['Hardened Linux Repo', 'Object Storage / S3', 'Tape / NAS'], description: 'Destinos de almacenamiento para guardar las imágenes de backup.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Continuidad Real', hpe: 'Zero Data Loss (Snapless)', competitor: 'Snapshot-based (Minutos)', hpeAdvantage: 'Zerto replica continuamente sin pausar la VM ni requerir snapshots del hypervisor.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'RPO (Segundos)', hpe: 'Segundos (CDP)', competitor: 'Minutos/Horas (Schedule)', hpeAdvantage: 'Zerto permite RPOs de 5 a 15 segundos constantes, imposibles para un sistema de backup.', hpeIsBetter: true }
                ]
            },
            {
                id: 'commvault-cloud',
                name: 'Commvault',
                solution: 'Commvault Cloud',
                topology: {
                    summary: 'Plataforma unificada de gestión de datos y protección cloud-native.',
                    layers: [
                        { name: 'Gestión', components: ['Command Center', 'CommServe', 'Metallic SaaS'], description: 'Consola central web con capacidades SaaS integradas.' },
                        { name: 'Procesamiento', components: ['MediaAgent', 'Indexing Service', 'Data Analytics'], description: 'Componente que mueve datos hacia el almacenamiento y maneja el índice.' },
                        { name: 'Captura', components: ['VMware VADP', 'Cloud APIs', 'IntelliSnap'], description: 'Orquestación de snapshots de hardware y nube para protección de datos.' },
                        { name: 'Almacenamiento', components: ['HyperScale X', 'Cloud Storage / S3', 'Disk / Tape'], description: 'Nodos de almacenamiento definidos por software o destinos cloud.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Simplicidad', hpe: 'Instalación en 1 hora', competitor: 'Complejidad Enterprise', hpeAdvantage: 'Zerto se instala y protege en minutos; Commvault requiere semanas de diseño y tuning.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Impacto en Producción', hpe: 'Impacto cero (VRA)', competitor: 'Impacto por Snapshots', hpeAdvantage: 'Zerto evita el "VM Stun" de los snapshots que interrumpe aplicaciones críticas.', hpeIsBetter: true }
                ]
            },
            {
                id: 'rubrik-security-cloud',
                name: 'Rubrik',
                solution: 'Rubrik',
                topology: {
                    summary: 'Gestión de datos en la nube con enfoque en seguridad e inmutabilidad descentralizada.',
                    layers: [
                        { name: 'Gestión', components: ['Rubrik Security Cloud (SaaS)', 'Polaris'], description: 'Plano de control operado desde la nube para toda la infraestructura.' },
                        { name: 'Platform', components: ['CDM (Cloud Data Mgmt)', 'Cinder/Altive', 'Atlas FS'], description: 'Sistema de archivos distribuido inmutable basado en una plataforma flash-first.' },
                        { name: 'Captura', components: ['VADP Integration', 'Direct-to-Object', 'Agentless'], description: 'Captura incremental perpetua mediante APIs nativas de virtualización.' },
                        { name: 'Hardware', components: ['Brik (Appliance)', 'Cloud Nodes', 'Standard Hardware'], description: 'Software que corre en appliances propios o hardware validado.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Foco en DR', hpe: 'Recuperación de Desastres', competitor: 'Backup Inmutable', hpeAdvantage: 'Rubrik es excelente para backup, pero Zerto orquesta la recuperación del sitio completo en minutos.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Segmentación de Journal', hpe: 'Granularidad de Segundos', competitor: 'Granularidad de Snapshots', hpeAdvantage: 'Zerto permite volver a un punto justo antes del ataque de Ransomware (segundos).', hpeIsBetter: true }
                ]
            },
            {
                id: 'vmware-live-recovery',
                name: 'VMware',
                solution: 'VMware Site Recovery Manager / VMware Live Recovery',
                topology: {
                    summary: 'Orquestación de recuperación de desastres dependiente de replicación externa.',
                    layers: [
                        { name: 'Gestión', components: ['SRM Server', 'vCenter Plugin', 'Live Recovery SaaS'], description: 'Software que coordina los planes de recuperación de sitios primario y secundario.' },
                        { name: 'Replicación', components: ['vSphere Replication (Host)', 'Array Based (SRA)'], description: 'Software o hardware que mueve los datos (vSphere Replication es asíncrono pesado).' },
                        { name: 'Captura', components: ['Async Snapshots', 'LUN-level replication'], description: 'No es continuo; usa snapshots programados o replicación de cabina.' },
                        { name: 'Infraestructura', components: ['vSphere Hosts', 'Certified Storage'], description: 'Requiere entornos VMware idénticos en ambos sitios para SRM.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Agnosticismo HW', hpe: 'Cualquier Hardware/Storage', competitor: 'Limitado a VMware/Storage HCL', hpeAdvantage: 'Zerto replica entre cualquier servidor y almacenamiento sin importar la marca.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'CDP Real', hpe: 'CDP Nativo Incluido', competitor: 'Opcional / Complejo', hpeAdvantage: 'vSphere Replication no alcanza los RPOs de segundos que Zerto ofrece de forma nativa.', hpeIsBetter: true }
                ]
            },
            {
                id: 'dell-recoverpoint',
                name: 'Dell',
                solution: 'Dell RecoverPoint',
                topology: {
                    summary: 'Replicación continua basada en hardware o software para sistemas Dell.',
                    layers: [
                        { name: 'Gestión', components: ['RecoverPoint Console', 'Unisphere'], description: 'Gestión centrada en el almacenamiento histórico de Dell EMC.' },
                        { name: 'Data Path', components: ['Splitting Engine', 'RPA (Appliance)', 'vRPA'], description: 'Intercepta el I/O en la red SAN o en el hypervisor mediante un splitter.' },
                        { name: 'Continuidad', components: ['CDP Engine', 'Consistency Groups'], description: 'Mantiene copias locales o remotas mediante replicación síncrona/asíncrona.' },
                        { name: 'Infraestructura', components: ['Dell Unity/PowerStore', 'VMAX/PowerMax'], description: 'Fuerte dependencia del hardware de almacenamiento de Dell.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Flexibilidad Cloud', hpe: 'Multi-Cloud Native', competitor: 'On-Prem Dedicated', hpeAdvantage: 'Zerto permite replicar de On-Prem a AWS/Azure fácilmente; RecoverPoint es más rígido.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Simplicidad de Red', hpe: 'IP-based Replication', competitor: 'SAN/FC Splitters', hpeAdvantage: 'Zerto no requiere hardware especializado ni configuraciones complejas en la SAN.', hpeIsBetter: true }
                ]
            },
            {
                id: 'cohesity-dataprotect',
                name: 'Cohesity',
                solution: 'Cohesity DataProtect / Cohesity',
                topology: {
                    summary: 'Plataforma multi-cloud para gestión y protección de datos convergente.',
                    layers: [
                        { name: 'Gestión', components: ['Helios (SaaS)', 'Data Management UI'], description: 'Plano de control global unificado operado vía SaaS.' },
                        { name: 'Plataforma', components: ['SpanFS', 'Cluster Orchestrator', 'DataHawk'], description: 'Sistema de archivos distribuido de ultra-escalabilidad para datos secundarios.' },
                        { name: 'Procesamiento', components: ['Media Services', 'Search Engine', 'Security'], description: 'Servicios que indexan y protegen los datos contra ataques.' },
                        { name: 'Hardware', components: ['Cohesity Nodes', 'Standard Hardware', 'Cloud/S3'], description: 'Nodos de servidores x86 certificados o almacenamiento cloud.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Continuidad de App', hpe: 'DR en Minutos', competitor: 'Backup & Restore', hpeAdvantage: 'Zerto permite levantar todo el sitio en segundos; Cohesity sigue un flujo de restauración.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Velocidad de Recuperación', hpe: 'Orquestación Masiva', competitor: 'Velocidad de Nodo', hpeAdvantage: 'Zerto orquesta boot orders, re-IP y scripts de Post-failover automáticamente.', hpeIsBetter: true }
                ]
            },
            {
                id: 'unitrends-backup',
                name: 'Unitrends',
                solution: 'Unitrends Backup and Recovery',
                topology: {
                    summary: 'Appliance de backup "todo en uno" que combina hardware y software.',
                    layers: [
                        { name: 'Gestión', components: ['Unitrends UI', 'Recovery Console'], description: 'Interfaz centralizada para la gestión de tareas de protección.' },
                        { name: 'Procesamiento', components: ['Recovery Engine', 'Dedupe Software'], description: 'Motor de tareas que procesa el flujo de backup hacia el appliance.' },
                        { name: 'Continuidad', components: ['Cloud Empowerment', 'DRaaS'], description: 'Capacidad de enviar backups a la nube propia de Unitrends.' },
                        { name: 'Infraestructura', components: ['Recovery Series HW', 'Unitrends Backup SW'], description: 'Appliances físicos dedicados o virtuales corriendo sobre el hypervisor.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Escalabilidad', hpe: 'Enterprise Level', competitor: 'Principalmente SMB', hpeAdvantage: 'Zerto está diseñado para data centers de miles de VMs; Unitrends es nicho SMB/Mid-market.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Arquitectura', hpe: 'Virtual Native', competitor: 'Hardware Bound', hpeAdvantage: 'Zerto es puro software que se adapta a cualquier infraestructura sin amarrarte a un appliance.', hpeIsBetter: true }
                ]
            },
            {
                id: 'nakivo-backup-replication',
                name: 'NAKIVO',
                solution: 'NAKIVO Backup & Replication',
                topology: {
                    summary: 'Solución de backup rápida y ligera optimizada para entornos virtuales y NAS.',
                    layers: [
                        { name: 'Gestión', components: ['Director UI', 'Multi-tenant Console'], description: 'Panel de control web simplificado para gestión de múltiples clientes.' },
                        { name: 'Procesamiento', components: ['Transporter', 'Data Deduplication'], description: 'Componente ligero que puede instalarse incluso en un NAS de QNAP/Synology.' },
                        { name: 'Continuidad', components: ['Site Recovery', 'Cloud Connect'], description: 'Orquestación de planes de recuperación básica con dependencias cloud.' },
                        { name: 'Infraestructura', components: ['NAS Installation', 'VM Appliance', 'Cloud Destinations'], description: 'Arquitectura extremadamente liviana que no requiere servidores pesados.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Robustez Enterprise', hpe: 'Líder en DR Continuo', competitor: 'Eficiencia en Costo', hpeAdvantage: 'Para cargas de misión crítica, la tecnología CDP de Zerto no tiene rival en RTO/RPO.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Manejo de Carga', hpe: 'Escalabilidad Masiva', competitor: 'Foco en Cargas Pequeñas', hpeAdvantage: 'Zerto maneja clusters de producción intensivos sin degradar el rendimiento.', hpeIsBetter: true }
                ]
            },
            {
                id: 'cove-data-protection',
                name: 'N-able',
                solution: 'Cove Data Protection',
                topology: {
                    summary: 'Protección de datos cloud-first gestionada como servicio (SaaS).',
                    layers: [
                        { name: 'Gestión', components: ['Cove Dashboard (SaaS)', 'Multi-tenant Portal'], description: 'Gestión centralizada en la nube sin necesidad de servidores locales.' },
                        { name: 'Agentes', components: ['Backup Manager', 'Lightweight Agent'], description: 'Envía datos directamente de los dispositivos a la nube de N-able.' },
                        { name: 'Almacenamiento', components: ['Cove Cloud Storage', 'LSV (Local Speed Vault)'], description: 'Uso de la nube propia incluida en el servicio con caché local opcional.' },
                        { name: 'Infraestructura', components: ['Server / Desktop', 'VMware / Hyper-V', 'M365'], description: 'Protección para todo el espectro de dispositivos de la empresa.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Performance On-Prem', hpe: 'LAN Speed Recovery', competitor: 'Cloud Speed Dependent', hpeAdvantage: 'Zerto recupera a velocidad de red local gigabit; Cove depende del ancho de banda WAN.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Metodología', hpe: 'CDP (Cerca del Kernel)', competitor: 'Backup Cloud Incremental', hpeAdvantage: 'Zerto captura datos antes de escribirse en disco para un RPO real de segundos.', hpeIsBetter: true }
                ]
            },
            {
                id: 'axcient-x360recover',
                name: 'Axcient',
                solution: 'Axcient x360Recover',
                topology: {
                    summary: 'Solución BCDR diseñada para MSPs con virtualización cloud instantánea.',
                    layers: [
                        { name: 'Gestión', components: ['x360 Management Portal', 'RMC'], description: 'Panel unificado para gestión de múltiples sitios y clientes.' },
                        { name: 'Continuidad', components: ['Instant Virtualization', 'Virtual Office'], description: 'Capacidad de encender VMs en la nube de Axcient durante un desastre.' },
                        { name: 'Captura', components: ['Chain-Free Imaging', 'Auto-Verify'], description: 'Tecnología de captura sin cadenas de backup pesadas y con verificación automática.' },
                        { name: 'Infraestructura', components: ['Appliance Physical/Virtual', 'Direct-to-Cloud'], description: 'Despliegue flexible con o sin hardware local previo.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Segmento', hpe: 'Enterprise / Large Corp', competitor: 'SMB / MSP Focused', hpeAdvantage: 'Zerto es el estándar de oro para resiliencia en empresas del Fortune 500.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Costos DR', hpe: 'Cualquier nube o sitio propio', competitor: 'Nube propietaria mandatoria', hpeAdvantage: 'Libertad de elegir dónde recuperar sin estar atado a la infraestructura del vendor.', hpeIsBetter: true }
                ]
            },
            {
                id: 'datto-siris',
                name: 'Datto',
                solution: 'Datto SIRIS',
                topology: {
                    summary: 'Appliance híbrido BCDR que unifica backup local y recuperación cloud.',
                    layers: [
                        { name: 'Gestión', components: ['Datto Partner Portal', 'SIRIS UI'], description: 'Gestión simplificada para canales de servicio y partners.' },
                        { name: 'Continuidad', components: ['Instant On-Site DR', 'Cloud Virtualization'], description: 'Virtualización instantánea de copias en el appliance local o en la nube Datto.' },
                        { name: 'Captura', components: ['Inverse Chain Technology', 'Screenshot Verification'], description: 'Elimina cadenas de backup para agilizar recuperaciones y validaciones.' },
                        { name: 'Hardware', components: ['Datto Appliances (Intel)', 'NAS / Alto'], description: 'Hardware robusto diseñado específicamente para correr cargas virtualizadas de emergencia.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Tamaño de Workload', hpe: 'Petabyte Scale', competitor: 'Limitado a Capacidad de Appliance', hpeAdvantage: 'Zerto escala infinitamente en software; Datto te obliga a comprar más hardware para crecer.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Método de Replicación', hpe: 'Continua (Segundos)', competitor: 'Programada (Snapshots)', hpeAdvantage: 'Zerto ofrece replicación continua real, Datto se basa en ciclos de captura de snapshots.', hpeIsBetter: true }
                ]
            },
            {
                id: 'opentext-availability',
                name: 'OpenText',
                solution: 'OpenText Availability',
                topology: {
                    summary: 'Alta disponibilidad y protección de datos basada en replicación de Byte-level.',
                    layers: [
                        { name: 'Gestión', components: ['Carbonite Console', 'Availability Manager'], description: 'Interfaz para configurar esquemas de alta disponibilidad y migración.' },
                        { name: 'Replicación', components: ['Byte-level Mirroring', 'Agent-based'], description: 'Captura cambios a nivel de byte en tiempo real dentro del sistema operativo.' },
                        { name: 'Continuidad', components: ['Real-time Replication', 'Failover Monitor'], description: 'Asegura que el servidor secundario esté siempre sincronizado con el primario.' },
                        { name: 'Infraestructura', components: ['Windows / Linux', 'Multi-Hypervisor', 'Any-Cloud'], description: 'Independencia total del hardware y del hypervisor mediante el uso de agentes.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Gestión masiva', hpe: 'Gestión sin agentes (Hypervisor)', competitor: 'Agente en cada VM', hpeAdvantage: 'Zerto protege a nivel de hypervisor, ahorrando tiempo en instalación y mantenimiento de agentes.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'TCO de Operación', hpe: 'Bajo Mantenimiento', competitor: 'Alto (Update de agentes)', hpeAdvantage: 'Menos horas hombre requeridas al no tener que gestionar actualizaciones de red en cada SO.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'opsramp': {
        id: 'opsramp',
        name: 'HPE OpsRamp',
        description: 'Observabilidad full-stack y gestión de operaciones IT (AIOps).',
        topology: {
            summary: 'Plataforma SaaS de Observabilidad y AIOps.',
            layers: [
                { name: 'Gestión', components: ['OpsRamp SaaS Portal'], description: 'Multi-tenant, interfaz unificada.' },
                { name: 'Inteligencia', components: ['AIOps Correlation Engine'], description: 'Reducción de ruido y automatización de incidentes.' },
                { name: 'Recolección', components: ['Gateway / Agentless', 'Agents (Opcional)'], description: 'Descubrimiento nativo de infraestructura y aplicaciones.' },
                { name: 'Monitoreo', components: ['Hybrid Estate (On-Prem + Cloud)'], description: 'Visibilidad completa desde el mainframe hasta serverless.' }
            ]
        },
        competitors: [
            {
                id: 'datadog',
                name: 'Datadog',
                solution: 'Cloud Monitoring',
                topology: {
                    summary: 'Monitoreo Cloud-Native basado en agentes.',
                    layers: [
                        { name: 'Gestión', components: ['Datadog SaaS'], description: 'Excelente visualización de métricas.' },
                        { name: 'Recolección', components: ['Datadog Agent'], description: 'Requiere agente propietario en cada host.' },
                        { name: 'Integración', components: ['Integrations'], description: 'Costo incremental por métricas custom.' },
                        { name: 'Alcance', components: ['Cloud Focused'], description: 'Menor profundidad en hardware legacy.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Enfoque Híbrido', hpe: 'Nativo Híbrido (Legacy+Cloud)', competitor: 'Cloud Native', hpeAdvantage: 'Nombrado "Strong Performer" en AIOps por Forrester; visión híbrida real.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Remediación', hpe: 'Automatización Integrada', competitor: 'Principalmente Alertas', hpeAdvantage: 'Reduce el ruido de alertas en un 95% mediante correlación inteligente.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Predictibilidad', hpe: 'Modelo enterprise', competitor: 'Costos variables (Métricas)', hpeAdvantage: 'Sin sorpresas en la factura por ingestión de logs o métricas custom.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Correlación', hpe: 'AIOps Nativo', competitor: 'Add-on o limitado', hpeAdvantage: 'Motor de inferencia potente que entiende dependencias de topología.', hpeIsBetter: true }
                ]
            },
            {
                id: 'servicenow',
                name: 'ServiceNow',
                solution: 'ITOM',
                topology: {
                    summary: 'Gestión de servicios IT (ITSM/ITOM).',
                    layers: [
                        { name: 'Gestión', components: ['ServiceNow Instance'], description: 'Plataforma workflow empresarial.' },
                        { name: 'Recolección', components: ['MID Server'], description: 'Requiere servidores intermedios en la red local.' },
                        { name: 'CMDB', components: ['Configuration Management DB'], description: 'Base de datos de configuración central.' },
                        { name: 'Enfoque', components: ['Ticket-centric'], description: 'Más enfocado en tickets que en métricas en tiempo real.' }
                    ]
                },
                comparisons: [
                    { category: 'Funcional', feature: 'Monitoreo', hpe: 'Profundidad en tiempo real', competitor: 'Depende de integraciones', hpeAdvantage: 'OpsRamp es la "fuente de la verdad" operativa que alimenta a ServiceNow.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'gl-pcbe': {
        id: 'gl-pcbe',
        name: 'HPE GreenLake for Private Cloud Business Edition',
        description: 'La nube privada hiperconvergente simplificada para el centro de datos moderno y el borde.',
        topology: {
            summary: 'Infraestructura de nube privada gestionada con despliegue ultra-rápido.',
            layers: [
                { name: 'Gestión', components: ['GreenLake Cloud Platform', 'PCBE Console', 'HPE InfoSight (AI)', 'Aruba Central Integration'], description: 'Gestión centralizada desde la nube con operaciones asistidas por IA.' },
                { name: 'Consumo', components: ['Self-Service VM/K8s', 'SaaS Catalog', 'Role-Based Control', 'Billing/Metering'], description: 'Experiencia de consumo tipo nube pública para recursos locales.' },
                { name: 'Software', components: ['HCI Native Software', 'Virtual Active Replication', 'Built-in Backup'], description: 'Stack completo de software de virtualización y servicios de datos integrados.' },
                { name: 'Hardware', components: ['HPE Alletra dHCI', 'HPE SimpliVity nodes', 'Standard ProLiant'], description: 'Infraestructura física flexible y resiliente pre-validada.' }
            ]
        },
        competitors: [
            {
                id: 'dell-vxrail-gl',
                name: 'Dell',
                solution: 'VxRail with APEX',
                topology: {
                    summary: 'HCI basada en vSAN gestionada como servicio mediante Dell APEX.',
                    layers: [
                        { name: 'Gestión', components: ['APEX Console', 'VxRail Manager', 'vCenter Server'], description: 'Integración de gestión de hardware Dell con el stack de VMware.' },
                        { name: 'Consumo', components: ['APEX Cloud Services', 'Fixed Subscriptions'], description: 'Modelo de suscripción para hardware Dell en sitio.' },
                        { name: 'Virtualización', components: ['VMware vSphere', 'vSAN Distributed Storage'], description: 'Software propietario de virtualización de VMware.' },
                        { name: 'Hardware', components: ['Dell PowerEdge Nodes', 'SmartFabric'], description: 'Servidores Dell optimizados para cargas de trabajo VMware.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Flexibilidad de Hypervisor', hpe: 'Soporte Multi-Hypervisor', competitor: 'Bloqueo en VMware', hpeAdvantage: 'PCBE permite usar VM Essentials, VMware o Nutanix; VxRail es exclusivo de VMware.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Eficiencia de Datos', hpe: 'HW-Offload Dedupe', competitor: 'Software-based', hpeAdvantage: 'SimpliVity/HCI nativo en PCBE ahorra un 90% de capacidad sin degradar la CPU.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'gl-pce': {
        id: 'gl-pce',
        name: 'HPE Private Cloud Enterprise (PCE)',
        description: 'Nube privada automatizada de autoservicio que soporta VMs, contenedores y bare metal.',
        topology: {
            summary: 'Plataforma unificada para aplicaciones modernas y tradicionales.',
            layers: [
                { name: 'Portal', components: ['PCE Self-Service Portal', 'Service Catalog', 'API Gateway', 'FinOps Dashboard'], description: 'Interfaz única para desarrolladores y administradores con control de costos.' },
                { name: 'Orquestación', components: ['Automation Engine', 'Morpheus Integration', 'Governance Policies'], description: 'Motor de automatización que gestiona el ciclo de vida de las apps.' },
                { name: 'Cargas de Trabajo', components: ['Virtual Machines (VM)', 'Kubernetes Clusters', 'Bare Metal Servers'], description: 'Flexibilidad total para correr cualquier workload en la misma arquitectura.' },
                { name: 'Infraestructura', components: ['Automated Bare Metal', 'Software Defined Network', 'Managed Storage'], description: 'Hardware 100% gestionado por HPE con aprovisionamiento transparente.' }
            ]
        },
        competitors: [
            {
                id: 'aws-outposts-gl',
                name: 'AWS',
                solution: 'AWS Outposts',
                topology: {
                    summary: 'Extensión de la nube de AWS en el centro de datos local.',
                    layers: [
                        { name: 'Gestión', components: ['AWS Management Console', 'IAM Control'], description: 'Control de nube pública extendido al borde local.' },
                        { name: 'Conexión', components: ['Direct Connect / VPN', 'Local Gateway'], description: 'Requiere conexión síncrona obligatoria al plano de control de AWS.' },
                        { name: 'Hardware', components: ['AWS Outpost Rack', 'AWS Nitro System'], description: 'Rack cerrado y propietario fabricado y gestionado por AWS.' },
                        { name: 'Servicios', components: ['EC2', 'EBS', 'S3', 'RDS Integration'], description: 'Subconjunto de servicios de AWS que corren localmente.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Operación Autonoma', hpe: 'Funcionamiento Offline', competitor: 'Dependencia de Nube', hpeAdvantage: 'PCE opera sin conexión a internet; Outposts es un "ladrillo" si se pierde el enlace con AWS.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Agnosticismo Cloud', hpe: 'Multi-Cloud Native', competitor: 'AWS Locked-in', hpeAdvantage: 'PCE gestiona múltiples nubes; Outposts solo sirve para el ecosistema AWS.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'gl-block': {
        id: 'gl-block',
        name: 'HPE GreenLake for Block Storage',
        description: 'Almacenamiento de bloque como servicio con disponibilidad del 100% garantizada.',
        topology: {
            summary: 'Almacenamiento inteligente de misión crítica basado en Alletra MP.',
            layers: [
                { name: 'Gestión', components: ['Data Services Cloud Console', 'DSCC Management', 'Intent-based Provisioning'], description: 'SaaS centralizado para gestionar el almacenamiento globalmente.' },
                { name: 'Inteligencia', components: ['HPE InfoSight', 'AI-driven Optimization', 'Predictive Analysis'], description: 'Optimización proactiva basada en inteligencia artificial.' },
                { name: 'Rendimiento', components: ['NVMe-over-Fabrics', 'Parallel Architecture', 'Shared-Everything'], description: 'Arquitectura escalable que garantiza latencias ultra-bajas para cargas críticas.' },
                { name: 'Hardware', components: ['HPE Alletra MP', 'Dual Controller', 'Resilient Hardware'], description: 'Infraestructura desacoplada que permite escalar cómputo y storage por separado.' }
            ]
        },
        competitors: [
            {
                id: 'dell-block-apex',
                name: 'Dell',
                solution: 'APEX Block Storage / PowerStore / PowerMax',
                topology: {
                    summary: 'Portafolio de almacenamiento de Dell gestionado como servicio.',
                    layers: [
                        { name: 'Gestión', components: ['APEX Console', 'CloudIQ', 'Unisphere'], description: 'Control unificado para el monitoreo de salud y capacidad predictiva.' },
                        { name: 'Software/OS', components: ['PowerStoreOS', 'PowerMaxOS', 'SDG (Storage Delivery)'], description: 'Sistemas operativos específicos según la gama de hardware.' },
                        { name: 'Data Path', components: ['NVMe-over-Fabrics', 'Dynamic Resiliency Engine'], description: 'Optimización de caminos de datos para alto rendimiento y disponibilidad.' },
                        { name: 'Hardware', components: ['PowerStore Nodes', 'PowerMax Racks', 'APEX Infrastructure'], description: 'Infraestructura física de Dell escalable en sitio.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Flexibilidad de Gestión', hpe: 'SaaS Nativo (DSCC)', competitor: 'Appliance-based / Mixed', hpeAdvantage: 'HPE gestiona todo el storage global desde una única consola SaaS real.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Eficiencia CPU', hpe: 'Escalado Desacoplado', competitor: 'Escalado en Nodos', hpeAdvantage: 'Alletra MP permite crecer en performance sin obligar a comprar discos extra.', hpeIsBetter: true }
                ]
            },
            {
                id: 'netapp-keystone',
                name: 'NetApp',
                solution: 'NetApp Keystone / NetApp AFF',
                topology: {
                    summary: 'Almacenamiento unificado con enfoque en gestión de datos híbridos.',
                    layers: [
                        { name: 'Gestión', components: ['BlueXP', 'Active IQ', 'Cloud Insights'], description: 'Plataforma unificada para gestionar datos en on-prem y nube.' },
                        { name: 'Software/OS', components: ['ONTAP', 'StorageGRID', 'Element OS'], description: 'El software ONTAP permite gestión de bloque, archivo y objeto.' },
                        { name: 'Conectividad', components: ['FabricPool', 'SnapMirror', 'NVMe/FC'], description: 'Integración profunda con nubes públicas para tiering automático.' },
                        { name: 'Hardware', components: ['AFF A-Series', 'FAS Series', 'Keystone Hardware'], description: 'Sistemas de almacenamiento flash y dispositivos híbridos.' }
                    ]
                },
                comparisons: [
                    { category: 'Funcional', feature: 'Gestión Unificada', hpe: 'Consola SaaS (DSCC)', competitor: 'Múltiples herramientas', hpeAdvantage: 'HPE ofrece una experiencia de nube real simplificada vs la complejidad de ONTAP.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Arquitectura Hardware', hpe: 'Shared-Everything', competitor: 'Dual Controller Traditional', hpeAdvantage: 'La arquitectura de Alletra MP es más resiliente y escalable que el modelo de pares de NetApp.', hpeIsBetter: true }
                ]
            },
            {
                id: 'pure-evergreen-one',
                name: 'Pure Storage',
                solution: 'Pure Storage Evergreen//One / FlashArray',
                topology: {
                    summary: 'Suscripción de almacenamiento con arquitectura Evergreen nativa.',
                    layers: [
                        { name: 'Gestión', components: ['Pure1', 'Purity UI'], description: 'Monitoreo basado en la nube con soporte proactivo.' },
                        { name: 'Software/OS', components: ['Purity OS', 'Evergreen Subscription'], description: 'Software que permite actualizaciones de hardware sin interrupciones.' },
                        { name: 'Data Engine', components: ['DirectFlash Modules', 'NVMe Control'], description: 'Arquitectura dedicada a flash sin capas de abstracción innecesarias.' },
                        { name: 'Hardware', components: ['FlashArray //X', '//XL', '//C'], description: 'Equipamiento optimizado para rendimiento o capacidad según la serie.' }
                    ]
                },
                comparisons: [
                    { category: 'Financiero', feature: 'Escalabilidad Independiente', hpe: 'Desacoplado (Performance/Cap)', competitor: 'Acoplado (Controller/Box)', hpeAdvantage: 'Alletra MP permite escalar controladores sin discos; Pure requiere saltos de nivel.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Ecosistema GreenLake', hpe: 'Compute + Networking + Storage', competitor: 'Solo Storage', hpeAdvantage: 'HPE ofrece una solución de nube privada completa bajo GreenLake.', hpeIsBetter: true }
                ]
            },
            {
                id: 'ibm-flashsystem-aas',
                name: 'IBM',
                solution: 'IBM FlashSystem / Storage as a Service',
                topology: {
                    summary: 'Almacenamiento flash con integración profunda en seguridad de datos.',
                    layers: [
                        { name: 'Gestión', components: ['Storage Insights', 'Spectrum Control'], description: 'Análisis predictivo y gestión impulsada por IA.' },
                        { name: 'Software/OS', components: ['Spectrum Virtualize', 'Encryption Engine'], description: 'Software que permite virtualizar más de 500 sistemas de otros vendors.' },
                        { name: 'Seguridad', components: ['Safeguarded Copy', 'Cyber Resiliency'], description: 'Copias inmutables y protección avanzada contra Ransomware.' },
                        { name: 'Hardware', components: ['FlashSystem 5000/7000/9000', 'FCM Modules'], description: 'Hardware con módulos Flash Core propietarios de baja latencia.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Simplicidad SaaS', hpe: 'Zero Infrastructure Mgmt', competitor: 'Software-heavy local', hpeAdvantage: 'HPE DSCC elimina la necesidad de instalar y mantener Spectrum Virtualize local.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Disponibilidad', hpe: '100% Garantizada', competitor: 'Garantía 99.9999%', hpeAdvantage: 'HPE formaliza el compromiso de disponibilidad total en Block Storage.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'gl-file': {
        id: 'gl-file',
        name: 'HPE GreenLake for File Storage',
        description: 'Almacenamiento de archivos escalable diseñado para IA y análisis de datos a escala empresarial.',
        topology: {
            summary: 'Sistema de archivos paralelo de alto rendimiento gestionado desde la nube.',
            layers: [
                { name: 'Gestión', components: ['DSCC File Console', 'OpsRamp Integration', 'SaaS Unified Portal'], description: 'Gestión moderna de datos no estructurados con visibilidad completa.' },
                { name: 'Protocolo', components: ['Multi-protocol (SMB/NFS)', 'S3 Interface', 'VAST Data Software'], description: 'Arquitectura DASE (Disaggregated Shared Everything) para escalabilidad masiva.' },
                { name: 'Eficiencia', components: ['Similarity Deduplication', 'Predictive Caching', 'No-Rebuild RAID'], description: 'Máxima eficiencia de almacenamiento para datasets gigantescos de IA/ML.' },
                { name: 'Hardware', components: ['HPE Alletra MP (File Nodes)', 'Compute Nodes', 'NVMe Capacity nodes'], description: 'Desacoplamiento de nodos de cómputo y capacidad para crecimiento flexible.' }
            ]
        },
        competitors: [
            {
                id: 'dell-powerscale-gl',
                name: 'Dell',
                solution: 'PowerScale (Isilon)',
                topology: {
                    summary: 'Almacenamiento NAS escalable líder en el mercado tradicional.',
                    layers: [
                        { name: 'Gestión', components: ['InsightIQ', 'OneFS Console', 'CloudIQ'], description: 'Software de gestión maduro para clusters NAS de gran tamaño.' },
                        { name: 'Software', components: ['OneFS', 'SmartQuotas', 'SyncIQ'], description: 'Sistema de archivos distribuido que agrupa nodos en un pool único.' },
                        { name: 'Red de Nodos', components: ['InfiniBand / Ethernet Switch', 'Internal Backplane'], description: 'Dependencia de red de alta velocidad dedicada para la comunicación inter-nodo.' },
                        { name: 'Hardware', components: ['F-Series (Flash)', 'H-Series (Hybrid)', 'A-Series (Archive)'], description: 'Nodos de hardware rígidos que combinan siempre CPU y discos.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Arquitectura Moderna', hpe: 'Desacoplada (DASE)', competitor: 'Arquitectura de Nodos', hpeAdvantage: 'HPE escala performance y capacidad por separado; PowerScale obliga a comprar nodos completos.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Eficiencia de Datos', hpe: 'Similarity Deduplication', competitor: 'Dedupe tradicional', hpeAdvantage: 'Logra ratios de reducción superiores en datos científicos y de IA frente a Isilon.', hpeIsBetter: true }
                ]
            },
            {
                id: 'cloudian-hyperstore',
                name: 'Cloudian',
                solution: 'Cloudian HyperStore',
                topology: {
                    summary: 'Almacenamiento de objetos escalable compatible con S3 nativo.',
                    layers: [
                        { name: 'Gestión', components: ['HyperIQ', 'Cloudian Management Console'], description: 'Herramientas de monitoreo y gestión de políticas de datos.' },
                        { name: 'Software', components: ['HyperStore Object OS', 'S3 Native API'], description: 'Sistema de archivos de objetos diseñado para compatibilidad total con AWS S3.' },
                        { name: 'Distribución', components: ['Data Tiering', 'Multi-tenant Isolation'], description: 'Capacidad de mover datos entre nubes y on-prem de forma transparente.' },
                        { name: 'Hardware', components: ['Cloudian Appliances', 'Standard x86 Servers'], description: 'Software que corre en appliances propios o hardware estándar certificado.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Rendimiento File/Object', hpe: 'Unificado Nativo (DASE)', competitor: 'Object-First (Gateway for File)', hpeAdvantage: 'HPE ofrece rendimiento de archivo nativo sin penalizaciones de latencia por traducción.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Soporte Global', hpe: 'Soporte Único HPE', competitor: 'Soporte por Componentes', hpeAdvantage: 'HPE ofrece un único punto de contacto para todo el stack de infraestructura.', hpeIsBetter: true }
                ]
            },
            {
                id: 'pure-flashblade',
                name: 'Pure Storage',
                solution: 'Pure Storage FlashBlade',
                topology: {
                    summary: 'Almacenamiento de archivos y objetos flash de alto rendimiento.',
                    layers: [
                        { name: 'Gestión', components: ['Pure1 UI', 'Purity//FB OS'], description: 'Gestión simplificada basada en la nube para clusters flash.' },
                        { name: 'Software/OS', components: ['Purity//FB', 'Scale-out File & Object'], description: 'Software que orquesta el acceso paralelo masivo a los blades.' },
                        { name: 'Interconexión', components: ['Fabric Modules', 'High-speed Backplane'], description: 'Red interna que conecta los blades de cómputo y almacenamiento.' },
                        { name: 'Hardware', components: ['DirectFlash Blades', 'FlashBlade//S', '//E'], description: 'Nodos tipo blade integrados en un chasis propietario.' }
                    ]
                },
                comparisons: [
                    { category: 'Financiero', feature: 'Escalamiento Granular', hpe: 'Performance vs Capacidad', competitor: 'Escalado por Blade', hpeAdvantage: 'Alletra MP permite escalar solo performance o solo capacidad; Pure escala ambos al añadir blades.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Resiliencia', hpe: 'Shared-Everything (DASE)', competitor: 'Bladed Architecture', hpeAdvantage: 'HPE elimina cuellos de botella al desacoplar totalmente los recursos.', hpeIsBetter: true }
                ]
            },
            {
                id: 'huawei-oceanstor-pacific',
                name: 'Huawei',
                solution: 'Huawei OceanStor Pacific Series',
                topology: {
                    summary: 'Almacenamiento masivo escalable para Big Data e HPC.',
                    layers: [
                        { name: 'Gestión', components: ['DME (Data Mgmt Engine)', 'DeviceManager'], description: 'Gestión de ciclo de vida de datos asistida por IA.' },
                        { name: 'Software', components: ['Pacific Distributed SW', 'Parallel File System'], description: 'Motor de archivos paralelos optimizado para throughput masivo.' },
                        { name: 'Capa de Datos', components: ['Flash-First Optimization', 'Dynamic Tiering'], description: 'Uso inteligente de flash para metadatos y discos mecánicos para capacidad.' },
                        { name: 'Hardware', components: ['Pacific 9500/9900 Nodes', 'High-density Chassis'], description: 'Hardware de alta densidad diseñado para infraestructuras a escala petabyte.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Confianza y Geopolítica', hpe: 'Global/Western Trusted v', competitor: 'Restricciones Regionales', hpeAdvantage: 'HPE es la opción preferida en mercados regulados y seguros a nivel global.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Ecosistema Cloud', hpe: 'GreenLake Unified (SaaS)', competitor: 'Local-Centric', hpeAdvantage: 'HPE ofrece una experiencia de nube real integrada con AWS/Azure/GCP.', hpeIsBetter: true }
                ]
            },
            {
                id: 'minio-ai-storage',
                name: 'MinIO',
                solution: 'MinIO Enterprise Object Storage',
                topology: {
                    summary: 'Almacenamiento de objetos definido por software de alto rendimiento.',
                    layers: [
                        { name: 'Gestión', components: ['MinIO Console', 'Prometheus/Grafana'], description: 'Interfaz moderna para gestión de tenants y monitoreo.' },
                        { name: 'Software', components: ['MinIO Server', 'Erasure Coding Engine'], description: 'Software ligero diseñado para ser el más rápido en acceso a objetos S3.' },
                        { name: 'Abstracción', components: ['Identity Mgmt', 'Encryption Layer', 'IAM'], description: 'Capa de seguridad y servicios para entornos multi-tenant.' },
                        { name: 'Infraestructura', components: ['Docker/K8s', 'x86 Generic Servers'], description: 'Corre exclusivamente como software sobre contenedores o servidores estándar.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Soporte Enterprise', hpe: 'Soporte Crítico 24/7', competitor: 'Community/Support Tiers', hpeAdvantage: 'HPE garantiza el tiempo de actividad con ingenieros de campo y soporte global.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Rendimiento de Archivo', hpe: 'NAS Nativo Masivo', competitor: 'Object-Centric', hpeAdvantage: 'HPE entrega performance NFS/SMB superior sin capas de emulación adicionales.', hpeIsBetter: true }
                ]
            },
            {
                id: 'veritas-access-appliance',
                name: 'Veritas',
                solution: 'NetBackup Access Appliances',
                topology: {
                    summary: 'Almacenamiento secundario optimizado para protección de datos.',
                    layers: [
                        { name: 'Gestión', components: ['NetBackup Console', 'Appliance Shell'], description: 'Integración profunda con el ecosistema de backup Veritas.' },
                        { name: 'Software', components: ['Veritas Access OS', 'Long-term Retention'], description: 'Software optimizado para retención de largo plazo e inmutabilidad.' },
                        { name: 'Servicios', components: ['S3 for Backup', 'Object Lock'], description: 'Enfoque en ser un repositorio seguro para datos protegidos.' },
                        { name: 'Hardware', components: ['Access 3350/5350 HW', 'Storage Shelves'], description: 'Hardware pre-configurado tipo appliance propietario.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Uso de Cargas', hpe: 'Multi-Uso (IA/HPC/Backup)', competitor: 'Foco en Backup Only', hpeAdvantage: 'HPE for File Storage sirve para producción (IA) y protección al mismo tiempo.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'TCO de Escalamiento', hpe: 'Escala Performance/Cap separate', competitor: 'Forklift upgrade frequently', hpeAdvantage: 'Evita renovaciones tecnológicas costosas al ser una arquitectura desacoplada.', hpeIsBetter: true }
                ]
            },
            {
                id: 'nutanix-unified-storage',
                name: 'Nutanix',
                solution: 'Nutanix Unified Storage (Files/Objects)',
                topology: {
                    summary: 'Almacenamiento definido por software integrado en el cluster HCI.',
                    layers: [
                        { name: 'Gestión', components: ['Prism Central', 'Unified Dashboard'], description: 'Control unificado de toda la infraestructura Nutanix.' },
                        { name: 'Software', components: ['AOS Distributed FS', 'Files/Objects Services'], description: 'Software que corre como VMs controladoras sobre el hypervisor.' },
                        { name: 'Datos', components: ['Storage Pool', 'Data Locality Engine'], description: 'Gestión de datos compartida con las VMs de producción del cluster HCI.' },
                        { name: 'Hardware', components: ['Standard HCI Nodes', 'Certified Hardware'], description: 'Corre en los mismos nodos que el cómputo y la virtualización.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Impacto en Producción', hpe: 'Dedicado/Sin Impacto', competitor: 'Consume recursos HCI', hpeAdvantage: 'HPE no le "roba" CPU a las aplicaciones para gestionar los archivos.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Economía de Escala', hpe: 'Costo por GB Enterprise', competitor: 'Costo de Licencia HCI', hpeAdvantage: 'Logra un mejor TCO para grandes repositorios de datos al usar hardware optimizado.', hpeIsBetter: true }
                ]
            },
            {
                id: 'qumulo-file-data',
                name: 'Qumulo',
                solution: 'Qumulo File Data Platform',
                topology: {
                    summary: 'Plataforma de datos de archivos de arquitectura distribuida nativa.',
                    layers: [
                        { name: 'Gestión', components: ['Qumulo Analytics', 'Real-time Visibility'], description: 'Visibilidad inmediata de quién usa qué archivos en tiempo real.' },
                        { name: 'Software', components: ['Qumulo Core OS', 'Scalable File System'], description: 'Sistema de archivos que corre sobre x86 o infraestructura cloud.' },
                        { name: 'Capa de Red', components: ['Standard TCP/IP', 'Cloud Connectivity'], description: 'Enfoque en simplicidad de red estándar sin componentes propietarios.' },
                        { name: 'Infraestructura', components: ['AWS/Azure/GCP', 'HPE ProLiant (OEM)', 'Generic Hardware'], description: 'Software agnóstico que se despliega en nubes o hardware validado.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Soporte Global', hpe: 'Soporte HPE Integral', competitor: 'Software Vendor Support', hpeAdvantage: 'HPE provee la garantía de hardware y software bajo un solo contrato mundial.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Eficiencia CRUD', hpe: 'DASE Architecture', competitor: 'Node-based Quotas', hpeAdvantage: 'HPE maneja millones de archivos pequeños con mayor performance gracias a su arquitectura paralela.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'gl-networking': {
        id: 'gl-networking',
        name: 'HPE GreenLake for Networking',
        description: 'Networking as a Service (NaaS) gestionado desde la nube para campus, centro de datos y borde.',
        topology: {
            summary: 'Conectividad segura y automatizada basada en Aruba Networking.',
            layers: [
                { name: 'Gestión Cloud', components: ['Aruba Central', 'ClearPass Cloud', 'AI Desktop'], description: 'Panel centralizado para gestión de wired, wireless y SD-WAN.' },
                { name: 'Inteligencia', components: ['AI-Powered Insights', 'Profiling Engine', 'Performance Monitoring'], description: 'Resolución de problemas asistida por IA para maximizar el tiempo de actividad.' },
                { name: 'Seguridad', components: ['Zero Trust Security', 'Role-Based Access', 'Universal Policy'], description: 'Control de acceso granular y visibilidad total de dispositivos IoT.' },
                { name: 'Hardware NaaS', components: ['AOS-CX Switches', 'WLAN Access Points', 'SD-WAN Gateways'], description: 'Equipamiento de última generación entregado bajo un modelo de consumo.' }
            ]
        },
        competitors: [
            {
                id: 'cisco-dna-gl',
                name: 'Cisco',
                solution: 'Cisco DNA Center / Catalyst',
                topology: {
                    summary: 'Gestión de red basada en controladores locales y cloud.',
                    layers: [
                        { name: 'Gestión', components: ['Cisco DNA Center', 'DNAC Appliance', 'vManage'], description: 'Requiere appliances físicos pesados para la gestión centralizada.' },
                        { name: 'Control', components: ['ISE (Identity Services)', 'Software Defined Access'], description: 'Implementación compleja de políticas de seguridad.' },
                        { name: 'Software', components: ['DNA Subscription', 'iOS-XE'], description: 'Licenciamiento por niveles obligado para funciones avanzadas.' },
                        { name: 'Hardware', components: ['Catalyst 9000 Series', 'Aironet / Catalyst APs'], description: 'Hardware de red tradicional con dependencia de arquitectura de hardware.' }
                    ]
                },
                comparisons: [
                    { category: 'Funcional', feature: 'Simplicidad de Gestión', hpe: 'Cloud Native (Central)', competitor: 'Appliance-based (DNAC)', hpeAdvantage: 'HPE elimina la necesidad de hardware de gestión costoso y complejo en sitio.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Modelo de Consumo', hpe: 'NaaS 100% Flexible', competitor: 'CAPEX + Suscripción', hpeAdvantage: 'Verdadero modelo de pago por uso frente a la compra tradicional de Cisco con software extra.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'gl-dr': {
        id: 'gl-dr',
        name: 'HPE GreenLake for Disaster Recovery',
        description: 'Recuperación ante desastres como servicio para aplicaciones críticas con orquestación automática.',
        topology: {
            summary: 'Protección de datos y resiliencia en la nube ante Ransomware.',
            layers: [
                { name: 'Plano de Control', components: ['GL for Disaster Recovery Console', 'SaaS Manager'], description: 'Consola web centralizada para gestionar políticas de protección global.' },
                { name: 'Motor', components: ['Zerto Replication Engine', 'CDP Technology', 'Automation'], description: 'Tecnología de replicación continua sin snapshots para RPOs de segundos.' },
                { name: 'Resiliencia', components: ['Any-point-in-time Restore', 'Ransomware Vault', 'Encryption'], description: 'Capacidad de volver a un punto exacto en el tiempo antes del desastre.' },
                { name: 'Infraestructura', components: ['On-prem to On-prem', 'On-prem to Cloud', 'Hybrid Storage'], description: 'Flexibilidad de destino para la recuperación de las cargas de trabajo.' }
            ]
        },
        competitors: [
            {
                id: 'vmware-srm-gl',
                name: 'VMware',
                solution: 'VMware Site Recovery Manager (SRM)',
                topology: {
                    summary: 'Orquestación de recuperación basada en replicación de snapshots.',
                    layers: [
                        { name: 'Gestión', components: ['SRM Server', 'vCenter Plugin'], description: 'Software de orquestación local para planes de recuperación.' },
                        { name: 'Captura', components: ['vSphere Replication', 'Snapshot-based'], description: 'Replicación asíncrona que impacta el rendimiento del host.' },
                        { name: 'Red', components: ['Network Mapping', 'Re-IP engine'], description: 'Gestión manual o semi-automática de configuraciones de red.' },
                        { name: 'Infraestructura', components: ['ESXi Cluster', 'Certified Storage'], description: 'Requiere hardware y hypervisores compatibles en ambos extremos.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'RPO (Segundos)', hpe: 'CDP Continuo (5s)', competitor: 'Schedule Snapshots (15m+)', hpeAdvantage: 'GL for DR reduce drásticamente la pérdida de datos frente a SRM.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Simplicidad SaaS', hpe: 'Zero-Infrastructure mgmt', competitor: 'Heavy local software', hpeAdvantage: 'Elimina la complejidad de mantener servidores SRM y replicación locales.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'vm_essentials_infra': {
        id: 'vm_essentials_infra',
        name: 'VM Essentials (Full Stack)',
        description: 'Solución integral de virtualización que incluye hardware y software optimizado.',
        topology: {
            summary: 'Stack completo de virtualización pre-configurado.',
            layers: [
                { name: 'Gestión', components: ['VME Manager', 'HPE InfoSight'], description: 'Control centralizado de todo el stack.' },
                { name: 'spacer', components: [], description: '' },
                { name: 'Hypervisor', components: ['VME Hypervisor (KVM)'], description: 'Kernel optimizado para alto rendimiento.' },
                { name: 'Hardware', components: ['HPE ProLiant / Apollo'], description: 'Infraestructura líder en cómputo.' }
            ]
        },
        competitors: [
            {
                id: 'dell-vxrail-vme',
                name: 'Dell',
                solution: 'VxRail',
                topology: {
                    summary: 'HCI Propietaria con stack VMware integrado.',
                    layers: [
                        { name: 'Gestión', components: ['VxRail Manager', 'vCenter'], description: 'Múltiples consolas de gestión para hardware y software.' },
                        { name: 'spacer', components: [], description: '' },
                        { name: 'Software', components: ['vSphere / vSAN'], description: 'Software de virtualización y almacenamiento definido por software.' },
                        { name: 'Hardware', components: ['Dell PowerEdge Custom'], description: 'Hardware propietario optimizado.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Simplicidad', hpe: 'Gestión unificada HW/SW', competitor: 'Complejidad vSAN/vCenter', hpeAdvantage: 'VME ofrece una experiencia de gestión mucho más ligera y directa que el ecosistema VMware.', hpeIsBetter: true },
                    { category: 'Precios', feature: 'Costo de Licencia', hpe: 'Incluido en el stack', competitor: 'Suscripción vSphere/vSAN', hpeAdvantage: 'Ahorro masivo eliminando las licencias obligatorias de Broadcom.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'vm_essentials_license': {
        id: 'vm_essentials_license',
        name: 'VM Essentials (Licencia)',
        description: 'Software de virtualización para ejecución en cualquier hardware x86 estándar.',
        topology: {
            summary: 'Hypervisor ligero definido por software.',
            layers: [
                { name: 'Gestión', components: ['VME UI'], description: 'Interfaz web moderna.' },
                { name: 'Virtualización', components: ['VME Software'], description: 'Hypervisor desacoplado del hardware.' },
                { name: 'spacer', components: [], description: '' },
                { name: 'Hardware', components: ['Cualquier x86 (HPE, Dell, Lenovo)', 'Agnóstico'], description: 'Flexibilidad total de hardware.' }
            ]
        },
        competitors: [
            {
                id: 'vsphere-std',
                name: 'VMware',
                solution: 'vSphere Standard',
                topology: {
                    summary: 'Virtualización tradicional con vCenter.',
                    layers: [
                        { name: 'Gestión', components: ['vCenter Server'], description: 'Gestor central obligatorio.' },
                        { name: 'Virtualización', components: ['ESXi Standard'], description: 'Hypervisor propietario.' },
                        { name: 'spacer', components: [], description: '' },
                        { name: 'Hardware', components: ['HCL Stricto'], description: 'Hardware certificado por VMware.' }
                    ]
                },
                comparisons: [
                    { category: 'Financiero', feature: 'Modelo de Compra', hpe: 'Flexible / Perpetuo disponible', competitor: 'Suscripción obligatoria', hpeAdvantage: 'Libertad de elegir cómo pagar, sin contratos de suscripción forzosos.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Footprint', hpe: 'Mínimo (Linux based)', competitor: 'Pesado (ESXi)', hpeAdvantage: 'Hypervisor más eficiente que libera más recursos para las aplicaciones.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'pcbe_business': {
        id: 'pcbe_business',
        name: 'PCBE Business Edition',
        description: 'Nube privada simplificada para el mercado medio y sucursales.',
        topology: {
            summary: 'arquitectura de nube híbrida simplificada y altamente automatizada.',
            layers: [
                { name: 'Gestión (Cloud)', components: ['GL Cloud Platform', 'Data Services Console'], description: 'Plano de control SaaS unificado y accesible desde cualquier lugar.' },
                { name: 'Orquestación', components: ['PCBE Orchestrator', 'Cloud Connector'], description: 'Automatización del ciclo de vida y conectividad híbrida nativa.' },
                { name: 'Software', components: ['HPE VM Essentials', 'KVM / VMware Support'], description: 'Capa de virtualización optimizada y flexible por software.' },
                { name: 'Hardware', components: ['HPE Alletra 5000 / MP', 'HPE ProLiant Gen11'], description: 'Infraestructura de alto rendimiento con garantía de disponibilidad del 100%.' }
            ]
        },
        competitors: [
            {
                id: 'vcf-std-pcbe',
                name: 'VMware',
                solution: 'Cloud Foundation (VCF)',
                topology: {
                    summary: 'Stack completo de software-defined datacenter (SDDC) local.',
                    layers: [
                        { name: 'Gestión', components: ['vCenter', 'SDDC Manager', 'NSX Manager'], description: 'Múltiples appliances de gestión locales pesados.' },
                        { name: 'spacer', components: [], description: '' },
                        { name: 'Software', components: ['vSphere', 'vSAN', 'NSX'], description: 'Capa de virtualización y red definida por software.' },
                        { name: 'Hardware', components: ['Certificado vSAN / VxRail'], description: 'Servidores x86 certificados.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Simplicidad Operativa', hpe: 'Cloud-Managed On-Prem', competitor: 'Software-Defined Complex', hpeAdvantage: 'HPE gestiona el plano de control desde la nube; VCF requiere múltiples appliances de gestión locales.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Modelo de Costos', hpe: 'Paga por uso (OpEx)', competitor: 'Suscripción rígida', hpeAdvantage: 'Evita el "Impuesto Broadcom" pagando solo por los recursos realmente consumidos.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Despliegue', hpe: 'Automatizado (1-Click)', competitor: 'Manual / Complejo', hpeAdvantage: 'Aprovisionamiento de VMs y servicios cloud mucho más ágil que el stack tradicional de VMware.', hpeIsBetter: true }
                ]
            },
            {
                id: 'nutanix-cp-pcbe',
                name: 'Nutanix',
                solution: 'Cloud Platform (NCP)',
                topology: {
                    summary: 'Arquitectura HCI basada en Controller VMs (CVM).',
                    layers: [
                        { name: 'Gestión', components: ['Prism Central', 'Prism Element'], description: 'Consola de gestión local.' },
                        { name: 'Capa Control', components: ['Controller VM (CVM)'], description: 'Requiere recursos significativos en cada nodo.' },
                        { name: 'Software', components: ['AHV Hypervisor', 'AOS Storage'], description: 'Stack nativo de Nutanix.' },
                        { name: 'Hardware', components: ['Nutanix NX / HPE / Dell'], description: 'Nodos de cómputo y almacenamiento.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Eficiencia de Recursos', hpe: 'Sin CVM (Offload)', competitor: 'Requiere Controller VM', hpeAdvantage: 'Libera hasta 100GB de RAM por nodo al no requerir CVMs pesadas en cada servidor.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Arquitectura', hpe: 'Desacoplada (Escala HW)', competitor: 'HCI Propietaria', hpeAdvantage: 'Escala cómputo y almacenamiento de forma independiente sin el lock-in de la plataforma Nutanix.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'TCO a 3 Años', hpe: 'Hasta 30% menor', competitor: 'Costo incremental por nodo', hpeAdvantage: 'Mejor densidad de VMs por host gracias al ahorro de recursos del hypervisor.', hpeIsBetter: true }
                ]
            },
            {
                id: 'azure-stack-pcbe',
                name: 'Microsoft',
                solution: 'Azure Stack HCI / Azure Local',
                topology: {
                    summary: 'Extensión de Azure para ejecución local con dependencia de nube.',
                    layers: [
                        { name: 'Gestión', components: ['Azure Portal', 'Windows Admin Center'], description: 'Gestión híbrida fragmentada.' },
                        { name: 'spacer', components: [], description: '' },
                        { name: 'Software', components: ['Hyper-V', 'S2D (Storage Spaces Direct)'], description: 'OS optimizado para Azure local.' },
                        { name: 'Hardware', components: ['Azure Stack HCI Validated'], description: 'Nodos validados por partners.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Soberanía / Conexión', hpe: 'Independencia de Nube', competitor: 'Conexión obligatoria', hpeAdvantage: 'PCBE funciona sin depender de una conexión constante a la nube pública para su licenciamiento.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Gestión', hpe: 'Portal Único GL', competitor: 'Azure Portal + Local', hpeAdvantage: 'Experiencia consistente de nube híbrida sin la fragmentación de herramientas de Microsoft.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Performance', hpe: 'Alletra Performance', competitor: 'S2D Dependiente', hpeAdvantage: 'Rendimiento de almacenamiento empresarial consistente sin la variabilidad de Storage Spaces Direct.', hpeIsBetter: true }
                ]
            },
            {
                id: 'vxrail-pcbe',
                name: 'Dell',
                solution: 'VxRail',
                topology: {
                    summary: 'Appliance HCI altamente integrado con el ecosistema VMware.',
                    layers: [
                        { name: 'Gestión', components: ['VxRail Manager', 'vCenter'], description: 'Integración profunda de HW y SW.' },
                        { name: 'spacer', components: [], description: '' },
                        { name: 'Software', components: ['vSphere', 'vSAN'], description: 'Stack estándar de VMware.' },
                        { name: 'Hardware', components: ['Dell PowerEdge Custom'], description: 'Hardware propietario optimizado.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Integración', hpe: 'Experiencia Cloud-Native', competitor: 'Hardware-Centric', hpeAdvantage: 'PCBE es una nube que viene a ti; VxRail es hardware que requiere gestión de software tradicional.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'OpEx Real', hpe: 'Consumo medido', competitor: 'Lease / Financiación', hpeAdvantage: 'Verdadero modelo de consumo vs. simple financiamiento de hardware de Dell.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Actualizaciones', hpe: 'Zero-Touch Lifecycle', competitor: 'Manual / Orchestrated', hpeAdvantage: 'Ciclo de vida gestionado por HPE para que el cliente se enfoque en sus aplicaciones.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'pcbe_enterprise': {
        id: 'pcbe_enterprise',
        name: 'PCBE Enterprise Edition',
        description: 'Nube privada de alto rendimiento para cargas de trabajo críticas a escala.',
        topology: {
            summary: 'Arquitectura Enterprise con escalabilidad masiva.',
            layers: [
                { name: 'Gestión', components: ['HPE GL Private Cloud Enterprise'], description: 'Control total de nube híbrida.' },
                { name: 'Orquestación', components: ['HPE GreenLake Orchestrator'], description: 'Entrega de servicios as-a-service.' },
                { name: 'Software', components: ['VME / K8s / Morpheus'], description: 'Stack de software enterprise.' },
                { name: 'Tecnología', components: ['HPE Alletra 9000 / Synergy'], description: 'Infraestructura composable y de misión crítica.' }
            ]
        },
        competitors: [
            {
                id: 'vcf-ent-pcbe',
                name: 'VMware',
                solution: 'VCF Enterprise',
                topology: {
                    summary: 'Stack completo de SDDC Enterprise.',
                    layers: [
                        { name: 'Gestión', components: ['vCenter / SDDC Manager'], description: 'Gestión central del SDDC.' },
                        { name: 'Orquestación', components: ['Aria Automation'], description: 'Automatización de la suite VCF.' },
                        { name: 'Software', components: ['vSphere / vSAN / NSX / Aria'], description: 'Stack completo de VMware.' },
                        { name: 'Hardware', components: ['VxRail / Certificado'], description: 'Hardware certificado para enterprise.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Gestión SDDC', hpe: 'SaaS Managed (GreenLake)', competitor: 'Local (vCenter/SDDC Manager)', hpeAdvantage: 'HPE centraliza la gestión en la nube, eliminando la carga operativa de mantener múltiples appliances locales.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Disponibilidad', hpe: '100% Data Availability (Alletra 9K)', competitor: '99.9999% (vSAN)', hpeAdvantage: 'Garantía absoluta de disponibilidad de datos para tus apps más críticas.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Modelo de Pago', hpe: 'Pay-per-use real', competitor: 'Suscripción fija', hpeAdvantage: 'Alinea tus costos con el consumo real del negocio, sin bundles forzados.', hpeIsBetter: true }
                ]
            },
            {
                id: 'nutanix-ent-pcbe',
                name: 'Nutanix',
                solution: 'Cloud Platform (NCP)',
                topology: {
                    summary: 'Arquitectura Enterprise con gestión unificada multicloud.',
                    layers: [
                        { name: 'Gestión', components: ['Prism Central / Elite'], description: 'Plano de control de gestión multicloud.' },
                        { name: 'Orquestación', components: ['Nutanix Cloud Manager (NCM)'], description: 'Automatización y gobierno de nubes.' },
                        { name: 'Software', components: ['AHV / AOS / Flow / Files'], description: 'Stack unificado de servicios integrados.' },
                        { name: 'Hardware', components: ['HPE DX / Nutanix NX / Dell'], description: 'Nodos de cómputo y almacenamiento enterprise.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Recursos de Cómputo', hpe: 'Arquitectura Desacoplada', competitor: 'Consumo por CVM (HCI)', hpeAdvantage: 'HPE no desperdicia recursos en Controller VMs; el 100% de la CPU/RAM es para tus aplicaciones.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Escalabilidad', hpe: 'Composable (Synergy)', competitor: 'Escalado por Nodos (HCI)', hpeAdvantage: 'HPE permite modular cómputo y almacenamiento de forma masiva e independiente.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Gestión Cross-Stack', hpe: 'Unificada (GL Cloud)', competitor: 'Consola Proprietaria', hpeAdvantage: 'HPE GL gestiona compute, storage y networking desde una sola consola federada.', hpeIsBetter: true }
                ]
            },
            {
                id: 'azure-ent-pcbe',
                name: 'Microsoft',
                solution: 'Azure Stack HCI / Azure Local',
                topology: {
                    summary: 'Extensión de Azure para workloads locales de misión crítica.',
                    layers: [
                        { name: 'Gestión', components: ['Azure Arc / Portal / Monitor'], description: 'Control desde la nube de Azure.' },
                        { name: 'Orquestación', components: ['Azure Resource Manager (ARM)'], description: 'Automatización mediante Bicep y ARM.' },
                        { name: 'Software', components: ['OS Especializado / S2D / K8s'], description: 'Stack nativo optimizado para Azure.' },
                        { name: 'Hardware', components: ['Azure Stack HCI Premium Nodes'], description: 'Hardware validado de alta gama.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Dependencia de Nube', hpe: 'Operación Desconectada', competitor: 'Conexión Azure Obligatoria', hpeAdvantage: 'PCBE funciona sin depender de la nube pública; Azure Local requiere conexión mensual para licenciamiento.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Rendimiento Storage', hpe: 'Alletra 9000 (NVMe/AI)', competitor: 'S2D (Storage Spaces Direct)', hpeAdvantage: 'Rendimiento enterprise garantizado vs variabilidad de almacenamiento definido por software.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Gasto Recurrente', hpe: 'Consumo Medido Local', competitor: 'Suscripción Azure + Licencias', hpeAdvantage: 'Sin costos por core/mes de Azure que pueden fluctuar o ser obligatorios.', hpeIsBetter: true }
                ]
            },
            {
                id: 'apex-ent-pcbe',
                name: 'Dell',
                solution: 'APEX Cloud Platform',
                topology: {
                    summary: 'Plataforma as-a-service integrada con partners de software.',
                    layers: [
                        { name: 'Gestión', components: ['APEX Console / Cloud Management'], description: 'SaaS de gestión de suscripciones Dell.' },
                        { name: 'Orquestación', components: ['Dell APEX Orchestrator'], description: 'Automatización del ciclo de vida del hardware.' },
                        { name: 'Software', components: ['OpenShift / VMware (Software Defined)'], description: 'Stack de software de terceros gestionado.' },
                        { name: 'Hardware', components: ['Dell PowerEdge / APEX Nodes'], description: 'Infraestructura propietaria de Dell.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Madurez SaaS', hpe: 'HPE GreenLake (Pionero)', competitor: 'Dell APEX (Siloed)', hpeAdvantage: 'GreenLake ofrece una experiencia de nube madura con +10 años de desarrollo vs APEX.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Flexibilidad Financiera', hpe: 'Paga por Uso Real', competitor: 'Leasing / Suscripción Fija', hpeAdvantage: 'Verdadero modelo de utilidad que puede escalar hacia abajo en facturación.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Integración IA', hpe: 'HPE InfoSight (IA Nativa)', competitor: 'Monitoreo Tradicional', hpeAdvantage: 'IA predictiva que resuelve proactivamente problemas antes de que afecten la producción.', hpeIsBetter: true }
                ]
            },
            {
                id: 'ibm-sat-pcbe',
                name: 'IBM',
                solution: 'Cloud Satellite / Cloud Pak (Private Cloud)',
                topology: {
                    summary: 'Nube distribuida basada en OpenShift y contenedores.',
                    layers: [
                        { name: 'Gestión', components: ['IBM Cloud Console (SaaS)'], description: 'Mismo plano de control que IBM Cloud.' },
                        { name: 'Orquestación', components: ['Satellite Configuration'], description: 'Despliegue unificado de apps.' },
                        { name: 'Software', components: ['Red Hat OpenShift / IBM Cloud Paks'], description: 'Enfoque masivo en contenedores y modernización.' },
                        { name: 'Hardware', components: ['Infraestructura Agnóstica'], description: 'Cualquier hardware validado (vía Satellite).' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Foco en Cargas', hpe: 'Híbrida (VMs + Containers)', competitor: 'Contenedores (Container-First)', hpeAdvantage: 'HPE ofrece un balance perfecto para modernizar sin forzar todo a contenedores de inmediato.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Complejidad de Licencia', hpe: 'Licenciamiento Simplificado', competitor: 'IBM VPC / OpenShift / Pak Units', hpeAdvantage: 'Elimina la complejidad de calcular Cloud Pak Units y suscripciones RHOS fragmentadas.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Rendimiento Crítico', hpe: 'HPE Synergy / Mission Critical', competitor: 'Software Defined Overlay', hpeAdvantage: 'Hardware diseñado específicamente para el máximo rendimiento de bases de datos y apps legacy.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'storeonce': {
        id: 'storeonce',
        name: 'HPE StoreOnce',
        description: 'Protección de datos eficiente y backup de alto rendimiento.',
        topology: {
            summary: 'arquitectura de protección de datos con deduplicación federada.',
            layers: [
                { name: 'Gestión', components: ['StoreOnce GUI', 'HPE InfoSight'], description: 'Consola web intuitiva y analítica de datos.' },
                { name: 'Interface', components: ['Catalyst', 'VTL / NAS', 'Cloud Bank'], description: 'Protocolos de backup optimizados y nube.' },
                { name: 'Software', components: ['Deduplication', 'Replication'], description: 'Tecnología de reducción de datos eficiente.' },
                { name: 'Hardware', components: ['StoreOnce Systems', 'Disk Shelves'], description: 'Sistemas de protección escalables y resilientes.' }
            ]
        },
        competitors: [
            {
                id: 'dell-powerprotect-dd',
                name: 'Dell',
                solution: 'PowerProtect Data Domain',
                topology: {
                    summary: 'Protección de datos tradicional basada en Data Domain.',
                    layers: [
                        { name: 'Gestión', components: ['PowerProtect Manager', 'DD Console'], description: 'Herramientas de gestión fragmentadas.' },
                        { name: 'Interface', components: ['DD Boost', 'VTL / CIFS / NFS'], description: 'Protocolos propietarios y tradicionales.' },
                        { name: 'Software', components: ['Deduplication Engine', 'Cloud Tier'], description: 'Capa de software de protección.' },
                        { name: 'Hardware', components: ['PowerProtect DD Systems'], description: 'Hardware de propósito específico.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Deduplicación', hpe: 'Federada (Todo el Path)', competitor: 'Post-proceso / Destino', hpeAdvantage: 'HPE Catalyst reduce el tráfico de red hasta un 95% al deduplicar en el origen.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Flexibilidad de Nube', hpe: 'Cloud Bank Storage (Cualquier Nube)', competitor: 'Dell Cloud Tier (Inflexibilidad)', hpeAdvantage: 'HPE permite usar almacenamiento de nube pública de bajo costo sin gateways complejos.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Eficiencia', hpe: 'Alta densidad / Bajo TCO', competitor: 'Licenciamiento por feature', hpeAdvantage: 'Licenciamiento simple de HPE frente a los múltiples costos de software de Dell.', hpeIsBetter: true }
                ]
            },
            {
                id: 'exagrid-ex',
                name: 'ExaGrid',
                solution: 'EX Series',
                topology: {
                    summary: 'Arquitectura de almacenamiento de backup de niveles.',
                    layers: [
                        { name: 'Gestión', components: ['ExaGrid Manager'], description: 'Consola de gestión de escalado horizontal.' },
                        { name: 'Interface', components: ['Landing Zone (Disk-cache)', 'Repository'], description: 'Arquitectura de doble nivel para backups rápidos.' },
                        { name: 'Software', components: ['Adaptive Deduplication'], description: 'Deduplicación después del backup.' },
                        { name: 'Hardware', components: ['EX Appliances'], description: 'Hardware de escalado horizontal.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Velocidad Deduplicación', hpe: 'En línea / Federada', competitor: 'Post-procesamiento', hpeAdvantage: 'HPE deduplica en tiempo real, optimizando el uso de disco desde el primer momento.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Consolidación', hpe: 'Enterprise Wide', competitor: 'Silos de Backup', hpeAdvantage: 'StoreOnce consolida ROBO y Data Center bajo una sola arquitectura federada.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Escalabilidad', hpe: 'Escalado hacia arriba y nube', competitor: 'Scale-out forzado', hpeAdvantage: 'Crece según tus necesidades sin obligarte a comprar nodos completos innecesarios.', hpeIsBetter: true }
                ]
            },
            {
                id: 'quantum-dxi',
                name: 'Quantum',
                solution: 'DXi Series',
                topology: {
                    summary: 'Protección de datos con deduplicación variable.',
                    layers: [
                        { name: 'Gestión', components: ['DXi Management Console'], description: 'Gestión de sistemas de protección.' },
                        { name: 'Interface', components: ['DXi Accent', 'VTL / OST'], description: 'Interfaces de backup de alto rendimiento.' },
                        { name: 'Software', components: ['Variable-length Dedupe'], description: 'Software de optimización de datos.' },
                        { name: 'Hardware', components: ['DXi HW Appliances'], description: 'Plataformas de hardware dedicado.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Ecosistema', hpe: 'Integración GreenLake', competitor: 'Punto de solución único', hpeAdvantage: 'StoreOnce es parte de una plataforma de datos completa, no un dispositivo aislado.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Soporte Global', hpe: 'Presencia Global HPE', competitor: 'Limitada', hpeAdvantage: 'La red de soporte de HPE garantiza continuidad de negocio en cualquier parte del mundo.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Valor Residual', hpe: 'HPE Financial Services', competitor: 'Tradicional', hpeAdvantage: 'Mejores opciones de renovación y financiación de activos tecnológicas.', hpeIsBetter: true }
                ]
            },
            {
                id: 'veritas-nbu-app',
                name: 'Veritas',
                solution: 'NetBackup Appliances',
                topology: {
                    summary: 'Integración profunda de software y hardware de backup.',
                    layers: [
                        { name: 'Gestión', components: ['NetBackup Web UI'], description: 'Gestión central del stack de protección.' },
                        { name: 'Interface', components: ['OST (OpenStorage)', 'SAN / LAN'], description: 'Conectividad optimizada con el software NBU.' },
                        { name: 'Software', components: ['Deduplication Engine (MSDP)'], description: 'Software de protección integrado.' },
                        { name: 'Hardware', components: ['NBU Appliances (5000/6000)'], description: 'Hardware optimizado para NetBackup.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Independencia SW', hpe: 'Multi-software (Veeam/Commvault)', competitor: 'Veritas Centric', hpeAdvantage: 'StoreOnce es agnóstico y rinde al máximo con cualquier software de backup líder.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Simplicidad HW', hpe: 'Hardware Optimizado', competitor: 'Servidor x86 con Capa SW', hpeAdvantage: 'Diseño de propósito específico para protección vs simple servidor con software instalado.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'TCO Software', hpe: 'Sin Lock-in', competitor: 'Dependencia Veritas', hpeAdvantage: 'Libertad de cambiar de software de backup sin tener que reemplazar el hardware de protección.', hpeIsBetter: true }
                ]
            },
            {
                id: 'cohesity-dp-app',
                name: 'Cohesity',
                solution: 'DataProtect Appliances',
                topology: {
                    summary: 'Plataforma de datos convergente y moderna.',
                    layers: [
                        { name: 'Gestión', components: ['Helios Console (SaaS)'], description: 'Gestión de datos unificada en la nube.' },
                        { name: 'Interface', components: ['SpanFS', 'S3 / NFS / SMB'], description: 'Sistema de archivos distribuido.' },
                        { name: 'Software', components: ['Global Deduplication'], description: 'Deduplicación a través de todos los nodos.' },
                        { name: 'Hardware', components: ['C8000 / C4000 Series'], description: 'Arquitectura de nodos distribuidos.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Eficiencia', hpe: 'StoreOnce Catalyst (Eficiente)', competitor: 'Dedupe Variable (Pesada)', hpeAdvantage: 'Mejor rendimiento de backup con menor impacto en los servidores de producción.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Foco en Backup', hpe: 'Especialista en Protección', competitor: 'Generalista de Datos', hpeAdvantage: 'HPE ofrece la mejor inmutabilidad y resiliencia dedicada contra Ransomware.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Madurez', hpe: 'Tecnología Probada', competitor: 'Solución Emergente', hpeAdvantage: 'Décadas de confiabilidad enterprise frente a plataformas más nuevas y costosas.', hpeIsBetter: true }
                ]
            }
        ]
    }
};
