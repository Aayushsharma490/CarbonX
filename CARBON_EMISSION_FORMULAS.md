# CarbonX — Master Carbon Emission Formulas & Engineering Specification

> **Platform Version:** CarbonX v4.0 (Dual-Engine Carbon Intelligence Platform)  
> **Standard Compliance:** GHG Protocol (Scope 1, 2, 3), ISO 14064, CEA India Baseline v19, IPCC AR6 Guidelines.

---

## 1. Core Deterministic Carbon Equation

Every emission in CarbonX is computed using deterministic mathematics (no LLM approximations or hallucinations):

$$\text{CO}_2\text{e Emissions (kg)} = \text{Activity Metric Value} \times \text{Certified Emission Factor } \left(\frac{\text{kg CO}_2\text{e}}{\text{Unit}}\right)$$

$$\text{Lineage Trace: } \text{Input Value} \xrightarrow{\text{Validated Unit}} \text{Factor ID} \xrightarrow{\text{Certified Authority}} \text{Deterministic Math} \xrightarrow{\pm \text{Uncertainty}} \text{Lineage Record}$$

---

## 2. Official Emission Factor Library (India-First Data Layer)

### ⚡ A. Electricity & Domestic Energy
| Activity | Factor ID | Factor ($\text{kg CO}_2\text{e/Unit}$) | Unit | Certified Source & Standard |
| :--- | :--- | :--- | :--- | :--- |
| **Grid Electricity (India Combined Margin)** | `grid_electricity_in` | **0.820** | $\text{kWh}$ | Central Electricity Authority (CEA) v19 (2023) |
| **Domestic LPG Cylinder (14.2 kg)** | `lpg_cylinder_14kg` | **21.500** | $\text{cylinder}$ | PPAC / MoPNG / IPCC AR6 |
| **LPG Consumption (Direct Mass)** | `lpg_per_kg` | **1.514** | $\text{kg}$ | IPCC Guidelines for National GHG Inventories |
| **Piped Natural Gas (PNG)** | `png_gas_scm` | **2.180** | $\text{SCM}$ | Indraprastha Gas Limited (IGL) / GAIL Standard |

#### Formulas:
$$\text{Emissions}_{\text{Grid Electricity}} = \text{Units (kWh)} \times 0.820\text{ kg CO}_2\text{e}$$
$$\text{Emissions}_{\text{LPG}} = \text{Cylinders} \times 21.50\text{ kg CO}_2\text{e}$$
$$\text{Emissions}_{\text{PNG}} = \text{SCM Consumed} \times 2.180\text{ kg CO}_2\text{e}$$

---

### 🚗 B. Travel & Transportation Modes
| Transport Mode | Factor ID | Factor ($\text{kg CO}_2\text{e/km}$) | Metric Type | Benchmark Source |
| :--- | :--- | :--- | :--- | :--- |
| **Metro Rail (Electrified Transit)** | `transport_metro` | **0.032** | per passenger-km | DMRC CDM Clean Development Mechanism |
| **Electric Two-Wheeler (EV Scooter)** | `transport_electric_2w` | **0.018** | per vehicle-km | NITI Aayog E-Amrit EV Benchmark |
| **Petrol Two-Wheeler (100–150cc)** | `transport_petrol_2w` | **0.045** | per vehicle-km | ARAI & BEE Standard (45 km/L) |
| **Auto Rickshaw (CNG)** | `transport_cng_auto` | **0.065** | per passenger-km | Centre for Science and Environment (CSE) |
| **City Public Bus (CNG / Diesel)** | `transport_city_bus` | **0.040** | per passenger-km | ASRTU Fleet Benchmark |
| **Petrol Car (Hatchback/Sedan)** | `transport_petrol_car` | **0.170** | per vehicle-km | ARAI & MoRTH (12–14 km/L city) |
| **Diesel Car / SUV** | `transport_diesel_car` | **0.190** | per vehicle-km | ARAI & MoRTH (14–16 km/L) |
| **Electric Car (Grid-Charged)** | `transport_electric_car` | **0.082** | per vehicle-km | NITI Aayog (100 Wh/km @ 0.82 kg/kWh) |
| **Domestic Air Travel (Economy)** | `transport_flight_domestic` | **0.145** | per passenger-km | ICAO Carbon Calculator & DGCA India |

#### Formulas:
$$\text{Emissions}_{\text{Petrol Car}} = \text{Distance (km)} \times 0.170\text{ kg CO}_2\text{e}$$
$$\text{Emissions}_{\text{Metro Trip}} = \text{Distance (km)} \times 0.032\text{ kg CO}_2\text{e}$$
$$\text{Emissions}_{\text{Flight}} = \text{Flight Distance (km)} \times 0.145\text{ kg CO}_2\text{e}$$

