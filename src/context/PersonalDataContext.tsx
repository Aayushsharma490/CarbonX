'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
    ActivityCategory,
    ActivityRecord,
    AnomalyReport,
    CarbonTarget,
    HouseholdMember,
    MLPrediction,
    WhatIfSlider,
    DataFreshness
} from '@/types/personal';
import { calculateCarbonLineage, aggregateCarbonFootprint } from '@/lib/carbon-engine/calculationEngine';
import { validateActivityInput } from '@/lib/carbon-engine/validationEngine';
import { detectActivityAnomalies, predictNextPeriodFootprint } from '@/lib/carbon-engine/mlEngine';
import { DEFAULT_WHAT_IF_SLIDERS, calculateWhatIfScenario } from '@/lib/carbon-engine/whatIfEngine';
import { DEFAULT_HOUSEHOLD_MEMBERS } from '@/lib/carbon-engine/householdEngine';
import { evaluateDataTrust } from '@/lib/carbon-engine/dataTrustEngine';

interface PersonalDataContextType {
    activities: ActivityRecord[];
    target: CarbonTarget;
    householdMembers: HouseholdMember[];
    sliders: WhatIfSlider[];
    selectedLineageActivity: ActivityRecord | null;
    anomalies: AnomalyReport[];
    summary: ReturnType<typeof aggregateCarbonFootprint>;
    mlPrediction: MLPrediction;
    dataTrustReport: ReturnType<typeof evaluateDataTrust>;
    addActivity: (input: {
        category: ActivityCategory;
        activityType: string;
        factorId: string;
        value: number;
        unit?: string;
        source: string;
        dataFreshness: DataFreshness;
        householdMemberId?: string;
        allocationType?: 'Shared' | 'Individual' | 'Proportional';
        isDemo?: boolean;
    }) => { success: boolean; flagged?: boolean; message?: string; record?: ActivityRecord };
    deleteActivity: (id: string) => void;
    updateActivityValidation: (id: string, status: 'VERIFIED' | 'FLAGGED' | 'MANUAL_OVERRIDE') => void;
    resolveAnomaly: (activityId: string, action: 'VERIFY' | 'EDIT' | 'DISMISS', updatedValue?: number) => void;
    updateTarget: (updates: Partial<CarbonTarget>) => void;
    updateHouseholdMembers: (members: HouseholdMember[]) => void;
    updateSlider: (sliderId: string, value: number) => void;
    resetSliders: () => void;
    setSelectedLineageActivity: (act: ActivityRecord | null) => void;
    resetToDemoData: () => void;
    hasDemoData: boolean;
}

const PersonalDataContext = createContext<PersonalDataContextType | undefined>(undefined);

