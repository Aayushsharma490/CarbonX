'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    ArrowRight, Zap, Leaf, Activity, BarChart3,
    Shield, Building2, Sliders, Cpu,
    CheckCircle2, Gauge, AlertTriangle, FileSpreadsheet,
    Factory, Network, Radio
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Page() {
    const { loading, isAuthenticated } = useAuth();

    if (loading) return null;

    const industrialCapabilities = [
        {
            icon: Cpu,
            color: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
            title: 'Industrial IoT Telemetry',
            desc: 'Live high-frequency stream from ESP32 nodes and SCADA gateways, tracking multi-phase voltage, current, active power, and power factors.'
        },
        {
            icon: AlertTriangle,
            color: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
            title: '3-Tier Loss Forensics',
            desc: 'Continuous detection of transmission line resistance loss, phase imbalances, transformer heating, and reactive power waste.'
        },
        {
            icon: Activity,
            color: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
            title: 'Predictive Machine Health',
            desc: 'Continuous vibration, thermal, and load profiling for heavy plant machinery and XT2 overhead cranes with maintenance forecasting.'
        },
        {
            icon: Leaf,
            color: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
            title: 'Certified Carbon Accounting',
            desc: 'Deterministic Scope 1 and Scope 2 calculation engine compliant with CEA v19 grid emission factors and IPCC AR6 standards.'
        },
        {
            icon: Gauge,
            color: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
            title: 'Power Factor Optimization',
            desc: 'Automated capacitor bank recommendations and penalty-prevention alerts for lagging/leading reactive loads.'
        },
        {
            icon: FileSpreadsheet,
            color: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
            title: 'Audit-Ready ESG Reports',
            desc: 'Instant export of verified operational carbon metrics, energy balance sheets, and compliance-ready audit summaries.'
        }
    ];

    const pipelineSteps = [
        { step: '01', title: 'TELEMETRY INGESTION', desc: 'ESP32 mesh nodes stream phase voltages and power draws via RX Gateway' },
        { step: '02', title: 'ANOMALY VALIDATION', desc: 'Z-score and threshold checks detect power spikes and thermal anomalies' },
        { step: '03', title: 'LOSS FORENSICS', desc: 'Real-time calculation of resistance losses and reactive power dissipation' },
        { step: '04', title: 'CARBON CONVERSION', desc: 'Deterministic conversion from kWh to CO₂e using verified emission factors' },
        { step: '05', title: 'PREDICTIVE DIAGNOSTICS', desc: 'Health score indexing and estimated days until required maintenance' },
        { step: '06', title: 'EXECUTIVE DISPATCH', desc: 'Real-time alarm dispatching and shift-wise energy consumption trends' }
    ];

    return (
        <div className="min-h-screen text-gray-900">
            {/* ── Hero ── */}
            <section className="pt-12 pb-16 px-4 text-center max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-xs inline-block">
                            <Image src="/carbon_logo.png" alt="CarbonX" width={140} height={40} className="object-contain" priority />
                        </div>
                    </div>

                    {/* Status pill */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800 mb-6">
                        <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                        Industrial Operations Engine — Live Telemetry Active
                    </div>

                    {/* Main heading */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.05] mb-4">
                        Industrial Carbon Intelligence<br className="hidden sm:inline" />
                        <span className="text-emerald-700"> & Energy Optimization</span>
                    </h1>

                    <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
                        The unified operations platform for heavy industry. Deterministic carbon calculation, real-time ESP32 telemetry, line loss forensics, and predictive machine diagnostics.
                    </p>

                    {/* Industrial Launch Card */}
                    <div className="max-w-2xl mx-auto mb-10">
                        <Link
                            href={isAuthenticated ? '/dashboard' : '/login'}
                            className="block bg-white rounded-3xl border-2 border-emerald-600/30 hover:border-emerald-600 p-8 shadow-sm hover:shadow-lg transition-all group text-left relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                    <Factory size={28} />
                                </div>
                                <span className="px-3.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                                    Industrial Platform Active
                                </span>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 group-hover:text-emerald-700 transition-colors">
                                Industrial Operations Dashboard
                            </h2>
                            <p className="text-sm text-gray-600 mt-2 mb-6 leading-relaxed">
                                Monitor real-time SCADA telemetry across TX1/TX2/TX3 nodes and XT2 Cranes, track line loss percentages, calculate carbon footprints, and prevent equipment downtime.
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <span className="text-xs text-gray-500 font-semibold">ESP32 Mesh · 868MHz Protocol · Modbus/TCP</span>
                                <div className="flex items-center gap-1.5 text-sm font-extrabold text-emerald-700">
                                    <span>Enter Operations Dashboard</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── Architecture Pipeline ── */}
            <section className="max-w-6xl mx-auto px-4 pb-20">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-800 mb-2">
                        <Activity size={13} className="text-emerald-600" />
                        Forensic Industrial Architecture
                    </div>
                    <h2 className="text-3xl font-black text-gray-900">End-to-End Telemetry to Decision Loop</h2>
                    <p className="text-sm text-gray-600 max-w-xl mx-auto mt-1">
                        High-frequency plant data stream turned into actionable carbon and energy reduction insights.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pipelineSteps.map((step) => (
                        <div key={step.step} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-200 transition-all">
                            <div className="text-xs font-black text-emerald-700 mb-1">{step.step}</div>
                            <h3 className="text-sm font-extrabold text-gray-900 mb-1">{step.title}</h3>
                            <p className="text-xs text-gray-600 leading-snug">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Core Capabilities Grid ── */}
            <section className="max-w-6xl mx-auto px-4 pb-20">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900">Plant-Grade Intelligence Capabilities</h2>
                    <p className="text-sm text-gray-600 max-w-lg mx-auto mt-1">
                        Engineered for plant managers, electrical engineers, and sustainability directors.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {industrialCapabilities.map((item, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-3xl border border-gray-100 p-7 hover:border-emerald-200 hover:shadow-md transition-all"
                        >
                            <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-5`}>
                                <item.icon size={24} className={item.iconColor} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="max-w-4xl mx-auto px-4 pb-20 text-center">
                <div className="bg-gradient-to-r from-emerald-950 via-gray-950 to-emerald-950 rounded-3xl p-10 text-white shadow-xl border border-emerald-900/40">
                    <h2 className="text-3xl font-extrabold mb-3">Maximize Electrical Efficiency & Cut Plant Emissions</h2>
                    <p className="text-emerald-100/90 text-sm max-w-xl mx-auto mb-8">
                        Deploy real-time energy telemetry and forensic carbon intelligence across your entire facility today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href={isAuthenticated ? '/dashboard' : '/login'}>
                            <button className="px-8 py-4 bg-white text-emerald-950 font-extrabold rounded-2xl hover:bg-emerald-50 transition-all shadow-sm">
                                Open Industrial Dashboard
                            </button>
                        </Link>
                        <Link href={isAuthenticated ? '/machines' : '/login'}>
                            <button className="px-8 py-4 bg-emerald-900/40 text-emerald-100 font-extrabold rounded-2xl border border-emerald-500/30 hover:bg-emerald-900/60 transition-all">
                                View Connected Machinery
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
