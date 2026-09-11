'use client';

import React from 'react';
import { usePersonalData } from '@/context/PersonalDataContext';
import { calculateWhatIfScenario } from '@/lib/carbon-engine/whatIfEngine';
import {
    Sliders, RotateCcw, Target, CheckCircle2,
    AlertCircle, Sparkles, TrendingDown, ArrowRight,
    Car, Zap, ShoppingBag, Utensils, Wind
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';

export default function WhatIfPage() {
    const { sliders, updateSlider, resetSliders, summary, target } = usePersonalData();

    const simulation = calculateWhatIfScenario(sliders, summary.totalCO2e, target.monthlyTargetKg);

    const comparisonBarData = [
        { name: 'Current Baseline', co2: simulation.baselineKg, fill: '#64748b' },
        { name: 'Simulated Scenario', co2: simulation.scenarioKg, fill: simulation.isTargetAchieved ? '#10b981' : '#f59e0b' },
        { name: 'Monthly Target', co2: simulation.targetKg, fill: '#3b82f6' }
    ];

    const categoryIcons: Record<string, React.ElementType> = {
        Travel: Car,
        Electricity: Zap,
        Purchases: ShoppingBag,
        Food: Utensils,
        Lifestyle: Wind
    };

    return (
        <div className="fade-in space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            Interactive Decision Simulator
                        </span>
                        <span className="text-xs text-gray-400 font-medium">· Real-time What-If Engine</span>
                    </div>
                    <h1 className="page-title">What-If Carbon Simulator</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Adjust lifestyle levers to model your potential footprint reduction against your monthly target.
                    </p>
                </div>

                <button
                    onClick={resetSliders}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all shadow-2xs self-start sm:self-auto"
                >
                    <RotateCcw size={14} />
                    <span>Reset to Baseline</span>
                </button>
            </div>

            {/* Results Header Card */}
            <div className={cn(
                'rounded-3xl p-6 border transition-all duration-300 shadow-md',
                simulation.isTargetAchieved
                    ? 'bg-gradient-to-br from-emerald-900 to-green-950 text-white border-green-800'
                    : 'bg-gradient-to-br from-gray-900 to-slate-900 text-white border-gray-800'
            )}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 bg-white/10 text-green-300">
                            {simulation.isTargetAchieved ? <CheckCircle2 size={14} /> : <Sparkles size={14} />}
                            <span>{simulation.isTargetAchieved ? 'TARGET ACHIEVED IN SCENARIO' : 'SIMULATION ACTIVE'}</span>
                        </div>

                        <div className="flex items-baseline gap-4 flex-wrap">
                            <div>
                                <span className="text-xs text-gray-300 block uppercase font-bold">Scenario Footprint</span>
                                <span className="text-4xl sm:text-5xl font-black">{simulation.scenarioKg}</span>
                                <span className="text-sm text-gray-300 ml-1">kg CO₂e</span>
                            </div>

                            <div className="pl-4 border-l border-white/20">
                                <span className="text-xs text-gray-300 block uppercase font-bold">Reduction</span>
                                <span className="text-2xl sm:text-3xl font-extrabold text-green-300">
                                    {simulation.totalReductionKg > 0 ? `-${simulation.totalReductionKg}` : `+${Math.abs(simulation.totalReductionKg)}`} kg
                                </span>
                            </div>

                            <div className="pl-4 border-l border-white/20">
                                <span className="text-xs text-gray-300 block uppercase font-bold">Monthly Target</span>
                                <span className="text-2xl sm:text-3xl font-extrabold text-blue-300">{simulation.targetKg} kg</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs space-y-1.5 min-w-[220px]">
                        <div className="text-gray-300 font-bold uppercase text-[10px]">Status Evaluation</div>
                        <div className="font-extrabold text-base text-white">
                            {simulation.isTargetAchieved
                                ? `✓ Target Beaten by ${Math.abs(simulation.targetGapKg)} kg`
                                : `⚠ ${simulation.targetGapKg} kg Gap to Target`}
                        </div>
                        <p className="text-[11px] text-gray-300 leading-snug">
                            {simulation.isTargetAchieved
                                ? 'Adjusting these daily parameters allows you to meet your 2026 climate target!'
                                : 'Try shifting more commute kms to metro or lowering AC hours to bridge the gap.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Interactive Workspace: Sliders + Scenario Comparison Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Sliders Grid */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="section-title">Scenario Parameters</div>
                        <span className="text-xs text-gray-400 font-medium">All results labelled as simulation estimates</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sliders.map(slider => {
                            const Icon = categoryIcons[slider.category] || Sliders;
                            const delta = slider.scenarioValue - slider.currentValue;
                            const co2Impact = Math.round((slider.currentValue - slider.scenarioValue) * slider.reductionFactorKgPerUnit);

                            return (
                                <div key={slider.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 flex items-center justify-center">
                                                <Icon size={16} className="text-emerald-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-900">{slider.label}</h4>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold">{slider.category}</span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-xs font-extrabold text-gray-900">
                                                {slider.scenarioValue} <span className="text-[10px] font-normal text-gray-500">{slider.unit}</span>
                                            </span>
                                            {delta !== 0 && (
                                                <div className={cn('text-[10px] font-bold mt-0.5', co2Impact > 0 ? 'text-green-600' : 'text-amber-600')}>
                                                    {co2Impact > 0 ? `-${co2Impact} kg CO₂` : `+${Math.abs(co2Impact)} kg CO₂`}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Slider Control */}
                                    <div className="space-y-1">
                                        <input
                                            type="range"
                                            min={slider.min}
                                            max={slider.max}
                                            step={slider.step}
                                            value={slider.scenarioValue}
                                            onChange={(e) => updateSlider(slider.id, parseFloat(e.target.value))}
                                            className="w-full accent-green-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                                            <span>{slider.min}</span>
                                            <span>Baseline: {slider.currentValue} {slider.unit}</span>
                                            <span>{slider.max}</span>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-gray-500 leading-snug">{slider.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Col: Visual Scenario Bar Chart & Category Delta Summary */}
                <div className="space-y-5">
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between">
                        <div>
                            <div className="section-title mb-1">Scenario vs Target</div>
                            <div className="text-xs text-gray-400 mb-4">Immediate comparison of baseline vs simulation</div>

                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={comparisonBarData} barSize={28}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 600 }} />
                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} width={35} />
                                        <RechartsTooltip
                                            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12, fontWeight: 600 }}
                                            formatter={(val: any) => [`${val} kg CO₂e`, 'Footprint']}
                                        />
                                        <Bar dataKey="co2" radius={[8, 8, 0, 0]}>
                                            {comparisonBarData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-gray-100 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Starting Baseline:</span>
                                <span className="font-bold text-gray-800">{simulation.baselineKg} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Simulated Footprint:</span>
                                <span className="font-bold text-gray-900">{simulation.scenarioKg} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Monthly Target:</span>
                                <span className="font-bold text-blue-600">{simulation.targetKg} kg</span>
                            </div>
                        </div>
                    </div>

                    {/* Category Reductions Breakdown */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-5">
                        <div className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-3">Reductions by Sector</div>
                        <div className="space-y-2">
                            {Object.entries(simulation.categoryDeltas).map(([cat, delta]) => (
                                <div key={cat} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                                    <span className="font-semibold text-gray-700">{cat}</span>
                                    <span className={cn('font-bold', delta > 0 ? 'text-green-600' : delta < 0 ? 'text-amber-600' : 'text-gray-400')}>
                                        {delta > 0 ? `-${Math.round(delta)} kg` : delta < 0 ? `+${Math.abs(Math.round(delta))} kg` : '0 kg'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
