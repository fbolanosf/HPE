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
        name: 'HPE Morpheus',
        description: 'Plataforma de gestión de nube híbrida agnóstica y orquestación.',
        topology: {
            summary: 'Plataforma unificada de orquestación agnóstica.',
            layers: [
                { name: 'Gestión', components: ['Morpheus UI', 'Role Based Access'], description: 'Panel único para todas las nubes y on-premise.' },
                { name: 'Orquestación', components: ['Automation Engine', 'Workflow Designer'], description: 'Motor de automatización y self-service.' },
                { name: 'Costo', components: ['FinOps Module', 'Guidance'], description: 'Análisis y optimización de costos en tiempo real.' },
                { name: 'Infraestructura', components: ['AWS', 'Azure', 'VMware', 'Nutanix', 'Kubernetes'], description: 'Gestiona +80 tipos de nubes e infraestructura.' }
            ]
        },
        competitors: [
            {
                id: 'vmware-aria',
                name: 'VMware',
                solution: 'Aria (vRealize)',
                topology: {
                    summary: 'Suite de múltiples productos integrados.',
                    layers: [
                        { name: 'Gestión', components: ['Aria Automation', 'Aria Operations'], description: 'Múltiples consolas y servidores de gestión.' },
                        { name: 'Orquestación', components: ['vRealize Orchestrator'], description: 'Motor de flujos de trabajo complejo.' },
                        { name: 'Lifecycle', components: ['Aria Suite Lifecycle'], description: 'Gestor del ciclo de vida de la propia suite.' },
                        { name: 'Infraestructura', components: ['Optimizado para VMware/AWS'], description: 'Soporte limitado fuera del ecosistema VMware.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Agnosticismo', hpe: '100% Agnóstico (Bare Metal, VM, K8s)', competitor: 'Optimizado para VMware/AWS', hpeAdvantage: 'Evita el vendor lock-in; Morpheus gestiona +80 nubes y on-premise por igual.', hpeIsBetter: true },
                    { category: 'Negocio', feature: 'Time-to-Value', hpe: 'Semanas (Appliance único)', competitor: 'Meses (Múltiples componentes)', hpeAdvantage: 'Implementación ~4x más rápida que vRealize Suite según casos de uso promedio.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Self-Service', hpe: 'Catálogo unificado Multi-Nube', competitor: 'Fragmentado por nube', hpeAdvantage: 'Experiencia consistente: Una sola interfaz para AWS, Azure, y On-Prem.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Costos de Nube', hpe: 'FinOps Integrado y Nativo', competitor: 'Módulo separado o limitado', hpeAdvantage: 'Ahorros inmediatos del 30% en cloud spend mediante recomendaciones nativas.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Arquitectura', hpe: 'Agentless (Sin agentes)', competitor: 'Requiere Agentes en algunos casos', hpeAdvantage: 'Menor sobrecarga operativa y 0 impacto en el rendimiento de las VMs.', hpeIsBetter: true },
                    { category: 'Precios', feature: 'Licenciamiento', hpe: 'Por Workload (Flexible)', competitor: 'Por CPU/Core (Costoso)', hpeAdvantage: 'Modelo agnóstico al hardware subyacente, ideal para entornos densos.', hpeIsBetter: true }
                ]
            },
            {
                id: 'terraform',
                name: 'HashiCorp',
                solution: 'Terraform Enterprise',
                topology: {
                    summary: 'Infraestructura como Código (IaC).',
                    layers: [
                        { name: 'Gestión', components: ['TFE / Cloud Console'], description: 'Gestión de estado y runs.' },
                        { name: 'Ejecución', components: ['Runners / Agents'], description: 'Ejecución de planes de terraform.' },
                        { name: 'Código', components: ['HCL Manifests', 'Modules'], description: 'Definición basada enteramente en código.' },
                        { name: 'Infraestructura', components: ['Providers API'], description: 'Interactúa con APIs de proveedores.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Usuario Objetivo', hpe: 'DevOps + I&O (Democratizado)', competitor: 'DevOps expertos (Alto nivel)', hpeAdvantage: 'Habilita "Self-Service IT" real incluso para usuarios no técnicos.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Gestión de Estado', hpe: 'Múltiples backends + GUI', competitor: 'State file management complejo', hpeAdvantage: 'Elimina el "State File Hell" con una capa de abstracción visual robusta.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Costo Total', hpe: 'Plataforma CMP completa', competitor: 'Solo IAC (Requiere más herramientas)', hpeAdvantage: 'Consolida gobernanza, costos y automatización en una sola licencia.', hpeIsBetter: true }
                ]
            },
            {
                id: 'flexera',
                name: 'Flexera',
                solution: 'Cloud Management',
                topology: {
                    summary: 'Gestión de activos y costos cloud.',
                    layers: [
                        { name: 'Gestión', components: ['Flexera One UI'], description: 'Visibilidad de activos.' },
                        { name: 'Datos', components: ['Discovery Agents'], description: 'Inventario de software y hardware.' },
                        { name: 'Costo', components: ['Cost Optimization'], description: 'Foco principal de la herramienta.' },
                        { name: 'Infraestructura', components: ['Multi-Cloud'], description: 'Conexión a APIs de facturación.' }
                    ]
                },
                comparisons: [
                    { category: 'Funcional', feature: 'Enfoque', hpe: 'Orquestación + FinOps', competitor: 'Principalmente FinOps/Asset Mgmt', hpeAdvantage: 'No solo ve los costos, actúa sobre ellos automáticamente (Auto-shutdown, Rightsizing).', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Integraciones', hpe: '+100 Plugins Nativos', competitor: 'Enfoque en descubrimiento', hpeAdvantage: 'Plugin architecture extensible sin costo adicional por integración.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'vm-essentials': {
        id: 'vm-essentials',
        name: 'HPE VM Essentials',
        description: 'Virtualización empresarial moderna, desacoplada y rentable.',
        topology: {
            summary: 'Virtualización Enterprise basada en KVM con gestión simplificada.',
            layers: [
                { name: 'Gestión', components: ['VM Essentials UI', 'VME Manager'], description: 'Interfaz moderna y ligera para gestión de clusters KVM.' },
                { name: 'Virtualización', components: ['KVM Enterprise', 'Libvirt'], description: 'Kernel-based Virtual Machine optimizado y soportado por HPE.' },
                { name: 'Almacenamiento', components: ['NFS', 'iSCSI', 'FC', 'Local'], description: 'Agnóstico al almacenamiento; usa lo que ya tienes.' },
                { name: 'Hardware', components: ['HPE ProLiant', 'Server Hardware'], description: 'Optimizado para hardware HPE pero compatible con x86.' }
            ]
        },
        competitors: [
            {
                id: 'vmware-vsphere',
                name: 'Broadcom/VMware',
                solution: 'vSphere + vCenter',
                topology: {
                    summary: 'Estándar de industria tradicional, alta dependencia de vCenter.',
                    layers: [
                        { name: 'Gestión', components: ['vCenter Server'], description: 'Punto único de fallo y gestión pesada.' },
                        { name: 'Virtualización', components: ['ESXi'], description: 'Hypervisor propietario tipo 1.' },
                        { name: 'Almacenamiento', components: ['VMFS / vVols'], description: 'Sistema de archivos clusterizado complejo.' },
                        { name: 'Hardware', components: ['HCL Stricto'], description: 'Hardware legacy con HCL restrictiva.' }
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
                solution: 'Hyper-V + System Center / Azure Stack HCI',
                topology: {
                    summary: 'Ecosistema fragmentado entre Windows Server y Azure.',
                    layers: [
                        { name: 'Gestión', components: ['System Center (SCVMM)', 'Windows Admin Center', 'Azure Portal'], description: 'Múltiples consolas desconectadas.' },
                        { name: 'Virtualización', components: ['Hyper-V'], description: 'Hypervisor integrado en el OS.' },
                        { name: 'Almacenamiento', components: ['S2D (Storage Spaces Direct)'], description: 'Complejidad en configuración y mantenimiento.' },
                        { name: 'Hardware', components: ['Certified Nodes'], description: 'Dependencia de validación de hardware estricta para HCI.' }
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
                solution: 'AHV / NX-OS',
                topology: {
                    summary: 'HCI Appliance con hypervisor KVM modificado.',
                    layers: [
                        { name: 'Gestión', components: ['Prism Central', 'Prism Element'], description: 'Buena UI pero ecosistema cerrado.' },
                        { name: 'Virtualización', components: ['AHV'], description: 'KVM modificado propietario.' },
                        { name: 'Almacenamiento', components: ['NDFS (CVM)'], description: 'Controller VM consume muchos recursos (RAM/CPU).' },
                        { name: 'Hardware', components: ['Nutanix / OEM'], description: 'Lock-in de plataforma.' }
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
                id: 'cisco-ucs',
                name: 'Cisco',
                solution: 'UCS + Hyper-V / VMware',
                topology: {
                    summary: 'Infraestructura convergente centrada en la red.',
                    layers: [
                        { name: 'Gestión', components: ['Intersight', 'UCS Manager'], description: 'Gestión de hardware separada del hypervisor.' },
                        { name: 'Virtualización', components: ['VMware / Hyper-V'], description: 'Depende de terceros para la capa de virtualización.' },
                        { name: 'Red', components: ['Fabric Interconnects'], description: 'Hardware de red obligatorio y costoso.' },
                        { name: 'Hardware', components: ['UCS Blades/Rack'], description: 'Chasis propietario costoso.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Simplicidad de Stack', hpe: 'Full Stack HPE (HW + SW)', competitor: 'Multi-Vendor (Cisco HW + VMware/MS SW)', hpeAdvantage: 'Un solo punto de contacto para soporte completo del stack, sin "finger-pointing" entre vendors.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Hypervisor Incluido', hpe: 'KVM Incluido', competitor: 'Requiere licencia VMware o Hyper-V aparte', hpeAdvantage: 'VME incluye el hypervisor; con Cisco UCS aún hay que comprar la licencia de virtualización.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Costo de Entrada', hpe: 'Bajo (Server Estándar)', competitor: 'Alto (FI + Chasis UCS)', hpeAdvantage: 'VME no requiere Fabric Interconnects ni chasis blade costosos para iniciar.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Complejidad de Red', hpe: 'Networking Estándar', competitor: 'Fabric Interconnects Obligatorios', hpeAdvantage: 'Se integra en tu infraestructura de red existente sin requerir hardware especializado.', hpeIsBetter: true },
                    { category: 'Precios', feature: 'TCO Global', hpe: 'Menor (Sin HW de Red Adicional)', competitor: 'Mayor (FI + Licencias SW)', hpeAdvantage: 'Elimina el costo de Fabric Interconnects (~$20K+) y licencias de hypervisor de terceros.', hpeIsBetter: true }
                ]
            },
            {
                id: 'scale-computing',
                name: 'Scale Computing',
                solution: 'HC3',
                topology: {
                    summary: 'HCI para SMB/Edge con KVM modificado.',
                    layers: [
                        { name: 'Gestión', components: ['HyperCore UI'], description: 'Gestión simple pero básica.' },
                        { name: 'Virtualización', components: ['KVM Custom'], description: 'KVM muy modificado, "Caja Negra".' },
                        { name: 'Almacenamiento', components: ['SCRIBE'], description: 'Block storage propietario directo al disco.' },
                        { name: 'Hardware', components: ['Hardware Limitado'], description: 'Opciones de hardware muy restringidas.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Escalabilidad', hpe: 'Enterprise (Edge → DC)', competitor: 'Solo SMB / Edge', hpeAdvantage: 'VME escala desde el borde hasta el datacenter corporativo; Scale Computing es nicho SMB solamente.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Certificaciones ISV', hpe: 'SAP, Oracle, Microsoft', competitor: 'Limitadas', hpeAdvantage: 'VME está validado para cargas empresariales críticas certificadas por los ISVs principales.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Protección de Inversión', hpe: 'Hardware HPE Reutilizable', competitor: 'Hardware Dedicado HC3', hpeAdvantage: 'ProLiant puede reutilizarse para otros workloads; el hardware HC3 es de propósito único.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Estándares Abiertos', hpe: 'KVM/Libvirt Estándar', competitor: 'KVM Propietario ("Caja Negra")', hpeAdvantage: 'VME usa estándares abiertos (Libvirt/KVM) facilitando la portabilidad y las integraciones.', hpeIsBetter: true },
                    { category: 'Precios', feature: 'Soporte Global', hpe: 'HPE 24x7 Global', competitor: 'Regional/Limitado', hpeAdvantage: 'Soporte empresarial global de HPE con SLAs y cobertura en +160 países vs soporte regional.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'simplivity': {
        id: 'simplivity',
        name: 'HPE SimpliVity',
        description: 'HCI Inteligente con garantía de eficiencia de datos extrema.',
        topology: {
            summary: 'Arquitectura "Todo en Uno" optimizada para el borde y VDI.',
            layers: [
                { name: 'Gestión', components: ['vCenter Server', 'HPE InfoSight (AI)'], description: 'Plugin nativo en vCenter. Gestión global centralizada.' },
                { name: 'Virtualización', components: ['VMware vSphere (ESXi)'], description: 'Hypervisor estándar de la industria.' },
                { name: 'Data Virtualization Platform', components: ['OmniStack Accelerator Card (FPGA)', 'Data Virtualization Software'], description: 'Deduplicación/Compresión inline garantizada sin impacto en CPU.', color: '#01A982' },
                { name: 'Hardware', components: ['HPE ProLiant DL380 Gen10/11'], description: 'Servidor x86 líder mundial, altamente resiliente.' }
            ]
        },
        competitors: [
            {
                id: 'dell-vxrail',
                name: 'Dell',
                solution: 'VxRail',
                topology: {
                    summary: 'HCI basada en vSAN con integración profunda en el hardware Dell.',
                    layers: [
                        { name: 'Gestión', components: ['vCenter Server', 'VxRail Manager'], description: 'Requiere VxRail Manager para ciclo de vida del HW.' },
                        { name: 'Virtualización', components: ['VMware vSphere (ESXi)'], description: 'Mismo hypervisor.' },
                        { name: 'Software Defined Storage', components: ['VMware vSAN (OSA/ESA)'], description: 'Utiliza CPU del host para I/O y reducción de datos.' },
                        { name: 'Hardware', components: ['Dell PowerEdge'], description: 'Servidor x86 estándar.' }
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
                id: 'nutanix-aos',
                name: 'Nutanix',
                solution: 'Cloud Platform (AOS)',
                topology: {
                    summary: 'Arquitectura distribuida basada en CVM (Controller VM).',
                    layers: [
                        { name: 'Gestión', components: ['Prism Central', 'Prism Element'], description: 'Consola propia HTML5.' },
                        { name: 'Virtualización', components: ['AHV (KVM based)'], description: 'Hypervisor gratuito incluido.' },
                        { name: 'Storage Controller', components: ['CVM (Controller VM)'], description: 'Consume recursos (vCPU/RAM) de cada nodo para gestión de datos.' },
                        { name: 'Hardware', components: ['Commodity Hardware'], description: 'Nutanix NX o Hardware de terceros (HPE DX, Dell XC).' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Arquitectura de Datos', hpe: 'Hardware Acelerado', competitor: 'Software Defined puro', hpeAdvantage: 'La tarjeta aceleradora libera a la CPU de tareas de I/O intensivas.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Licenciamiento', hpe: 'Incluido/Perpetuo', competitor: 'Suscripción (Core-based)', hpeAdvantage: 'Modelo de costos predecible sin renovación forzosa de suscripción de software.', hpeIsBetter: true }
                ]
            },
            {
                id: 'cisco-hyperflex',
                name: 'Cisco',
                solution: 'HyperFlex',
                topology: {
                    summary: 'HCI con dependencia fuerte de la red y gestión cloud.',
                    layers: [
                        { name: 'Gestión', components: ['Cisco Intersight (Cloud)', 'HyperFlex Connect'], description: 'Gestión SaaS obligatoria para funcionalidad completa.' },
                        { name: 'Virtualización', components: ['VMware vSphere', 'HX Data Platform'], description: 'Software propietario de sistema de archivos (Springpath).' },
                        { name: 'Networking', components: ['Fabric Interconnects (FI)'], description: 'Hardware de red obligatorio y costoso para el cluster.' },
                        { name: 'Hardware', components: ['Cisco UCS Servers'], description: 'Servidores blade/rack UCS.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Futuro del Producto', hpe: 'Roadmap Claro (HPE)', competitor: 'Incierto (Alianza Nutanix)', hpeAdvantage: 'La alianza Cisco-Nutanix pone en duda la longevidad de HyperFlex.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'File System', hpe: 'Dedupe Global In-line', competitor: 'Log-structured (Logfs)', hpeAdvantage: 'SimpliVity nació para la eficiencia de datos; HyperFlex adaptó tecnología (Springpath).', hpeIsBetter: true }
                ]
            },
            {
                id: 'azure-stack-hci',
                name: 'Microsoft',
                solution: 'Azure Stack HCI',
                topology: {
                    summary: 'Extensión híbrida de Azure on-premise.',
                    layers: [
                        { name: 'Gestión', components: ['Azure Arc', 'Windows Admin Center'], description: 'Dos portales; requiere conexión a Azure periódica.' },
                        { name: 'OS / Hypervisor', components: ['Azure Stack HCI OS (Hyper-V)'], description: 'Sistema operativo especializado, no es Windows Server estándar.' },
                        { name: 'Storage', components: ['Storage Spaces Direct (S2D)'], description: 'Almacenamiento definido por software integrado en el OS.' },
                        { name: 'Hardware', components: ['Validated Nodes'], description: 'Hardware certificado por Microsoft.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Enfoque', hpe: 'HCI Appliance', competitor: 'Extensión de Azure', hpeAdvantage: 'SimpliVity funciona 100% desconectado; A-Stack HCI requiere conexión periódica a Azure.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Modelo de Costo', hpe: 'Capex Predecible', competitor: 'Suscripción Mensual', hpeAdvantage: 'Sin costos recurrentes obligatorios por core/mes solo para encender la infraestructura.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Gestión', hpe: 'vCenter Plugin', competitor: 'Admin Center + Azure', hpeAdvantage: 'Gestión nativa donde los admins de virtualización ya viven (vCenter).', hpeIsBetter: true }
                ]
            },
            {
                id: 'dell-powerflex',
                name: 'Dell',
                solution: 'PowerFlex (VxFlex)',
                topology: {
                    summary: 'Almacenamiento definido por software (SDS) a escala.',
                    layers: [
                        { name: 'Gestión', components: ['PowerFlex Manager'], description: 'Gestión de infraestructura y orquestación.' },
                        { name: 'Consumo', components: ['SDC (Storage Data Client)'], description: 'Driver instalado en cada host consumidor (Compute).' },
                        { name: 'Almacenamiento', components: ['SDS (Storage Data Server)'], description: 'Agrega discos locales en un pool global.' },
                        { name: 'Hardware', components: ['PowerFlex Nodes'], description: 'Nodos dedicados o HCI.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Simplicidad', hpe: 'Instalación en horas', competitor: 'Arquitectura Compleja', hpeAdvantage: 'SimpliVity es verdadero "HCI Simple"; PowerFlex es almacenamiento definido por software complejo.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Footprint', hpe: '2 Nodos mínimo (HA)', competitor: '4+ Nodos recomendados', hpeAdvantage: 'Menor espacio, energía y enfriamiento para oficinas remotas o borde (ROBO).', hpeIsBetter: true }
                ]
            },
            {
                id: 'vmware-vsan',
                name: 'VMware',
                solution: 'vSAN (DIY/ESA)',
                topology: {
                    summary: 'HCI "Do It Yourself" o ReadyNodes.',
                    layers: [
                        { name: 'Gestión', components: ['vCenter Server'], description: 'Gestión estándar de VMware.' },
                        { name: 'Software', components: ['vSphere + vSAN'], description: 'Licenciamiento por Core (Suscripción).' },
                        { name: 'I/O Path', components: ['vSAN ESA / OSA'], description: 'ESA requiere hardware NVMe específico y certificado.' },
                        { name: 'Hardware', components: ['ReadyNodes (Cualquier Vendor)'], description: 'Gran variabilidad de hardware y firmware a gestionar.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Responsabilidad', hpe: 'Un solo proveedor', competitor: 'Múltiples (HW + SW)', hpeAdvantage: 'Soporte unificado HPE (L1/L2/L3) para hardware y software.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Eficiencia de Datos', hpe: 'Hardware Offload', competitor: 'Software (Consumer CPU)', hpeAdvantage: 'SimpliVity no "roba" CPU de las aplicaciones para hacer deduplicación/compresión.', hpeIsBetter: true }
                ]
            }
        ]
    },
    'zerto': {
        id: 'zerto',
        name: 'HPE Zerto',
        description: 'Protección de datos continua y movilidad de cargas de trabajo.',
        topology: {
            summary: 'Protección Continua de Datos (CDP) basada en hypervisor.',
            layers: [
                { name: 'Gestión', components: ['Zerto Virtual Manager (ZVM)'], description: 'Se integra en vCenter; interfaz HTML5 simple.' },
                { name: 'Data Mover', components: ['VRA (Virtual Replication Appliance)'], description: 'Appliance ligero por host que intercepta escrituras en RAM.' },
                { name: 'Journal', components: ['Recovery Journal'], description: 'Log de cambios que permite ir a cualquier punto en el tiempo (segundos).' },
                { name: 'Recuperación', components: ['Orquestación Automática'], description: 'Failover/Failback automatizado con pre-scripts y re-IP.' }
            ]
        },
        competitors: [
            {
                id: 'veeam',
                name: 'Veeam',
                solution: 'Backup & Replication',
                topology: {
                    summary: 'Arquitectura tradicional de Backup basada en Snapshots.',
                    layers: [
                        { name: 'Gestión', components: ['Backup Server'], description: 'Servidor central (Windows) que coordina los trabajos.' },
                        { name: 'Procesamiento', components: ['Backup Proxy'], description: 'Servidores que leen datos y comprimen (carga CPU).' },
                        { name: 'Almacenamiento', components: ['Backup Repository'], description: 'Almacenamiento de disco para guardar los archivos de backup.' },
                        { name: 'Captura', components: ['VMware Snapshot'], description: 'Depende de snapshots que impactan el rendimiento (Stun).' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Continuidad', hpe: 'Zero Data Loss (Casi)', competitor: 'Pérdida de minutos/horas', hpeAdvantage: 'IDC confirma RPOs de 5 a 15 segundos mediante Journaling continuo.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Granularidad', hpe: 'Journal (Segundos)', competitor: 'Snapshot (Minutos)', hpeAdvantage: 'Recuperación granular ante Ransomware: "Rebobina" segundos antes del ataque.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Almacenamiento', hpe: 'Eficiente (Journaling)', competitor: 'Alto consumo (Snapshots)', hpeAdvantage: 'Ahorro drástico en almacenamiento de DR al no usar snapshots pesados.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Método', hpe: 'Replicación Continua (CDP)', competitor: 'Snapshot-based', hpeAdvantage: 'Sin impacto en producción ("VM Stun") durante la replicación.', hpeIsBetter: true },
                    { category: 'Precios', feature: 'Modelo', hpe: 'Simple por VM protegida', competitor: 'Complejo (VUL)', hpeAdvantage: 'Escalabilidad lineal de costos sin calculadoras de licencias complejas.', hpeIsBetter: true }
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
    'greenlake': {
        id: 'greenlake',
        name: 'HPE GreenLake',
        description: 'El modelo de nube que viene a ti: experiencia de nube en tus apps y datos.',
        topology: {
            summary: 'Experiencia de Nube Híbrida gestionada.',
            layers: [
                { name: 'Gestión', components: ['GreenLake Central'], description: 'Consola unificada para ver costos, uso y salud de toda la IT.' },
                { name: 'Orquestación', components: ['Private Cloud Enterprise'], description: 'Vendedores de servicios gestionados (MSP) o self-service.' },
                { name: 'Medición', components: ['Consumption Metering'], description: 'Medición granular de uso para facturación "Pay-per-use".' },
                { name: 'Infraestructura', components: ['HPE Alletra', 'HPE ProLiant', 'Aruba'], description: 'Infraestructura propiedad de HPE gestionada por HPE.' }
            ]
        },
        competitors: [
            {
                id: 'dell-apex',
                name: 'Dell',
                solution: 'APEX',
                topology: {
                    summary: 'Oferta As-a-Service en evolución.',
                    layers: [
                        { name: 'Gestión', components: ['APEX Console'], description: 'Consola web para ordenar y monitorear servicios.' },
                        { name: 'Servicios', components: ['Storage Service', 'Compute Service'], description: 'Silos separados de servicios.' },
                        { name: 'Operación', components: ['Customer Managed'], description: 'Frecuentemente el cliente sigue operando el HW.' },
                        { name: 'Hardware', components: ['Dell Infrastructure'], description: 'Hardware Dell estándar en sitio.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Madurez del Modelo', hpe: '+10 Años (Líder)', competitor: 'Reciente (Seguidor)', hpeAdvantage: 'Forrester TEI reporta 30-40% de ahorro de TCO histórico con GreenLake.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Portal Unificado', hpe: 'GreenLake Central (Completo)', competitor: 'Consola APEX (En evolución)', hpeAdvantage: 'Plataforma unificada real: Gestiona Compute, Storage y Networking (Aruba).', hpeIsBetter: true }
                ]
            },
            {
                id: 'aws-outposts',
                name: 'AWS',
                solution: 'Outposts',
                topology: {
                    summary: 'Hardware dedicado de AWS en tu datacenter.',
                    layers: [
                        { name: 'Gestión', components: ['AWS Console (Cloud)'], description: 'Misma consola que la nube pública.' },
                        { name: 'Conexión', components: ['Service Link'], description: 'Conexión VPN/DX permanente requerida al plano de control.' },
                        { name: 'Hardware', components: ['Outpost Rack'], description: 'Rack cerrado "Caja Negra" gestionado 100% por AWS.' },
                        { name: 'Ubicación', components: ['On-Premise'], description: 'Físicamente local, lógicamente en la nube.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Soberanía de Datos', hpe: 'Total (Sin lock-in)', competitor: 'Parcial (Control AWS)', hpeAdvantage: 'Datos 100% bajo tu control. Forrester cita 161% ROI en 3 años.', hpeIsBetter: true },
                    { category: 'Funcional', feature: 'Desconexión', hpe: 'Operación autónoma', competitor: 'Dependencia de enlace', hpeAdvantage: 'Soporta entornos desconectados; Outposts requiere conexión constante al plano de control.', hpeIsBetter: true },
                    { category: 'Financiero', feature: 'Egress Fees', hpe: 'Cero costos de salida', competitor: 'Aplican tarifas AWS', hpeAdvantage: 'Sin costos ocultos por mover tus propios datos fuera de la plataforma.', hpeIsBetter: true },
                    { category: 'Técnico', feature: 'Latencia', hpe: 'Local (Microsegundos)', competitor: 'Local (pero control remoto)', hpeAdvantage: 'Latencia determinista para aplicaciones industriales o críticas.', hpeIsBetter: true },
                    { category: 'Precios', feature: 'Flexibilidad', hpe: 'Escalado arriba/abajo', competitor: 'Compromiso fijo de hardware', hpeAdvantage: 'Paga por uso real con buffer; Outposts es hardware dedicado facturado.', hpeIsBetter: true }
                ]
            },
            {
                id: 'lenovo-truscale',
                name: 'Lenovo',
                solution: 'TruScale',
                topology: {
                    summary: 'Modelo basado en alianzas con terceros.',
                    layers: [
                        { name: 'Gestión', components: ['TruScale Portal'], description: 'Portal básico de facturación.' },
                        { name: 'Servicios', components: ['Partner Dependent'], description: 'Depende de partners para servicios avanzados.' },
                        { name: 'Hardware', components: ['ThinkSystem'], description: 'Hardware Lenovo en sitio.' },
                        { name: 'Medición', components: ['Power Consumption'], description: 'A menudo basado en consumo energético vs uso real.' }
                    ]
                },
                comparisons: [
                    { category: 'Técnico', feature: 'Ecosistema', hpe: 'Morpheus + OpsRamp + Zerto', competitor: 'Dependencia de partners externos', hpeAdvantage: 'HPE ofrece el stack completo de SW propio; Lenovo depende de terceros.', hpeIsBetter: true }
                ]
            },
            {
                id: 'pure-aas',
                name: 'Pure Storage',
                solution: 'Evergreen//One',
                topology: {
                    summary: 'Suscripción de Almacenamiento "As-a-Service".',
                    layers: [
                        { name: 'Gestión', components: ['Pure1'], description: 'Gestión de almacenamiento en la nube.' },
                        { name: 'Servicio', components: ['Storage Service'], description: 'Solo bloque/archivo/objeto.' },
                        { name: 'Hardware', components: ['FlashArray / FlashBlade'], description: 'Arrays propietarios de Pure.' },
                        { name: 'Alcance', components: ['Storage Only'], description: 'No incluye cómputo ni redes.' }
                    ]
                },
                comparisons: [
                    { category: 'Negocio', feature: 'Amplitud de Portafolio', hpe: 'Storage + Compute + Networking', competitor: 'Solo Almacenamiento', hpeAdvantage: 'Una factura, un proveedor para toda la infraestructura, no solo discos.', hpeIsBetter: true }
                ]
            },
            {
                id: 'cisco-plus',
                name: 'Cisco',
                solution: 'Cisco+',
                topology: {
                    summary: 'NaaS (Network as a Service) y Compute.',
                    layers: [
                        { name: 'Gestión', components: ['Intersight'], description: 'Gestión cloud de infraestructura Cisco.' },
                        { name: 'Servicio', components: ['Hybrid Cloud'], description: 'Enfoque en conectividad.' },
                        { name: 'Hardware', components: ['UCS + Nexus'], description: 'Infraestructura Cisco.' },
                        { name: 'Storage', components: ['Third Party'], description: 'Depende de partners de almacenamiento.' }
                    ]
                },
                comparisons: [
                    { category: 'Funcional', feature: 'Gestión de Datos', hpe: 'Unified DataOps (Alletra)', competitor: 'Enfoque en Networking/UCS', hpeAdvantage: 'Liderazgo en Data Services con consola DSCC madura.', hpeIsBetter: true }
                ]
            }
        ]
    }
};