---

### 🛍️ C. Purchases & Consumption (EEIO Model)
Environmentally Extended Input-Output (EEIO) spending models calibrated to Indian market prices:

| Category | Factor ID | Factor ($\text{kg CO}_2\text{e per ₹1,000}$) | Model Basis |
| :--- | :--- | :--- | :--- |
| **Supermarket & Groceries Spend** | `spend_groceries_inr` | **1.250** | EEIO India Agricultural Matrix |
| **Apparel, Clothing & Footwear** | `spend_clothing_inr` | **2.100** | Textile Supply Chain Carbon Audit |
| **Electronics & Digital Hardware** | `spend_electronics_inr` | **3.400** | Embodied Manufacturing Protocol |
| **Dining, Cafes & Food Delivery** | `spend_dining_inr` | **1.600** | Food Services & Hospitality Model |

#### Formula:
$$\text{Emissions}_{\text{Spend}} = \left(\frac{\text{Spend Amount (INR)}}{1000}\right) \times \text{Factor}_{\text{EEIO}}$$

---

### 🥗 D. Food, Diet & Lifestyle Profiles
| Profile | Factor ID | Factor ($\text{kg CO}_2\text{e/day}$) | Source |
| :--- | :--- | :--- | :--- |
| **Non-Vegetarian (Daily Meat/Chicken)** | `diet_heavy_meat_daily` | **3.200** | ICMR & EAT-Lancet Commission |
| **Flexitarian (Occasional Fish/Poultry)**| `diet_flexitarian_daily` | **2.100** | ICMR Dietary Guidelines |
| **Lacto-Vegetarian (Standard Indian)** | `diet_vegetarian_daily` | **1.450** | ICMR / National Institute of Nutrition |
| **Plant-Based / Vegan** | `diet_vegan_daily` | **0.950** | IPCC Food Systems Standard |
| **Air Conditioner Usage (1.5T 3-Star)**| `lifestyle_ac_usage_hour` | **0.980** (per hour) | Bureau of Energy Efficiency (BEE) |
| **Municipal Solid Waste Generation** | `lifestyle_waste_daily` | **0.350** (per person/day)| Central Pollution Control Board (CPCB) |

---

## 3. Uncertainty Propagation & Confidence Scoring

No single point estimate is presented without explainable uncertainty bounds:

$$\Delta = \text{Calculated CO}_2\text{e} \times \left(\frac{\text{Uncertainty Percentage } (U\%)}{100}\right)$$

$$\text{Lower Bound} = \max(0, \text{Calculated CO}_2\text{e} - \Delta)$$
$$\text{Upper Bound} = \text{Calculated CO}_2\text{e} + \Delta$$

$$\text{Display Range: } [\text{Lower Bound} \text{ -- } \text{Upper Bound}] \text{ kg CO}_2\text{e}$$

### Confidence Score Mapping Function:
$$\text{Score}(U) = 
\begin{cases} 
\text{clamp}(30, 99, 92 - 0.5 \times U) & \text{if Confidence Tier is HIGH} \\
\text{clamp}(30, 99, 75 - 0.6 \times U) & \text{if Confidence Tier is MEDIUM} \\
\text{clamp}(30, 99, 50 - 0.7 \times U) & \text{if Confidence Tier is LOW (Spend-based)} 
\end{cases}$$

---

## 4. Machine Learning & Statistical Algorithms

### 🌲 A. Anomaly Detection (Isolation Forest & Dynamic Z-Score)
Identifies abnormal consumption spikes (e.g. uncharacteristic AC cooling spikes or anomalous travel logs):

$$\mu = \frac{1}{N}\sum_{i=1}^N x_i, \qquad \sigma = \sqrt{\frac{1}{N}\sum_{i=1}^N (x_i - \mu)^2}$$

$$Z\text{-Score} = \frac{x_{\text{entered}} - \mu}{\sigma}$$

- **Condition for Anomaly Trigger**: If $Z > 2.5$ ($99^{\text{th}}$ percentile historical deviation), flag activity with status `PENDING` and generate automated actions (`Verify`, `Edit`, `Keep`).

---

### 📈 B. 30-Day Footprint Forecasting (Gradient Boosted Momentum)
Predicts the subsequent month's total footprint using exponential time-decay weighting and seasonal trend analysis:

$$w_i = 1.2^i \quad \text{for } i \in [0, \dots, n-1]$$

