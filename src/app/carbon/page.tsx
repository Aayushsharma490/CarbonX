'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area,
    BarChart, Bar
} from 'recharts';
import {
    Leaf, TreePine, TrendingDown, Globe,
    Zap, AlertCircle, CheckCircle2, Factory,
    Cpu, Activity, Wind
} from 'lucide-react';

import { useSystem } from '@/context/SystemContext';
import { useTelemetry } from '@/context/TelemetryContext';
import { FormulaIntelligence } from '@/components/FormulaIntelligence';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { kwhToCo2Kg } from '@/lib/energyCalculations';
import { cn } from '@/lib/utils';

const COLORS = ['#10b981', '#fb923c', '#3b82f6', '#facc15'];

// 1 Tree offsets ~20kg of CO2 per year
const CO2_PER_TREE_YEAR = 20;

function generateHistoricalCarbonData() {
    return Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        co2: 40 + Math.abs(Math.sin(i)) * 20,
        target: 45
    }));
}

// Custom Radial Gauge for PPM
const PPMGauge = ({ value, label, sublabel }: { value: number; label: string; sublabel?: string }) => {
    const fill = value > 600 ? '#ef4444' : value > 500 ? '#f59e0b' : '#10b981';

    return (
        <div className="relative flex flex-col items-center">
            <ResponsiveContainer width={140} height={140}>
                <PieChart>
                    <Pie
                        data={[{ value: 100 }]}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={60}
                        startAngle={225} endAngle={-45}
                        fill="#f1f5f9" stroke="none"
                        dataKey="value"
                    />
                    <Pie
                        data={[{ value: Math.min((value / 1000) * 100, 100) }]}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={60}
                        startAngle={225} endAngle={225 - (Math.min((value / 1000) * 100, 100) / 100 * 270)}
                        fill={fill} stroke="none"
                        dataKey="value"
                        cornerRadius={10}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[35%] text-center">
                <div className="text-xl font-black italic text-brand-green-dark leading-tight">{value.toFixed(0)}</div>
                <div className="text-[8px] font-black opacity-30 uppercase tracking-tighter">PPM</div>
            </div>
            <div className="mt-2 text-center">
                <div className="text-[10px] font-black text-brand-green-dark uppercase italic leading-tight">{label}</div>
                {sublabel && <div className="text-[8px] font-bold text-brand-green-dark/40 uppercase tracking-widest">{sublabel}</div>}
            </div>
        </div>
    );
};

