'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    ArrowRight, Zap, Leaf, Activity, BarChart3,
    Shield, Users, User, Building2, Sliders,
    ShieldCheck, Sparkles, Database, CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppMode } from '@/context/ModeContext';

export default function Page() {
    const { loading, isAuthenticated } = useAuth();
    const { setMode } = useAppMode();

    if (loading) return null;

    const handleEnterPersonal = () => {
        setMode('personal');
    };

    const handleEnterOrganization = () => {
        setMode('organization');
    };

    const decisionLoopSteps = [
        { step: '01', title: 'COLLECT', desc: 'IoT Telemetry, Smart Meters & Digital Receipts' },
        { step: '02', title: 'VALIDATE', desc: 'Range bounds, temporal & Z-score checks' },
        { step: '03', title: 'CALCULATE', desc: 'Deterministic formulas & certified emission factors' },
        { step: '04', title: 'UNDERSTAND', desc: 'Explainable uncertainty ranges & confidence breakdown' },
        { step: '05', title: 'PRIORITIZE', desc: 'Mathematical impact vs effort ranking' },
        { step: '06', title: 'SIMULATE', desc: 'Real-time What-If scenario modeling' },
        { step: '07', title: 'OPTIMIZE', desc: 'Automated reduction action bundles' },
        { step: '08', title: 'TARGET', desc: '2026 climate budgets & gap analysis' },
        { step: '09', title: 'VERIFY', desc: '8-point forensic data trust checklist' }
    ];

    return (
        <div className="min-h-screen">
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
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-800 mb-6">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Carbon Decision Engine — Platform v4.0 Active
                    </div>

                    {/* Main heading */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.05] mb-4">
                        From Individual Choices<br className="hidden sm:inline" />
                        <span className="text-emerald-600"> to Industrial Decisions</span>
                    </h1>

                    <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
                        The complete Carbon Intelligence Platform. Deterministic carbon calculation, explainable uncertainty bounds, and real-time industrial telemetry in one unified ecosystem.
                    </p>

                    {/* Dual Mode Launch Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10 text-left">
                        {/* Personal Mode Card */}
                        <Link
                            href={isAuthenticated ? '/dashboard' : '/login'}
                            onClick={handleEnterPersonal}
                            className="bg-white rounded-3xl border-2 border-emerald-500/30 hover:border-emerald-500 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                    <User size={24} />
                                </div>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                                    Default Mode
                                </span>
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                Personal Mode
                            </h2>
                            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
                                Household & individual footprinting with uncertainty ranges, bill OCR scanner, What-If simulation sliders, and prioritized habits.
                            </p>
                            <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-700">
                                <span>Launch Personal Platform</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* Organization Mode Card */}
                        <Link
                            href={isAuthenticated ? '/dashboard' : '/login'}
                            onClick={handleEnterOrganization}
                            className="bg-white rounded-3xl border-2 border-blue-500/30 hover:border-blue-500 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                                    <Building2 size={24} />
                                </div>
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                    Industrial Scale
                                </span>
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors">
                                Organization Mode
                            </h2>
                            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
                                Industrial IoT gateway telemetry (TX1/TX2/TX3/XT2 Crane), machine health monitoring, 3-tier loss forensics, and predictive maintenance.
                            </p>
                            <div className="flex items-center gap-1 text-xs font-extrabold text-blue-700">
                                <span>Launch Industrial Dashboard</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── Carbon Decision Engine Loop ── */}
            <section className="max-w-6xl mx-auto px-4 pb-20">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700 mb-2">
                        <Sparkles size={13} className="text-green-600" />
                        Forensic Decision Architecture
                    </div>
                    <h2 className="text-3xl font-black text-gray-900">The CarbonX Decision Loop</h2>
                    <p className="text-sm text-gray-500 max-w-xl mx-auto mt-1">
                        A rigorous 9-stage engineering framework that turns raw telemetry into verified climate impact.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                    {decisionLoopSteps.map((step) => (
                        <div key={step.step} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-all">
                            <div className="text-xs font-black text-emerald-600 mb-1">{step.step}</div>
                            <h3 className="text-sm font-extrabold text-gray-900 mb-1">{step.title}</h3>
                            <p className="text-xs text-gray-500 leading-snug">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 3 Key Value Pillars ── */}
            <section className="max-w-6xl mx-auto px-4 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Database,
                            color: 'bg-emerald-50',
                            iconColor: 'text-emerald-600',
                            title: 'Deterministic Traceability',
                            desc: 'Every emission calculation preserves its complete mathematical lineage and official CEA v19 / IPCC AR6 citations. No hallucinated LLM values.',
                        },
                        {
                            icon: Sliders,
                            color: 'bg-blue-50',
                            iconColor: 'text-blue-600',
                            title: 'Interactive What-If Simulation',
                            desc: 'Model adjustments across transit, cooling, grid power, and shopping with real-time target gap recalculation.',
                        },
                        {
                            icon: Activity,
                            color: 'bg-amber-50',
                            iconColor: 'text-amber-600',
                            title: 'Real-Time Industrial IoT',
                            desc: 'Live telemetry stream from ESP32 nodes, monitoring phase voltages, power factors, machine vibrations, and XT2 crane stability.',
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-3xl border border-gray-100 p-8 hover:border-gray-200 hover:shadow-md transition-all"
                        >
                            <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-5`}>
                                <item.icon size={24} className={item.iconColor} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="max-w-4xl mx-auto px-4 pb-20 text-center">
                <div className="bg-gradient-to-r from-emerald-900 to-green-950 rounded-3xl p-10 text-white shadow-xl">
                    <h2 className="text-3xl font-extrabold mb-3">Ready to quantify and reduce your carbon footprint?</h2>
                    <p className="text-green-100 text-sm max-w-xl mx-auto mb-8">
                        Experience precision carbon intelligence built with scientific rigor for individuals and industrial facilities alike.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href={isAuthenticated ? '/dashboard' : '/login'} onClick={handleEnterPersonal}>
                            <button className="px-8 py-4 bg-white text-emerald-900 font-extrabold rounded-2xl hover:bg-emerald-50 transition-all shadow-sm">
                                Open Personal Dashboard
                            </button>
                        </Link>
                        <Link href={isAuthenticated ? '/dashboard' : '/login'} onClick={handleEnterOrganization}>
                            <button className="px-8 py-4 bg-white/10 text-white font-extrabold rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                                Open Industrial Platform
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
