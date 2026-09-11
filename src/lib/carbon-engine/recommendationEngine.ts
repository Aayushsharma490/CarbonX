/**
 * CarbonX — Action Recommendation Engine
 * Not a generic chatbot: uses a curated, scientifically validated action library.
 * Ranks actions using an explainable mathematical priority formula:
 * Priority Score = (CO2 Reduction * Confidence) / (Effort Score * Cost Score)
 */

import type { RecommendedAction, ActivityCategory } from '@/types/personal';

export const ACTION_LIBRARY: Omit<RecommendedAction, 'priorityScore' | 'priorityRank'>[] = [
    {
        id: 'act-metro-commute',
        title: 'Switch 4 Weekly Commutes to Metro',
        category: 'Travel',
        description: 'Take the Metro instead of a petrol car for 4 work commutes per week (approx 20 km each).',
        co2ReductionKg: 24,
        effort: 'Low',
        effortScore: 1,
        cost: 'Free',
        costScore: 1,
        confidence: 'HIGH',
        confidenceScore: 0.95,
        applicability: 'Users with car commute > 10 km in metro-connected cities'
    },
    {
        id: 'act-ac-temp-24',
        title: 'Set AC Temperature to 24°C from 20°C',
        category: 'Lifestyle',
        description: 'BEE recommendation: Increasing thermostat by 4°C saves ~24% electricity on compressor run cycles.',
        co2ReductionKg: 14,
        effort: 'Low',
        effortScore: 1,
        cost: 'Free',
        costScore: 1,
        confidence: 'HIGH',
        confidenceScore: 0.92,
        applicability: 'Households with active air conditioning in warm weather'
    },
    {
        id: 'act-plant-protein',
        title: 'Adopt 2 Plant-Powered Days per Week',
        category: 'Food',
        description: 'Replace meat/dairy-heavy meals with lentils, chickpeas, and seasonal vegetables twice weekly.',
        co2ReductionKg: 10,
        effort: 'Low',
        effortScore: 1.2,
        cost: 'Free',
        costScore: 1,
        confidence: 'HIGH',
        confidenceScore: 0.88,
        applicability: 'Non-vegetarian and flexitarian households'
    },
    {
        id: 'act-shared-carpool',
        title: 'Carpool or Shared Auto for Short Trips',
        category: 'Travel',
        description: 'Share office rides or use shared CNG autos for trips under 5 km.',
        co2ReductionKg: 9,
        effort: 'Medium',
        effortScore: 2,
        cost: 'Free',
        costScore: 1,
        confidence: 'MEDIUM',
        confidenceScore: 0.80,
        applicability: 'City commuters using solo personal vehicles'
    },
    {
        id: 'act-rooftop-solar',
        title: 'Install 2 kW Rooftop Solar Array',
        category: 'Electricity',
        description: 'Generate ~240 kWh/month clean energy under PM Surya Ghar Muft Bijli Yojana.',
        co2ReductionKg: 196,
        effort: 'High',
        effortScore: 3,
        cost: 'High',
        costScore: 3,
        confidence: 'HIGH',
        confidenceScore: 0.98,
        applicability: 'Homeowners with independent roof access'
    },
    {
        id: 'act-led-retrofit',
        title: 'Upgrade remaining CFL/Halogens to 9W LEDs',
        category: 'Electricity',
        description: 'Replace standard incandescent/CFL bulbs with high-efficiency BEE 5-star LEDs.',
        co2ReductionKg: 8,
        effort: 'Low',
        effortScore: 1,
        cost: 'Low',
        costScore: 1.5,
        confidence: 'HIGH',
        confidenceScore: 0.94,
        applicability: 'All households'
    }
];

/**
 * Computes priority score and ranks actions by explainable formula.
 */
export function getPrioritizedActions(categoryFilter?: ActivityCategory): RecommendedAction[] {
    let actions = ACTION_LIBRARY.map(action => {
        // Priority = (CO2 * Confidence) / (Effort * Cost)
        const priorityScore = parseFloat(
            ((action.co2ReductionKg * action.confidenceScore) / (action.effortScore * action.costScore)).toFixed(2)
        );

        return {
            ...action,
            priorityScore,
            priorityRank: 0
        };
    });

    if (categoryFilter) {
        actions = actions.filter(a => a.category === categoryFilter);
    }

    // Sort descending by priority score
    actions.sort((a, b) => b.priorityScore - a.priorityScore);

    // Assign 1-indexed ranks
    actions = actions.map((a, idx) => ({ ...a, priorityRank: idx + 1 }));

    return actions;
}
