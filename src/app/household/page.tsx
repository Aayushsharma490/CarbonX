'use client';

import React, { useState } from 'react';
import { usePersonalData } from '@/context/PersonalDataContext';
import { validateHouseholdDoubleCounting } from '@/lib/carbon-engine/householdEngine';
import type { HouseholdMember } from '@/types/personal';
import {
    Users, UserPlus, ShieldCheck, AlertCircle,
    CheckCircle2, Home, Zap, Car, Layers, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HouseholdPage() {
    const { householdMembers, updateHouseholdMembers, activities } = usePersonalData();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<'Family Member' | 'Roommate'>('Family Member');

    const audit = validateHouseholdDoubleCounting(householdMembers);

    const totalHouseholdKg = activities.reduce((sum, a) => sum + a.calculatedCO2e, 0);

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberName.trim()) return;

        const newCount = householdMembers.length + 1;
        const equalShare = Math.floor(100 / newCount);

        const updated = householdMembers.map(m => ({ ...m, allocatedSharePct: equalShare }));
        updated.push({
            id: `mem-${Date.now()}`,
            name: newMemberName.trim(),
            role: newMemberRole,
            avatarBg: '#8b5cf6',
            allocatedSharePct: 100 - (equalShare * (newCount - 1)),
            personalFootprintKg: 0
        });

        updateHouseholdMembers(updated);
        setNewMemberName('');
        setIsAddOpen(false);
    };

    const handleDeleteMember = (id: string) => {
        if (householdMembers.length <= 1) return;
        const filtered = householdMembers.filter(m => m.id !== id);
        const equalShare = Math.floor(100 / filtered.length);
        const updated = filtered.map((m, idx) => ({
            ...m,
            allocatedSharePct: idx === 0 ? 100 - (equalShare * (filtered.length - 1)) : equalShare
        }));
        updateHouseholdMembers(updated);
    };

    const handleUpdateShare = (id: string, newShare: number) => {
        const updated = householdMembers.map(m => m.id === id ? { ...m, allocatedSharePct: newShare } : m);
        updateHouseholdMembers(updated);
    };

    return (
        <div className="fade-in space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            Household Allocation Intelligence
                        </span>
                    </div>
                    <h1 className="page-title">Household & Multi-Member Carbon</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Allocate shared electricity and family vehicles across members without double counting.
                    </p>
                </div>

                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all shadow-xs self-start sm:self-auto"
                >
                    <UserPlus size={15} />
                    <span>Add Member</span>
                </button>
            </div>

            {/* Audit Status Banner */}
            <div className={cn(
                'p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs',
                audit.isValid
                    ? 'bg-green-50/80 border-green-200 text-green-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
            )}>
                <div className="flex items-center gap-2.5">
                    {audit.isValid ? <ShieldCheck size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-amber-600" />}
                    <span className="font-semibold">{audit.auditStatus}</span>
                </div>
                <div className="font-bold">
                    Total Share: {audit.totalSharePct}%
                </div>
            </div>

            {/* Add Member Modal / Card */}
            {isAddOpen && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-md animate-in fade-in">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Add Household Member</h3>
                    <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                            type="text"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            placeholder="Full Name"
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-green-500"
                            required
                        />
                        <select
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value as any)}
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
                        >
                            <option value="Family Member">Family Member</option>
                            <option value="Roommate">Roommate</option>
                        </select>
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800"
                            >
                                Confirm Member
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddOpen(false)}
                                className="px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Household Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {householdMembers.map(member => {
                    const allocatedFootprintKg = Math.round((totalHouseholdKg * member.allocatedSharePct) / 100);

                    return (
                        <div key={member.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-2xl text-white font-bold flex items-center justify-center text-sm shadow-xs"
                                            style={{ backgroundColor: member.avatarBg }}
                                        >
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">{member.name}</h3>
                                            <span className="text-[11px] text-gray-400 font-semibold">{member.role}</span>
                                        </div>
                                    </div>

                                    {member.role !== 'Admin' && householdMembers.length > 1 && (
                                        <button
                                            onClick={() => handleDeleteMember(member.id)}
                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50"
                                            title="Remove member"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>

                                <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-gray-400 text-[10px] uppercase font-bold block">Allocated Footprint</span>
                                        <span className="text-lg font-black text-gray-900">{allocatedFootprintKg} kg CO₂e</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-[10px] uppercase font-bold block">Shared Allocation</span>
                                        <span className="text-lg font-black text-blue-600">{member.allocatedSharePct}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Share Slider */}
                            <div className="space-y-1.5 pt-2 border-t border-gray-50">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Adjust Household Utility Share</span>
                                    <span className="font-bold text-gray-800">{member.allocatedSharePct}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={member.allocatedSharePct}
                                    onChange={(e) => handleUpdateShare(member.id, parseInt(e.target.value))}
                                    className="w-full accent-green-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Allocation Philosophy Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6">
                <div className="section-title mb-1">Double Counting Prevention Protocol</div>
                <div className="text-xs text-gray-400 mb-4">How CarbonX ensures carbon accounting mathematical rigor</div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <Home size={15} className="text-blue-600" />
                            <span>1. Shared Utility Meters</span>
                        </div>
                        <p className="text-gray-500 leading-relaxed">
                            Whole-home electricity bills (e.g. 240 kWh) are split according to member percentages, ensuring exactly 100% total attribution.
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <Car size={15} className="text-emerald-600" />
                            <span>2. Shared Family Vehicles</span>
                        </div>
                        <p className="text-gray-500 leading-relaxed">
                            Joint vehicle trips can be allocated either proportionally or assigned 100% to the specific commuter who made the trip.
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <ShieldCheck size={15} className="text-purple-600" />
                            <span>3. Personal Independence</span>
                        </div>
                        <p className="text-gray-500 leading-relaxed">
                            Individual food and shopping logs remain strictly personal to each member and are never blended into shared bills.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
