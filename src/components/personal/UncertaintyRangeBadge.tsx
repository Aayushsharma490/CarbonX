'use client';

import React, { useState } from 'react';
import { HelpCircle, Info, ShieldCheck, X } from 'lucide-react';
import { usePersonalData } from '@/context/PersonalDataContext';
import { explainUncertaintyRange } from '@/lib/carbon-engine/uncertaintyEngine';

export function UncertaintyRangeBadge({
    min,
    max,
    showExplainer = true
}: {
    min: number;
    max: number;
    showExplainer?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { activities } = usePersonalData();

    const explanation = explainUncertaintyRange(activities);

    return (
        <>
            <div className="inline-flex items-center gap-2">
                <span className="font-extrabold text-gray-900 tracking-tight">
                    {min}–{max} <span className="text-sm font-semibold text-gray-400">kg CO₂e</span>
                </span>
                {showExplainer && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-green-700 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 px-2 py-0.5 rounded-full transition-all"
                        title="Why is my range wide?"
                    >
                        <HelpCircle size={12} />
                        <span>Why Range?</span>
                    </button>
                )}
            </div>

            {/* Explainer Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-lg w-full p-6 relative overflow-hidden">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
                                    ±Δ
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Why is your range {min}–{max} kg?</h3>
                                    <p className="text-xs text-gray-500">Uncertainty Bounds & Confidence Decomposition</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600 mb-4 leading-relaxed flex items-start gap-2.5">
                            <Info size={16} className="text-green-600 shrink-0 mt-0.5" />
                            <span>{explanation.summary}</span>
                        </div>

                        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {explanation.explanations.map(item => (
                                <div key={item.category} className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="font-bold text-sm text-gray-800">{item.category}</span>
                                        <span className="text-xs font-semibold text-gray-500">
                                            ±{Math.round(item.uncertaintySpanKg / 2)} kg (±{item.uncertaintyPct}%)
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1.5">{item.primaryDriver}</p>
                                    <div className="text-[11px] text-green-700 bg-green-50/70 px-2 py-1 rounded-lg">
                                        💡 <span className="font-medium">{item.recommendationToNarrow}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <ShieldCheck size={14} className="text-green-600" />
                                <span>No fake precision. IPCC AR6 compliant.</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all"
                            >
                                Got It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
