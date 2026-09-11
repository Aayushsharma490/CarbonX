'use client';

import React from 'react';
import { X, CheckCircle2, Shield, Calendar, Layers, Database, Calculator, Trash2 } from 'lucide-react';
import { usePersonalData } from '@/context/PersonalDataContext';
import { FreshnessBadge } from './FreshnessBadge';

export function ActivityLineageDrawer() {
    const { selectedLineageActivity, setSelectedLineageActivity, deleteActivity } = usePersonalData();

    if (!selectedLineageActivity) return null;

    const act = selectedLineageActivity;

    return (
        <div className="fixed inset-0 z-[150] flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col overflow-y-auto border-l border-gray-100">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-5">
                    <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Calculation Lineage</span>
                        <h2 className="text-xl font-extrabold text-gray-900 mt-0.5">{act.title || act.activityType}</h2>
                    </div>
                    <button
                        onClick={() => setSelectedLineageActivity(null)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Primary Result Card */}
                <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 p-5 rounded-2xl border border-green-100 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-green-800 uppercase tracking-wider">Calculated Footprint</span>
                        <FreshnessBadge freshness={act.dataFreshness} />
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900">
                        {act.calculatedCO2e} <span className="text-base font-normal text-gray-500">kg CO₂e</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        <span>Uncertainty:</span>
                        <span className="font-semibold text-gray-700">{act.uncertaintyMin} – {act.uncertaintyMax} kg (±{act.uncertaintyPct}%)</span>
                    </div>
                </div>

                {/* Lineage Details */}
                <div className="space-y-4 flex-1">
                    {/* Math Formula */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
                            <Calculator size={15} className="text-green-600" />
                            <span>Deterministic Formula</span>
                        </div>
                        <code className="text-xs font-mono text-gray-800 bg-white p-2.5 rounded-xl border border-gray-200 block break-all">
                            {act.formula}
                        </code>
                    </div>

                    {/* Emission Factor & Provenance */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
                            <Database size={15} className="text-blue-600" />
                            <span>Factor Provenance</span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Emission Factor:</span>
                                <span className="font-bold text-gray-900">{act.emissionFactor} kg CO₂e / {act.unit}</span>
                            </div>
                            <div className="flex flex-col pt-1">
                                <span className="text-gray-500 mb-0.5">Official Source Citation:</span>
                                <span className="font-medium text-gray-800 bg-white p-2 rounded-lg border border-gray-200 text-[11px] leading-relaxed">
                                    {act.emissionFactorSource}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Input Metadata */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
                            <Layers size={15} className="text-purple-600" />
                            <span>Input Attributes</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                                <div className="text-[10px] text-gray-400 font-bold uppercase">Category</div>
                                <div className="font-bold text-gray-800 mt-0.5">{act.category}</div>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                                <div className="text-[10px] text-gray-400 font-bold uppercase">Raw Value</div>
                                <div className="font-bold text-gray-800 mt-0.5">{act.value} {act.unit}</div>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                                <div className="text-[10px] text-gray-400 font-bold uppercase">Source</div>
                                <div className="font-bold text-gray-800 mt-0.5 truncate" title={act.source}>{act.source}</div>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                                <div className="text-[10px] text-gray-400 font-bold uppercase">Confidence</div>
                                <div className="font-bold text-green-700 mt-0.5">{act.confidence} ({act.confidenceScore}%)</div>
                            </div>
                        </div>
                    </div>

                    {/* Validation & Timestamp */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 flex items-center gap-1.5">
                                <Shield size={14} className="text-green-600" /> Validation Status:
                            </span>
                            <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                ✓ {act.validationStatus}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 flex items-center gap-1.5">
                                <Calendar size={14} className="text-gray-400" /> Logged At:
                            </span>
                            <span className="font-mono text-gray-700 text-[11px]">
                                {new Date(act.timestamp).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-5 mt-5 border-t border-gray-100 flex items-center justify-between gap-3">
                    <button
                        onClick={() => {
                            deleteActivity(act.id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <Trash2 size={14} />
                        Delete Log
                    </button>
                    <button
                        onClick={() => setSelectedLineageActivity(null)}
                        className="px-5 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all"
                    >
                        Close Lineage
                    </button>
                </div>
            </div>
        </div>
    );
}
