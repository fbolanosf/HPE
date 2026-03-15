# 🚀 HPE Sales Specialist Toolkit

El **HPE Sales Specialist Toolkit** es una plataforma avanzada diseñada para empoderar a los especialistas de ventas de HPE y sus socios de negocio. Esta herramienta centraliza la inteligencia de mercado, el análisis financiero y la comparativa técnica en una interfaz moderna, dinámica y visualmente impactante.

---

## 🛠 Módulos Principales

### 1. 🌍 Inteligencia de Ecosistemas (Partner Map)
Visualización geográfica y analítica del canal de distribución.
- **Mapa Geoespacial**: Localización de partners con clustering avanzado (Leaflet).
- **Detalle Pro**: Visualización de niveles de certificación HPE (Platinum, Gold, Silver), marcas OEM representadas y especializaciones tecnológicas (Virtualización, HCI, etc.).
- **Gráfico de Dispersión**: Análisis comparativo de socios basado en Score de Oportunidad vs. Tamaño de Mercado.

### 2. 📋 Assessment Explorer
Motor de levantamiento de requisitos técnicos y de negocio.
- Generación de cuestionarios inteligentes basados en verticales de industria.
- Diagnóstico automático de brechas tecnológicas.
- Exportación profesional de hallazgos.

### 3. 💰 Financial Architect
Calculadora financiera de alta precisión para proyectos complejos.
- Análisis de **TCO (Total Cost of Ownership)** y **ROI (Return on Investment)**.
- Comparativa de modelos de consumo (CapEx vs. OpEx).
- Visualización de flujos de caja y ahorros proyectados.

### 4. ⚖️ Solution Comparator
Herramienta de posicionamiento competitivo.
- Matriz de afinidad de productos.
- Comparativa directa contra competidores del mercado.
- Enfoque especial en **HPE VM Essentials** como alternativa líder de virtualización.

---

## 💻 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (React 18).
- **Styling**: Vanilla CSS + Glassmorphism UX.
- **Visualización Géo**: [Leaflet.js](https://leafletjs.org/) con mapas de alta resolución.
- **Gráficos**: [Recharts](https://recharts.org/) para analítica dinámica.
- **Iconografía**: [Lucide React](https://lucide.dev/).
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/).

---

## 📂 Estructura del Proyecto

```text
HPE/
├── sales-app/            # Aplicación principal Next.js
│   ├── src/
│   │   ├── app/          # Rutas y páginas
│   │   ├── components/   # Componentes modulares (UI, Gráficos, Mapas)
│   │   └── lib/          # Lógica de datos y cálculos financieros
│   ├── public/           # Recursos estáticos (Imágenes, Iconos)
│   └── package.json      # Dependencias y scripts
├── start.command         # Script de inicio rápido para macOS
└── README.md             # Documentación maestra (este archivo)
```

---

## 🚀 Inicio Rápido

1. **Instalación de Dependencias**:
   ```bash
   cd sales-app
   npm install --legacy-peer-deps
   ```

2. **Modo Desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

3. **Acceso Directo (macOS)**:
   Simplemente haz doble clic en el archivo `start.command` en la carpeta raíz para iniciar el servidor y abrir el navegador automáticamente.

---

## 📄 Notas de Versión actual (v6.1.0)
- Enriquecimiento masivo de datos de partners.
- Integración de certificaciones oficiales HPE con badges de color.
- Sincronización automática con repositorio de respaldo GitHub.

---
*Desarrollado para la excelencia en ventas tecnológicas.*
