'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '@/context/SystemContext';
import { useTelemetry } from '@/context/TelemetryContext';
import { GaugeChart } from '@/components/GaugeChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Activity, ShieldCheck, Zap, Thermometer, Info, Wind, HeartPulse } from 'lucide-react';
import type { TXEnergyUnit } from '@/types/energy';
import { cn } from '@/lib/utils';
import { calculateMachineHealth, getStatusColor } from '@/lib/energyCalculations';

export default function MachinesPage() {
    const { config } = useSystem();
    const { nodeData, loading } = useTelemetry();
    const [mounted, setMounted] = useState(false);

    const ZONES = Array.from(new Set(config.txUnits.map(tx => tx.name)));
    const [activeZone, setActiveZone] = useState('');

    useEffect(() => {
        setMounted(true);
        if (ZONES.length > 0 && !activeZone) setActiveZone(ZONES[0]);
    }, [ZONES, activeZone]);

    if (!mounted || loading) return <div className="p-20 text-center">Loading Machine Health...</div>;

    const filteredMachines = nodeData.filter(m => m.zone === activeZone);

    return (
        <div className="fade-in space-y-8 pb-20">
            {/* Header Area */}
            <div className="glass-thick p-6 md:p-10 md:rounded-[50px] rounded-[35px] flex flex-col lg:flex-row justify-between items-start lg:items-center shadow-sm relative group">
                <div className="absolute inset-0 grid-overlay opacity-10 -z-10 rounded-[inherit] overflow-hidden" />
                <div className="relative z-10 space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase text-brand-green-dark flex items-center gap-4">
                        <Activity className="text-brand-green-light" size={36} />
                        Machine Health
                    </h1>
                    <p className="text-brand-green-dark/60 font-medium text-sm md:text-base">Real-time telemetry and gauge monitoring across plant zones.</p>
                </div>

                <div className="mt-8 lg:mt-0 flex gap-4 relative z-10">
                    <div className="glass-thick bg-brand-green-light/10 border-brand-green-light/20 px-8 py-4 rounded-3xl shadow-sm">
                        <div className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] text-brand-green-dark">Nodes Operational</div>
                        <div className="text-3xl font-black text-brand-green-dark italic">{filteredMachines.length} <span className="text-sm opacity-40 uppercase">/ {nodeData.length} Total</span></div>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green-light/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Zone Filter Tabs */}
            <Tabs value={activeZone} onValueChange={setActiveZone} className="w-full">
                <TabsList className="bg-transparent h-auto p-0 gap-4 flex-wrap">
                    {ZONES.map(zone => (
                        <TabsTrigger
                            key={zone}
                            value={zone}
                            className={cn(
                                "px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300",
                                "data-[state=active]:bg-brand-green-dark data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-brand-green-dark/20",
                                "data-[state=inactive]:bg-white/50 data-[state=inactive]:text-brand-green-dark/40 data-[state=inactive]:hover:bg-white"
                            )}
                        >
                            {zone}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {ZONES.map(zone => (
                    <TabsContent key={zone} value={zone} className="mt-8">
                        <div className="grid grid-cols-1 gap-8">
                                    {filteredMachines.length > 0 ? (
                                        filteredMachines.map(machine => {
                                            const health = calculateMachineHealth(machine);
                                            const statusColor = getStatusColor(health.status);

                                            return (
                                                <Card key={machine.nodeId} className="glass-card border-none overflow-hidden hover:shadow-2xl transition-all duration-500 md:rounded-[35px] rounded-3xl">
                                                    <CardHeader className="bg-brand-green-dark/[0.02] border-b border-black/5 p-6">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <CardTitle className="text-2xl font-black text-brand-green-dark flex items-center gap-3">
                                                                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
                                                                    {machine.name}
                                                                </CardTitle>
                                                                <Badge variant="outline" className="mt-2 bg-white/50 border-black/5 text-[10px] font-black uppercase">
                                                                    ID: {machine.nodeId} • {machine.phaseType} Phase
                                                                </Badge>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">AI Health Score</div>
                                                                <div className="text-2xl font-black" style={{ color: statusColor }}>{health.score}%</div>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-8">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                                            {/* Gauge 1: Power */}
                                                            <GaugeChart
                                                                label={`${machine.zone} Power`}
                                                                value={machine.currentKw}
                                                                max={machine.targetKw * 1.5}
                                                                unit="kW"
                                                            />

                                                            {/* Gauge 2: Current */}
                                                            <GaugeChart
                                                                label={`${machine.zone} Current`}
                                                                value={machine.phaseCurrents[0]}
                                                                max={100}
                                                                unit="Amps"
                                                            />

                                                            {/* Gauge 3: Voltage */}
                                                            <GaugeChart
                                                                label={`${machine.zone} Voltage`}
                                                                value={machine.phaseVoltages[0]}
                                                                max={500}
                                                                unit="Volts"
                                                            />
                                                        </div>

                                                        {/* Machine Details Footer */}
                                                        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:rounded-3xl rounded-2xl bg-black/5">
                                                            <div className="p-4 border-r border-black/5">
                                                                <div className="flex items-center gap-2 text-[10px] font-black opacity-40 uppercase mb-1">
                                                                    <HeartPulse size={14} className="text-brand-green-light" /> Load Profile
                                                                </div>
                                                                <div className="font-black text-brand-green-dark">{(machine.powerFactor * 100).toFixed(0)}% <span className="text-[10px] opacity-40 uppercase">Eff</span></div>
                                                            </div>
                                                            <div className="p-4 border-r border-black/5">
                                                                <div className="flex items-center gap-2 text-[10px] font-black opacity-40 uppercase mb-1">
                                                                    <Wind size={14} className="text-brand-yellow" /> Carbon Drift
                                                                </div>
                                                                <div className="font-black text-brand-green-dark">{machine.ppm} <span className="text-[10px] opacity-40">PPM</span></div>
                                                            </div>
                                                            <div className="p-4 border-r border-black/5">
                                                                <div className="flex items-center gap-2 text-[10px] font-black opacity-40 uppercase mb-1">
                                                                    <Thermometer size={14} className="text-blue-500" /> Operating Temp
                                                                </div>
                                                                <div className="font-black text-brand-green-dark">{machine.temperature.toFixed(1)}°C</div>
                                                            </div>
                                                            <div className="p-4">
                                                                <div className="flex items-center gap-2 text-[10px] font-black opacity-40 uppercase mb-1">
                                                                    <Zap size={14} className="text-orange-500" /> Vibration
                                                                </div>
                                                                <div className="font-black text-brand-green-dark">{machine.vibration.toFixed(2)} <span className="text-[10px] opacity-40">mm/s</span></div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                            ) : (
                                <div className="glass p-20 md:rounded-[40px] rounded-3xl text-center border-none shadow-sm">
                                    <div className="w-20 h-20 bg-brand-green-light/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Activity className="text-brand-green-light/40" size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-brand-green-dark mb-2">No Machines Detected</h3>
                                    <p className="text-brand-green-dark/40 font-medium">There are no TX nodes assigned to {zone} in the system config.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
