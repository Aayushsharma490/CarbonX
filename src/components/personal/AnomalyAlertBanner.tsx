'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Edit3, X, ArrowRight } from 'lucide-react';
import { usePersonalData } from '@/context/PersonalDataContext';

export function AnomalyAlertBanner() {
    const { anomalies, resolveAnomaly } = usePersonalData();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number>(0);

    if (!anomalies || anomalies.length === 0) return null;

    const currentAnomaly = anomalies[0]; // focus on primary unaddressed anomaly

    const handleVerify = () => {
        resolveAnomaly(currentAnomaly.activityId, 'VERIFY');
    };

    const handleDismiss = () => {
        resolveAnomaly(currentAnomaly.activityId, 'DISMISS');
    };

    const handleStartEdit = () => {
        setEditingId(currentAnomaly.activityId);
        setEditValue(currentAnomaly.historicalMean);
    };

    const handleSaveEdit = () => {
        resolveAnomaly(currentAnomaly.activityId, 'EDIT', editValue);
        setEditingId(null);
    };

    return (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900">Unusual Activity Detected</h4>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                                ML Anomaly Filter
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-2xl">
                            <strong>{currentAnomaly.activityTitle}</strong> has a logged value of <strong>{currentAnomaly.enteredValue} {currentAnomaly.unit}</strong>, which is unusual compared to your average ({currentAnomaly.historicalMean} {currentAnomaly.unit}).
                        </p>
                    </div>
                </div>

                {/* Actions */}
                {!editingId ? (
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                            onClick={handleVerify}
                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-2xs"
                        >
                            Verify Correct
                        </button>
                        <button
                            onClick={handleStartEdit}
                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-2xs"
                        >
                            Edit Value
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-3.5 py-1.5 bg-amber-700 text-white text-xs font-bold rounded-xl hover:bg-amber-800 transition-all shadow-2xs"
                        >
                            Keep Value
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-xs text-gray-500 font-medium">New:</span>
                        <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 font-bold text-gray-900"
                        />
                        <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-800"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
