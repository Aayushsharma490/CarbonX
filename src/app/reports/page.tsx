'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '@/context/SystemContext';
import { useTelemetry } from '@/context/TelemetryContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    FileText, Download, FileSpreadsheet, FileJson,
    Calendar, Filter, FileCode, CheckCircle2,
    BarChart3, PieChart, Activity, Zap, Leaf, User, Building2, ClipboardList
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { calculateMachineHealth } from '@/lib/energyCalculations';

export default function ReportsPage() {
    const { config } = useSystem();
    const { nodeData, loading } = useTelemetry();
    const [mounted, setMounted] = useState(false);
    const [reportPeriod, setReportPeriod] = useState<'daily' | 'monthly'>('daily');
    const [selectedMachineId, setSelectedMachineId] = useState<'all' | string>('all');
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'docs'>('pdf');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || loading) return <div className="p-20 text-center text-brand-green-dark/40">Loading Report Console...</div>;

    const allDevices = nodeData;
    const tx2Devices = allDevices.filter(d => d.zone === 'Transmitter 2 (Zone-B)');
    const filteredDevices = selectedMachineId === 'all'
        ? allDevices
        : allDevices.filter(d => d.nodeId === selectedMachineId);

    const handleExport = async () => {
        setExporting(true);

        if (exportFormat === 'pdf') {
            window.print();
            setExporting(false);
            return;
        }

        const headers = ['Node ID', 'Machine Name', 'Zone', 'Status', 'Health (%)', 'Load (kW)', 'Temp (°C)', 'PF', 'Vibration (mm/s)', 'CO2 (ppm)'];
        const rows = filteredDevices.map(d => {
            const health = calculateMachineHealth(d);
            return [
                d.nodeId,
                d.name,
                d.zone,
                d.isOnline ? 'ONLINE' : 'OFFLINE',
                `${health.score}%`,
                d.currentKw.toFixed(2),
                d.temperature.toFixed(1),
                d.powerFactor.toFixed(2),
                d.vibration.toFixed(2),
                d.ppm.toFixed(0)
            ];
        });

        if (exportFormat === 'csv') {
            const csvContent = [
                [`CarbonX Industrial Protocol Report - ${reportPeriod.toUpperCase()}`],
                [`Scope: ${selectedMachineId === 'all' ? 'All System Nodes' : `Machine ${selectedMachineId}`}`],
                [`Generation Protocol: AI Verified - ${new Date().toLocaleString()}`],
                [],
                headers,
                ...rows
            ].map(e => e.join(",")).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `CarbonX_Report_${selectedMachineId}_${reportPeriod}.csv`);
            link.click();
        } else if (exportFormat === 'docs') {
            const content = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'></head>
                <body style="font-family: sans-serif; padding: 40px;">
                    <h1 style="color: #0d2a23;">CarbonX Industrial Report</h1>
                    <p><strong>Period:</strong> ${reportPeriod.toUpperCase()}</p>
                    <p><strong>Scope:</strong> ${selectedMachineId === 'all' ? 'All Machines' : `Machine ${selectedMachineId}`}</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                    <hr>
                    <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr style="background: #f4f4f4;">
                            ${headers.map(h => `<th style="padding: 10px;">${h}</th>`).join('')}
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                ${row.map(cell => `<td style="padding: 10px; text-align: center;">${cell}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </table>
                </body>
                </html>
            `;
            const blob = new Blob([content], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `CarbonX_Report_${selectedMachineId}_${reportPeriod}.doc`);
            link.click();
        }

        setTimeout(() => setExporting(false), 1000);
    };

    return (
        <div className="space-y-8 pb-10 fade-in px-4">
            {/* TX2 Data Section */}
            <Card className="glass-card md:rounded-[40px] rounded-3xl border-brand-green-light/5">
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
                        <Badge variant="outline" className="bg-brand-green-light/10 border-brand-green-light/20 text-brand-green-light px-4 py-2 rounded-full font-black italic uppercase tracking-widest text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-brand-green-light animate-pulse mr-2" />
                            CSV Protocol
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    {tx2Devices.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-brand-green-light/10">
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">Machine</TableHead>
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">Load (kW)</TableHead>
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">Temp (°C)</TableHead>
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">Vibration</TableHead>
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">PF</TableHead>
                                        <TableHead className="text-brand-green-dark/60 font-black text-[10px] uppercase tracking-widest">Energy (kWh)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tx2Devices.map(device => {
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
                                                <TableCell className="font-black text-brand-green-dark">{device.currentKw.toFixed(2)}</TableCell>
                                                <TableCell className="font-black text-brand-green-dark">{device.temperature.toFixed(1)}</TableCell>
                                                <TableCell className="font-black text-brand-green-dark">{device.vibration.toFixed(2)} mm/s</TableCell>
                                                <TableCell className="font-black text-brand-green-dark">{device.powerFactor.toFixed(2)}</TableCell>
                                                <TableCell className="font-black text-brand-green-dark">{device.kwh.toFixed(2)}</TableCell>
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
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
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
                            {allDevices.map(d => (
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
                        className="w-full h-18 rounded-[28px] bg-brand-green-dark hover:bg-black text-white font-black text-[14px] uppercase tracking-[0.4em] italic shadow-2xl transition-all active:scale-95 disabled:opacity-50 mt-4"
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
