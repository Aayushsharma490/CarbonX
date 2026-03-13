# CarbonX: Industrial Intelligence & Energy Forensics

## 1. Project Introduction
**CarbonX** is a next-generation Industrial IoT (IIoT) platform designed to provide "Forensics Beyond Data." It enables factory managers and industrial enterprises to monitor every watt of energy consumption, detect equipment anomalies in real-time, and automate carbon footprint reporting. By leveraging high-resolution telemetry from RX (Gateway) and TX (Node) units, CarbonX transforms raw electrical data into actionable intelligence.

## 2. Problem Statement
Modern industrial environments face three critical challenges:
- **Invisible Energy Waste**: Transmission losses between the main grid and machine nodes often go undetected, leading to significant financial leakage.
- **Unscheduled Downtime**: Equipment failures (like motor burnouts) are often caused by undetected 3-phase imbalances, overheating, or power factor degradation.
- **Reporting Complexity**: With increasing global pressure for "Net-Zero" compliance, manually tracking and reporting CO2 emissions from complex factory grids is error-prone and labor-intensive.

## 3. Target Audience
- **Factory Managers**: To optimize operational efficiency and reduce energy costs.
- **Maintenance Engineers**: For predictive maintenance and hardware longevity.
- **Sustainability (ESG) Officers**: To track and report real-time carbon emissions and manage offset goals.
- **Industrial Investors**: To monitor plant performance and asset health remotely.

## 4. Use Cases (In-Depth)
### A. Predictive Motor Maintenance
By monitoring vibration and temperature curves, CarbonX identifies the early signs of bearing failure or winding insulation breakdown.
- **Scenario**: A CNC machine's vibration increases from 0.5 to 2.2 mm/s over 48 hours.
- **Action**: CarbonX triggers a "Warning" alert, allowing engineers to replace a $50 bearing before it causes a $10,000 spindle failure.

### B. Real-Time Phase Balancing
Industrial motors run most efficiently when 3-phase voltages are balanced.
- **Scenario**: Phase L3 starts carrying 15% more current than L1/L2.
- **Action**: CarbonX detects the imbalance, preventing local transformer overheating and extending motor life by up to 30%.

### C. Automated ESG & Carbon Audits
Companies often struggle to calculate their Scope 2 emissions for annual reports.
- **Action**: CarbonX provides a "One-Click Export" of total kWh transformed into CO2 (kg) based on the specific grid emission factors, making audits 100% forensic and transparent.

### D. Leakage Detection (RX vs. TX)
- **Scenario**: The main grid (RX) shows 5000 kWh consumed, but the sum of all machines (TX) is only 4200 kWh.
- **Action**: CarbonX flags an 16% "Critical Loss," identifying faulty wiring or unauthorized power tapping in real-time.

## 5. Revenue Model (Monetization Strategy)
CarbonX employs a hybrid revenue model designed for scalability and high customer retention.

### Tier 1: Hardware-as-a-Service (HaaS)
- **Edge Nodes**: Low upfront cost. Factories pay a monthly lease per TX node (IP67 industrial grade).
- **Gateway (RX)**: One-time installation fee for the mesh-master gateway.

### Tier 2: SaaS Subscription (Data & AI)
- **Growth Plan**: ($49/node/mo) - Real-time dashboard, basic alerts, and 30-day data history.
- **Enterprise Plan**: ($99/node/mo) - Advanced AI health scores, predictive failure analysis, API access, and unlimited data history.
- **ESG Compliance Pack**: (+ $199/month/plant) - Automated monthly carbon audits and regulatory compliance certificates.

### Tier 3: Value-Added Services
- **Energy Optimization Consulting**: Quarterly audits led by CarbonX data scientists to identify further 5-10% energy savings.
- **Carbon Credit Trading**: Facilitating the sale of verified energy savings as carbon credits, with CarbonX taking a 10% transaction fee.

## 6. Core Calculations & Formulas
### A. Transmission Loss Formula
$$Energy\,Loss\,(\%) = \left[ \frac{Gateway\,Energy - \sum Node\,Energy}{Gateway\,Energy} \right] \times 100$$
*Tiers: <2% (Optimized), 2-10% (Warning), >10% (Critical).*

### B. AI Machine Health Score (0-100)
Derived from four weighted factors (25% each):
1. **Power Stability**: Comparison of live draw vs. rated capacity.
2. **Voltage Balance**: Deviation between Phase 1, 2, and 3.
3. **Power Factor Quality**: Efficiency of power utilization (Ideal: >0.85).
4. **Thermal Safety**: Margin between current temp and critical threshold (85°C).

## 7. Technical Stack
- **Framework**: Next.js 15 (App Router) + TypeScript.
- **Backend/IoT**: Firebase (Realtime Database for live telemetry, Firestore for logs).
- **Visualization**: Recharts (High-performance industrial analytics).
- **Aesthetic**: Premium Industrial Dark Mode with High-Impact Glassmorphism.
