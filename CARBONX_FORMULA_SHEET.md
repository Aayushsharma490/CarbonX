# CarbonX: Industrial Calculation Protocol (Official Formula Sheet)

This document defines the mathematical logic for the CarbonX platform using standard industrial notation.

---

## 1. Transmission Efficiency (Grid Loss)

### A. Energy Loss Percentage ($L_{grid}$)
Calculates the "upon" ratio of lost energy relative to the source.

$$ L_{grid} = \frac{E_{RX} - \sum E_{TX}}{E_{RX}} \times 100 $$

**Where:**
*   $E_{RX}$ = Total Energy at Gateway (Main Meter) in kWh.
*   $\sum E_{TX}$ = Sum of all Machine Node energy in kWh.

### B. Classification Tiers
*   **Optimized:** $< 2.0\%$
*   **Warning:** $2.0\% - 10.0\%$
*   **Critical:** $> 10.0\%$

---

## 2. AI Machine Health Score ($H_{total}$)
Total score derived from four vectors (25% weight each).

### A. Power Stability ($V_{P}$)
$$ V_{P} = \frac{P_{live}}{P_{target}} \times 100 $$
*(Capped at 100)*

### B. Voltage Balance ($V_{V}$)
Measures deviation from 400V nominal industrial standard.

$$ V_{avg} = \frac{V_{L1} + V_{L2} + V_{L3}}{3} $$
$$ \delta = \max(|V_{L1} - V_{avg}|, |V_{L2} - V_{avg}|, |V_{L3} - V_{avg}|) $$
$$ V_{V} = 100 - \left( \frac{\delta}{400} \times 100 \right) \times 10 $$

### C. Power Factor Quality ($V_{PF}$)
$$ V_{PF} = \frac{PF_{current}}{0.85} \times 80 $$
*(If $PF \ge 0.85$, $V_{PF} = 100$)*

### D. Thermal Safety ($V_{T}$)
Protection margin against motor burnout.

$$ V_{T} = 100 - \left( \frac{Temp_{current} - 85}{110 - 85} \times 100 \right) $$
*(If $Temp \le 85$, $V_{T} = 100$; If $Temp \ge 110$, $V_{T} = 0$)*

### E. Final Health Formula
$$ H_{total} = (V_{P} \times 0.25) + (V_{V} \times 0.25) + (V_{PF} \times 0.25) + (V_{T} \times 0.25) $$

---

## 3. Carbon Forensics ($C_{total}$)
Based on Indian Grid Emission Intensity (0.82 kg/kWh).

$$ C_{total} = kWh \times 0.82 $$

---

## 4. Operational Constants
| Constant | Value | Description |
| :--- | :--- | :--- |
| $V_{nominal}$ | $400V$ | Nominal 3-Phase Industrial Voltage |
| $PF_{min}$ | $0.85$ | Minimum Target Power Factor |
| $T_{limit}$ | $85^\circ\text{C}$ | Safe Temperature Threshold |
| $F_{carbon}$ | $0.82$ | Carbon Intensity Factor (India) |
