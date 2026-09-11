'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePersonalData } from '@/context/PersonalDataContext';
import { getPrioritizedActions } from '@/lib/carbon-engine/recommendationEngine';
import {
    Target, Flag, Calendar, TrendingDown,
    CheckCircle2, Sparkles, Sliders, ArrowRight,
    Award, ShieldCheck, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ReferenceLine } from 'recharts';

export default function TargetPage() {
    const { target, updateTarget, summary, mlPrediction } = usePersonalData();
    const [targetInput, setTargetInput] = useState<number>(target.monthlyTargetKg);
    const [reductionGoalPct, setReductionGoalPct] = useState<number>(target.reductionPctGoal);
    const [isSaved, setIsSaved] = useState(false);

    const currentKg = summary.totalCO2e;
    const targetKg = target.monthlyTargetKg;
    const targetGap = currentKg - targetKg;
    const requiredReductionKg = Math.max(0, targetGap);

    const actions = getPrioritizedActions();

    // Suggested optimal action bundle that closes the target gap
    let accumulatedReduction = 0;
    const suggestedBundle = actions.filter(a => {
        if (accumulatedReduction < requiredReductionKg) {
            accumulatedReduction += a.co2ReductionKg;
            return true;
        }
        return false;
    });

    const trajectoryData = [
        { month: 'Jun', actual: 380, target: targetKg },
        { month: 'Jul', actual: 365, target: targetKg },
        { month: 'Aug', actual: 355, target: targetKg },
        { month: 'Sep (Now)', actual: currentKg, target: targetKg },
        { month: 'Oct (Projected)', actual: mlPrediction.predictedCO2e, target: targetKg },
        { month: 'Nov (Goal)', actual: targetKg + 10, target: targetKg },
        { month: 'Dec (Target)', actual: targetKg, target: targetKg }
    ];

    const handleSaveTarget = (e: React.FormEvent) => {
        e.preventDefault();
        updateTarget({
            monthlyTargetKg: targetInput,
            reductionPctGoal: reductionGoalPct
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="fade-in space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            Carbon Budgeting & Targets
                        </span>
                    </div>
                    <h1 className="page-title">Carbon Target Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Set reduction milestones, model pathways, and generate optimized action bundles.
                    </p>
                </div>

                <Link href="/what-if">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all shadow-2xs">
                        <Sliders size={15} className="text-green-600" />
                        <span>Simulate What-If Levers</span>
                    </button>
                </Link>
            </div>

            {/* Target Status KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Footprint</div>
                    <div className="text-3xl font-black text-gray-900">{currentKg} <span className="text-sm font-normal text-gray-400">kg</span></div>
                    <div className="text-xs text-gray-500 mt-1.5">Uncertainty: {summary.uncertaintyMin}–{summary.uncertaintyMax} kg</div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Monthly Target</div>
                    <div className="text-3xl font-black text-blue-600">{targetKg} <span className="text-sm font-normal text-gray-400">kg</span></div>
                    <div className="text-xs text-blue-600 font-semibold mt-1.5">{target.reductionPctGoal}% reduction from baseline</div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Required Reduction</div>
                    <div className={cn('text-3xl font-black', targetGap > 0 ? 'text-amber-600' : 'text-green-600')}>
                        {targetGap > 0 ? `-${requiredReductionKg}` : '0'} <span className="text-sm font-normal text-gray-400">kg</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1.5">{targetGap > 0 ? 'Gap to close this month' : 'Target achieved!'}</div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ML Forecast (Next Mo)</div>
                    <div className="text-3xl font-black text-purple-700">{mlPrediction.predictedCO2e} <span className="text-sm font-normal text-gray-400">kg</span></div>
                    <div className="text-xs text-gray-500 mt-1.5">Confidence: {mlPrediction.confidencePct}%</div>
                </div>
            </div>

            {/* Target Settings & Trajectory Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Target Configuration Card */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Target size={18} className="text-blue-600" />
                            <h3 className="text-sm font-bold text-gray-900">Configure Target Budget</h3>
                        </div>
                        <p className="text-xs text-gray-400 mb-5">Set your desired monthly carbon cap and reduction percentage.</p>

                        <form onSubmit={handleSaveTarget} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Monthly Target (kg CO₂e)
                                </label>
                                <input
                                    type="number"
                                    value={targetInput}
                                    onChange={(e) => setTargetInput(parseFloat(e.target.value) || 0)}
                                    min="100"
                                    max="1000"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    2026 Reduction Goal ({reductionGoalPct}%)
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="50"
                                    step="1"
                                    value={reductionGoalPct}
                                    onChange={(e) => setReductionGoalPct(parseInt(e.target.value))}
                                    className="w-full accent-blue-600 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                                    <span>5% (Modest)</span>
                                    <span>25% (Ambitious)</span>
                                    <span>50% (Net Zero Track)</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all shadow-xs"
                            >
                                Update Target Goal
                            </button>

                            {isSaved && (
                                <div className="p-2.5 bg-green-50 text-green-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
                                    <CheckCircle2 size={14} />
                                    <span>Target updated successfully!</span>
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 text-xs text-gray-500">
                        Baseline Year: <strong>2025 (390 kg/mo)</strong>
                    </div>
                </div>

                {/* Trajectory Forecast Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="section-title">Carbon Target Roadmap</div>
                                <div className="text-xs text-gray-400 mt-0.5">Historical trajectory and projected convergence to target</div>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Actual / Projected
                                </span>
                                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Target ({targetKg} kg)
                                </span>
                            </div>
                        </div>

                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trajectoryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 600 }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} width={35} />
                                    <RechartsTooltip
                                        contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12, fontWeight: 600 }}
                                        formatter={(val: any) => [`${val} kg CO₂e`, 'Footprint']}
                                    />
                                    <ReferenceLine y={targetKg} stroke="#3b82f6" strokeDasharray="4 4" />
                                    <Line
                                        type="monotone"
                                        dataKey="actual"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                        <span>Projected convergence date: <strong>December 2026</strong></span>
                        <span className="text-green-700 font-bold">Paris Accord Alignment</span>
                    </div>
                </div>
            </div>

            {/* Suggested Action Bundle to Hit Target */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <div className="section-title">Suggested Action Combo to Bridge Gap (-{requiredReductionKg} kg)</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                            Automated combination of top-priority actions to meet your {targetKg} kg target this month
                        </div>
                    </div>
                    <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-xl">
                        Combined Impact: -{accumulatedReduction} kg CO₂e
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {suggestedBundle.map((act, idx) => (
                        <div key={act.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-900">Step {idx + 1}: {act.title}</span>
                                <span className="text-xs font-extrabold text-green-700 bg-white px-2 py-0.5 rounded-full border border-green-200">
                                    -{act.co2ReductionKg} kg
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{act.description}</p>
                            <div className="text-[10px] text-gray-400">
                                Effort: <strong>{act.effort}</strong> · Cost: <strong>{act.cost}</strong>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
