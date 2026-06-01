'use client';

import React, { useState } from 'react';
import { Bell, AlertTriangle, Shield, Info, Trash2, CheckCheck, Filter } from 'lucide-react';
import { useGlobalNotifications } from '@/context/NotificationContext';
import { NotificationPanel } from '@/components/NotificationSystem';
import type { NotificationSeverity } from '@/types/energy';
import { cn } from '@/lib/utils';

type FilterType = 'all' | NotificationSeverity;

const FILTERS: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: 'all',      label: 'All',      icon: <Filter size={14} /> },
    { key: 'critical', label: 'Critical', icon: <Shield size={14} /> },
    { key: 'warning',  label: 'Warning',  icon: <AlertTriangle size={14} /> },
    { key: 'info',     label: 'Info',     icon: <Info size={14} /> },
];

export default function AlertsPage() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const { activeNotifications, notifications, dismissAll, clearAll, criticalCount } = useGlobalNotifications();

    const allAlerts = [...activeNotifications, ...notifications.filter(n => n.dismissed)];
    const totalCount   = allAlerts.length;
    const warningCount = allAlerts.filter(n => n.severity === 'warning').length;
    const infoCount    = allAlerts.filter(n => n.severity === 'info').length;

    const countFor = (key: FilterType) => {
        if (key === 'all')      return totalCount;
        if (key === 'critical') return criticalCount;
        if (key === 'warning')  return warningCount;
        if (key === 'info')     return infoCount;
        return 0;
    };

    return (
        <div className="fade-in space-y-6 pb-10">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Bell size={20} className="text-gray-700" />
                        </div>
                        <h1 className="page-title">System Alerts</h1>
                    </div>
                    <p className="text-sm text-gray-500 ml-13 pl-0.5">
                        All system events, warnings, and critical alerts in one place.
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    {activeNotifications.length > 0 && (
                        <button
                            onClick={dismissAll}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:text-gray-900 transition-all"
                        >
                            <CheckCheck size={16} />
                            Mark All Read
                        </button>
                    )}
                    {totalCount > 0 && (
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-all"
                        >
                            <Trash2 size={16} />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card-metric">
                    <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                    <div className="text-sm text-gray-500 mt-0.5">Total Alerts</div>
                </div>
                <div className="card-metric border-l-4 border-red-400">
                    <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
                    <div className="text-sm text-gray-500 mt-0.5">Critical</div>
                </div>
                <div className="card-metric border-l-4 border-amber-400">
                    <div className="text-2xl font-bold text-amber-600">{warningCount}</div>
                    <div className="text-sm text-gray-500 mt-0.5">Warnings</div>
                </div>
                <div className="card-metric border-l-4 border-blue-400">
                    <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
                    <div className="text-sm text-gray-500 mt-0.5">Info</div>
                </div>
            </div>

            {/* ── Filter Tabs ── */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
                {FILTERS.map(({ key, label, icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveFilter(key)}
                        className={cn(
                            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                            activeFilter === key
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        )}
                    >
                        {icon}
                        {label}
                        {countFor(key) > 0 && (
                            <span className={cn(
                                'ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
                                activeFilter === key
                                    ? key === 'critical' ? 'bg-red-100 text-red-600'
                                    : key === 'warning'  ? 'bg-amber-100 text-amber-600'
                                    : 'bg-gray-100 text-gray-600'
                                    : 'bg-gray-200 text-gray-500'
                            )}>
                                {countFor(key)}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Alert List ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <NotificationPanel filter={activeFilter} />
            </div>

            {/* ── Info Banner ── */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700">
                    Alerts are generated automatically based on machine sensor data. Data refreshes every 15 minutes.
                    Critical alerts require immediate attention from the operations team.
                </p>
            </div>
        </div>
    );
}
