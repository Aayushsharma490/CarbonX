'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '@/context/SystemContext';
import { useTelemetry } from '@/context/TelemetryContext';
import { GaugeChart } from '@/components/GaugeChart';
import { Tabs, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Activity, RefreshCw } from 'lucide-react';
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

    if (!mounted || loading) return (
        <div className="flex items-center justify-center py-32 text-gray-400 font-medium gap-3">
            <RefreshCw size={18} className="animate-spin" />
            Loading machine data…
        </div>
    );

    const filteredMachines = nodeData.filter(m => m.zone === activeZone);

    return (
        <div className="fade-in space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Machine Health</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Real-time health scores, gauges, temperature and vibration data across all zones.
                    </p>
                </div>
                <div className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm font-medium text-gray-500 shrink-0">
                    {nodeData.filter(n => n.isOnline).length}/{nodeData.length} Online
                </div>
            </div>

            {/* Zone Tabs */}
            <Tabs value={activeZone} onValueChange={setActiveZone} className="w-full">
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit flex-wrap mb-5">
                    {ZONES.map(zone => (
                        <TabsTrigger
                            key={zone}
                            value={zone}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                'data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm',
                                'data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700'
                            )}
                        >
                            {zone}
                        </TabsTrigger>
                    ))}
                </div>

                {ZONES.map(zone => (
                    <TabsContent key={zone} value={zone}>
                        <div className="grid grid-cols-1 gap-5">
                            {filteredMachines.length > 0 ? (
                                filteredMachines.map(machine => {
                                    const health = calculateMachineHealth(machine);
                                    const statusColor = getStatusColor(health.status);
                                    const statusLabel = !machine.isOnline ? 'Offline'
                                        : health.score >= 80 ? 'Good'
                                        : health.score >= 60 ? 'Warning' : 'Critical';

                                    return (
                                        <div
                                            key={machine.nodeId}
                                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all"
                                        >
                                            {/* Card header */}
                                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{machine.name}</div>
                                                        <div className="text-xs text-gray-400">{machine.nodeId} · {machine.phaseType}-phase</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right hidden sm:block">
                                                        <div className="text-xs text-gray-400">Health Score</div>
                                                        <div className="font-bold" style={{ color: statusColor }}>{health.score}%</div>
                                                    </div>
                                                    <span className={cn(
                                                        'px-3 py-1 rounded-full text-xs font-semibold',
                                                        !machine.isOnline ? 'bg-gray-100 text-gray-500'
                                                        : health.score >= 80 ? 'bg-green-50 text-green-700'
                                                        : health.score >= 60 ? 'bg-amber-50 text-amber-700'
                                                        : 'bg-red-50 text-red-700'
                                                    )}>
                                                        {statusLabel}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Gauges */}
                                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                                                <GaugeChart
                                                    label="Active Power"
                                                    value={machine.currentKw}
                                                    max={machine.targetKw * 1.5}
                                                    unit="kW"
                                                />
                                                <GaugeChart
                                                    label="Phase Current"
                                                    value={machine.phaseCurrents[0]}
                                                    max={100}
                                                    unit="Amps"
                                                />
                                                <GaugeChart
                                                    label="Phase Voltage"
                                                    value={machine.phaseVoltages[0]}
                                                    max={500}
                                                    unit="Volts"
                                                />
                                            </div>

                                            {/* Metrics strip */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-gray-50">
                                                {[
                                                    { label: 'Power Factor', value: `${(machine.powerFactor * 100).toFixed(0)}%` },
                                                    { label: 'CO₂ Level',    value: `${machine.ppm} PPM` },
                                                    { label: 'Temperature',  value: `${machine.temperature.toFixed(1)}°C` },
                                                    { label: 'Vibration',    value: `${machine.vibration.toFixed(2)} mm/s` },
                                                ].map(({ label, value }, j) => (
                                                    <div key={j} className={cn('p-4', j < 3 && 'border-r border-gray-50')}>
                                                        <div className="text-xs text-gray-400 font-medium mb-1">{label}</div>
                                                        <div className="font-semibold text-gray-800">{value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
                                    <Activity size={36} className="text-gray-300 mb-4" />
                                    <div className="font-semibold text-gray-600">No machines in this zone</div>
                                    <p className="text-sm text-gray-400 mt-1">No devices assigned to {zone} yet.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
