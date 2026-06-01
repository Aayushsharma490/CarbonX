'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Leaf, Activity, BarChart3, Shield, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Page() {
    const { loading, isAuthenticated } = useAuth();
    if (loading) return null;

    return (
        <div className="min-h-screen">
            {/* ── Hero ── */}
            <section className="pt-16 pb-20 px-4 text-center max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm inline-block">
                            <Image src="/carbon_logo.png" alt="CarbonX" width={140} height={40} className="object-contain" priority />
                        </div>
                    </div>

                    {/* Status pill */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-100 rounded-full text-sm font-medium text-green-700 mb-6">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Platform Active — v4.0
                    </div>

                    {/* Main heading */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.05] mb-6">
                        Industrial Energy{' '}
                        <span className="text-green-600">Intelligence</span>
                    </h1>

                    <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
                        Monitor every machine, track your carbon footprint, and get AI-powered alerts — all from one simple dashboard built for manufacturing plants.
                    </p>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href={isAuthenticated ? '/dashboard' : '/login'}>
                            <button className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white text-base font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-sm group">
                                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        {!isAuthenticated && (
                            <Link href="/login">
                                <button className="px-8 py-4 bg-white text-gray-700 text-base font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:text-gray-900 transition-all">
                                    Sign In
                                </button>
                            </Link>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* ── 3 Key Benefits ── */}
            <section className="max-w-6xl mx-auto px-4 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Zap,
                            color: 'bg-green-50',
                            iconColor: 'text-green-600',
                            title: 'Real-Time Energy Monitoring',
                            desc: 'Track energy consumption across all machines and zones. Spot inefficiencies instantly with live kWh readings and trend charts.',
                        },
                        {
                            icon: Leaf,
                            color: 'bg-blue-50',
                            iconColor: 'text-blue-600',
                            title: 'Carbon Footprint Tracking',
                            desc: 'Automated CO₂ calculations based on your actual energy data. Generate compliance reports with one click.',
                        },
                        {
                            icon: Activity,
                            color: 'bg-amber-50',
                            iconColor: 'text-amber-600',
                            title: 'AI Anomaly Detection',
                            desc: 'Get notified before failures happen. Our AI monitors temperature, vibration, and power factor continuously.',
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 * i + 0.3 }}
                            className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-gray-200 hover:shadow-md transition-all"
                        >
                            <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-5`}>
                                <item.icon size={22} className={item.iconColor} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Stats strip ── */}
            <section className="max-w-5xl mx-auto px-4 pb-20">
                <div className="bg-gray-900 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { val: '14%',   label: 'Avg. Energy Savings' },
                        { val: '1.2M+', label: 'Tons CO₂ Tracked' },
                        { val: '99.2%', label: 'AI Accuracy' },
                        { val: '24/7',  label: 'Live Monitoring' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl font-extrabold text-white">{stat.val}</div>
                            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Who is it for ── */}
            <section className="max-w-6xl mx-auto px-4 pb-20">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Built for Industrial Teams</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">Three role levels, each with the right tools for their responsibilities.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Shield,
                            role: 'Plant Director / Admin',
                            perks: ['Full platform access', 'System configuration', 'All reports & alerts', 'User management'],
                        },
                        {
                            icon: Activity,
                            role: 'Maintenance Engineer',
                            perks: ['Machine health monitoring', 'Energy analysis', 'Alert management', 'Operational settings'],
                        },
                        {
                            icon: BarChart3,
                            role: 'Zone Manager',
                            perks: ['Carbon analytics', 'Executive reports', 'Zone performance', 'Sustainability metrics'],
                        },
                    ].map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                                <item.icon size={20} className="text-gray-700" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-3">{item.role}</h3>
                            <ul className="space-y-2">
                                {item.perks.map((p, j) => (
                                    <li key={j} className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full shrink-0" />
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Footer ── */}
            <section className="max-w-4xl mx-auto px-4 pb-20 text-center">
                <div className="bg-green-600 rounded-2xl p-10 text-white">
                    <h2 className="text-3xl font-extrabold mb-3">Ready to optimise your plant?</h2>
                    <p className="text-green-100 mb-8">Join industrial facilities already using CarbonX to reduce energy costs and carbon emissions.</p>
                    <Link href={isAuthenticated ? '/dashboard' : '/login'}>
                        <button className="px-8 py-4 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all shadow-sm">
                            {isAuthenticated ? 'Open Dashboard' : 'Start Now — Free Demo'}
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
