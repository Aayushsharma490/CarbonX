# 🌿 CarbonX — Carbon Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **From Individual Choices to Industrial Decisions.**  
> CarbonX is a unified, enterprise-grade **Carbon Intelligence & Decision Platform** featuring **Personal Mode** (deterministic calculations, explainable uncertainty bounds, bill OCR parsing, ML forecasting, and 8-point data trust) and **Organization Mode** (industrial IoT telemetry, RX-TX 3-tier grid loss forensics, and machine health monitoring).

---

## 🌟 Key Features

### 🏠 Personal Mode (Default Engine)
- **Deterministic Calculation Lineage**: Carbon emissions are computed via certified mathematical formulas ($V \times F = E$) rather than stochastic estimates.
- **India-First Certified Factors**: Built-in Central Electricity Authority (CEA v19: $0.820\text{ kg CO}_2\text{e/kWh}$), PPAC LPG ($21.5\text{ kg/cylinder}$), ARAI transport benchmarks, DMRC Metro, and EEIO spend intensity matrices.
- **Explainable Uncertainty Ranges**: Every point estimate displays a 95% confidence interval ($332\text{--}361\text{ kg CO}_2\text{e}$) to eliminate false precision.
- **Working Document OCR Scanner**: Upload custom bills (PNG/JPG/PDF) or scan pre-configured electricity bills (BSES Rajdhani & Tata Power) with optical preview, editable parameters, and direct lineage logging.
- **Machine Learning Subsystem**:
  - **Isolation Forest & Z-Score Anomaly Detector**: Identifies abnormal consumption spikes ($Z > 2.5$).
  - **Gradient Boosted 30-Day Forecasting**: Predicts next month's carbon footprint using historical momentum and seasonal trends.
- **Interactive What-If Simulation**: Real-time sliders for EV transitions, solar rooftop kWh, diet changes, and AC thermostat adjustments.
- **Multi-Member Household Allocation**: Shared, individual, and proportional splits with guaranteed zero double-counting ($\sum \text{Share} = 100\%$).
- **8-Point Forensic Data Trust Center**: Full verification checklist across certified factors, data freshness, timestamps, and audit lineage.

---

### 🏭 Organization Mode (Industrial IoT & Energy Telemetry)
- **RX-TX Multi-Tier Architecture**: Aggregates distributed transmitter nodes (`TX1`, `TX2`, `TX3`, `XT-2 Crane`) into central RX Gateways.
- **3-Tier Grid Loss Forensic**: Detects plant-wide transmission loss and hidden electrical leakages:
  $$\text{Loss (kWh)} = \text{RX Inflow} - \sum \text{TX Nodes}$$
- **Machine Health & Diagnostics**: Real-time 0–100 health scoring, phase load balancing, power factor penalties, temperature monitoring, and predictive maintenance horizons.
- **Industrial Reporting Console**: Export AI-verified datasets to **PDF, CSV, and DOC** formats with automated peak/minimum load summaries.

---

## 🧭 Platform Route Map

