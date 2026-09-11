'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Zap, Leaf } from 'lucide-react';
import type { RecommendedAction } from '@/types/personal';
import { cn } from '@/lib/utils';

export function ActionPriorityCard({
    action,
    onSimulate
}: {
    action: RecommendedAction;
    onSimulate?: (action: RecommendedAction) => void;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
                {/* Header with Priority Pill */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-gray-900 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                            #{action.priorityRank}
                        </span>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            {action.category}
                        </span>
                    </div>
                    <div className="px-2.5 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold shrink-0">
                        -{action.co2ReductionKg} kg CO₂e
                    </div>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-1.5 leading-snug">{action.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{action.description}</p>
            </div>

            {/* Metrics footer */}
            <div>
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px] mb-3">
                    <div>
                        <span className="text-gray-400 block text-[9px] uppercase font-bold">Effort</span>
                        <span className="font-semibold text-gray-800">{action.effort}</span>
                    </div>
                    <div>
                        <span className="text-gray-400 block text-[9px] uppercase font-bold">Cost</span>
                        <span className="font-semibold text-gray-800">{action.cost}</span>
                    </div>
                    <div>
                        <span className="text-gray-400 block text-[9px] uppercase font-bold">Priority Score</span>
                        <span className="font-bold text-green-700">{action.priorityScore}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-400 truncate" title={action.applicability}>
                        {action.applicability}
                    </span>
                    {onSimulate && (
                        <button
                            onClick={() => onSimulate(action)}
                            className="flex items-center gap-1 text-xs font-bold text-gray-900 hover:text-green-700 hover:underline shrink-0"
                        >
                            <span>Simulate</span>
                            <ArrowRight size={13} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
