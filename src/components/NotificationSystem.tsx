'use client';

import { X, AlertTriangle, Info, Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalNotifications } from '@/context/NotificationContext';
import type { EnergyNotification, NotificationSeverity } from '@/types/energy';

// ─── Individual Alert Row (used on Alerts page) ───────────────────────────────

function AlertRow({
    notification,
    onDismiss,
}: {
    notification: EnergyNotification;
    onDismiss: (id: string) => void;
}) {
    const severityConfig: Record<NotificationSeverity, { label: string; badgeClass: string; icon: React.ReactNode }> = {
        info:     { label: 'Info',     badgeClass: 'badge-info',     icon: <Info size={14} /> },
        warning:  { label: 'Warning',  badgeClass: 'badge-warning',  icon: <AlertTriangle size={14} /> },
        critical: { label: 'Critical', badgeClass: 'badge-critical', icon: <Shield size={14} /> },
    };

    const cfg = severityConfig[notification.severity];
    const time = new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = new Date(notification.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

    return (
        <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors group">
            <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 mt-0.5', cfg.badgeClass)}>
                {cfg.icon}
                <span>{cfg.label}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{notification.title.replace(/[🚨⚠️📳⚡🔥📡]/g, '').trim()}</div>
                <div className="text-gray-500 text-sm mt-0.5 leading-relaxed">{notification.message}</div>
                {notification.nodeId && (
                    <div className="text-xs text-gray-400 mt-1.5 font-mono">Machine: {notification.nodeId}</div>
                )}
            </div>
            <div className="text-right shrink-0">
                <div className="text-xs text-gray-400">{time}</div>
                <div className="text-xs text-gray-400">{date}</div>
            </div>
            <button
                onClick={() => onDismiss(notification.id)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Dismiss"
            >
                <X size={14} />
            </button>
        </div>
    );
}

// ─── Notification Panel (used on Alerts page) ─────────────────────────────────

export function NotificationPanel({ className, filter }: { className?: string; filter?: NotificationSeverity | 'all' }) {
    const { activeNotifications, notifications, dismiss, dismissAll, clearAll } = useGlobalNotifications();

    const allAlerts = [...activeNotifications, ...notifications.filter(n => n.dismissed)];
    const filtered = filter && filter !== 'all'
        ? allAlerts.filter(n => n.severity === filter)
        : allAlerts;

    if (filtered.length === 0) {
        return (
            <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
                    <CheckCircle2 size={28} className="text-green-500" />
                </div>
                <div className="font-semibold text-gray-700">No alerts</div>
                <div className="text-sm text-gray-400 mt-1">System is running normally.</div>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {filtered.map((n) => (
                <AlertRow key={n.id} notification={n} onDismiss={dismiss} />
            ))}
        </div>
    );
}

// NotificationOverlay removed — alerts are only shown on the /alerts page
export function NotificationOverlay() { return null; }
