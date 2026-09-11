'use client';

import React, { useState } from 'react';
import { usePersonalData } from '@/context/PersonalDataContext';
import { EMISSION_FACTORS } from '@/lib/carbon-engine/emissionFactors';
import { FreshnessBadge } from '@/components/personal/FreshnessBadge';
import { ActivityLineageDrawer } from '@/components/personal/ActivityLineageDrawer';
import { OcrBillParserModal } from '@/components/personal/OcrBillParserModal';
import { AnomalyAlertBanner } from '@/components/personal/AnomalyAlertBanner';
import type { ActivityCategory, DataFreshness } from '@/types/personal';
import {
    Plus, ScanLine, Filter, Search, Layers,
    Zap, Car, ShoppingBag, Utensils, Sparkles,
    Shield, Calendar, Calculator, CheckCircle2,
    Trash2, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES: { key: ActivityCategory; label: string; icon: React.ElementType }[] = [
    { key: 'Travel', label: 'Travel & Commute', icon: Car },
    { key: 'Electricity', label: 'Electricity & Gas', icon: Zap },
    { key: 'Purchases', label: 'Purchases & Spend', icon: ShoppingBag },
    { key: 'Food', label: 'Food & Diet', icon: Utensils },
    { key: 'Lifestyle', label: 'Lifestyle & AC', icon: Sparkles },
];

export default function ActivitiesPage() {
    const { activities, addActivity, deleteActivity, setSelectedLineageActivity } = usePersonalData();
    const [activeTab, setActiveTab] = useState<ActivityCategory>('Travel');
    const [searchQuery, setSearchQuery] = useState('');
    const [isOcrOpen, setIsOcrOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form states
    const [selectedFactorId, setSelectedFactorId] = useState<string>('transport_petrol_car');
    const [inputValue, setInputValue] = useState<string>('25');
    const [inputSource, setInputSource] = useState<string>('Manual Daily Trip Log');
    const [inputFreshness, setInputFreshness] = useState<DataFreshness>('MANUAL');
    const [allocationType, setAllocationType] = useState<'Shared' | 'Individual' | 'Proportional'>('Individual');
    const [formError, setFormError] = useState<string | null>(null);

    // Filter available emission factors by active tab category
    const categoryFactors = Object.values(EMISSION_FACTORS).filter(f => f.category === activeTab);

    // Filtered activities list
    const filteredActivities = activities.filter(act => {
        const matchesCategory = act.category === activeTab;
        const matchesSearch = searchQuery === '' ||
            act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            act.activityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            act.source.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleFactorChange = (factorId: string) => {
        setSelectedFactorId(factorId);
        const factor = EMISSION_FACTORS[factorId];
        if (factor) {
            if (factor.category === 'Electricity') {
                setInputSource('Smart Meter / Electricity Bill');
                setInputFreshness('LIVE');
            } else if (factor.category === 'Purchases') {
                setInputSource('Bank Spend Aggregation (EEIO)');
                setInputFreshness('ESTIMATED');
            } else {
                setInputSource('Personal Activity Log');
                setInputFreshness('MANUAL');
            }
        }
    };

    const handleAddActivitySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const val = parseFloat(inputValue);
        if (isNaN(val) || val <= 0) {
            setFormError('Please enter a positive numeric quantity.');
            return;
        }

        const factor = EMISSION_FACTORS[selectedFactorId];
        if (!factor) {
            setFormError('Invalid emission factor selected.');
            return;
        }

        const res = addActivity({
            category: activeTab,
            activityType: factor.subType,
            factorId: selectedFactorId,
            value: val,
            unit: factor.unit,
            source: inputSource,
            dataFreshness: inputFreshness,
            allocationType
        });

        if (!res.success) {
            setFormError(res.message || 'Validation error');
            return;
        }

        setIsFormOpen(false);
        setInputValue('25');
    };

    return (
        <div className="fade-in space-y-6 pb-12">
            <AnomalyAlertBanner />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            Activity Intelligence Hub
                        </span>
                    </div>
                    <h1 className="page-title">Activity Hub & Lineage Log</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Log Travel, Electricity, Purchases, Food, and Lifestyle with deterministic audit lineage.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setIsOcrOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all shadow-2xs"
                    >
                        <ScanLine size={15} className="text-green-600" />
                        <span>Scan Bill / Receipt</span>
                    </button>
                    <button
                        onClick={() => {
                            setIsFormOpen(!isFormOpen);
                            if (categoryFactors.length > 0) setSelectedFactorId(categoryFactors[0].id);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all shadow-xs"
                    >
                        <Plus size={15} />
                        <span>{isFormOpen ? 'Close Form' : 'Log Entry'}</span>
                    </button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200/60 scrollbar-none">
                {CATEGORIES.map(({ key, label, icon: Icon }) => {
                    const isActive = activeTab === key;
                    const count = activities.filter(a => a.category === key).length;
                    return (
                        <button
                            key={key}
                            onClick={() => {
                                setActiveTab(key);
                                const factors = Object.values(EMISSION_FACTORS).filter(f => f.category === key);
                                if (factors.length > 0) setSelectedFactorId(factors[0].id);
                            }}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0',
                                isActive
                                    ? 'bg-gray-900 text-white shadow-xs'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                            )}
                        >
                            <Icon size={15} />
                            <span>{label}</span>
                            <span className={cn('px-2 py-0.5 rounded-full text-[10px]', isActive ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500')}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Expandable Manual Entry Form */}
            {isFormOpen && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-md animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
                                <Plus size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">New {activeTab} Activity Entry</h3>
                        </div>
                        <span className="text-xs text-gray-400">Deterministic calculation with lineage</span>
                    </div>

                    {formError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold mb-4">
                            {formError}
                        </div>
                    )}

                    <form onSubmit={handleAddActivitySubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Activity Type Selection */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Activity Factor Type</label>
                                <select
                                    value={selectedFactorId}
                                    onChange={(e) => handleFactorChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    {categoryFactors.map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.subType} ({f.factor} kg CO₂e/{f.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Quantity ({EMISSION_FACTORS[selectedFactorId]?.unit || 'Units'})
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="e.g. 25"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            {/* Data Freshness */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Data Freshness</label>
                                <select
                                    value={inputFreshness}
                                    onChange={(e) => setInputFreshness(e.target.value as DataFreshness)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="LIVE">LIVE (Meter / Real-time)</option>
                                    <option value="RECENT">RECENT (Recent Digital Log)</option>
                                    <option value="ESTIMATED">ESTIMATED (Spend Inferred)</option>
                                    <option value="MANUAL">MANUAL (Self-Reported)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Data Source / Provenance Note</label>
                                <input
                                    type="text"
                                    value={inputSource}
                                    onChange={(e) => setInputSource(e.target.value)}
                                    placeholder="e.g. Odometer reading / Grocery Receipt"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Household Allocation</label>
                                <select
                                    value={allocationType}
                                    onChange={(e) => setAllocationType(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="Individual">Individual (100% Personal Attribution)</option>
                                    <option value="Shared">Shared (Divided equally across household)</option>
                                    <option value="Proportional">Proportional (Allocated by share %)</option>
                                </select>
                            </div>
                        </div>

                        {/* Lineage Preview */}
                        {(() => {
                            const factor = EMISSION_FACTORS[selectedFactorId];
                            const num = parseFloat(inputValue) || 0;
                            const co2e = parseFloat((num * (factor?.factor || 1)).toFixed(2));
                            return (
                                <div className="p-3.5 bg-green-50/60 border border-green-100 rounded-2xl flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-green-900">
                                        <Calculator size={16} className="text-green-600 shrink-0" />
                                        <span>
                                            Lineage: <strong>{num} {factor?.unit}</strong> × {factor?.factor} kg/unit = <strong>{co2e} kg CO₂e</strong> (Source: {factor?.source})
                                        </span>
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all shrink-0 ml-3"
                                    >
                                        Validate & Save Log
                                    </button>
                                </div>
                            );
                        })()}
                    </form>
                </div>
            )}

            {/* Search and Filters Bar */}
            <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 flex-1 max-w-md bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    <Search size={15} className="text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeTab} activities...`}
                        className="bg-transparent border-none text-xs text-gray-800 focus:outline-none w-full"
                    />
                </div>

                <div className="text-xs text-gray-400 font-semibold">
                    {filteredActivities.length} {filteredActivities.length === 1 ? 'Record' : 'Records'} Logged
                </div>
            </div>

            {/* Activities List */}
            <div className="space-y-3">
                {filteredActivities.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3">
                        <Layers size={36} className="mx-auto text-gray-300" />
                        <h3 className="text-base font-bold text-gray-800">No {activeTab} activities logged yet</h3>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto">
                            Add a new manual log or scan your utility bill / receipt using our OCR scanner.
                        </p>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800"
                        >
                            Log First {activeTab} Activity
                        </button>
                    </div>
                ) : (
                    filteredActivities.map((act) => (
                        <div
                            key={act.id}
                            className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-gray-200 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 flex items-center justify-center shrink-0 font-bold mt-0.5">
                                    {act.category === 'Travel' && <Car size={18} className="text-emerald-600" />}
                                    {act.category === 'Electricity' && <Zap size={18} className="text-blue-600" />}
                                    {act.category === 'Purchases' && <ShoppingBag size={18} className="text-purple-600" />}
                                    {act.category === 'Food' && <Utensils size={18} className="text-amber-600" />}
                                    {act.category === 'Lifestyle' && <Sparkles size={18} className="text-pink-600" />}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm font-bold text-gray-900">{act.title || act.activityType}</h4>
                                        <FreshnessBadge freshness={act.dataFreshness} />
                                        {act.isDemo && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                Demo Seed
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                                        <span>Raw Value: <strong className="text-gray-700">{act.value} {act.unit}</strong></span>
                                        <span>·</span>
                                        <span className="truncate max-w-xs" title={act.source}>Source: {act.source}</span>
                                        <span>·</span>
                                        <span className="text-green-700 font-semibold">{act.confidence} ({act.confidenceScore}%)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                                <div className="text-left sm:text-right">
                                    <div className="text-base font-extrabold text-gray-900">
                                        {act.calculatedCO2e} <span className="text-xs font-normal text-gray-500">kg CO₂e</span>
                                    </div>
                                    <div className="text-[11px] text-gray-400">
                                        ±{Math.round((act.uncertaintyMax - act.uncertaintyMin) / 2)} kg (±{act.uncertaintyPct}%)
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setSelectedLineageActivity(act)}
                                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200/70 transition-all flex items-center gap-1"
                                        title="Inspect calculation lineage"
                                    >
                                        <Calculator size={13} />
                                        <span>Lineage</span>
                                    </button>
                                    <button
                                        onClick={() => deleteActivity(act.id)}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                        title="Delete activity"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            <OcrBillParserModal isOpen={isOcrOpen} onClose={() => setIsOcrOpen(false)} />
            <ActivityLineageDrawer />
        </div>
    );
}
