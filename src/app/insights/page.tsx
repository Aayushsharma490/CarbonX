'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePersonalData } from '@/context/PersonalDataContext';
import { getPrioritizedActions } from '@/lib/carbon-engine/recommendationEngine';
import { ActionPriorityCard } from '@/components/personal/ActionPriorityCard';
import type { ActivityCategory, RecommendedAction } from '@/types/personal';
import {
    Lightbulb, Sparkles, Filter, ArrowRight,
    TrendingDown, CheckCircle2, ShieldCheck, Zap,
    Sliders, HelpCircle, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES: { key: 'ALL' | ActivityCategory; label: string }[] = [
    { key: 'ALL', label: 'All Categories' },
    { key: 'Travel', label: 'Travel & Commute' },
    { key: 'Electricity', label: 'Electricity' },
    { key: 'Food', label: 'Food & Diet' },
    { key: 'Lifestyle', label: 'Lifestyle & AC' }
];

export default function InsightsPage() {
    const router = useRouter();
    const { summary } = usePersonalData();
    const [selectedCategory, setSelectedCategory] = useState<'ALL' | ActivityCategory>('ALL');

    const actions = getPrioritizedActions(selectedCategory === 'ALL' ? undefined : selectedCategory);

    const totalPotentialReduction = actions.reduce((sum, a) => sum + a.co2ReductionKg, 0);

    return (
        <div className="fade-in space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            Explainable Recommendation Engine
                        </span>
                    </div>
                    <h1 className="page-title">Prioritized Climate Actions</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Actions ranked mathematically by: Priority = (CO₂ Reduction × Confidence) ÷ (Effort × Cost).
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-2xl border border-gray-100 flex items-center gap-2 text-xs">
                        <span className="text-gray-400 font-bold uppercase">Total Reduction Potential:</span>
                        <span className="font-black text-green-700 text-sm">-{totalPotentialReduction} kg CO₂e</span>
                    </div>
                </div>
            </div>

            {/* Explainer Banner */}
            <div className="bg-gradient-to-r from-green-900 to-emerald-950 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-green-300">
                        <Sparkles size={13} />
                        Transparent Decision Logic
                    </div>
                    <h2 className="text-xl font-extrabold">How are these actions prioritized?</h2>
                    <p className="text-xs text-green-100 leading-relaxed opacity-90">
                        CarbonX calculates an exact priority quotient for every action based on real emission reduction, data certainty, friction effort (1–3), and implementation expense (1–3). High-impact, zero-cost habits always rank first.
                    </p>
                </div>

                <Link href="/what-if" className="shrink-0">
                    <button className="flex items-center gap-2 px-5 py-3 bg-white text-gray-900 text-xs font-extrabold rounded-2xl hover:bg-green-50 transition-all shadow-sm">
                        <Sliders size={16} className="text-green-600" />
                        <span>Open What-If Simulator</span>
                    </button>
                </Link>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat.key)}
                        className={cn(
                            'px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0',
                            selectedCategory === cat.key
                                ? 'bg-gray-900 text-white shadow-xs'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {actions.map(action => (
                    <ActionPriorityCard
                        key={action.id}
                        action={action}
                        onSimulate={() => {
                            router.push('/what-if');
                        }}
                    />
                ))}
            </div>

            {/* Matrix Section: Impact vs Effort */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6">
                <div className="section-title mb-1">Impact vs Effort Matrix</div>
                <div className="text-xs text-gray-400 mb-6">Visual grouping of quick wins vs strategic investments</div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Quick Wins (Low Effort, High Impact) */}
                    <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-green-900 uppercase">⚡ Quick Wins</span>
                            <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">Low Effort</span>
                        </div>
                        <p className="text-xs text-gray-500">Immediate behavioral switches with zero upfront cost.</p>
                        <ul className="space-y-2 text-xs font-semibold text-gray-800">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                                AC Thermostat at 24°C (-14 kg)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                                4 Metro Work Commutes (-24 kg)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                                2 Plant-Powered Days (-10 kg)
                            </li>
                        </ul>
                    </div>

                    {/* Moderate Habits */}
                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-blue-900 uppercase">🔄 Moderate Habits</span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">Med Effort</span>
                        </div>
                        <p className="text-xs text-gray-500">Shared transport and conscious shopping adjustments.</p>
                        <ul className="space-y-2 text-xs font-semibold text-gray-800">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                Shared Auto / Carpool Short Trips (-9 kg)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                9W LED Retrofit Upgrade (-8 kg)
                            </li>
                        </ul>
                    </div>

                    {/* High Impact Infrastructure */}
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-purple-900 uppercase">☀️ High Impact Capital</span>
                            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">High Effort</span>
                        </div>
                        <p className="text-xs text-gray-500">Long-term structural investments and solar installations.</p>
                        <ul className="space-y-2 text-xs font-semibold text-gray-800">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                                2 kW Rooftop Solar System (-196 kg)
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
