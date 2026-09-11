'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppMode } from '@/context/ModeContext';
import { usePersonalData } from '@/context/PersonalDataContext';
import { useSystem } from '@/context/SystemContext';
import { useTelemetry } from '@/context/TelemetryContext';
import { useAuth } from '@/context/AuthContext';
import { getPrioritizedActions } from '@/lib/carbon-engine/recommendationEngine';
import { UncertaintyRangeBadge } from '@/components/personal/UncertaintyRangeBadge';
import { FreshnessBadge } from '@/components/personal/FreshnessBadge';
import { AnomalyAlertBanner } from '@/components/personal/AnomalyAlertBanner';
import { ActivityLineageDrawer } from '@/components/personal/ActivityLineageDrawer';
import { OcrBillParserModal } from '@/components/personal/OcrBillParserModal';
import { ActionPriorityCard } from '@/components/personal/ActionPriorityCard';
import { calculateEnergyLoss, calculateMachineHealth, kwhToCo2Kg } from '@/lib/energyCalculations';
import { cn } from '@/lib/utils';
import {
    Activity, Zap, Leaf, AlertTriangle,
    TrendingUp, TrendingDown, RefreshCw, Server,
    Plus, ScanLine, Sliders, ShieldCheck, ArrowRight,
    Sparkles, Target, Compass, Layers, Info, CheckCircle2,
    Calendar, Wrench, Lightbulb
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, Cell
} from 'recharts';

// ─── Shared Industrial Components ─────────────────────────────────────────────

const TREND_DATA = [
    { time: '00:00', kwh: 120 },
    { time: '04:00', kwh: 110 },
    { time: '08:00', kwh: 350 },
    { time: '12:00', kwh: 480 },
    { time: '16:00', kwh: 520 },
    { time: '20:00', kwh: 310 },
];

function IndustrialMetricCard({
    label, value, unit, icon: Icon, trend, trendLabel, accentColor = '#16a34a'
}: {
    label: string; value: string | number; unit?: string;
    icon: React.ElementType; trend?: 'up' | 'down' | 'neutral';
    trendLabel?: string; accentColor?: string;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}15` }}>
                    <Icon size={20} style={{ color: accentColor }} />
                </div>
                {trend && (
                    <div className={cn(
                        'flex items-center gap-1 text-xs font-semibold',
                        trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
                    )}>
                        {trend === 'up' ? <TrendingUp size={13} /> : trend === 'down' ? <TrendingDown size={13} /> : null}
                        {trendLabel}
                    </div>
                )}
            </div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight">
                {value}
                {unit && <span className="text-base font-normal text-gray-400 ml-1">{unit}</span>}
            </div>
        </div>
    );
}

function MachineCard({ node }: { node: any }) {
    const health = calculateMachineHealth(node);
    const statusColor = node.isOnline
        ? health.score >= 80 ? '#16a34a' : health.score >= 60 ? '#d97706' : '#dc2626'
        : '#6b7280';
    const statusLabel = !node.isOnline ? 'Offline'
        : health.score >= 80 ? 'Good' : health.score >= 60 ? 'Warning' : 'Critical';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900">{node.name}</h3>
                    <div className="text-xs text-gray-400 mt-0.5">{node.zone}</div>
                </div>
                <div className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                    !node.isOnline ? 'bg-gray-100 text-gray-500'
                    : health.score >= 80 ? 'bg-green-50 text-green-700'
                    : health.score >= 60 ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-700'
                )}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
                    {statusLabel}
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Health Score</span>
                    <span className="font-semibold text-gray-700">{health.score}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${health.score}%`, backgroundColor: statusColor }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: 'Load',  value: `${node.currentKw.toFixed(1)} kW` },
                    { label: 'Temp',  value: `${node.temperature.toFixed(0)}°C` },
                    { label: 'PF',    value: node.powerFactor.toFixed(2) },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</div>
                        <div className="text-sm font-bold text-gray-800 mt-0.5">{value}</div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                        <Sparkles size={14} className="text-purple-500" /> AI Insights
                    </div>
                    <div className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider",
                        !node.isOnline ? "text-gray-500 bg-gray-50 border-gray-200"
                        : health.score >= 75 ? "text-green-600 bg-green-50 border-green-100" 
                        : "text-amber-600 bg-amber-50 border-amber-100"
                    )}>
                        {!node.isOnline ? "Offline" : health.score >= 75 ? "Working Fine" : "Needs Attention"}
                    </div>
                </div>
                <div className="flex items-center justify-between bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/50">
                    <span className="text-xs font-medium text-purple-700/70">Est. Maintenance</span>
                    <span className="text-xs font-bold text-purple-700">In {Math.floor(health.score / 5)} Days</span>
                </div>
            </div>
        </div>
    );
}