$$\bar{H}_{\text{weighted}} = \frac{\sum_{i=0}^{n-1} h_i \cdot w_i}{\sum_{i=0}^{n-1} w_i}$$

$$\text{Slope} = \frac{h_{n-1} - h_{n-3}}{2}$$

$$\hat{y}_{\text{next month}} = \text{round}\Big(0.70 \times \text{Current Month CO}_2\text{e} + 0.30 \times (\bar{H}_{\text{weighted}} + \text{Slope})\Big)$$

$$\text{Forecast Bounds} = \hat{y}_{\text{next month}} \pm (0.05 \times \hat{y}_{\text{next month}})$$

---

### 🎯 C. Action Prioritization Ranking Formula
Habits and mitigation actions are ranked using an objective cost-benefit ratio:

$$\text{Priority Score} = \frac{\Delta\text{CO}_2\text{ (kg Saved/Month)} \times \text{Confidence Score}}{\text{Effort Score (1–5)} \times \text{Cost Score (1–5)}}$$

---

## 5. Multi-Member Household Allocation & Double-Counting Prevention

To prevent double-counting shared meters or family vehicles across a multi-member household:

### Allocation Rules:
1. **Individual Allocation ($100\%$ Attribution):**
   $$\text{Allocated Share} = \begin{cases} \text{Total CO}_2\text{e} & \text{if Member is Owner} \\ 0 & \text{otherwise} \end{cases}$$

2. **Shared Allocation (Equal Division):**
   $$\text{Share \%} = \frac{100\%}{N_{\text{members}}}, \qquad \text{Member CO}_2\text{e} = \text{Total CO}_2\text{e} \times \frac{\text{Share \%}}{100}$$

3. **Proportional Allocation (Custom Defined):**
   $$\text{Member CO}_2\text{e} = \text{Total CO}_2\text{e} \times \left(\frac{\text{Configured Share}_i\%}{100}\right)$$

### Integrity Audit Constraint:
$$\sum_{i=1}^{M} \text{Allocated Share}_i\% = 100\% \quad \Longrightarrow \quad \text{Double-Counting Free Verified}$$

---

## 6. Industrial Mode Telemetry & Machine Health Formulas

### ⚡ A. Active Power Calculation (3-Phase Alternating Current)
$$P_{\text{active}} (\text{kW}) = \frac{V_{\text{line}} \times I_{\text{phase}} \times \text{Power Factor (PF)} \times \sqrt{3}}{1000}$$

### 🔍 B. 3-Tier Grid Loss Forensic
$$\text{Grid Transmission Loss (kWh)} = \text{RX Master Inflow} - \sum_{k=1}^m \text{TX}_k \text{ Consumption}$$

$$\text{Loss Percentage (\%)} = \left(\frac{\text{Transmission Loss}}{\text{RX Inflow}}\right) \times 100$$

### ⚙️ C. Machine Health Score ($H \in [0, 100]$)
$$H = 100 - \Big(\text{Penalty}_{\text{Temp}} + \text{Penalty}_{\text{Overload}} + \text{Penalty}_{\text{PF Low}}\Big)$$

- **Temperature Penalty:** If $T > 75^\circ\text{C}$, $\text{Penalty}_{\text{Temp}} = (T - 75) \times 2.5$
- **Power Factor Penalty:** If $\text{PF} < 0.85$, $\text{Penalty}_{\text{PF}} = (0.85 - \text{PF}) \times 100$
- **Overload Penalty:** If $P > P_{\text{rated}}$, $\text{Penalty}_{\text{Overload}} = 25$
- **Maintenance Horizon:** $\text{Days to Maintenance} = \text{floor}\left(\frac{H}{5}\right)$

---

## 7. 8-Point Forensic Data Trust Checklist

Every calculation passes through an 8-point audit framework:
1. **Certified Emission Factor Provenance** (CEA, IPCC, ARAI, BEE certified).
2. **Deterministic Computation Lineage** ($V \times F = E$).
3. **Temporal Timestamp & Data Freshness** (`LIVE`, `RECENT`, `ESTIMATED`, `MANUAL`).
4. **Range & Sanity Boundary Verification** (Z-score $< 2.5$).
5. **Explainable Uncertainty Interval** ($95\%$ confidence bounds).
6. **Household Double-Counting Prevention** ($\sum \text{Share} = 100\%$).
7. **Scope Attribution** (GHG Protocol Scope 1, Scope 2, Scope 3).
8. **Forensic Audit Hash & Non-Hallucination Integrity**.

---
*Generated by CarbonX Carbon Intelligence Platform Architecture.*
