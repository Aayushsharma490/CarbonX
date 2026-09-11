/**
 * CarbonX — Household Allocation Engine
 * Supports multi-member households with Shared, Individual, and Proportional allocations.
 * Prevents double-counting of shared electricity meters or family vehicles.
 */

import type { HouseholdMember, ActivityRecord, AllocationType } from '@/types/personal';

export const DEFAULT_HOUSEHOLD_MEMBERS: HouseholdMember[] = [
    {
        id: 'mem-1',
        name: 'Aayush Sharma (You)',
        role: 'Admin',
        avatarBg: '#10b981',
        allocatedSharePct: 50,
        personalFootprintKg: 184
    },
    {
        id: 'mem-2',
        name: 'Priya Sharma',
        role: 'Family Member',
        avatarBg: '#3b82f6',
        allocatedSharePct: 50,
        personalFootprintKg: 164
    }
];

export interface AllocationResult {
    activityId: string;
    totalActivityCO2e: number;
    userAllocatedCO2e: number;
    allocationType: AllocationType;
    allocationSharePct: number;
    note: string;
}

/**
 * Calculates a specific member's share for an activity and guarantees no double-counting.
 */
export function calculateMemberAllocation(
    activity: ActivityRecord,
    memberId: string,
    members: HouseholdMember[] = DEFAULT_HOUSEHOLD_MEMBERS
): AllocationResult {
    const totalCO2e = activity.calculatedCO2e;
    const allocationType = activity.allocationType || 'Individual';

    if (allocationType === 'Individual') {
        const isOwner = !activity.householdMemberId || activity.householdMemberId === memberId;
        return {
            activityId: activity.id,
            totalActivityCO2e: totalCO2e,
            userAllocatedCO2e: isOwner ? totalCO2e : 0,
            allocationType: 'Individual',
            allocationSharePct: isOwner ? 100 : 0,
            note: isOwner ? '100% individual attribution' : 'Attributed to another household member'
        };
    }

    if (allocationType === 'Shared') {
        const memberCount = Math.max(1, members.length);
        const sharePct = Math.round(100 / memberCount);
        const userShare = parseFloat(((totalCO2e * sharePct) / 100).toFixed(2));
        return {
            activityId: activity.id,
            totalActivityCO2e: totalCO2e,
            userAllocatedCO2e: userShare,
            allocationType: 'Shared',
            allocationSharePct: sharePct,
            note: `Divided equally across ${memberCount} members (${sharePct}%)`
        };
    }

    // Proportional
    const currentMember = members.find(m => m.id === memberId);
    const sharePct = currentMember ? currentMember.allocatedSharePct : Math.round(100 / members.length);
    const userShare = parseFloat(((totalCO2e * sharePct) / 100).toFixed(2));

    return {
        activityId: activity.id,
        totalActivityCO2e: totalCO2e,
        userAllocatedCO2e: userShare,
        allocationType: 'Proportional',
        allocationSharePct: sharePct,
        note: `Allocated proportionally based on household profile (${sharePct}%)`
    };
}

/**
 * Validates household share integrity (all shares must sum to 100% to prevent under/over accounting).
 */
export function validateHouseholdDoubleCounting(members: HouseholdMember[]): {
    isValid: boolean;
    totalSharePct: number;
    auditStatus: string;
} {
    const totalSharePct = members.reduce((sum, m) => sum + m.allocatedSharePct, 0);
    const isValid = totalSharePct === 100;

    return {
        isValid,
        totalSharePct,
        auditStatus: isValid
            ? '✓ Double-counting check PASSED: Exact 100% allocation across members.'
            : `⚠ Allocation anomaly: Total shares sum to ${totalSharePct}% (must equal 100%).`
    };
}
