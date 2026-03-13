# CarbonX Telemetry Formulas & Mapping

This document explains how raw data from Firebase (TX1) and CSV (TX2) is transformed into the metrics displayed on the CarbonX Dashboard.

## 1. Raw Data Mapping

The following table shows how raw fields from the data sources are mapped to internal system properties.

| Firebase / CSV Key | Internal Property | Description |
|-------------------|-------------------|-------------|
| `Time` / `timestamp` | `timestamp` | ISO format timestamp of the reading |
| `CO2` / `ppm` | `ppm` | Carbon Dioxide levels in Parts Per Million |
| `Temp` / `temperature` | `temperature` | Operating temperature in Celcius |
| `Vib` / `vibration` | `vibration` | RMS Vibration velocity in mm/s |
| `R_V`, `Y_V`, `B_V` | `phaseVoltages` | 3-Phase Voltages (L1, L2, L3) |
| `R_A`, `Y_A`, `B_A` | `phaseCurrents` | 3-Phase Currents (L1, L2, L3) |
| `active_power_kw` | `currentKw` | Live power draw in kilowatts |
| `PF` | `powerFactor` | Power Factor (0.0 to 1.0) |
| `kwh` | `kwh` | Total Energy consumption in kilowatt-hours |

## 2. Core Calculations

### A. Transmission Loss (RX vs TX)
This calculates the energy lost between the Main Receiver (RX) and the individual Machine Nodes (TX).

**Formula:**
$$Loss\% = \frac{RX_{total\_kwh} - \sum TX_{kwh}}{RX_{total\_kwh}} \times 100$$

*   **No Loss:** < 2%
*   **Acceptable:** 2% - 10%
*   **Critical:** > 10%

### B. Machine/Motor Health Score (0-100)
A holistic score derived from four key factors, each contributing 25%.

**1. Power Stability (25%)**
Calculated by comparing current draw vs. ideal capacity.
$$Score = \min(100, \frac{currentKw}{ratedKw} \times 100)$$

**2. Voltage Balance (25%)**
Measures the deviation between phases. High imbalance causes motor over-heating.
$$AvgV = \frac{L1_V + L2_V + L3_V}{3}$$
$$MaxDev = \max(|L1_V - AvgV|, |L2_V - AvgV|, |L3_V - AvgV|)$$
$$Score = \max(0, 100 - (\frac{MaxDev}{400} \times 100) \times 10)$$

**3. Power Factor Quality (25%)**
$$Score = PF \ge 0.85 \text{ ? } 100 : (\frac{PF}{0.85} \times 80)$$

**4. Temperature Safety (25%)**
$$Score = Temp \le 85^\circ\text{C} \text{ ? } 100 : \max(0, 100 - \frac{Temp - 85}{110 - 85} \times 100)$$

**Final Health Score:**
$$Health = (PowerStable \times 0.25) + (VoltageBal \times 0.25) + (PF \times 0.25) + (Temp \times 0.25)$$

### C. Carbon Footprint
Converts energy consumption into CO2 equivalent using the Indian Grid Emission Factor.

**Formula:**
$$CO_2(kg) = kWh \times 0.82$$

## 3. Real-time Simulation (TX-2)
For simulation purposes, TX-2 data is sampled from `jms_eboot_sara_daily.csv` every 5 seconds with a ±5% random jitter applied to `currentKw` and `temperature` to simulate live fluctuations.
