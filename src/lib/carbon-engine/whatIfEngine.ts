/**
 * CarbonX — What-If Simulation Engine
 * Computes scenario footprints dynamically based on parameter adjustments.
 * Clearly labels all scenario results as simulation estimates.
 */

import type { WhatIfSlider } from '@/types/personal';

export const DEFAULT_WHAT_IF_SLIDERS: WhatIfSlider[] = [
    {
        id: 'car-km',
        label: 'Petrol Car Driving',
        category: 'Travel',
        unit: 'km/month',
        currentValue: 320,
        scenarioValue: 320,
        min: 0,
        max: 800,
        step: 20,
        reductionFactorKgPerUnit: 0.170, // 0.17 kg CO2 / km
        description: 'Reducing car mileage by shifting to metro or carpooling'
    },
    {
        id: 'metro-km',
        label: 'Metro Rail Travel',
        category: 'Travel',
        unit: 'km/month',
        currentValue: 80,
        scenarioValue: 80,
        min: 0,
        max: 500,
        step: 20,
        reductionFactorKgPerUnit: -0.032, // negative since increasing metro adds low-emission kms
        description: 'Electrified mass transit replacement for road transport'
    },
    {
        id: 'ac-hours',
        label: 'AC Daily Usage',
        category: 'Lifestyle',
        unit: 'hours/day',
        currentValue: 7,
        scenarioValue: 7,
        min: 0,
        max: 18,
        step: 1,
        reductionFactorKgPerUnit: 0.98 * 30, // ~29.4 kg/month per daily hour
        description: 'Optimizing thermostat and running fans during cooler night hours'
    },
    {
        id: 'grid-kwh',
        label: 'Grid Electricity Consumption',
        category: 'Electricity',
        unit: 'kWh/month',
        currentValue: 240,
        scenarioValue: 240,
        min: 50,
        max: 600,
        step: 10,
        reductionFactorKgPerUnit: 0.82, // 0.82 kg/kWh
        description: 'Overall household electrical efficiency and rooftop solar'
    },
    {
        id: 'shopping-spend',
        label: 'Apparel & Online Shopping',
        category: 'Purchases',
        unit: '₹1,000/mo',
        currentValue: 8,
        scenarioValue: 8,
        min: 0,
        max: 30,
        step: 1,
        reductionFactorKgPerUnit: 2.10, // ~2.1 kg per ₹1,000
        description: 'Mindful consumption, circular fashion, and repairing electronics'
    },
    {
        id: 'meat-days',
        label: 'Non-Vegetarian Meal Days',
        category: 'Food',
        unit: 'days/month',
        currentValue: 12,
        scenarioValue: 12,
        min: 0,
        max: 30,
        step: 1,
        reductionFactorKgPerUnit: 1.75, // difference between meat vs veg day
        description: 'Replacing non-veg meals with protein-rich plant alternatives'
    }
];

export interface WhatIfSimulationResult {
    baselineKg: number;
    scenarioKg: number;
    totalReductionKg: number;
    targetKg: number;
    targetGapKg: number;
    isTargetAchieved: boolean;
    categoryDeltas: Record<string, number>;
}

export function calculateWhatIfScenario(
    sliders: WhatIfSlider[],
    baselineKg: number,
    targetKg: number = 300
): WhatIfSimulationResult {
    let totalReductionKg = 0;
    const categoryDeltas: Record<string, number> = {};

    sliders.forEach(slider => {
        const deltaUnits = slider.currentValue - slider.scenarioValue;
        const reduction = deltaUnits * slider.reductionFactorKgPerUnit;
        totalReductionKg += reduction;

        categoryDeltas[slider.category] = (categoryDeltas[slider.category] || 0) + reduction;
    });

    const scenarioKg = Math.max(0, Math.round(baselineKg - totalReductionKg));
    const targetGapKg = scenarioKg - targetKg;
    const isTargetAchieved = scenarioKg <= targetKg;

    return {
        baselineKg: Math.round(baselineKg),
        scenarioKg,
        totalReductionKg: Math.round(totalReductionKg),
        targetKg,
        targetGapKg: Math.round(targetGapKg),
        isTargetAchieved,
        categoryDeltas
    };
}
