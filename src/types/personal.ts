/**
 * CarbonX — Personal Carbon Intelligence Types
 * Supports calculation lineage, uncertainty, confidence, validation, ML forecasting,
 * recommendations, what-if simulations, and household allocation.
 */

export type ActivityCategory = 'Travel' | 'Electricity' | 'Purchases' | 'Food' | 'Lifestyle';

export type DataFreshness = 'LIVE' | 'RECENT' | 'ESTIMATED' | 'MANUAL';

export type ConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW';

export type ValidationStatus = 'VERIFIED' | 'FLAGGED' | 'MANUAL_OVERRIDE';

export type AllocationType = 'Shared' | 'Individual' | 'Proportional';

export interface CalculationLineage {
    inputId: string;
    category: ActivityCategory;
    activityType: string;
    value: number;
    unit: string;
    source: string;
    emissionFactor: number;
    emissionFactorSource: string;
    formula: string;
    calculatedCO2e: number;
    uncertaintyMin: number;
    uncertaintyMax: number;
    uncertaintyPct: number;
    confidence: ConfidenceTier;
    confidenceScore: number; // 0–100
    validationStatus: ValidationStatus;
    validationNotes?: string;
    dataFreshness: DataFreshness;
    calculationMethod: 'Deterministic Factor' | 'EEIO Spend Inferred' | 'Activity Distance' | 'Direct Smart Meter';
    timestamp: string;
    isDemo?: boolean;
}

export interface ActivityRecord extends CalculationLineage {
    id: string;
    userId: string;
    title: string;
    description?: string;
    householdMemberId?: string;
    allocationType?: AllocationType;
    allocationSharePct?: number; // 100 for individual, or split share
}

export interface ValidationResult {
    isValid: boolean;
    status: ValidationStatus;
    severity?: 'info' | 'warning' | 'critical';
    message?: string;
    suggestedValue?: number;
    historicalAverage?: number;
    deviationScore?: number;
}

export interface AnomalyReport {
    activityId: string;
    activityTitle: string;
    category: ActivityCategory;
    enteredValue: number;
    unit: string;
    historicalMean: number;
    historicalStdDev: number;
    zScore: number;
    flagReason: string;
    status: 'PENDING' | 'VERIFIED' | 'EDITED' | 'DISMISSED';
    detectedAt: string;
}

export interface MLPrediction {
    period: string; // e.g. "October 2026"
    predictedCO2e: number;
    lowerBoundCO2e: number;
    upperBoundCO2e: number;
    confidencePct: number;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    topFactor: string;
    historicalBaseline: number;
    isSeedModel: boolean;
}

export interface RecommendedAction {
    id: string;
    title: string;
    category: ActivityCategory;
    description: string;
    co2ReductionKg: number;
    effort: 'Low' | 'Medium' | 'High'; // Low = 1, Med = 2, High = 3
    effortScore: number; // 1, 2, 3
    cost: 'Free' | 'Low' | 'Medium' | 'High';
    costScore: number; // 1, 2, 3
    confidence: ConfidenceTier;
    confidenceScore: number; // 0.6 - 1.0
    priorityScore: number; // (co2Reduction * confidenceScore) / (effortScore * costScore)
    priorityRank: number;
    applicability: string;
    isImplemented?: boolean;
}

export interface WhatIfSlider {
    id: string;
    label: string;
    category: ActivityCategory;
    unit: string;
    currentValue: number;
    scenarioValue: number;
    min: number;
    max: number;
    step: number;
    reductionFactorKgPerUnit: number;
    description: string;
}

export interface CarbonTarget {
    monthlyTargetKg: number;
    currentFootprintKg: number;
    uncertaintyMinKg: number;
    uncertaintyMaxKg: number;
    targetYear: number;
    baselineYear: number;
    baselineFootprintKg: number;
    reductionPctGoal: number;
    projectedEndMonthKg: number;
}

export interface HouseholdMember {
    id: string;
    name: string;
    role: 'Admin' | 'Family Member' | 'Roommate';
    avatarBg: string;
    allocatedSharePct: number; // default share for shared bills
    personalFootprintKg: number;
}

export interface DataTrustMetric {
    id: string;
    label: string;
    passed: boolean;
    score: number; // 0-100
    description: string;
    standard: string;
}
