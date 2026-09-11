/**
 * CarbonX — Uncertainty & Confidence Explanation Engine
 * Provides transparent justification for why uncertainty bounds exist
 * and breaks down the exact contributor to range width.
 */

import type { ActivityCategory, CalculationLineage, ConfidenceTier } from '@/types/personal';

export interface UncertaintyExplanation {
    category: ActivityCategory;
    co2e: number;
    uncertaintySpanKg: number;
    uncertaintyPct: number;
    primaryDriver: string;
    confidenceLevel: ConfidenceTier;
    recommendationToNarrow: string;
}

export function explainUncertaintyRange(activities: CalculationLineage[]): {
    totalSpanKg: number;
    explanations: UncertaintyExplanation[];
    summary: string;
} {
    const categoryMap = new Map<ActivityCategory, {
        co2e: number;
        min: number;
        max: number;
        sources: Set<string>;
        hasSpendData: boolean;
        hasMeterData: boolean;
    }>();

    activities.forEach(act => {
        if (!categoryMap.has(act.category)) {
            categoryMap.set(act.category, {
                co2e: 0,
                min: 0,
                max: 0,
                sources: new Set(),
                hasSpendData: false,
                hasMeterData: false
            });
        }
        const entry = categoryMap.get(act.category)!;
        entry.co2e += act.calculatedCO2e;
        entry.min += act.uncertaintyMin;
        entry.max += act.uncertaintyMax;
        entry.sources.add(act.source);
        if (act.calculationMethod === 'EEIO Spend Inferred') entry.hasSpendData = true;
        if (act.calculationMethod === 'Direct Smart Meter') entry.hasMeterData = true;
    });

    const explanations: UncertaintyExplanation[] = [];
    let totalSpanKg = 0;

    categoryMap.forEach((val, cat) => {
        const span = Math.round(val.max - val.min);
        totalSpanKg += span;
        const pct = val.co2e > 0 ? Math.round((span / val.co2e) * 100) : 0;

        let primaryDriver = 'Standard calculation factor variance';
        let recommendation = 'Keep logging daily activities regularly';
        let confidenceLevel: ConfidenceTier = 'MEDIUM';

        if (val.hasSpendData) {
            primaryDriver = 'Top-level financial spend EEIO inference (high economic variance)';
            recommendation = 'Upload itemized digital receipts or specify exact quantity/grams instead of ₹ spend.';
            confidenceLevel = 'LOW';
        } else if (val.hasMeterData) {
            primaryDriver = 'Calibrated digital smart meter measurements';
            recommendation = 'Already at maximum precision (±4%).';
            confidenceLevel = 'HIGH';
        } else if (cat === 'Travel') {
            primaryDriver = 'Route odometer approximation and traffic congestion variance';
            recommendation = 'Log exact trip distance or commute mode to reduce uncertainty.';
            confidenceLevel = 'MEDIUM';
        } else if (cat === 'Food') {
            primaryDriver = 'Dietary intake variation & supply chain agricultural factors';
            recommendation = 'Log specific meals rather than broad monthly diet profiles.';
            confidenceLevel = 'MEDIUM';
        }

        explanations.push({
            category: cat,
            co2e: Math.round(val.co2e),
            uncertaintySpanKg: span,
            uncertaintyPct: pct,
            primaryDriver,
            confidenceLevel,
            recommendationToNarrow: recommendation
        });
    });

    // Sort by largest uncertainty span descending
    explanations.sort((a, b) => b.uncertaintySpanKg - a.uncertaintySpanKg);

    const widest = explanations[0];
    const summary = widest
        ? `Your uncertainty range (±${Math.round(totalSpanKg / 2)} kg) is primarily driven by ${widest.category} (${widest.primaryDriver}).`
        : 'Your data has high confidence with minimal uncertainty.';

    return {
        totalSpanKg,
        explanations,
        summary
    };
}
