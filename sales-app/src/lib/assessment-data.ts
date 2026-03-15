export type AnswerOption = {
    id: string;
    label: string;
    score: number; // 0-10 scale
    gap: string; // The identified problem/gap
    futureState: string; // The desired to-be state
    hpeSolution: string; // The specific HPE product/service
};

export type Question = {
    id: string;
    category: 'infrastructure' | 'agility' | 'cloud-strategy' | 'data-resilience' | 'security' | 'financial';
    categoryLabel: string;
    text: string;
    options: AnswerOption[];
};

export const ASSESSMENT_QUESTIONS: Question[] = [
    // --- 1. INFRASTRUCTURE EFFICIENCY (3 Questions) ---
    {
        id: 'inf-1',
        category: 'infrastructure',
        categoryLabel: 'Eficiencia Infraestructura',
        text: '¿Cuál es el estado actual de su infraestructura de cómputo y almacenamiento?',
        options: [
            {
                id: 'inf1-1', label: 'Silos tradicionales (Servidores y SAN separados)', score: 3,
                gap: 'Complejidad de gestión y cuellos de botella.',
                futureState: 'Infraestructura hiperconvergente desagregada (dHCI).',
                hpeSolution: 'HPE Alletra dHCI'
            },
            {
                id: 'inf1-2', label: 'Virtualización básica con almacenamiento compartido', score: 5,
                gap: 'Escalabilidad limitada y gestión reactiva.',
                futureState: 'Modernización con almacenamiento All-NVMe.',
                hpeSolution: 'HPE Alletra MP'
            },
            {
                id: 'inf1-3', label: 'HCI Tradicional', score: 7,
                gap: 'Desperdicio de recursos al escalar (cómputo vs storage).',
                futureState: 'Optimización de cargas con dHCI.',
                hpeSolution: 'HPE Alletra dHCI'
            },
            {
                id: 'inf1-4', label: 'Infraestructura Componible / Cloud-Native', score: 10,
                gap: 'Optimizado.',
                futureState: 'Liderazgo tecnológico.',
                hpeSolution: 'HPE Synergy'
            },
        ],
    },
    {
        id: 'inf-2',
        category: 'infrastructure',
        categoryLabel: 'Eficiencia Infraestructura',
        text: '¿Cómo maneja el rendimiento de sus aplicaciones críticas?',
        options: [
            {
                id: 'inf2-1', label: 'Quejas frecuentes de usuarios / Lentitud', score: 2,
                gap: 'Latencia alta impactando el negocio.',
                futureState: 'Disponibilidad 100% y rendimiento extremo.',
                hpeSolution: 'HPE Alletra 9000'
            },
            {
                id: 'inf2-2', label: 'Tuning manual constante para mantener SLA', score: 5,
                gap: 'Carga operativa alta.',
                futureState: 'Gestión autónoma con IA.',
                hpeSolution: 'HPE InfoSight'
            },
            {
                id: 'inf2-3', label: 'Rendimiento adecuado, sin visibilidad', score: 7,
                gap: 'Riesgo de problemas no detectados.',
                futureState: 'Visibilidad full-stack predictiva.',
                hpeSolution: 'HPE OpsRamp'
            },
            {
                id: 'inf2-4', label: 'SLA garantizado con IA predictiva', score: 10,
                gap: 'Optimizado.',
                futureState: 'Optimización continua.',
                hpeSolution: 'HPE InfoSight'
            },
        ],
    },
    {
        id: 'inf-3',
        category: 'infrastructure',
        categoryLabel: 'Eficiencia Infraestructura',
        text: '¿Cómo gestiona el ciclo de vida del hardware (firmware/drivers)?',
        options: [
            {
                id: 'inf3-1', label: 'Manual y reactivo (solo ante fallas)', score: 2,
                gap: 'Riesgo de seguridad y downtime.',
                futureState: 'Automatización de ciclo de vida.',
                hpeSolution: 'HPE OneView'
            },
            {
                id: 'inf3-2', label: 'Ventanas de mantenimiento trimestrales', score: 5,
                gap: 'Interrupciones de servicio programadas.',
                futureState: 'Actualizaciones no disruptivas.',
                hpeSolution: 'HPE OneView'
            },
            {
                id: 'inf3-3', label: 'Gestión centralizada de perfiles', score: 8,
                gap: 'Gestión eficiente pero requiere supervisión.',
                futureState: 'Infraestructura como Código (IaC).',
                hpeSolution: 'HPE OneView + Ansible'
            },
            {
                id: 'inf3-4', label: 'Totalmente automatizado / Gestionado', score: 10,
                gap: 'Optimizado.',
                futureState: 'Mantenimiento cero-toque.',
                hpeSolution: 'HPE GreenLake Management Services'
            },
        ],
    },
    {
        id: 'inf-4',
        category: 'infrastructure',
        categoryLabel: 'Eficiencia Infraestructura',
        text: '¿Cómo gestiona el crecimiento de datos no estructurados (archivos, imágenes, logs)?',
        options: [
            {
                id: 'inf4-1', label: 'Silos de servidores de archivos (Windows/Linux) dispersos', score: 3,
                gap: 'Fragmentación de datos y difícil gestión.',
                futureState: 'Data Lake unificado y escalable.',
                hpeSolution: 'HPE GreenLake for File Storage'
            },
            {
                id: 'inf4-2', label: 'NAS tradicional con problemas de rendimiento/escalabilidad', score: 5,
                gap: 'Cuellos de botella en cargas intensivas.',
                futureState: 'Arquitectura desagregada de alto rendimiento.',
                hpeSolution: 'HPE Alletra MP (File)'
            },
            {
                id: 'inf4-3', label: 'Almacenamiento en nube pública (Egress costs altos)', score: 6,
                gap: 'Costos impredecibles de salida de datos.',
                futureState: 'Experiencia nube con control local.',
                hpeSolution: 'HPE Solutions for Scality'
            },
            {
                id: 'inf4-4', label: 'Plataforma unificada de alto rendimiento', score: 10,
                gap: 'Optimizado.',
                futureState: 'Inteligencia de datos avanzada.',
                hpeSolution: 'HPE GreenLake for File Storage'
            },
        ],
    },
    {
        id: 'inf-5',
        category: 'infrastructure',
        categoryLabel: 'Eficiencia Infraestructura',
        text: '¿Qué estrategia utiliza para cargas de trabajo de propósito general o secundarias?',
        options: [
            {
                id: 'inf5-1', label: 'Todo en All-Flash costoso (sin tiering)', score: 4,
                gap: 'Costo por GB ineficiente para datos fríos.',
                futureState: 'Almacenamiento Híbrido Inteligente.',
                hpeSolution: 'HPE Alletra 5000'
            },
            {
                id: 'inf5-2', label: 'Hardware legado/antiguo sin soporte', score: 2,
                gap: 'Riesgo de pérdida de datos y alto consumo.',
                futureState: 'Modernización costo-efectiva.',
                hpeSolution: 'HPE MSA Gen6'
            },
            {
                id: 'inf5-3', label: 'Mezcla de vendors y tecnologías', score: 6,
                gap: 'Complejidad operativa.',
                futureState: 'Gestión unificada en nube.',
                hpeSolution: 'HPE Alletra 5000'
            },
            {
                id: 'inf5-4', label: 'Tiering automático eficiente', score: 10,
                gap: 'Optimizado.',
                futureState: 'Eficiencia de costos máxima.',
                hpeSolution: 'HPE Alletra'
            },
        ],
    },

    // --- 2. OPERATIONAL AGILITY (3 Questions) ---
    {
        id: 'ops-1',
        category: 'agility',
        categoryLabel: 'Agilidad Operativa',
        text: '¿Cuánto tiempo toma provisionar nueva infraestructura?',
        options: [
            {
                id: 'ops1-1', label: 'Semanas o Meses', score: 2,
                gap: 'Time-to-market lento.',
                futureState: 'Aprovisionamiento en minutos (Cloud exp).',
                hpeSolution: 'HPE GreenLake Private Cloud'
            },
            {
                id: 'ops1-2', label: 'Días (Virtualización manual)', score: 5,
                gap: 'Procesos manuales propensos a error.',
                futureState: 'Automatización basada en políticas.',
                hpeSolution: 'HPE OneView'
            },
            {
                id: 'ops1-3', label: 'Horas (Scripts básicos)', score: 7,
                gap: 'Automatización aislada.',
                futureState: 'Orquestación completa.',
                hpeSolution: 'HPE GreenLake Central'
            },
            {
                id: 'ops1-4', label: 'Minutos (Autoservicio)', score: 10,
                gap: 'Optimizado.',
                futureState: 'Agilidad continua.',
                hpeSolution: 'HPE GreenLake'
            },
        ],
    },
    {
        id: 'ops-2',
        category: 'agility',
        categoryLabel: 'Agilidad Operativa',
        text: '¿Qué nivel de visibilidad tiene sobre la salud de su TI?',
        options: [
            {
                id: 'ops2-1', label: 'Reactiva (Nos enteramos al fallar)', score: 2,
                gap: 'Downtime no planificado.',
                futureState: 'Resolución predictiva con IA.',
                hpeSolution: 'HPE InfoSight'
            },
            {
                id: 'ops2-2', label: 'Monitoreo básico (Ping/SNMP)', score: 5,
                gap: 'Alertas sin contexto ("Ruido").',
                futureState: 'Observabilidad unificada.',
                hpeSolution: 'HPE OpsRamp'
            },
            {
                id: 'ops2-3', label: 'Dashboards centralizados', score: 8,
                gap: 'Falta correlación automática.',
                futureState: 'AIOps autónomo.',
                hpeSolution: 'HPE InfoSight + OpsRamp'
            },
            {
                id: 'ops2-4', label: 'AIOps predictivo automatizado', score: 10,
                gap: 'Optimizado.',
                futureState: 'Operaciones autónomas.',
                hpeSolution: 'HPE InfoSight'
            },
        ],
    },
    {
        id: 'ops-3',
        category: 'agility',
        categoryLabel: 'Agilidad Operativa',
        text: '¿Utiliza contenedores en producción?',
        options: [
            {
                id: 'ops3-1', label: 'No, solo VMs', score: 3,
                gap: 'Dependencia de arquitectura monolítica.',
                futureState: 'Modernización de apps con Containers.',
                hpeSolution: 'HPE Ezmeral Runtime'
            },
            {
                id: 'ops3-2', label: 'Pilotos aislados', score: 5,
                gap: 'Falta de estandarización.',
                futureState: 'Orquestación Kubernetes empresarial.',
                hpeSolution: 'HPE Ezmeral'
            },
            {
                id: 'ops3-3', label: 'K8s en producción sobre VMs', score: 8,
                gap: 'Overhead de gestión.',
                futureState: 'Contenedores Bare-metal.',
                hpeSolution: 'HPE Ezmeral Data Fabric'
            },
            {
                id: 'ops3-4', label: 'Containerización a escala', score: 10,
                gap: 'Optimizado.',
                futureState: 'Innovación continua.',
                hpeSolution: 'HPE Ezmeral'
            },
        ],
    },
    {
        id: 'ops-4',
        category: 'agility',
        categoryLabel: 'Agilidad Operativa',
        text: '¿Cómo administra el aprovisionamiento de almacenamiento en su entorno híbrido?',
        options: [
            {
                id: 'ops4-1', label: 'Consolas individuales por dispositivo (Silos)', score: 3,
                gap: 'Gestión fragmentada y lenta.',
                futureState: 'Consola de Nube Unificada (DSCC).',
                hpeSolution: 'HPE Data Services Cloud Console'
            },
            {
                id: 'ops4-2', label: 'Scripts manuales y hojas de cálculo', score: 4,
                gap: 'Propenso a errores humanos.',
                futureState: 'Provisionamiento basado en intenciones (Intent-based).',
                hpeSolution: 'HPE DSCC (Data Ops)'
            },
            {
                id: 'ops4-3', label: 'Herramientas de terceros complejas', score: 7,
                gap: 'Sobrecosto de licenciamiento.',
                futureState: 'Gestión nativa SaaS.',
                hpeSolution: 'HPE GreenLake for Block Storage'
            },
            {
                id: 'ops4-4', label: 'Gestión Centralizada Cloud-Native', score: 10,
                gap: 'Optimizado.',
                futureState: 'Agilidad de datos global.',
                hpeSolution: 'HPE Data Services Cloud Console'
            },
        ],
    },

    // --- 3. CLOUD STRATEGY (3 Questions) ---
    {
        id: 'cld-1',
        category: 'cloud-strategy',
        categoryLabel: 'Estrategia Nube',
        text: '¿Cómo integra la nube pública en su estrategia?',
        options: [
            {
                id: 'cld1-1', label: 'Sin estrategia clara / Shadow IT', score: 2,
                gap: 'Riesgo de seguridad y descontrol.',
                futureState: 'Estrategia Híbrida Unificada.',
                hpeSolution: 'HPE GreenLake Hybrid Cloud'
            },
            {
                id: 'cld1-2', label: 'Cloud First sin análisis', score: 4,
                gap: 'Costos ocultos y latencia.',
                futureState: 'Cloud Smart (Cargas idóneas).',
                hpeSolution: 'HPE Right Mix Advisor'
            },
            {
                id: 'cld1-3', label: 'Híbrida conectada (VPN)', score: 7,
                gap: 'Gestión fragmentada.',
                futureState: 'Experiencia consistente Edge-to-Cloud.',
                hpeSolution: 'HPE GreenLake Central'
            },
            {
                id: 'cld1-4', label: 'Multicloud orquestada', score: 10,
                gap: 'Optimizado.',
                futureState: 'Innovación continua.',
                hpeSolution: 'HPE GreenLake'
            },
        ],
    },
    {
        id: 'cld-2',
        category: 'cloud-strategy',
        categoryLabel: 'Estrategia Nube',
        text: '¿Cómo maneja la portabilidad de datos?',
        options: [
            {
                id: 'cld2-1', label: 'Datos atrapados en silos (Data Gravity)', score: 2,
                gap: 'Incapacidad de mover cargas ágilmente.',
                futureState: 'Data Fabric global unificado.',
                hpeSolution: 'HPE Ezmeral Data Fabric'
            },
            {
                id: 'cld2-2', label: 'Movimiento manual y lento', score: 5,
                gap: 'Procesos de migración costosos.',
                futureState: 'Movilidad de datos fluida.',
                hpeSolution: 'HPE Zerto'
            },
            {
                id: 'cld2-3', label: 'Replicación automatizada parcial', score: 8,
                gap: 'Complejidad de sincronización.',
                futureState: 'Acceso universal a datos.',
                hpeSolution: 'HPE Ezmeral'
            },
            {
                id: 'cld2-4', label: 'Data Fabric global activo', score: 10,
                gap: 'Optimizado.',
                futureState: 'Agilidad de datos total.',
                hpeSolution: 'HPE Ezmeral Data Fabric'
            },
        ],
    },
    {
        id: 'cld-3',
        category: 'cloud-strategy',
        categoryLabel: 'Estrategia Nube',
        text: '¿Dónde procesa sus datos generados en el borde (Edge)?',
        options: [
            {
                id: 'cld3-1', label: 'Todo se envía al Datacenter central', score: 3,
                gap: 'Latencia y costos de ancho de banda.',
                futureState: 'Procesamiento en el borde (Edge).',
                hpeSolution: 'HPE Edgeline'
            },
            {
                id: 'cld3-2', label: 'Procesamiento local limitado', score: 5,
                gap: 'Capacidad de análisis limitada.',
                futureState: 'Inteligencia en el borde.',
                hpeSolution: 'HPE Edgeline + Aruba'
            },
            {
                id: 'cld3-3', label: 'Edge Computing consolidado', score: 8,
                gap: 'Gestión dispersa.',
                futureState: 'Gestión Edge-to-Cloud unificada.',
                hpeSolution: 'HPE GreenLake for Edge'
            },
            {
                id: 'cld3-4', label: 'Arquitectura distribuida optimizada', score: 10,
                gap: 'Optimizado.',
                futureState: 'Innovación en el borde.',
                hpeSolution: 'HPE Edgeline'
            },
        ],
    },

    // --- 4. DATA RESILIENCE (3 Questions) ---
    {
        id: 'res-1',
        category: 'data-resilience',
        categoryLabel: 'Resiliencia de Datos',
        text: '¿Cuál es su capacidad de recuperación ante desastres (DR)?',
        options: [
            {
                id: 'res1-1', label: 'Backup local solamente', score: 2,
                gap: 'Riesgo total ante desastre de sitio.',
                futureState: 'DR automatizado multisitio.',
                hpeSolution: 'HPE Zerto'
            },
            {
                id: 'res1-2', label: 'Replicación storage-to-storage', score: 5,
                gap: 'RTO/RPO dependiente del hardware.',
                futureState: 'Protección continua (CDP) agnóstica.',
                hpeSolution: 'HPE Zerto'
            },
            {
                id: 'res1-3', label: 'Backup inmutable en nube', score: 7,
                gap: 'RTO lento para grandes volúmenes.',
                futureState: 'Recuperación instantánea orquestada.',
                hpeSolution: 'HPE GreenLake for DR'
            },
            {
                id: 'res1-4', label: 'Disponibilidad continua (Active-Active)', score: 10,
                gap: 'Optimizado.',
                futureState: 'Resiliencia total.',
                hpeSolution: 'HPE Zerto'
            },
        ],
    },
    {
        id: 'res-2',
        category: 'data-resilience',
        categoryLabel: 'Resiliencia de Datos',
        text: '¿Protege sus cargas de trabajo SaaS (M365, Salesforce)?',
        options: [
            {
                id: 'res2-1', label: 'No, confiamos en el proveedor', score: 2,
                gap: 'Responsabilidad compartida ignorada.',
                futureState: 'Protección integral de SaaS.',
                hpeSolution: 'HPE GreenLake for Backup (SaaS)'
            },
            {
                id: 'res2-2', label: 'Backups manuales / scripts', score: 4,
                gap: 'Gestión ineficiente y riesgosa.',
                futureState: 'Backup automatizado como servicio.',
                hpeSolution: 'HPE GreenLake for Backup'
            },
            {
                id: 'res2-3', label: 'Herramienta de tercero dedicada', score: 8,
                gap: 'Silo de backup adicional.',
                futureState: 'Protección unificada.',
                hpeSolution: 'HPE GreenLake for Backup'
            },
            {
                id: 'res2-4', label: 'Protección unificada On-prem/SaaS', score: 10,
                gap: 'Optimizado.',
                futureState: 'Gestión unificada.',
                hpeSolution: 'HPE GreenLake for Backup'
            },
        ],
    },
    {
        id: 'res-3',
        category: 'data-resilience',
        categoryLabel: 'Resiliencia de Datos',
        text: '¿Con qué frecuencia prueba su plan de DR?',
        options: [
            {
                id: 'res3-1', label: 'Nunca o Rara vez', score: 1,
                gap: 'Incertidumbre de recuperación.',
                futureState: 'Pruebas constantes no disruptivas.',
                hpeSolution: 'HPE Zerto'
            },
            {
                id: 'res3-2', label: 'Anualmente (con disrupción)', score: 4,
                gap: 'Impacto al negocio durante pruebas.',
                futureState: 'Validación continua de DR.',
                hpeSolution: 'HPE Zerto'
            },
            {
                id: 'res3-3', label: 'Semestralmente (aislado)', score: 7,
                gap: 'Frecuencia insuficiente.',
                futureState: 'Orquestación y reporte automatizado.',
                hpeSolution: 'HPE Zerto'
            },
            {
                id: 'res3-4', label: 'Continuamente / Automatizado', score: 10,
                gap: 'Optimizado.',
                futureState: 'Confianza total en recuperación.',
                hpeSolution: 'HPE Zerto'
            },
        ],
    },

    // --- 5. SECURITY (3 Questions) ---
    {
        id: 'sec-1',
        category: 'security',
        categoryLabel: 'Ciberseguridad',
        text: '¿Cómo protege sus backups contra Ransomware?',
        options: [
            {
                id: 'sec1-1', label: 'Backups estándar en disco/cinta', score: 2,
                gap: 'Vulnerable a encriptación.',
                futureState: 'Inmutabilidad garantizada.',
                hpeSolution: 'HPE StoreOnce Catalyst'
            },
            {
                id: 'sec1-2', label: 'Repositorio "Hardened" Linux', score: 5,
                gap: 'Complejidad de gestión.',
                futureState: 'Appliance de deduplicación seguro.',
                hpeSolution: 'HPE StoreOnce'
            },
            {
                id: 'sec1-3', label: 'Inmutabilidad con Air-Gap lógico', score: 8,
                gap: 'Falta detección proactiva.',
                futureState: 'Detección de amenezas en backup.',
                hpeSolution: 'HPE GreenLake for Backup'
            },
            {
                id: 'sec1-4', label: 'Cyber Recovery Vault aislado', score: 10,
                gap: 'Optimizado.',
                futureState: 'Máxima seguridad.',
                hpeSolution: 'Zerto Cyber Resilience Vault'
            },
        ],
    },
    {
        id: 'sec-2',
        category: 'security',
        categoryLabel: 'Ciberseguridad',
        text: '¿Qué visibilidad tiene sobre vulnerabilidades infraestructura?',
        options: [
            {
                id: 'sec2-1', label: 'Scans periódicos manuales', score: 3,
                gap: 'Ventana de exposición amplia.',
                futureState: 'Seguridad desde el silicio.',
                hpeSolution: 'HPE Silicon Root of Trust'
            },
            {
                id: 'sec2-2', label: 'Actualizaciones de firmware reactivas', score: 5,
                gap: 'Riesgo latente.',
                futureState: 'Gestión automatizada de cumplimiento.',
                hpeSolution: 'HPE iLO Amplifier'
            },
            {
                id: 'sec2-3', label: 'Gestión centralizada de parches', score: 7,
                gap: 'Enfoque solo en OS/Apps.',
                futureState: 'Cadena de suministro segura.',
                hpeSolution: 'HPE Trusted Supply Chain'
            },
            {
                id: 'sec2-4', label: 'Infraestructura Zero Trust nativa', score: 10,
                gap: 'Optimizado.',
                futureState: 'Seguridad embebida.',
                hpeSolution: 'HPE ProLiant Gen11'
            },
        ],
    },
    {
        id: 'sec-3',
        category: 'security',
        categoryLabel: 'Ciberseguridad',
        text: '¿Utiliza autenticación multifactor (MFA) para gestión?',
        options: [
            {
                id: 'sec3-1', label: 'Solo passwords', score: 1,
                gap: 'Acceso administrativo vulnerable.',
                futureState: 'Identidad federalizada y MFA.',
                hpeSolution: 'HPE GreenLake Platform ID'
            },
            {
                id: 'sec3-2', label: 'MFA para algunos accesos remotos', score: 5,
                gap: 'Cobertura incompleta.',
                futureState: 'Acceso Zero Trust completo.',
                hpeSolution: 'Aruba ClearPass'
            },
            {
                id: 'sec3-3', label: 'MFA generalizado', score: 8,
                gap: 'Políticas estáticas.',
                futureState: 'Autenticación contextual adaptable.',
                hpeSolution: 'Aruba ClearPass'
            },
            {
                id: 'sec3-4', label: 'Zero Trust Network Access (ZTNA)', score: 10,
                gap: 'Optimizado.',
                futureState: 'Seguridad perimetral total.',
                hpeSolution: 'HPE Aruba SSE'
            },
        ],
    },

    // --- 6. FINANCIAL EFFICIENCY (3 Questions) ---
    {
        id: 'fin-1',
        category: 'financial',
        categoryLabel: 'Eficiencia Financiera',
        text: '¿Cómo alinea los costos de TI con el negocio?',
        options: [
            {
                id: 'fin1-1', label: 'CapEx (Compra) cada 3-5 años', score: 3,
                gap: 'Sobreaprovisionamiento costoso.',
                futureState: 'Modelo de consumo (OpEx).',
                hpeSolution: 'HPE GreenLake'
            },
            {
                id: 'fin1-2', label: 'Leasing financiero', score: 5,
                gap: 'Deuda fija sin elasticidad.',
                futureState: 'Pago por uso real.',
                hpeSolution: 'HPE GreenLake Flex Capacity'
            },
            {
                id: 'fin1-3', label: 'CapEx + Nube Pública', score: 7,
                gap: 'Costos impredecibles.',
                futureState: 'Transparencia de costos unificada.',
                hpeSolution: 'HPE GreenLake Central'
            },
            {
                id: 'fin1-4', label: 'IT as a Service (ITaaS)', score: 10,
                gap: 'Optimizado.',
                futureState: 'Alineación total costo-valor.',
                hpeSolution: 'HPE GreenLake'
            },
        ],
    },
    {
        id: 'fin-2',
        category: 'financial',
        categoryLabel: 'Eficiencia Financiera',
        text: '¿Qué nivel de utilización tienen sus recursos?',
        options: [
            {
                id: 'fin2-1', label: 'Baja (<30%) por sobreaprovisionamiento', score: 2,
                gap: 'Capital inmovilizado improductivo.',
                futureState: 'Buffer activo gestionado.',
                hpeSolution: 'HPE GreenLake Buffer'
            },
            {
                id: 'fin2-2', label: 'Media (50%) con picos de riesgo', score: 5,
                gap: 'Ineficiencia operativa.',
                futureState: 'Capacidad bajo demanda.',
                hpeSolution: 'HPE GreenLake'
            },
            {
                id: 'fin2-3', label: 'Alta (>80%) con riesgo de saturación', score: 8,
                gap: 'Riesgo de rendimiento.',
                futureState: 'Elasticidad instantánea.',
                hpeSolution: 'HPE GreenLake'
            },
            {
                id: 'fin2-4', label: 'Optimizado (Recursos just-in-time)', score: 10,
                gap: 'Optimizado.',
                futureState: 'Eficiencia máxima.',
                hpeSolution: 'HPE GreenLake'
            },
        ],
    },
    {
        id: 'fin-3',
        category: 'financial',
        categoryLabel: 'Eficiencia Financiera',
        text: '¿Cómo gestiona el "fin de vida" de sus activos?',
        options: [
            {
                id: 'fin3-1', label: 'Almacenamiento en bodegas / Basura', score: 2,
                gap: 'Riesgo ambiental y de seguridad.',
                futureState: 'Economía circular certificada.',
                hpeSolution: 'HPE Asset Upcycling'
            },
            {
                id: 'fin3-2', label: 'Donación o venta informal', score: 5,
                gap: 'Sin retorno de valor garantizado.',
                futureState: 'Recuperación de valor de activos.',
                hpeSolution: 'HPE Financial Services'
            },
            {
                id: 'fin3-3', label: 'Reciclaje básico', score: 7,
                gap: 'Cumplimiento normativo básico.',
                futureState: 'Upcycling sustentable.',
                hpeSolution: 'HPE Asset Upcycling'
            },
            {
                id: 'fin3-4', label: 'Renovación tecnológica continua', score: 10,
                gap: 'Optimizado.',
                futureState: 'Sustentabilidad total.',
                hpeSolution: 'HPE GreenLake'
            },
        ],
    },
];