// ── Realistic Initial Seed Data (India Urban Profile — Clearly Marked as Demo/Baseline) ──
const INITIAL_DEMO_ACTIVITIES: ActivityRecord[] = [
    // 1. Travel (Transport is Top Contributor: ~140 kg)
    {
        ...calculateCarbonLineage({
            category: 'Travel',
            activityType: 'Petrol Car Commute (City)',
            factorId: 'transport_petrol_car',
            value: 650,
            unit: 'km',
            source: 'Manual Trip Tracker',
            dataFreshness: 'RECENT',
            isDemo: true
        }),
        id: 'act-demo-1',
        userId: 'usr-demo',
        title: 'Daily City Car Commute (650 km/mo)',
        allocationType: 'Individual'
    },
    {
        ...calculateCarbonLineage({
            category: 'Travel',
            activityType: 'Metro Rail Commute',
            factorId: 'transport_metro',
            value: 120,
            unit: 'km',
            source: 'Metro Smart Card Transit Log',
            dataFreshness: 'RECENT',
            isDemo: true
        }),
        id: 'act-demo-2',
        userId: 'usr-demo',
        title: 'Metro Rail Travel (120 km)',
        allocationType: 'Individual'
    },
    {
        ...calculateCarbonLineage({
            category: 'Travel',
            activityType: 'Auto Rickshaw (CNG)',
            factorId: 'transport_cng_auto',
            value: 40,
            unit: 'km',
            source: 'Ride Hailing Digital Receipt',
            dataFreshness: 'RECENT',
            isDemo: true
        }),
        id: 'act-demo-3',
        userId: 'usr-demo',
        title: 'CNG Auto Short Rides (40 km)',
        allocationType: 'Individual'
    },

    // 2. Electricity (~105 kg)
    {
        ...calculateCarbonLineage({
            category: 'Electricity',
            activityType: 'Grid Electricity Consumption',
            factorId: 'grid_electricity_in',
            value: 110, // User share of 220 kWh bill
            unit: 'kWh',
            source: 'Smart Meter DLMS Direct Reading',
            dataFreshness: 'LIVE',
            isDemo: true
        }),
        id: 'act-demo-4',
        userId: 'usr-demo',
        title: 'Grid Power (Household Share)',
        allocationType: 'Shared',
        allocationSharePct: 50
    },
    {
        ...calculateCarbonLineage({
            category: 'Electricity',
            activityType: 'Domestic LPG Cylinder',
            factorId: 'lpg_cylinder_14kg',
            value: 0.5, // half cylinder per month share
            unit: 'cylinder',
            source: 'Indane Gas Delivery Receipt',
            dataFreshness: 'RECENT',
            isDemo: true
        }),
        id: 'act-demo-5',
        userId: 'usr-demo',
        title: 'LPG Cooking Gas (0.5 Cyl)',
        allocationType: 'Shared',
        allocationSharePct: 50
    },

    // 3. Purchases (~45 kg)
    {
        ...calculateCarbonLineage({
            category: 'Purchases',
            activityType: 'Supermarket & Groceries Spend',
            factorId: 'spend_groceries_inr',
            value: 16, // ₹16,000
            unit: '₹1,000',
            source: 'Bank Spend Aggregation (EEIO)',
            dataFreshness: 'ESTIMATED',
            isDemo: true
        }),
        id: 'act-demo-6',
        userId: 'usr-demo',
        title: 'Monthly Supermarket Spend (₹16k)',
        allocationType: 'Shared'
    },
    {
        ...calculateCarbonLineage({
            category: 'Purchases',
            activityType: 'Apparel & Footwear Purchases',
            factorId: 'spend_clothing_inr',
            value: 6, // ₹6,000
            unit: '₹1,000',
            source: 'Online Shopping Receipt OCR',
            dataFreshness: 'ESTIMATED',
            isDemo: true
        }),
        id: 'act-demo-7',
        userId: 'usr-demo',
        title: 'Clothing & Footwear Purchases (₹6k)',
        allocationType: 'Individual'
    },

    // 4. Food (~38 kg)
    {
        ...calculateCarbonLineage({
            category: 'Food',
            activityType: 'Standard Indian Lacto-Vegetarian Diet',
            factorId: 'diet_vegetarian_daily',
            value: 20,
            unit: 'days',
            source: 'Dietary Preference Profile',
            dataFreshness: 'RECENT',
            isDemo: true
        }),
        id: 'act-demo-8',
        userId: 'usr-demo',
        title: 'Vegetarian Meal Days (20 days)',
        allocationType: 'Individual'
    },
    {
        ...calculateCarbonLineage({
            category: 'Food',
            activityType: 'Flexitarian Diet (Occasional Non-Veg)',
            factorId: 'diet_flexitarian_daily',
            value: 10,
            unit: 'days',
            source: 'Dietary Preference Profile',
            dataFreshness: 'RECENT',
            isDemo: true
        }),
        id: 'act-demo-9',
        userId: 'usr-demo',
        title: 'Flexitarian / Dining Out Days (10 days)',
        allocationType: 'Individual'
    },

    // 5. Lifestyle (~20 kg)
    {
        ...calculateCarbonLineage({
            category: 'Lifestyle',
            activityType: 'Air Conditioning (1.5T Inverter)',
            factorId: 'lifestyle_ac_usage_hour',
            value: 18,
            unit: 'hours',
            source: 'Smart AC IoT Controller Log',
            dataFreshness: 'MANUAL',
            isDemo: true
        }),
        id: 'act-demo-10',
        userId: 'usr-demo',
        title: 'Bedroom AC (Night Eco Mode, 18 hrs logged)',
        allocationType: 'Individual'
    }
];

const INITIAL_TARGET: CarbonTarget = {
    monthlyTargetKg: 300,
    currentFootprintKg: 348,
    uncertaintyMinKg: 332,
    uncertaintyMaxKg: 361,
    targetYear: 2026,
    baselineYear: 2025,
    baselineFootprintKg: 390,
    reductionPctGoal: 23,
    projectedEndMonthKg: 335
};

