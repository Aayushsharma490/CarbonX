'use client';

import React, { useState } from 'react';
import { usePersonalData } from '@/context/PersonalDataContext';
import { UncertaintyRangeBadge } from '@/components/personal/UncertaintyRangeBadge';
import { FreshnessBadge } from '@/components/personal/FreshnessBadge';
import { explainUncertaintyRange } from '@/lib/carbon-engine/uncertaintyEngine';
import { ActivityLineageDrawer } from '@/components/personal/ActivityLineageDrawer';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    Leaf, PieChart as PieIcon, HelpCircle,
    ShieldCheck, Info, ArrowUpRight, TrendingDown,
    Building2, Globe, Compass, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FootprintPage() {
    const { summary, activities, setSelectedLineageActivity } = usePersonalData();
    const explanation = explainUncertaintyRange(activities);

    const categoryColors: Record<string, string> = {
        Travel: '#10b981',
        Electricity: '#3b82f6',
        Purchases: '#8b5cf6',
        Food: '#f59e0b',
        Lifestyle: '#ec4899'
    };

    const pieData = Object.entries(summary.categoryBreakdown).map(([cat, val]) => ({
        name: cat,
        value: val.co2e,
        min: val.min,
        max: val.max,
        sharePct: val.sharePct,
        color: categoryColors[cat] || '#6b7280',
        freshness: val.freshness
    })).filter(d => d.value > 0);

    const uncertaintyBarData = Object.entries(summary.categoryBreakdown).map(([cat, val]) => ({
        category: cat,
        co2e: val.co2e,
        min: val.min,
        max: val.max,
        uncertaintySpan: Math.round(val.max - val.min),
        color: categoryColors[cat] || '#6b7280'
    })).filter(d => d.co2e > 0);

    const benchmarkData = [
        { label: 'Your Footprint', value: summary.totalCO2e, color: '#10b981' },
        { label: 'Delhi/NCR Urban Avg', value: 360, color: '#64748b' },
        { label: 'India Urban Avg (CEA)', value: 340, color: '#94a3b8' },
        { label: 'Paris 2030 Climate Goal', value: 200, color: '#3b82f6' }
    ];

    return (
        <div className="fade-in space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            Footprint Deep Dive
                        </span>
                    </div>
                    <h1 className="page-title">Carbon Footprint Analysis</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Category decomposition, uncertainty error bands, and regional benchmark comparisons.
                    </p>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-gray-400">Total Footprint Range</div>
                        <UncertaintyRangeBadge min={summary.uncertaintyMin} max={summary.uncertaintyMax} />
                    </div>
                </div>
            </div>

            {/* Top Row: Category Share Pie & Uncertainty Bands */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Category Contribution Breakdown */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between">
                    <div>
                        <div className="section-title mb-1">Emission Distribution</div>
                        <div className="text-xs text-gray-400 mb-4">Percentage contribution of your lifestyle sectors</div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <div className="h-52">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12, fontWeight: 600 }}
                                            formatter={(val: any) => [`${val} kg CO₂e`, 'Footprint']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-2.5">
                                {pieData.map(item => (
                                    <div key={item.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="font-bold text-gray-800">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{item.value} kg</span>
                                            <span className="text-gray-400 font-medium">({item.sharePct}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                        <span>Top contributor: <strong className="text-gray-800">{summary.topCategory}</strong></span>
                        <span>Confidence: <strong className="text-green-700">{summary.overallConfidence}%</strong></span>
                    </div>
                </div>

                {/* Uncertainty Range Bounds Breakdown */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between">
                    <div>
                        <div className="section-title mb-1">Uncertainty Bounds by Sector</div>
                        <div className="text-xs text-gray-400 mb-4">Quantified minimum vs. maximum range spreads (±Δ)</div>

                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={uncertaintyBarData} layout="vertical" barSize={14}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 600 }} width={80} />
                                    <RechartsTooltip
                                        contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12, fontWeight: 600 }}
                                        formatter={(val: any, name: any, item: any) => [
                                            `${item.payload.min} – ${item.payload.max} kg (±${item.payload.uncertaintySpan} kg)`,
                                            'Confidence Interval'
                                        ]}
                                    />
                                    <Bar dataKey="co2e" radius={[0, 6, 6, 0]}>
                                        {uncertaintyBarData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600 flex items-center justify-between mt-2">
                        <span className="flex items-center gap-1.5">
                            <Info size={14} className="text-green-600" />
                            <span>{explanation.summary}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Regional Benchmarks */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="section-title">Indian Urban Benchmarks Comparison</div>
                        <div className="text-xs text-gray-400 mt-0.5">How your monthly footprint compares to national and climate standards</div>
                    </div>
                    <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 self-start sm:self-auto">
                        {summary.totalCO2e < 360 ? 'Better than Urban Avg' : 'Slightly Above Benchmark'}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {benchmarkData.map(bm => (
                        <div key={bm.label} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex flex-col justify-between">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{bm.label}</div>
                            <div className="text-2xl font-black text-gray-900">
                                {bm.value} <span className="text-xs font-normal text-gray-400">kg/mo</span>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-200/60 text-[11px] text-gray-500">
                                {bm.label === 'Your Footprint'
                                    ? 'Based on active activity logs'
                                    : `Delta: ${bm.value - summary.totalCO2e > 0 ? `-${bm.value - summary.totalCO2e} kg lower` : `+${summary.totalCO2e - bm.value} kg higher`}`}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom: Detailed Explanations Breakdown */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6">
                <div className="section-title mb-1">Uncertainty Drivers & How to Narrow Range</div>
                <div className="text-xs text-gray-400 mb-5">Decomposition of measurement precision by category</div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {explanation.explanations.map(exp => (
                        <div key={exp.category} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-gray-900">{exp.category}</span>
                                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">
                                    ±{exp.uncertaintyPct}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{exp.primaryDriver}</p>
                            <div className="p-2.5 bg-white rounded-xl border border-green-100 text-[11px] text-green-800">
                                💡 <strong>Action:</strong> {exp.recommendationToNarrow}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ActivityLineageDrawer />
        </div>
    );
}
