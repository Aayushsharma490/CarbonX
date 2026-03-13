'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '@/context/SystemContext';
import { useTelemetry } from '@/context/TelemetryContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Activity, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateMachineHealth } from '@/lib/energyCalculations';

export default function ReportsPage() {
    const { nodeData, loading } = useTelemetry();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || loading) return <div className="p-20 text-center text-brand-green-dark/40">Loading Report Console...</div>;

    return (
        <div className="space-y-8 pb-10 fade-in px-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-8 glass-thick md:rounded-[50px] rounded-[35px] shadow-sm border border-brand-green-light/10 relative group">
                <div className="absolute inset-0 grid-overlay opacity-10 -z-10 rounded-[inherit] overflow-hidden" />
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-brand-green-light/5 flex items-center justify-center border border-brand-green-light/20 shadow-inner">
                        <FileText className="text-brand-green-dark" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-brand-green-dark leading-none">System Reports</h1>
                        <p className="text-brand-green-dark/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">All Nodes Protocol Inventory</p>
                    </div>
                </div>
                <div className="mt-6 lg:mt-0">
                    <Badge variant="outline" className="bg-brand-green-light/10 border-brand-green-light/20 text-brand-green-light px-6 py-2.5 rounded-full font-black italic uppercase tracking-widest text-[10px] shadow-sm">
                        Total Nodes: {nodeData.length}
                    </Badge>
                </div>
            </div>

            <Card className="glass-card md:rounded-[40px] rounded-3xl border-brand-green-light/5">
                <CardHeader className="pt-8 px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-brand-green-dark text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                                <Activity className="text-brand-green-light" size={20} />
                                Master Data Ledger
                            </CardTitle>
                            <p className="text-[10px] font-bold text-brand-green-dark/40 uppercase tracking-widest italic mt-1">
                                Full system node telemetry and health inventory
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-brand-green-light/10">
                                    <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest leading-none">Node Identity</TableHead>
                                    <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest leading-none">Zone Location</TableHead>
                                    <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest leading-none">Status</TableHead>
                                    <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest leading-none text-right">Health Score</TableHead>
                                    <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest leading-none text-right">L1 (V)</TableHead>
                                    <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest leading-none text-right">Energy (kWh)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {nodeData.map(device => {
                                    const health = calculateMachineHealth(device);
                                    return (
                                        <TableRow key={device.nodeId} className="border-brand-green-light/5 hover:bg-brand-green-light/5 transition-colors">
                                            <TableCell className="font-black text-brand-green-dark text-sm py-5">
                                                <div>
                                                    <div className="font-black">{device.name}</div>
                                                    <div className="text-[9px] text-brand-green-dark/40 font-bold uppercase tracking-wider">{device.nodeId}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[11px] font-bold text-brand-green-dark/60 uppercase italic">{device.zone}</TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="outline" 
                                                    className={cn(
                                                        "font-black text-[9px] uppercase tracking-widest px-3 py-1",
                                                        device.isOnline 
                                                            ? "bg-brand-green-light/10 border-brand-green-light/20 text-brand-green-light" 
                                                            : "bg-red-500/10 border-red-500/20 text-red-500"
                                                    )}
                                                >
                                                    {device.isOnline ? 'ONLINE' : 'OFFLINE'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-black text-brand-green-dark text-right text-sm">{health.score}%</TableCell>
                                            <TableCell className="font-black text-brand-green-dark text-right text-sm">{device.phaseVoltages[0].toFixed(1)}v</TableCell>
                                            <TableCell className="font-black text-brand-green-dark text-right text-sm">{device.kwh.toFixed(2)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
