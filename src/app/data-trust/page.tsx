'use client';

import React from 'react';
import { usePersonalData } from '@/context/PersonalDataContext';
import { ActivityLineageDrawer } from '@/components/personal/ActivityLineageDrawer';
import {
    ShieldCheck, CheckCircle2, AlertTriangle,
    Database, Calculator, FileText, Lock,
    Check, Sparkles, Layers, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DataTrustPage() {
    const { dataTrustReport, activities, setSelectedLineageActivity } = usePersonalData();

    return (
        <div className="fade-in space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            Forensic Transparency Center
                        </span>
                    </div>
                    <h1 className="page-title">Data Trust & Verification Audit</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        8-point live integrity checklist, mathematical lineage traceability, and ISO 14064 standards compliance.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-2xl border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-black text-base">
                            {dataTrustReport.grade}
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Data Quality Score</div>
                            <div className="text-xl font-black text-gray-900">{dataTrustReport.overallQualityScore}% Verified</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Score Showcase Hero */}
            <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div className="md:col-span-2 space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-green-300">
                            <ShieldCheck size={14} />
                            <span>100% Traceable Carbon Lineage</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Zero Hallucinations. Pure Deterministic Integrity.
                        </h2>
                        <p className="text-xs text-gray-300 leading-relaxed max-w-lg">
                            CarbonX maintains complete calculation provenance for every logged emission. Emission coefficients are anchored directly to official CEA v19 and IPCC AR6 scientific registries.
                        </p>
                    </div>

                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                        <div className="text-3xl sm:text-4xl font-black text-white">{dataTrustReport.lineageIntegrityPct}%</div>
                        <div className="text-[11px] text-gray-300 uppercase font-bold mt-1">Lineage Integrity</div>
                        <div className="text-[10px] text-green-300 mt-1">✓ Verified mathematical formulas</div>
                    </div>

                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                        <div className="text-3xl sm:text-4xl font-black text-white">{dataTrustReport.uncertaintyCoveragePct}%</div>
                        <div className="text-[11px] text-gray-300 uppercase font-bold mt-1">Uncertainty Coverage</div>
                        <div className="text-[10px] text-green-300 mt-1">✓ Explicit [min, max] bounds</div>
                    </div>
                </div>
            </div>

            {/* 8-Point Verification Checklist */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                    <div>
                        <div className="section-title">8-Point Data Trust Verification Checklist</div>
                        <div className="text-xs text-gray-400 mt-0.5">Continuous validation pipeline running across all activity logs</div>
                    </div>
                    <div className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 self-start sm:self-auto">
                        Status: {dataTrustReport.anomalyScanStatus}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dataTrustReport.metrics.map(metric => (
                        <div
                            key={metric.id}
                            className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white transition-all flex items-start gap-3.5"
                        >
                            <div className={cn(
                                'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold mt-0.5',
                                metric.passed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            )}>
                                {metric.passed ? <Check size={16} /> : <AlertTriangle size={15} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-bold text-gray-900">{metric.label}</h4>
                                    <span className="text-xs font-extrabold text-gray-700">{metric.score}%</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 leading-snug">{metric.description}</p>
                                <div className="mt-2 text-[10px] font-semibold text-gray-400">
                                    Benchmark Standard: <strong className="text-gray-600">{metric.standard}</strong>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Audit Trail: Recent Verified Records */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="section-title">Verified Calculation Audit Trail</div>
                        <div className="text-xs text-gray-400 mt-0.5">Click any record to inspect full mathematical formula & provenance</div>
                    </div>
                    <span className="text-xs text-gray-500 font-bold">{activities.length} Audited Logs</span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {activities.map(act => (
                        <div
                            key={act.id}
                            onClick={() => setSelectedLineageActivity(act)}
                            className="p-3.5 bg-gray-50/80 hover:bg-white rounded-2xl border border-gray-100 hover:border-green-300 hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-green-700 flex items-center justify-center font-bold text-xs">
                                    ✓
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-900 group-hover:text-green-800 transition-colors">
                                        {act.title || act.activityType}
                                    </div>
                                    <div className="text-[11px] text-gray-400 mt-0.5">
                                        Formula: <code className="font-mono text-gray-600">{act.formula}</code>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <div className="text-xs font-extrabold text-gray-900">{act.calculatedCO2e} kg CO₂e</div>
                                <div className="text-[10px] text-green-700 font-semibold">{act.confidence} ({act.confidenceScore}%)</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ActivityLineageDrawer />
        </div>
    );
}
