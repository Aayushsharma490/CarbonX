'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Activity, Zap, Leaf, AlertTriangle,
    ArrowDownRight, ArrowUpRight, Download, Server,
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { NotificationOverlay } from '@/components/NotificationSystem';
import { FormulaIntelligence } from '@/components/FormulaIntelligence';
import { useEnergyNotifications } from '@/hooks/useEnergyNotifications';
import { calculateEnergyLoss, calculateMachineHealth, kwhToCo2Kg, getStatusColor } from '@/lib/energyCalculations';
import { debounce } from '@/lib/debounce';
import { cn } from '@/lib/utils';
import { useSystem } from '@/context/SystemContext';
import { useTelemetry } from '@/context/TelemetryContext';
import type { RXEnergyUnit, TXEnergyUnit } from '@/types/energy';

const COLORS = ['#10b981', '#fb923c', '#3b82f6', '#facc15'];

const historicalTrendPlaceholder = [
    { time: '00:00', kwh: 120, predicted: 125 },
    { time: '04:00', kwh: 110, predicted: 115 },
    { time: '08:00', kwh: 350, predicted: 340 },
    { time: '12:00', kwh: 480, predicted: 490 },
    { time: '16:00', kwh: 520, predicted: 510 },
    { time: '20:00', kwh: 310, predicted: 300 },
];

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const { addNotification } = useEnergyNotifications();
    const { config } = useSystem();
    const { gatewayData, loading, isLive, latestLogs } = useTelemetry();

    const debouncedLossCheck = useRef(
        debounce((gw: RXEnergyUnit) => {
            const lossResult = calculateEnergyLoss(gw);
            if (lossResult.status === 'critical-loss') {
                addNotification({
                    severity: 'critical',
                    title: '⚡ Critical Energy Loss',
                    message: `${gw.name}: ${lossResult.lossPercent.toFixed(1)}% loss detected.`,
                    gatewayId: gw.gatewayId,
                    lossPercent: lossResult.lossPercent,
                });
            }
        }, 500)
    ).current;

    useEffect(() => { setMounted(true); }, []);

    // --- 1. Transmission Loss Monitor (Legacy) ---
    useEffect(() => {
        if (mounted && gatewayData) {
            debouncedLossCheck(gatewayData);
        }
    }, [mounted, gatewayData, debouncedLossCheck]);

    // --- 2. Live Telemetry Alert Monitor (New) ---
    const lastProcessedLogId = useRef<string | null>(null);

    useEffect(() => {
        if (!mounted || !latestLogs || latestLogs.length === 0) return;

        const latestLog = latestLogs[0];
        if (latestLog.id === lastProcessedLogId.current) return;

        lastProcessedLogId.current = latestLog.id;

        // Extract telemetry data
        const nodeId = latestLog.node_id || latestLog.nodeId || "Unknown";
        const rawTel = latestLog.telemetry || {};
        const temp = latestLog.Temp || rawTel.temperature_c;
        const vibration = latestLog.Vib || rawTel.vibration_v_rms;
        const status = latestLog.status;

        // Alert Triggering Logic
        if (temp > 65) {
            addNotification({
                severity: 'critical',
                title: '🔥 High Temperature',
                message: `${nodeId}: Critical temperature detected (${temp}°C)!`,
                nodeId
            });
        } else if (temp > 55) {
            addNotification({
                severity: 'warning',
                title: '⚠️ Temperature Warning',
                message: `${nodeId}: Temperature rising (${temp}°C).`,
                nodeId
            });
        }

        if (vibration === 'HIGH' || vibration > 4.0) {
            addNotification({
                severity: 'critical',
                title: '📳 High Vibration',
                message: `${nodeId}: Abnormal vibration levels detected!`,
                nodeId
            });
        }

        if (status === 'WARNING' || status === 'CRITICAL') {
            addNotification({
                severity: status === 'CRITICAL' ? 'critical' : 'warning',
                title: `📡 System ${status}`,
                message: `${nodeId}: ${latestLog.message || 'Anomalous operational state detected.'}`,
                nodeId
            });
        }

    }, [mounted, latestLogs, addNotification]);

    if (!mounted || loading) return <div className="p-20 text-center">Loading CarbonX Dashboard...</div>;
    if (!gatewayData) return <div className="p-20 text-center text-brand-green-dark/40">Waiting for Telemetry Feed...</div>;

    const gateway = gatewayData;

    const lossResult = calculateEnergyLoss(gateway);
    const totalCo2 = kwhToCo2Kg(gateway.totalKwh);
    const trendData = [...historicalTrendPlaceholder, { time: 'Now', kwh: Math.round(gateway.totalKwh / 10), predicted: 285 }];
    const pieData = gateway.txNodes.map((n) => ({ name: n.nodeId, value: Math.round(n.kwh) }));

    return (
        <div className="space-y-6 pb-10 fade-in px-4 md:px-0">
            <NotificationOverlay />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-8 glass-thick md:rounded-[50px] rounded-[35px] shadow-sm border border-brand-green-light/10 relative group">
                <div className="absolute inset-0 grid-overlay opacity-10 -z-10 rounded-[inherit] overflow-hidden" />
                <div className="flex items-center gap-5">
                    <div className="w-18 h-18 rounded-3xl bg-brand-green-light/5 flex items-center justify-center border border-brand-green-light/20 shadow-inner group-hover:bg-brand-green-light/10 transition-colors">
                        <Image src="/carbon_logo.png" alt="Logo" width={50} height={50} className="group-hover:rotate-12 transition-transform duration-500 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-brand-green-dark leading-none">Command Center</h1>
                        <p className="text-brand-green-dark/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Node Protocol: {gateway.name}</p>
                    </div>
                </div>
                <div className="mt-6 lg:mt-0 flex flex-wrap gap-3 items-center">
                    <FormulaIntelligence />
                    <Badge variant="outline" className="bg-brand-green-light/10 border-brand-green-light/20 text-brand-green-light px-6 py-2.5 rounded-full font-black italic uppercase tracking-widest text-[10px] flex items-center shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-green-light animate-pulse mr-3" />
                        Live Rx/Tx
                    </Badge>
                    <Badge variant="outline" className="bg-brand-yellow/10 border-brand-yellow/20 text-brand-yellow px-6 py-2.5 rounded-full font-black italic uppercase tracking-widest text-[10px] shadow-sm">
                        AI Verified
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card theme-mint shine-hover border-none shadow-sm md:rounded-[35px] rounded-3xl">
                    <CardContent className="p-7">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center border border-white shadow-inner">
                                <Zap className="text-emerald-700" size={24} />
                            </div>
                            <ArrowUpRight className="text-emerald-700/20" size={20} />
                        </div>
                        <div className="text-[10px] font-black text-emerald-900/30 uppercase tracking-[0.2em] mb-1 italic">Consolidated RX</div>
                        <div className="text-4xl font-black text-emerald-900 tracking-tighter italic">{gateway.totalKwh.toFixed(0)} <span className="text-lg opacity-30">kWh</span></div>
                        <div className="text-[8px] font-black text-emerald-700/40 mt-6 bg-white/40 px-3 py-1.5 rounded-full w-fit uppercase tracking-widest shadow-sm">Protocol 4.0 Reading</div>
                    </CardContent>
                </Card>

                <Card className="glass-card theme-peach shine-hover border-none shadow-sm md:rounded-[35px] rounded-3xl">
                    <CardContent className="p-7">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center border border-white shadow-inner">
                                <Leaf className="text-orange-700" size={24} />
                            </div>
                            <Activity className="text-orange-700/20" size={20} />
                        </div>
                        <div className="text-[10px] font-black text-orange-900/30 uppercase tracking-[0.2em] mb-1 italic">Carbon Footprint</div>
                        <div className="text-4xl font-black text-orange-900 tracking-tighter italic">{totalCo2.toFixed(0)} <span className="text-lg opacity-30">kg</span></div>
                        <div className="text-[8px] font-black text-orange-700/40 mt-6 bg-white/40 px-3 py-1.5 rounded-full w-fit uppercase tracking-widest shadow-sm">Delta Tracking</div>
                    </CardContent>
                </Card>

                <Card className="glass-card theme-blue shine-hover border-none shadow-sm md:rounded-[35px] rounded-3xl">
                    <CardContent className="p-7">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center border border-white shadow-inner">
                                <Server className="text-blue-700" size={24} />
                            </div>
                            <Download className="text-blue-700/20" size={20} />
                        </div>
                        <div className="text-[10px] font-black text-blue-900/30 uppercase tracking-[0.2em] mb-1 italic">Stability Score</div>
                        <div className="text-4xl font-black text-blue-900 tracking-tighter italic">92 <span className="text-lg opacity-30">/100</span></div>
                        <Progress value={92} className="h-2 mt-6 bg-blue-900/5 rounded-full" />
                    </CardContent>
                </Card>

                <Card className="glass-card theme-yellow shine-hover border-none shadow-sm md:rounded-[35px] rounded-3xl">
                    <CardContent className="p-7">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center border border-white shadow-inner">
                                <AlertTriangle className="text-yellow-700" size={24} />
                            </div>
                            <ArrowDownRight className="text-yellow-700/20" size={20} />
                        </div>
                        <div className="text-[10px] font-black text-yellow-900/30 uppercase tracking-[0.2em] mb-1 italic">Transmission Loss</div>
                        <div className="text-4xl font-black text-yellow-900 tracking-tighter italic">{lossResult.lossPercent.toFixed(1)} <span className="text-lg opacity-30">%</span></div>
                        <div className="text-[8px] font-black text-yellow-700 mt-6 bg-white/60 px-3 py-1.5 rounded-full w-fit uppercase tracking-widest border border-yellow-700/10">Limit: {config.lossThreshold}%</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Device Monitor */}
                <Card className="glass-card md:rounded-[40px] rounded-3xl border-brand-green-light/5 lg:col-span-1">
                    <CardHeader className="pt-8 px-8">
                        <CardTitle className="text-brand-green-dark text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                            <Activity className="text-brand-green-light" size={20} />
                            Active Monitor
                        </CardTitle>
                        <p className="text-[10px] font-bold text-brand-green-dark/40 uppercase tracking-widest italic">Live Hardware Heartbeat</p>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {gateway.txNodes.map((node) => (
                                <div key={node.nodeId} className="flex items-center justify-between p-3 rounded-2xl bg-brand-green-light/5 border border-brand-green-light/10">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-2.5 h-2.5 rounded-full animate-pulse",
                                            node.isOnline ? "bg-brand-green-light" : "bg-red-400"
                                        )} />
                                        <div>
                                            <div className="text-[10px] font-black text-brand-green-dark uppercase italic leading-tight">{node.name}</div>
                                            <div className="text-[8px] font-bold text-brand-green-dark/40 uppercase tracking-widest leading-tight">{node.nodeId}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] font-black text-brand-green-dark italic">{node.isOnline ? 'LATENCY: 12ms' : 'OFFLINE'}</div>
                                        <div className="text-[7px] font-bold text-brand-green-dark/30 uppercase tracking-[0.2em]">{new Date(node.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Vibration & Stress Analysis */}
                <Card className="glass-card md:rounded-[40px] rounded-3xl border-brand-green-light/5 lg:col-span-2 overflow-hidden flex flex-col justify-between">
                    <CardHeader className="pt-8 px-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-brand-green-dark text-xl font-black italic uppercase tracking-tight">Plant Load Trend</CardTitle>
                            <p className="text-[10px] font-bold text-brand-green-dark/40 uppercase tracking-widest italic">Live Hardware Heartbeat (kWh)</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-600 uppercase italic">Actively Tracking</span>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px] pb-6 px-6 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <defs>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.03} vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#000"
                                    strokeOpacity={0.2}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#064e3b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#000"
                                    strokeOpacity={0.2}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#064e3b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <RechartsTooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white/90 backdrop-blur-md border border-brand-green-light/20 p-4 rounded-[25px] shadow-2xl flex flex-col gap-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-green-dark/40 mb-1">{payload[0].payload.time}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                                                        <p className="text-sm font-black italic text-brand-green-dark">{payload[0].value} <span className="text-[10px] opacity-40">kWh</span></p>
                                                    </div>
                                                    {payload[1] && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                                                            <p className="text-sm font-black italic text-brand-green-dark/60">{payload[1].value} <span className="text-[10px] opacity-40">Pred.</span></p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="kwh"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    filter="url(#glow)"
                                    animationDuration={1500}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="predicted"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                    animationDuration={2000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {gateway.txNodes.map((node, idx) => {
                    const health = calculateMachineHealth(node);
                    const color = getStatusColor(health.status);
                    const themes = [
                        'bg-[#F0FFF4] border-[#D1FAE5]', // Minty
                        'bg-[#FFF5F0] border-[#FFEDD5]', // Peachy
                        'bg-[#F0F9FF] border-[#E0F2FE]', // Blueish
                        'bg-[#FEFCE8] border-[#FEF9C3]'  // Yellowish
                    ];

                    return (
                        <Card key={node.nodeId} className={cn(
                            "border-none shadow-none rounded-[50px] overflow-hidden transition-all duration-500 hover:scale-[1.02]",
                            themes[idx % 4]
                        )}>
                            <CardContent className="p-10 pt-12 relative overflow-hidden">
                                {/* Top Header */}
                                <div className="flex justify-between items-start mb-10">
                                    <div className="space-y-3">
                                        <h3 className="text-4xl font-black italic tracking-tighter text-brand-green-dark leading-none">
                                            {node.name}
                                        </h3>
                                        <Badge variant="outline" className="bg-white/80 border-black/5 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full text-brand-green-dark/60">
                                            {node.phaseType === 'three' ? 'THREE PH PROTOCOL' : 'SINGLE PH PROTOCOL'}
                                        </Badge>
                                    </div>
                                    <div className="w-4 h-4 rounded-full shadow-sm animate-pulse" style={{ backgroundColor: color }} />
                                </div>

                                {/* Real Logs */}
                                <div className="space-y-4 mb-10">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black italic uppercase tracking-widest text-brand-green-dark/30">Real Logs</span>
                                        <span className="text-sm font-black italic tracking-tighter text-brand-green-dark">{health.score}%</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-brand-green-dark/5 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_12px_rgba(0,0,0,0.2)]"
                                            style={{
                                                width: `${health.score}%`,
                                                backgroundColor: color,
                                                boxShadow: `0 0 10px ${color}80`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Load/Cap Pills */}
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-white/80 rounded-full px-6 py-4 border border-white flex flex-col items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                                        <div className="text-[8px] font-black uppercase opacity-20 mb-0.5">LOAD</div>
                                        <div className="text-lg font-black italic text-brand-green-dark -mt-1 truncate drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]">
                                            {node.currentKw.toFixed(1)} <span className="text-[10px] opacity-40">kW</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white/80 rounded-full px-6 py-4 border border-white flex flex-col items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                                        <div className="text-[8px] font-black uppercase opacity-20 mb-0.5">CAP</div>
                                        <div className="text-lg font-black italic text-brand-green-dark -mt-1 truncate drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]">
                                            {node.targetKw.toFixed(0)} <span className="text-[10px] opacity-40">kW</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
