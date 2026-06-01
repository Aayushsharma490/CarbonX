'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Activity, Zap, Leaf, AlertTriangle,
    TrendingUp, TrendingDown, RefreshCw, Server,
    Thermometer, Wind, Gauge, Sparkles
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { calculateEnergyLoss, calculateMachineHealth, kwhToCo2Kg, getStatusColor } from '@/lib/energyCalculations';
import { cn } from '@/lib/utils';
import { useSystem } from '@/context/SystemContext';
import { useTelemetry } from '@/context/TelemetryContext';

const TREND_DATA = [
    { time: '00:00', kwh: 120 },
    { time: '04:00', kwh: 110 },
    { time: '08:00', kwh: 350 },
    { time: '12:00', kwh: 480 },
    { time: '16:00', kwh: 520 },
    { time: '20:00', kwh: 310 },
];

// ── Small metric card ──────────────────────────────────────────────────────────
function MetricCard({
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

// ── Machine node card ──────────────────────────────────────────────────────────
function MachineCard({ node }: { node: any }) {
    const health = calculateMachineHealth(node);
    const statusColor = node.isOnline
        ? health.score >= 80 ? '#16a34a' : health.score >= 60 ? '#d97706' : '#dc2626'
        : '#6b7280';
    const statusLabel = !node.isOnline ? 'Offline'
        : health.score >= 80 ? 'Good' : health.score >= 60 ? 'Warning' : 'Critical';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all">
            {/* Header */}
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

            {/* Health bar */}
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

            {/* Key metrics */}
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

            {/* AI Insights Section */}
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

// ── Main dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const { config } = useSystem();
    const { gatewayData, loading, latestLogs, nodeData } = useTelemetry();

    useEffect(() => { setMounted(true); }, []);

    if (!mounted || loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="flex items-center gap-3 text-gray-400">
                    <RefreshCw size={20} className="animate-spin" />
                    <span className="font-medium">Loading dashboard data…</span>
                </div>
            </div>
        );
    }

    if (!gatewayData) {
        return (
            <div className="text-center py-32">
                <Server size={40} className="text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500 font-medium">Waiting for telemetry data…</div>
                <div className="text-sm text-gray-400 mt-1">Make sure your devices are connected.</div>
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

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Operations Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {gatewayData.name} &nbsp;·&nbsp; Last updated: {lastUpdated}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full text-sm font-medium text-green-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live
                    </div>
                    <div className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm font-medium text-gray-500">
                        {onlineCount}/{nodeData.length} Machines Online
                    </div>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Total Energy Used"
                    value={gatewayData.totalKwh.toFixed(0)}
                    unit="kWh"
                    icon={Zap}
                    trend="up"
                    trendLabel="+3.2%"
                    accentColor="#2d8a22"
                />
                <MetricCard
                    label="CO₂ Footprint"
                    value={totalCo2.toFixed(1)}
                    unit="kg"
                    icon={Leaf}
                    trend="down"
                    trendLabel="-1.1%"
                    accentColor="#2563eb"
                />
                <MetricCard
                    label="System Health"
                    value="92"
                    unit="/100"
                    icon={Activity}
                    trend="neutral"
                    accentColor="#7c3aed"
                />
                <MetricCard
                    label="Line Loss"
                    value={lossResult.lossPercent.toFixed(1)}
                    unit="%"
                    icon={AlertTriangle}
                    trend={lossResult.lossPercent > config.lossThreshold ? 'down' : 'up'}
                    trendLabel={`Limit: ${config.lossThreshold}%`}
                    accentColor={lossResult.lossPercent > config.lossThreshold ? '#dc2626' : '#d97706'}
                />
            </div>

            {/* ── Chart + Node List ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Energy trend chart */}
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
                                <XAxis
                                    dataKey="time"
                                    axisLine={false} tickLine={false}
                                    tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                                    dy={8}
                                />
                                <YAxis
                                    axisLine={false} tickLine={false}
                                    tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                                    width={40}
                                />
                                <RechartsTooltip
                                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 13, fontWeight: 600 }}
                                    itemStyle={{ color: '#2d8a22' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="kwh"
                                    stroke="#2d8a22"
                                    strokeWidth={2.5}
                                    fill="url(#energyGrad)"
                                    dot={{ r: 3, fill: '#2d8a22', strokeWidth: 2, stroke: '#fff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Machine status list */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="section-title mb-4">Machine Status</div>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {gatewayData.txNodes.map((node) => {
                            const health = calculateMachineHealth(node);
                            return (
                                <div key={node.nodeId} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{ backgroundColor: node.isOnline ? '#16a34a' : '#dc2626' }}
                                        />
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

            {/* ── Machine Cards Grid ── */}
            <div>
                <div className="section-title mb-4">All Machines</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nodeData.map((node) => (
                        <MachineCard key={node.nodeId} node={node} />
                    ))}
                </div>
            </div>
        </div>
    );
}