export function PersonalDataProvider({ children }: { children: React.ReactNode }) {
    const [activities, setActivities] = useState<ActivityRecord[]>(INITIAL_DEMO_ACTIVITIES);
    const [target, setTargetState] = useState<CarbonTarget>(INITIAL_TARGET);
    const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>(DEFAULT_HOUSEHOLD_MEMBERS);
    const [sliders, setSliders] = useState<WhatIfSlider[]>(DEFAULT_WHAT_IF_SLIDERS);
    const [selectedLineageActivity, setSelectedLineageActivity] = useState<ActivityRecord | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('carbonx_personal_activities');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setActivities(parsed);
                }
            } catch (e) {
                console.error('Failed to load personal activities from localStorage', e);
            }
        }
        setInitialized(true);
    }, []);

    useEffect(() => {
        if (initialized) {
            localStorage.setItem('carbonx_personal_activities', JSON.stringify(activities));
        }
    }, [activities, initialized]);

    // Footprint Summary
    const summary = useMemo(() => {
        return aggregateCarbonFootprint(activities);
    }, [activities]);

    // Sync target with summary
    useEffect(() => {
        setTargetState(prev => ({
            ...prev,
            currentFootprintKg: summary.totalCO2e,
            uncertaintyMinKg: summary.uncertaintyMin,
            uncertaintyMaxKg: summary.uncertaintyMax
        }));
    }, [summary]);

    // ML Predictions
    const mlPrediction = useMemo(() => {
        return predictNextPeriodFootprint([380, 365, 355, 348], summary.totalCO2e);
    }, [summary.totalCO2e]);

    // ML Anomalies
    const anomalies = useMemo(() => {
        return detectActivityAnomalies(activities);
    }, [activities]);

    // Data Trust Report
    const dataTrustReport = useMemo(() => {
        return evaluateDataTrust(activities);
    }, [activities]);

    const hasDemoData = useMemo(() => {
        return activities.some(a => a.isDemo);
    }, [activities]);

    const addActivity = (input: {
        category: ActivityCategory;
        activityType: string;
        factorId: string;
        value: number;
        unit?: string;
        source: string;
        dataFreshness: DataFreshness;
        householdMemberId?: string;
        allocationType?: 'Shared' | 'Individual' | 'Proportional';
        isDemo?: boolean;
    }) => {
        // Run validation engine
        const validation = validateActivityInput({
            category: input.category,
            activityType: input.activityType,
            value: input.value,
            unit: input.unit || 'unit',
            existingActivities: activities,
            source: input.source
        });

        if (!validation.isValid && validation.severity === 'critical') {
            return {
                success: false,
                flagged: true,
                message: validation.message || 'Validation failed: Invalid input value.'
            };
        }

        const lineage = calculateCarbonLineage({
            category: input.category,
            activityType: input.activityType,
            factorId: input.factorId,
            value: input.value,
            unit: input.unit,
            source: input.source,
            dataFreshness: input.dataFreshness,
            validationStatus: validation.status,
            validationNotes: validation.message,
            isDemo: input.isDemo ?? false
        });

        const newRecord: ActivityRecord = {
            ...lineage,
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            userId: 'usr-current',
            title: `${input.activityType} (${input.value} ${lineage.unit})`,
            householdMemberId: input.householdMemberId || 'mem-1',
            allocationType: input.allocationType || 'Individual'
        };

        setActivities(prev => [newRecord, ...prev]);

        return {
            success: true,
            flagged: validation.status === 'FLAGGED',
            message: validation.message,
            record: newRecord
        };
    };

    const deleteActivity = (id: string) => {
        setActivities(prev => prev.filter(a => a.id !== id));
        if (selectedLineageActivity?.id === id) {
            setSelectedLineageActivity(null);
        }
    };

    const updateActivityValidation = (id: string, status: 'VERIFIED' | 'FLAGGED' | 'MANUAL_OVERRIDE') => {
        setActivities(prev => prev.map(a => a.id === id ? { ...a, validationStatus: status } : a));
    };

    const resolveAnomaly = (activityId: string, action: 'VERIFY' | 'EDIT' | 'DISMISS', updatedValue?: number) => {
        if (action === 'DISMISS' || action === 'VERIFY') {
            updateActivityValidation(activityId, 'VERIFIED');
        } else if (action === 'EDIT' && typeof updatedValue === 'number') {
            setActivities(prev => prev.map(a => {
                if (a.id === activityId) {
                    const recalculated = calculateCarbonLineage({
                        category: a.category,
                        activityType: a.activityType,
                        factorId: a.inputId,
                        value: updatedValue,
                        unit: a.unit,
                        source: a.source,
                        dataFreshness: a.dataFreshness,
                        validationStatus: 'VERIFIED'
                    });
                    return {
                        ...a,
                        ...recalculated,
                        value: updatedValue,
                        title: `${a.activityType} (${updatedValue} ${a.unit})`
                    };
                }
                return a;
            }));
        }
    };

    const updateTarget = (updates: Partial<CarbonTarget>) => {
        setTargetState(prev => ({ ...prev, ...updates }));
    };

    const updateHouseholdMembers = (members: HouseholdMember[]) => {
        setHouseholdMembers(members);
    };

    const updateSlider = (sliderId: string, value: number) => {
        setSliders(prev => prev.map(s => s.id === sliderId ? { ...s, scenarioValue: value } : s));
    };

    const resetSliders = () => {
        setSliders(prev => prev.map(s => ({ ...s, scenarioValue: s.currentValue })));
    };

    const resetToDemoData = () => {
        setActivities(INITIAL_DEMO_ACTIVITIES);
        setSliders(DEFAULT_WHAT_IF_SLIDERS);
    };

    return (
        <PersonalDataContext.Provider value={{
            activities,
            target,
            householdMembers,
            sliders,
            selectedLineageActivity,
            anomalies,
            summary,
            mlPrediction,
            dataTrustReport,
            addActivity,
            deleteActivity,
            updateActivityValidation,
            resolveAnomaly,
            updateTarget,
            updateHouseholdMembers,
            updateSlider,
            resetSliders,
            setSelectedLineageActivity,
            resetToDemoData,
            hasDemoData
        }}>
            {children}
        </PersonalDataContext.Provider>
    );
}

export function usePersonalData() {
    const context = useContext(PersonalDataContext);
    if (!context) {
        throw new Error('usePersonalData must be used within a PersonalDataProvider');
    }
    return context;
}