// ─── Industrial Dashboard View (Organization Mode) ────────────────────────────
function IndustrialDashboardView() {
    const { config } = useSystem();
    const { gatewayData, loading, nodeData } = useTelemetry();
    const { role } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="flex items-center gap-3 text-gray-400">
                    <RefreshCw size={20} className="animate-spin" />
                    <span className="font-medium">Loading industrial telemetry…</span>
                </div>
            </div>
        );
    }

    if (!gatewayData) {
        return (
            <div className="text-center py-32">
                <Server size={40} className="text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500 font-medium">Waiting for telemetry data…</div>
                <div className="text-sm text-gray-400 mt-1">Ensure ESP32 transmitters are connected.</div>
            </div>
        );
    }

    const lossResult = calculateEnergyLoss(gatewayData);
    const totalCo2   = kwhToCo2Kg(gatewayData.totalKwh);
    const trendData  = [...TREND_DATA, { time: 'Now', kwh: Math.round(gatewayData.totalKwh / 10) }];
    const onlineCount = nodeData.filter(n => n.isOnline).length;
    const lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="fade-in space-y-6 pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                            Organization Mode
                        </span>
                    </div>
                    <h1 className="page-title">Industrial Operations Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {gatewayData.name} &nbsp;·&nbsp; RX Gateway Protocol &nbsp;·&nbsp; Last updated: {lastUpdated}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full text-sm font-medium text-green-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live Protocol
                    </div>
                    <div className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm font-medium text-gray-500">
                        {onlineCount}/{nodeData.length} TX Nodes Online
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <IndustrialMetricCard
                    label="Total Energy Used"
                    value={gatewayData.totalKwh.toFixed(0)}
                    unit="kWh"
                    icon={Zap}
                    trend="up"
                    trendLabel="+3.2%"
                    accentColor="#2d8a22"
                />
                <IndustrialMetricCard
                    label="Industrial CO₂ Footprint"
                    value={totalCo2.toFixed(1)}
                    unit="kg"
                    icon={Leaf}
                    trend="down"
                    trendLabel="-1.1%"
                    accentColor="#2563eb"
                />
                <IndustrialMetricCard
                    label="System Health"
                    value="92"
                    unit="/100"
                    icon={Activity}
                    trend="neutral"
                    accentColor="#7c3aed"
                />
                <IndustrialMetricCard
                    label="Line Loss"
                    value={lossResult.lossPercent.toFixed(1)}
                    unit="%"
                    icon={AlertTriangle}
                    trend={lossResult.lossPercent > config.lossThreshold ? 'down' : 'up'}
                    trendLabel={`Limit: ${config.lossThreshold}%`}
                    accentColor={lossResult.lossPercent > config.lossThreshold ? '#dc2626' : '#d97706'}
                />
            </div>

            {/* Chart + Machine List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="section-title">Energy Trend Today</div>
                            <div className="text-sm text-gray-400 mt-0.5">kWh consumed per time block</div>
                        </div>
                    </div>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#2d8a22" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#2d8a22" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} width={40} />
                                <RechartsTooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 13, fontWeight: 600 }} itemStyle={{ color: '#2d8a22' }} />
                                <Area type="monotone" dataKey="kwh" stroke="#2d8a22" strokeWidth={2.5} fill="url(#energyGrad)" dot={{ r: 3, fill: '#2d8a22', strokeWidth: 2, stroke: '#fff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="section-title mb-4">Machine Status</div>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {gatewayData.txNodes.map((node) => {
                            const health = calculateMachineHealth(node);
                            return (
                                <div key={node.nodeId} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: node.isOnline ? '#16a34a' : '#dc2626' }} />
                                        <div>
                                            <div className="text-sm font-medium text-gray-800">{node.name}</div>
                                            <div className="text-xs text-gray-400">{node.nodeId}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-700">{health.score}%</div>
                                        <div className="text-xs text-gray-400">{node.currentKw.toFixed(1)} kW</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Machine Cards Grid */}
            <div>
                <div className="section-title mb-4">Connected Transmitters & Cranes</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nodeData.map((node) => (
                        <MachineCard key={node.nodeId} node={node} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Personal Dashboard View (Personal Mode) ──────────────────────────────────
function PersonalDashboardView() {
    const { summary, target, mlPrediction, dataTrustReport, hasDemoData, resetToDemoData, setSelectedLineageActivity } = usePersonalData();
    const [isOcrOpen, setIsOcrOpen] = useState(false);

    const prioritizedActions = getPrioritizedActions().slice(0, 3);
    const targetGap = summary.totalCO2e - target.monthlyTargetKg;

    // Monthly historical comparison trend data
    const monthlyTrendData = [
        { month: 'Jun', co2: 380, target: 300 },
        { month: 'Jul', co2: 365, target: 300 },
        { month: 'Aug', co2: 355, target: 300 },
        { month: 'Sep (Current)', co2: summary.totalCO2e, target: target.monthlyTargetKg },
        { month: 'Oct (Predicted)', co2: mlPrediction.predictedCO2e, target: target.monthlyTargetKg }
    ];

    const categoryColors: Record<string, string> = {
        Travel: '#10b981',
        Electricity: '#3b82f6',
        Purchases: '#8b5cf6',
        Food: '#f59e0b',
        Lifestyle: '#ec4899'
    };

    const categoryArray = Object.entries(summary.categoryBreakdown).map(([cat, val]) => ({
        category: cat,
        co2e: val.co2e,
        sharePct: val.sharePct,
        freshness: val.freshness,
        color: categoryColors[cat] || '#6b7280'
    })).filter(c => c.co2e > 0);

    return (
        <div className="fade-in space-y-6 pb-12">
            {/* Anomaly Banner if any */}
            <AnomalyAlertBanner />

            {/* Demo Data Notice if Active */}
            {hasDemoData && (
                <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-800">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span><strong>Demo Profile Active</strong>: Initial seeded baseline for Indian urban lifestyle. You can log real activities anytime.</span>
                    </div>
                    <button
                        onClick={resetToDemoData}
                        className="text-xs font-bold text-blue-700 hover:underline shrink-0 ml-2"
                    >
                        Reset Demo Baseline
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            Personal Carbon Intelligence
                        </span>
                        <span className="text-xs text-gray-400 font-medium">· Decision Engine v4.0</span>
                    </div>
                    <h1 className="page-title">Personal Footprint Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Continuous footprint tracking, uncertainty bounds, and actionable reduction pathways.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setIsOcrOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all shadow-2xs"
                    >
                        <ScanLine size={15} className="text-green-600" />
                        <span>Scan Bill (OCR)</span>
                    </button>
                    <Link href="/activities">
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all shadow-xs">
                            <Plus size={15} />
                            <span>Log Activity</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Top Row: Primary Decision Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Monthly Footprint & Uncertainty */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
                            <Leaf size={20} />
                        </div>
                        <FreshnessBadge freshness="RECENT" />
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Monthly Footprint</div>
                    <div className="text-2xl font-black text-gray-900">
                        {summary.totalCO2e} <span className="text-sm font-normal text-gray-400">kg CO₂e</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                        <UncertaintyRangeBadge min={summary.uncertaintyMin} max={summary.uncertaintyMax} />
                    </div>
                </div>

                {/* 2. Target & Gap */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                            <Target size={20} />
                        </div>
                        <span className={cn(
                            'text-xs font-extrabold px-2.5 py-0.5 rounded-full border',
                            targetGap > 0
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-green-50 text-green-700 border-green-200'
                        )}>
                            {targetGap > 0 ? `+${targetGap} kg Gap` : 'On Track'}
                        </span>
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Target vs Current</div>
                    <div className="text-2xl font-black text-gray-900">
                        {target.monthlyTargetKg} <span className="text-sm font-normal text-gray-400">kg Target</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-50 flex justify-between">
                        <span>Current: {summary.totalCO2e} kg</span>
                        <span className="font-semibold text-gray-700">{target.reductionPctGoal}% 2026 Goal</span>
                    </div>
                </div>

                {/* 3. Explainable Confidence */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                            High Confidence
                        </span>
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Data Confidence</div>
                    <div className="text-2xl font-black text-gray-900">
                        {summary.overallConfidence}%
                    </div>
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-50 flex justify-between">
                        <span>Quality Score: {dataTrustReport.overallQualityScore}%</span>
                        <Link href="/data-trust" className="text-green-700 font-bold hover:underline">
                            Audit Trust →
                        </Link>
                    </div>
                </div>

                {/* 4. Top Contributor & ML Forecast */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                            <Sparkles size={20} />
                        </div>
                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Next Mo: {mlPrediction.predictedCO2e} kg
                        </span>
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Top Contributor</div>
                    <div className="text-2xl font-black text-gray-900">
                        {summary.topCategory}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-50 truncate" title={mlPrediction.topFactor}>
                        <span>ML: {mlPrediction.topFactor}</span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Trend Chart + Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 5-Month Trajectory & Forecast */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <div className="section-title">Footprint Trajectory & ML Projection</div>
                            <div className="text-xs text-gray-400 mt-0.5">Historical monthly actuals vs. Gradient Boosted next-period forecast</div>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Actual / Projected
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Target ({target.monthlyTargetKg} kg)
                            </div>
                        </div>
                    </div>

                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyTrendData}>
                                <defs>
                                    <linearGradient id="personalCo2Grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} width={40} />
                                <RechartsTooltip
                                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12, fontWeight: 600 }}
                                    formatter={(value: any) => [`${value} kg CO₂e`, 'Footprint']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="co2"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fill="url(#personalCo2Grad)"
                                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Contribution & Provenance */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between">
                    <div>
                        <div className="section-title mb-1">Category Breakdown</div>
                        <div className="text-xs text-gray-400 mb-4">Proportion and data provenance source</div>

                        <div className="space-y-3">
                            {categoryArray.map(cat => (
                                <div key={cat.category} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                            <span className="font-bold text-gray-800">{cat.category}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{cat.co2e} kg ({cat.sharePct}%)</span>
                                            <FreshnessBadge freshness={cat.freshness} />
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${cat.sharePct}%`, backgroundColor: cat.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Explore full details:</span>
                        <Link href="/footprint" className="text-xs font-bold text-gray-900 hover:text-green-700 flex items-center gap-1">
                            <span>Footprint Deep Dive</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Top 3 Prioritized Actions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="section-title">Top 3 Prioritized Reduction Actions</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                            Ranked by explainable formula: (CO₂ Reduction × Confidence) ÷ (Effort × Cost)
                        </div>
                    </div>
                    <Link href="/insights" className="text-xs font-bold text-green-700 hover:underline flex items-center gap-1">
                        <span>View All Recommendations ({getPrioritizedActions().length})</span>
                        <ArrowRight size={13} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {prioritizedActions.map(action => (
                        <ActionPriorityCard
                            key={action.id}
                            action={action}
                            onSimulate={() => {
                                window.location.href = '/what-if';
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Modals */}
            <OcrBillParserModal isOpen={isOcrOpen} onClose={() => setIsOcrOpen(false)} />
            <ActivityLineageDrawer />
        </div>
    );
}

// ─── Main Root Dashboard Component ───────────────────────────────────────────
export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const { mode } = useAppMode();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="flex items-center gap-3 text-gray-400">
                    <RefreshCw size={20} className="animate-spin" />
                    <span className="font-medium">Loading CarbonX platform…</span>
                </div>
            </div>
        );
    }

    // Render mode-specific dashboard
    if (mode === 'organization') {
        return <IndustrialDashboardView />;
    }

    return <PersonalDashboardView />;
}