| Route | Mode | Description |
| :--- | :--- | :--- |
| [`/`](file:///c:/CarbonX/src/app/page.tsx) | Dual | Landing page with platform overview & mode launch cards |
| [`/dashboard`](file:///c:/CarbonX/src/app/dashboard/page.tsx) | Personal / Org | Dual dashboard switching seamlessly between personal carbon & industrial plant |
| [`/activities`](file:///c:/CarbonX/src/app/activities/page.tsx) | Personal | 5-Category Activity Hub + Activity Lineage Drawer + OCR Bill Scanner |
| [`/footprint`](file:///c:/CarbonX/src/app/footprint/page.tsx) | Personal | Uncertainty spread analysis, national benchmarks & 9-stage engineering decision loop |
| [`/insights`](file:///c:/CarbonX/src/app/insights/page.tsx) | Personal | Prioritized mitigation actions & 2x2 Impact vs Effort ranking matrix |
| [`/what-if`](file:///c:/CarbonX/src/app/what-if/page.tsx) | Personal | Real-time interactive simulation sliders and scenario carbon deltas |
| [`/target`](file:///c:/CarbonX/src/app/target/page.tsx) | Personal | Paris Agreement 2026 climate budgets & reduction bundle combos |
| [`/household`](file:///c:/CarbonX/src/app/household/page.tsx) | Personal | Multi-member household split & double-counting prevention audit |
| [`/data-trust`](file:///c:/CarbonX/src/app/data-trust/page.tsx) | Personal | 8-Point forensic checklist, provenance verification & audit score |
| [`/machines`](file:///c:/CarbonX/src/app/machines/page.tsx) | Organization | Industrial machine telemetry, crane status & phase diagnostics |
| [`/energy`](file:///c:/CarbonX/src/app/energy/page.tsx) | Organization | Grid transmission flow & loss forensics |
| [`/alerts`](file:///c:/CarbonX/src/app/alerts/page.tsx) | Organization | Industrial machine health alerts & anomaly logs |
| [`/reports`](file:///c:/CarbonX/src/app/reports/page.tsx) | Organization | Multi-format reporting and data ledger export |

---

## 📊 Core Calculation Equations

### 1. Deterministic Calculation
$$\text{CO}_2\text{e (kg)} = \text{Activity Value} \times \text{Certified Emission Factor } \left(\frac{\text{kg CO}_2\text{e}}{\text{Unit}}\right)$$

### 2. Uncertainty Interval
$$\Delta = \text{Calculated CO}_2\text{e} \times \left(\frac{\text{Uncertainty \%}}{100}\right)$$
$$\text{Range: } [\max(0, \text{CO}_2\text{e} - \Delta) \text{ -- } (\text{CO}_2\text{e} + \Delta)] \text{ kg CO}_2\text{e}$$

### 3. Action Priority Ranking
$$\text{Priority Score} = \frac{\Delta\text{CO}_2\text{ (kg Saved/Month)} \times \text{Confidence Score}}{\text{Effort Score (1--5)} \times \text{Cost Score (1--5)}}$$

> 📖 **Full Mathematical Specification:** For detailed derivations, see [CARBON_EMISSION_FORMULAS.md](CARBON_EMISSION_FORMULAS.md).  
> 🏗️ **System Architecture Document:** For detailed component architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16 (App Router + Turbopack)](https://nextjs.org/)
- **Core Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Visualizations:** [Recharts](https://recharts.org/) & HTML5 Canvas
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **State & Context:** React Context API (`ModeContext`, `PersonalDataContext`, `TelemetryContext`)
- **Backend / Telemetry:** Next.js Route Handlers + Firebase / Internal Stream Simulation

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.17+ or v20+ recommended)
- `npm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/Aayushsharma490/CarbonX.git
cd CarbonX
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Repository Structure

```
CarbonX/
├── src/
│   ├── app/                          # Next.js App Router routes & pages
│   ├── components/                   # UI components (Navigation, Modals, Drawers, Badges)
│   ├── context/                      # React Context providers (Mode, PersonalData, Telemetry)
│   ├── lib/
│   │   ├── carbon-engine/            # Carbon calculation, ML, and uncertainty engines
│   │   └── energyCalculations.ts     # Industrial power & machine health math
│   └── types/                        # TypeScript type definitions
├── CARBON_EMISSION_FORMULAS.md       # Master mathematical formulas & factor tables
├── ARCHITECTURE.md                   # Complete architectural and system specification
└── package.json                      # Project dependencies and build scripts
```

---

## 🛡️ Standards Compliance

- **GHG Protocol:** Scope 1 (Direct), Scope 2 (Electricity indirect), Scope 3 (Spend & Value chain).
- **ISO 14064:** Greenhouse gases carbon footprint quantification and reporting.
- **CEA Baseline Database v19:** Official weighted grid emission factor ($0.820\text{ kg CO}_2\text{e/kWh}$).
- **IPCC AR6:** Fifth/Sixth Assessment Report Global Warming Potentials ($GWP_{100}$).

---

## 👨‍💻 Author & Maintainer

**Aayush Sharma**  
Repository: [https://github.com/Aayushsharma490/CarbonX](https://github.com/Aayushsharma490/CarbonX)

---
*Built with precision for the next generation of climate intelligence.*
