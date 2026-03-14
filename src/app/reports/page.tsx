'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '@/context/SystemContext';
import { useTelemetry } from '@/context/TelemetryContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Activity, FileText, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateMachineHealth, kwhToCo2Kg } from '@/lib/energyCalculations';

export default function ReportsPage() {
    const { nodeData, loading, gatewayData } = useTelemetry();
    const [mounted, setMounted] = useState(false);
    
    // Export States
    const [reportPeriod, setReportPeriod] = useState<'daily' | 'monthly'>('daily');
    const [selectedMachineId, setSelectedMachineId] = useState<'all' | string>('all');
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'docs'>('pdf');
    const [exporting, setExporting] = useState(false);

    const [peakUsage, setPeakUsage] = useState({ high: 'N/A', low: 'N/A' });

    useEffect(() => {
        setMounted(true);
        if (nodeData.length > 0) {
            const sorted = [...nodeData].sort((a, b) => b.currentKw - a.currentKw);
            setPeakUsage({
                high: sorted[0]?.name || 'N/A',
                low: sorted[sorted.length - 1]?.name || 'N/A'
            });
        }
    }, [nodeData]);

    const handleExport = async () => {
        setExporting(true);

        const filteredDevices = selectedMachineId === 'all'
            ? nodeData
            : nodeData.filter(d => d.nodeId === selectedMachineId);

        if (exportFormat === 'pdf') {
            window.print();
            setExporting(false);
            return;
        }

        const headers = [
            'Node ID', 'Machine Name', 'Zone', 'Status', 'Health (%)', 
            'Maintenance Due', 'Peak Load (kW)',
            'Load (kW)', 'Energy (kWh)', 'PF',
            'Temp (°C)', 'CO2 (kg)'
        ];
        
        const rows = filteredDevices.map(d => {
            const health = calculateMachineHealth(d);
            const maintenanceDays = Math.floor(health.score / 5);
            return [
                d.nodeId,
                d.name,
                d.zone,
                d.isOnline ? 'ONLINE' : 'OFFLINE',
                `${health.score}%`,
                `${maintenanceDays} Days`,
                d.currentKw.toFixed(2),
                d.currentKw.toFixed(2),
                d.kwh.toFixed(2),
                d.powerFactor.toFixed(2),
                d.temperature.toFixed(1),
                kwhToCo2Kg(d.kwh).toFixed(3)
            ];
        });

        if (exportFormat === 'csv') {
            const csvContent = [
                [`CarbonX Industrial Protocol Report - ${reportPeriod.toUpperCase()}`],
                [`Scope: ${selectedMachineId === 'all' ? 'All System Nodes' : `Machine ${selectedMachineId}`}`],
                [`Usage Insights: Highest Load - ${peakUsage.high} | Lowest Load - ${peakUsage.low}`],
                [`Generation Protocol: AI Verified - ${new Date().toLocaleString()}`],
                [],
                headers,
                ...rows
            ].map(e => e.join(",")).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `CarbonX_Detailed_Report_${selectedMachineId}_${reportPeriod}.csv`);
            link.click();
        } else if (exportFormat === 'docs') {
            const content = `
                <html>
                <body style="font-family: sans-serif; padding: 20px;">
                    <h1 style="color: #064e3b;">CarbonX Detailed Industrial Report</h1>
                    <p><strong>Period:</strong> ${reportPeriod.toUpperCase()}</p>
                    <p><strong>Usage Insights:</strong> Highest Load: ${peakUsage.high} | Lowest Load: ${peakUsage.low}</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                    <table border="1" style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #ecfdf5;">${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                        ${rows.map(row => `<tr>${row.map(cell => `<td style="padding: 5px;">${cell}</td>`).join('')}</tr>`).join('')}
                    </table>
                </body>
                </html>
            `;
            const blob = new Blob([content], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `CarbonX_Detailed_Report_${selectedMachineId}_${reportPeriod}.doc`);
            link.click();
        }

        setTimeout(() => setExporting(false), 800);
    };

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
                <div className="flex flex-col md:flex-row gap-4 mt-6 lg:mt-0">
                    <Badge variant="outline" className="bg-brand-green-light/10 border-brand-green-light/20 text-brand-green-light px-6 py-2.5 rounded-full font-black italic uppercase tracking-widest text-[10px] shadow-sm">
                        Peak Load: {peakUsage.high}
                    </Badge>
                    <Badge variant="outline" className="bg-red-500/10 border-red-500/20 text-red-500 px-6 py-2.5 rounded-full font-black italic uppercase tracking-widest text-[10px] shadow-sm">
                        Min Load: {peakUsage.low}
                    </Badge>
                </div>
            </div>

            <Card className="glass-card md:rounded-[40px] rounded-3xl border-brand-green-light/5 overflow-hidden">
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
                                    <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest leading-none">Status</TableHead>
                                    <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest leading-none text-right">Health</TableHead>
                                    <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest leading-none text-right">Maintenance</TableHead>
                                    <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest leading-none text-right">Load (kW)</TableHead>
                                    <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest leading-none text-right">Energy (kWh)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {nodeData.map(device => {
                                    const health = calculateMachineHealth(device);
                                    const maintenanceDays = Math.floor(health.score / 5);
                                    return (
                                        <TableRow key={device.nodeId} className="border-brand-green-light/5 hover:bg-brand-green-light/5 transition-colors">
                                            <TableCell className="font-black text-brand-green-dark text-sm py-5">
                                                <div>
                                                    <div className="font-black">{device.name}</div>
                                                    <div className="text-[9px] text-brand-green-dark/40 font-bold uppercase tracking-wider">{device.nodeId}</div>
                                                </div>
                                            </TableCell>
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
                                            <TableCell className="font-black text-brand-green-dark text-right text-sm">
                                                <div className="flex flex-col items-end">
                                                    <span>{health.score}%</span>
                                                    <div className="w-16 h-1 bg-black/5 rounded-full overflow-hidden mt-1">
                                                        <div 
                                                            className={cn(
                                                                "h-full transition-all duration-1000",
                                                                health.score > 70 ? "bg-brand-green-light" : health.score > 40 ? "bg-brand-yellow" : "bg-red-500"
                                                            )}
                                                            style={{ width: `${health.score}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-black text-brand-green-dark text-right text-[11px] italic uppercase">
                                                In {maintenanceDays} Days
                                            </TableCell>
                                            <TableCell className="font-black text-brand-green-dark text-right text-sm">{device.currentKw.toFixed(1)}kW</TableCell>
                                            <TableCell className="font-black text-brand-green-dark text-right text-sm">{device.kwh.toFixed(1)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* TX2 Data Section */}
            <Card className="glass-card md:rounded-[40px] rounded-3xl border-brand-green-light/5 overflow-hidden">
                <CardHeader className="pt-8 px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-brand-green-dark text-2xl font-black italic uppercase tracking-tight flex items-center gap-2">
                                <Activity className="text-brand-green-light" size={24} />
                                TX2 Live Data
                            </CardTitle>
                            <p className="text-[10px] font-bold text-brand-green-dark/40 uppercase tracking-widest italic mt-1">
                                Transmitter 2 (Zone-B) - Real-time Telemetry
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    {nodeData.filter(d => d.zone === 'Transmitter 2 (Zone-B)').length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-brand-green-light/10">
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">Machine</TableHead>
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">Load (kW)</TableHead>
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">Temp (°C)</TableHead>
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">Health</TableHead>
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">PF</TableHead>
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">Energy</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {nodeData.filter(d => d.zone === 'Transmitter 2 (Zone-B)').map(device => {
                                        const health = calculateMachineHealth(device);
                                        return (
                                            <TableRow key={device.nodeId} className="border-brand-green-light/5">
                                                <TableCell className="font-black text-brand-green-dark text-sm">
                                                    <div>
                                                        <div className="font-black">{device.name}</div>
                                                        <div className="text-[9px] text-brand-green-dark/40 font-bold uppercase tracking-wider">{device.nodeId}</div>
                                                    </div>
                                                </TableCell>
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
                                                <TableCell className="font-black text-brand-green-dark">{device.currentKw.toFixed(1)}</TableCell>
                                                <TableCell className="font-black text-brand-green-dark">{device.temperature.toFixed(0)}°</TableCell>
                                                <TableCell className="font-black text-brand-green-dark text-sm">{health.score}%</TableCell>
                                                <TableCell className="font-black text-brand-green-dark">{device.powerFactor.toFixed(2)}</TableCell>
                                                <TableCell className="font-black text-brand-green-dark">{device.kwh.toFixed(1)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-brand-green-dark/40 font-black italic text-sm">
                            No TX2 data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Export Section */}
            <div className="flex flex-col items-center justify-center p-8 bg-brand-green-light/5 rounded-[50px] border border-brand-green-light/10">
                <div className="glass-thick p-10 md:p-12 md:rounded-[50px] rounded-[35px] w-full max-w-lg shadow-2xl border-none relative overflow-hidden bg-white/60 backdrop-blur-3xl">
                    <div className="absolute inset-0 grid-overlay opacity-5 -z-10" />

                    <div className="text-center mb-12">
                        <div className="w-20 h-20 rounded-[28px] bg-brand-green-light/10 flex items-center justify-center border border-brand-green-light/20 shadow-inner mx-auto mb-6">
                            <ClipboardList className="text-brand-green-dark" size={40} />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-brand-green-dark uppercase italic leading-none mb-2">Export Data</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-green-dark/30 italic">CarbonX Cloud Protocol</p>
                    </div>

                    <div className="space-y-8">
                        {/* Machine Dropdown */}
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-brand-green-dark/40 uppercase tracking-[0.2em] px-1 italic">
                                Select Machine Context
                            </label>
                            <select
                                value={selectedMachineId}
                                onChange={(e) => setSelectedMachineId(e.target.value)}
                                className="w-full h-14 bg-white/80 border-2 border-black/5 rounded-[22px] px-8 text-[13px] font-black text-brand-green-dark outline-none focus:border-brand-green-light transition-all appearance-none cursor-pointer shadow-sm text-center"
                            >
                                <option value="all">ALL MACHINES</option>
                                {nodeData.map(d => (
                                    <option key={d.nodeId} value={d.nodeId}>{d.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        {/* Period Switcher */}
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-brand-green-dark/40 uppercase tracking-[0.2em] px-1 italic">
                                Select Time Horizon
                            </label>
                            <div className="grid grid-cols-2 gap-3 p-1.5 bg-brand-green-dark/5 rounded-[25px]">
                                {(['daily', 'monthly'] as const).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setReportPeriod(p)}
                                        className={cn(
                                            "h-12 rounded-[20px] font-black text-[11px] uppercase tracking-widest transition-all",
                                            reportPeriod === p
                                                ? "bg-brand-green-dark text-white shadow-lg"
                                                : "text-brand-green-dark/60 hover:text-brand-green-dark"
                                        )}
                                    >
                                        {p.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Format Selector */}
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-brand-green-dark/40 uppercase tracking-[0.2em] px-1 italic">
                                Select Export Format
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['docs', 'pdf', 'csv'] as const).map(fmt => (
                                    <button
                                        key={fmt}
                                        onClick={() => setExportFormat(fmt)}
                                        className={cn(
                                            "h-14 rounded-[22px] border-2 font-black text-[11px] uppercase transition-all flex items-center justify-center",
                                            exportFormat === fmt
                                                ? "border-brand-green-light bg-brand-green-light/5 text-brand-green-dark"
                                                : "border-black/5 bg-white/40 text-brand-green-dark/40"
                                        )}
                                    >
                                        {fmt.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleExport}
                            disabled={exporting}
                            className="w-full h-18 rounded-[28px] bg-brand-green-dark hover:bg-black text-white font-black text-[14px] uppercase tracking-[0.4em] italic shadow-2xl transition-all active:translate-y-1 disabled:opacity-50 mt-4"
                        >
                            {exporting ? 'GENERATING...' : 'EXPORT REPORT'}
                        </Button>
                    </div>

                    <div className="mt-12 text-center opacity-20">
                        <p className="text-[8px] font-black uppercase tracking-[0.6em]">CarbonX Enterprise</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
