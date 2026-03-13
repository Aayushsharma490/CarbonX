'use client';

import { X, AlertTriangle, Info, Zap, Shield, Bell, BellOff } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useGlobalNotifications } from '@/context/NotificationContext';
import type { EnergyNotification, NotificationSeverity } from '@/types/energy';

// ─── Individual Notification Toast ───────────────────────────────────────────

function NotificationToast({
    notification,
    onDismiss,
}: {
    notification: EnergyNotification;
    onDismiss: (id: string) => void;
}) {
    const isCritical = notification.severity === 'critical';

    const iconMap: Record<NotificationSeverity, React.ReactNode> = {
        info: <Info size={18} className="text-white flex-shrink-0" />,
        warning: <AlertTriangle size={18} className="text-white flex-shrink-0" />,
        critical: <Shield size={20} className="text-white flex-shrink-0 animate-bounce" />,
    };

    // HIGH IMPACT STYLING (User requested: Dark background, White text, Red/Black Highlights)
    const containerClasses: Record<NotificationSeverity, string> = {
        info: 'bg-zinc-900 border-zinc-700 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)]',
        warning: 'bg-orange-950 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]',
        critical: 'bg-red-950 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.7)] ring-2 ring-red-600 ring-offset-2 ring-offset-black',
    };

    return (
        <div
            id={`notification-${notification.id}`}
            role="alert"
            aria-live={isCritical ? 'assertive' : 'polite'}
            className={cn(
                'flex items-center gap-3 p-3 rounded-xl border-2 backdrop-blur-md',
                'sm:gap-4 sm:p-4 sm:rounded-2xl',
                'animate-in slide-in-from-right duration-300 hover:scale-[1.02]',
                'w-full max-w-full overflow-hidden',
                containerClasses[notification.severity]
            )}
        >
            <div className={cn(
                "p-1.5 sm:p-2 rounded-lg flex items-center justify-center flex-shrink-0",
                isCritical ? "bg-red-600 animate-pulse" : "bg-white/10"
            )}>
                {iconMap[notification.severity]}
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
                <div className="font-bold text-xs sm:text-sm tracking-wide uppercase truncate">
                    {notification.title}
                </div>
                <div className="text-white/80 text-[10px] sm:text-[11px] font-medium mt-1 uppercase line-clamp-2">
                    {notification.message}
                </div>
            </div>

            <button
                onClick={() => onDismiss(notification.id)}
                aria-label="Dismiss notification"
                className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/80 text-white transition-all cursor-pointer"
            >
                <X size={14} className="sm:w-4 sm:h-4" />
            </button>
        </div>
    );
}

// ─── Notification Overlay ──────────────────────────────────────────────────

export function NotificationOverlay() {
    const { activeNotifications, dismiss, isMuted } = useGlobalNotifications();
    const pathname = usePathname();

    // Only show on dashboard and internal pages
    const isExcludedPage = pathname === '/' || pathname === '/login';
    
    // IF MUTED: Hide toasts entirely to keep screen clean (User: "kuch bhi nhi aaye screne par")
    if (isExcludedPage || isMuted) return null;
    if (activeNotifications.length === 0) return null;

    return (
        <div
            id="notification-overlay"
            className={cn(
                "fixed z-[100000] flex flex-col gap-3 transition-all duration-500",
                "bottom-4 left-4 right-4 max-w-full",
                "sm:bottom-6 sm:left-6 sm:right-6",
                "md:bottom-auto md:top-24 md:right-8 md:left-auto md:w-[420px] md:max-w-[90vw]",
                "lg:w-[480px]"
            )}
            aria-label="Live system alerts"
        >
            {activeNotifications.slice(0, 5).map((n) => (
                <NotificationToast key={n.id} notification={n} onDismiss={dismiss} />
            ))}
        </div>
    );
}

export function NotificationPanel({ className }: { className?: string }) {
    const { activeNotifications, dismiss, dismissAll } = useGlobalNotifications();

    if (activeNotifications.length === 0) return null;

    return (
        <div id="notification-panel" className={cn('flex flex-col gap-4', className)}>
            <div className="flex flex-col gap-3">
                {activeNotifications.map((n) => (
                    <NotificationToast key={n.id} notification={n} onDismiss={dismiss} />
                ))}
            </div>
            {activeNotifications.length > 1 && (
                <button
                    onClick={() => dismissAll()}
                    className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors py-2 px-4 bg-red-900/40 rounded-lg border border-red-500/50"
                >
                    CLEAR ALL PROTOCOL MESSAGES
                </button>
            )}
        </div>
    );
}