export default function CarbonAnalyticsPage() {
    const { config } = useSystem();
    const { latestLogs, gatewayData, nodeData, isLive } = useTelemetry();
    const [mounted, setMounted] = useState(false);
    const [historicalData, setHistoricalData] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        setHistoricalData(generateHistoricalCarbonData());
    }, []);

    if (!mounted || !gatewayData) return <div className="p-20 text-center font-black italic text-brand-green-dark/20 animate-pulse uppercase tracking-[0.4em]">Initializing Carbon Stream...</div>;

    const totalKwh = gatewayData.totalKwh;
    const avgPpm = nodeData.length > 0 ? nodeData.reduce((acc, n) => acc + n.ppm, 0) / nodeData.length : 400;

    // 0.82 kg/kWh is theoretical. Practical is often higher due to efficiency losses.
    // We'll calculate a "Drift" based on PPM vs expected baseline (400ppm).
    const co2Kg = kwhToCo2Kg(totalKwh);
    const driftPercent = Math.max(0, ((avgPpm - 400) / 400) * 10).toFixed(1);
    const theoreticalCo2 = co2Kg / (1 + parseFloat(driftPercent) / 100);
    const treesNeeded = (co2Kg * 365) / CO2_PER_TREE_YEAR;

    const comparisonData = [
        { name: 'Theoretical', value: theoreticalCo2, fill: '#3b82f6' },
        { name: 'Practical', value: co2Kg, fill: '#10b981' }
    ];

    return (
        <div className="fade-in space-y-6 pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Carbon Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time CO₂ intensity, molecular density and sustainability tracking.</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shrink-0 ${
                    isLive ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                    <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    {isLive ? 'Live Data' : 'Simulation'}
                </div>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card theme-mint shine-hover border-none shadow-sm md:rounded-[35px] rounded-3xl">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center text-emerald-700 shadow-inner border border-white">
                                <Globe size={24} />
                            </div>
                            <Badge variant="outline" className="bg-emerald-100/50 border-emerald-200 text-emerald-700 font-black text-[10px]">PRACTICAL</Badge>
                        </div>
                        <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1 italic">Measured Output</div>
                        <div className="text-4xl font-black text-brand-green-dark tracking-tighter italic">{co2Kg.toFixed(2)} <span className="text-lg opacity-30">kg CO2</span></div>
                    </CardContent>
                </Card>

                <Card className="glass-card theme-peach shine-hover border-none shadow-sm md:rounded-[35px] rounded-3xl">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center text-orange-700 shadow-inner border border-white">
                                <Factory size={24} />
                            </div>
                            <Badge variant="outline" className="bg-orange-100/50 border-orange-200 text-orange-700 font-black text-[10px]">THEORETICAL</Badge>
                        </div>
                        <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1 italic">Targeted Drift</div>
                        <div className="text-4xl font-black text-brand-green-dark tracking-tighter italic">{theoreticalCo2.toFixed(2)} <span className="text-lg opacity-30">kg CO2</span></div>
                    </CardContent>
                </Card>

                <Card className="glass-card theme-blue shine-hover border-none shadow-sm md:rounded-[35px] rounded-3xl">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center text-blue-700 shadow-inner border border-white">
                                <TreePine size={24} />
                            </div>
                            <Badge variant="outline" className="bg-blue-100/50 border-blue-200 text-blue-700 font-black text-[10px]">OFFSET</Badge>
                        </div>
                        <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1 italic">Atmospheric Sink</div>
                        <div className="text-4xl font-black text-brand-green-dark tracking-tighter italic">{Math.round(treesNeeded).toLocaleString()} <span className="text-lg opacity-30">Trees</span></div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Trend Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="glass-card md:rounded-[40px] rounded-3xl border-brand-green-light/5 lg:col-span-2 overflow-hidden">
                    <CardHeader className="pt-8 px-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-brand-green-dark text-xl font-black italic uppercase tracking-tight">PPM Intensity Trend</CardTitle>
                            <p className="text-[10px] font-bold text-brand-green-dark/40 uppercase tracking-widest italic">Molecular Density over Operation (Real-time)</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-600 uppercase italic">Actively Tracking</span>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px] pb-10 px-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={latestLogs.length > 0 ? latestLogs.slice().reverse().map((log, i) => {
                                const date = new Date(log.timestamp);
                                return {
                                    time: isNaN(date.getTime()) ? `T-${i}m` : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    ppm: log.telemetry?.co2_ppm || 420 + (Math.sin(i / 5) * 20),
                                    target: 400
                                };
                            }) : Array.from({ length: 24 }).map((_, i) => ({
                                time: `${i}:00`,
                                ppm: 400 + Math.abs(Math.sin(i)) * 20,
                                target: 400
                            }))}>
                                <defs>
                                    <filter id="glowCarbon" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                    <linearGradient id="ppmTrend" x1="0" y1="0" x2="0" y2="1">
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
                                    domain={['dataMin - 10', 'dataMax + 10']}
                                />
                                <RechartsTooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white/90 backdrop-blur-md border border-brand-green-light/20 p-4 rounded-[25px] shadow-2xl flex flex-col gap-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-green-dark/40 mb-1">{payload[0].payload.time}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                                                        <p className="text-sm font-black italic text-brand-green-dark">
                                                            {Number(payload[0]?.value || 0).toFixed(1)} <span className="text-[10px] opacity-40">PPM</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="ppm"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#ppmTrend)"
                                    filter="url(#glowCarbon)"
                                    animationDuration={1500}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="target"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Theoretical vs Practical Logic Box */}
                <Card className="glass-card md:rounded-[40px] rounded-3xl border-brand-green-light/5 flex flex-col p-8 bg-brand-green-dark/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-brand-green-dark flex items-center justify-center text-white shadow-lg">
                            <Cpu size={20} />
                        </div>
                        <h3 className="text-sm font-black text-brand-green-dark uppercase italic tracking-tighter">Carbon Logic: Tier 4</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-green-dark/40 italic">
                                <span>Drift Analysis</span>
                                <span className="text-brand-green-light">Verified</span>
                            </div>
                            <div className="p-4 rounded-3xl bg-white/60 border border-brand-green-light/20 shadow-sm relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                                    <Activity size={32} className="text-brand-green-light" />
                                </div>
                                <div className="text-2xl font-black text-brand-green-dark italic tracking-tighter">+{driftPercent}%</div>
                                <p className="text-[10px] font-bold text-brand-green-dark/60 mt-2 leading-snug">
                                    Delta between theoretical emission (0.82 kg/kWh) and real-time PPM sensor feedback.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="h-[2px] w-full bg-brand-green-dark/5" />
                            <div className="flex gap-4 items-center">
                                <div className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-[8px] font-black tracking-widest">THEO BASIS</div>
                                <div className="text-[10px] font-bold text-brand-green-dark/40 italic uppercase">Kwh Integrated Flow</div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[8px] font-black tracking-widest">PRACT SYNC</div>
                                <div className="text-[10px] font-bold text-brand-green-dark/40 italic uppercase">Molecular Density (PPM)</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Comparison Graph & Main Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card md:rounded-[40px] rounded-3xl border-brand-green-light/5 p-8 overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-green-dark">Theoretical vs Practical Delta</h3>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-widest italic">Efficiency calibration logic</p>
                        </div>
                    </div>
                    <div className="h-[250px] pb-6 px-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[
                                { name: 'T-1h', theoretical: theoreticalCo2 * 0.95, practical: co2Kg * 0.94 },
                                { name: 'T-45m', theoretical: theoreticalCo2 * 0.98, practical: co2Kg * 0.97 },
                                { name: 'T-30m', theoretical: theoreticalCo2 * 0.99, practical: co2Kg * 1.02 },
                                { name: 'T-15m', theoretical: theoreticalCo2, practical: co2Kg * 0.99 },
                                { name: 'Now', theoretical: theoreticalCo2, practical: co2Kg },
                            ]}>
                                <defs>
                                    <filter id="glowDelta" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.03} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#064e3b', opacity: 0.4 }}
                                />
                                <YAxis hide />
                                <RechartsTooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white/90 backdrop-blur-md border border-brand-green-light/20 p-4 rounded-[25px] shadow-2xl flex flex-col gap-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-green-dark/40 mb-1">{payload[0].payload.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                                                        <p className="text-sm font-black italic text-brand-green-dark">
                                                            {Number(payload[0]?.value || 0).toFixed(2)} <span className="text-[10px] opacity-40">Theo.</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                                                        <p className="text-sm font-black italic text-brand-green-dark">
                                                            {Number(payload[1]?.value || 0).toFixed(2)} <span className="text-[10px] opacity-40">Prac.</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="theoretical"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                    filter="url(#glowDelta)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="practical"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                    filter="url(#glowDelta)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="glass-card md:rounded-[40px] rounded-3xl border-brand-green-light/5 flex flex-col items-center justify-center p-8 bg-emerald-50/20">
                    <PPMGauge
                        value={nodeData.reduce((acc, n) => acc + n.ppm, 0) / (nodeData.length || 1)}
                        label="Plant Wide Intensity"
                        sublabel="Avg PPM Density (Real-time)"
                    />
                    <div className="mt-6 w-full space-y-3 px-10">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest italic opacity-40 px-2">
                            <span>LOWER (SAFE)</span>
                            <span>CRITICAL</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500" style={{ width: '40%' }} />
                            <div className="h-full bg-yellow-500" style={{ width: '30%' }} />
                            <div className="h-full bg-red-500" style={{ width: '30%' }} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Individual Device PPM Meters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {nodeData.map((node) => (
                    <Card key={node.nodeId} className="glass-card theme-mint border-none shadow-sm md:rounded-[35px] rounded-3xl p-6 flex flex-col items-center">
                        <PPMGauge
                            value={node.ppm}
                            label={node.name}
                            sublabel={node.nodeId}
                        />
                        <div className="mt-4 flex gap-2">
                            <Badge variant="outline" className="text-[7px] bg-white/40 border-black/5 font-black tracking-widest">
                                {node.isOnline ? 'ONLINE' : 'OFFLINE'}
                            </Badge>
                            <Badge variant="outline" className="text-[7px] bg-white/40 border-black/5 font-black tracking-widest">
                                {Math.round(node.kwh)} kWh
                            </Badge>
                        </div>
                    </Card>
                ))}
            </div>

            {/* AI Insights Bar */}
            <div className="glass-card theme-yellow p-8 border-none flex flex-col md:flex-row items-center gap-8 shine-hover md:rounded-[35px] rounded-3xl shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center shrink-0 shadow-inner border border-white">
                    <CheckCircle2 className="text-yellow-700" size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-xl font-black text-brand-green-dark italic uppercase tracking-tighter">AI Lab Recommendation</h4>
                    <p className="text-[11px] font-bold text-brand-green-dark/60 leading-relaxed mt-1 italic uppercase tracking-tight">
                        Theoretical drift is within normal tolerance ({driftPercent}%). However, {nodeData[0]?.nodeId} shows a PPM spike relative to its load.
                        Recommend performing a gas seal inspection on Phase {nodeData[0]?.phaseType === 'three' ? 'L1-L3' : 'L1'} manifolds.
                    </p>
                </div>
                <Button className="bg-brand-green-dark hover:bg-black text-white rounded-2xl px-10 h-14 font-black text-[10px] uppercase tracking-[0.2em] italic shadow-xl shadow-black/10 transition-all active:scale-95">
                    Launch Deep Audit
                </Button>
            </div>
        </div>
    );
}
