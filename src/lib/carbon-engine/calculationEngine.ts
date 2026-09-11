/**
 * CarbonX — Deterministic Carbon Calculation & Lineage Engine
 * Implements strict mathematical multiplication (Activity × Emission Factor = CO2e)
 * Preserves complete lineage, uncertainty intervals, and confidence scores.
 * NEVER uses LLM to invent or hallucinate emission numbers.
 */

import { getEmissionFactor } from './emissionFactors';
import type {
    ActivityCategory,
    CalculationLineage,
    ConfidenceTier,
    DataFreshness,
    ValidationStatus
} from '@/types/personal';

export interface CalculationInput {
    inputId?: string;
    category: ActivityCategory;
    activityType: string;
    factorId: string;
    value: number;
    unit?: string;
    source: string; // e.g. "Smart Meter DLMS", "Electricity Bill OCR", "Manual Commute Log"
    dataFreshness: DataFreshness;
    confidenceTierOverride?: ConfidenceTier;
    validationStatus?: ValidationStatus;
    validationNotes?: string;
    customUncertaintyPct?: number;
    isDemo?: boolean;
    timestamp?: string;
}

/**
 * Calculates CO2e deterministically and returns complete calculation lineage.
 */
export function calculateCarbonLineage(input: CalculationInput): CalculationLineage {
    const factorEntry = getEmissionFactor(input.factorId);
    const unit = input.unit || factorEntry.unit;
    const value = Math.max(0, input.value);
    const emissionFactor = factorEntry.factor;

    // Strict Deterministic Math
    const calculatedCO2e = parseFloat((value * emissionFactor).toFixed(2));

    // Uncertainty Bounds Calculation
    const uncertaintyPct = input.customUncertaintyPct ?? factorEntry.uncertaintyPct;
    const delta = (calculatedCO2e * uncertaintyPct) / 100;
    const uncertaintyMin = parseFloat(Math.max(0, calculatedCO2e - delta).toFixed(2));
    const uncertaintyMax = parseFloat((calculatedCO2e + delta).toFixed(2));

    // Confidence Calculation
    let confidence: ConfidenceTier = input.confidenceTierOverride || factorEntry.defaultConfidence;
    let confidenceScore = 85;

    if (confidence === 'HIGH') {
        confidenceScore = Math.round(92 - uncertaintyPct * 0.5);
    } else if (confidence === 'MEDIUM') {
        confidenceScore = Math.round(75 - uncertaintyPct * 0.6);
    } else {
        confidenceScore = Math.round(50 - uncertaintyPct * 0.7);
    }
    confidenceScore = Math.max(30, Math.min(99, confidenceScore));

    // Calculation Method
    let calculationMethod: CalculationLineage['calculationMethod'] = 'Deterministic Factor';
    if (input.category === 'Purchases') calculationMethod = 'EEIO Spend Inferred';
    else if (input.category === 'Travel') calculationMethod = 'Activity Distance';
    else if (input.source.toLowerCase().includes('meter')) calculationMethod = 'Direct Smart Meter';

    const formula = `${value} ${unit} × ${emissionFactor} kg CO₂e/${unit} = ${calculatedCO2e} kg CO₂e`;

    return {
        inputId: input.inputId || `inp-${Math.random().toString(36).substring(2, 9)}`,
        category: input.category,
        activityType: factorEntry.subType || input.activityType,
        value,
        unit,
        source: input.source,
        emissionFactor,
        emissionFactorSource: factorEntry.source,
        formula,
        calculatedCO2e,
        uncertaintyMin,
        uncertaintyMax,
        uncertaintyPct,
        confidence,
        confidenceScore,
        validationStatus: input.validationStatus || 'VERIFIED',
        validationNotes: input.validationNotes,
        dataFreshness: input.dataFreshness,
        calculationMethod,
        timestamp: input.timestamp || new Date().toISOString(),
        isDemo: input.isDemo ?? false,
    };
}

/**
 * Aggregates a list of activities into total CO2e and uncertainty range without false precision.
 */
export function aggregateCarbonFootprint(activities: CalculationLineage[]) {
    let totalCO2e = 0;
    let minSum = 0;
    let maxSum = 0;
    let weightedConfidenceSum = 0;

    const categoryBreakdown: Record<ActivityCategory, {
        co2e: number;
        min: number;
        max: number;
        count: number;
        sharePct: number;
        confidenceScore: number;
        freshness: DataFreshness;
    }> = {
        Travel: { co2e: 0, min: 0, max: 0, count: 0, sharePct: 0, confidenceScore: 0, freshness: 'RECENT' },
        Electricity: { co2e: 0, min: 0, max: 0, count: 0, sharePct: 0, confidenceScore: 0, freshness: 'LIVE' },
        Purchases: { co2e: 0, min: 0, max: 0, count: 0, sharePct: 0, confidenceScore: 0, freshness: 'ESTIMATED' },
        Food: { co2e: 0, min: 0, max: 0, count: 0, sharePct: 0, confidenceScore: 0, freshness: 'RECENT' },
        Lifestyle: { co2e: 0, min: 0, max: 0, count: 0, sharePct: 0, confidenceScore: 0, freshness: 'MANUAL' }
    };

    for (const act of activities) {
        totalCO2e += act.calculatedCO2e;
        minSum += act.uncertaintyMin;
        maxSum += act.uncertaintyMax;
        weightedConfidenceSum += act.confidenceScore * act.calculatedCO2e;

        const cat = categoryBreakdown[act.category];
        if (cat) {
            cat.co2e += act.calculatedCO2e;
            cat.min += act.uncertaintyMin;
            cat.max += act.uncertaintyMax;
            cat.count += 1;
            cat.confidenceScore = Math.round((cat.confidenceScore * (cat.count - 1) + act.confidenceScore) / cat.count);
        }
    }

    // Compute share %
    for (const key of Object.keys(categoryBreakdown) as ActivityCategory[]) {
        const cat = categoryBreakdown[key];
        cat.sharePct = totalCO2e > 0 ? Math.round((cat.co2e / totalCO2e) * 100) : 0;
        cat.co2e = parseFloat(cat.co2e.toFixed(1));
        cat.min = parseFloat(cat.min.toFixed(1));
        cat.max = parseFloat(cat.max.toFixed(1));
    }

    const overallConfidence = totalCO2e > 0
        ? Math.round(weightedConfidenceSum / totalCO2e)
        : 85;

    // Find top contributor
    let topCategory: ActivityCategory = 'Travel';
    let highestVal = -1;
    for (const key of Object.keys(categoryBreakdown) as ActivityCategory[]) {
        if (categoryBreakdown[key].co2e > highestVal) {
            highestVal = categoryBreakdown[key].co2e;
            topCategory = key;
        }
    }

    return {
        totalCO2e: Math.round(totalCO2e),
        uncertaintyMin: Math.round(minSum),
        uncertaintyMax: Math.round(maxSum),
        rangeFormatted: `${Math.round(minSum)}–${Math.round(maxSum)} kg CO₂e`,
        overallConfidence,
        topCategory,
        categoryBreakdown,
        activityCount: activities.length
    };
}
