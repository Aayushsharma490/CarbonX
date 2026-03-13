'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { EnergyNotification, NotificationSeverity } from '@/types/energy';
import { notificationRateLimiter } from '@/lib/debounce';

interface NotificationContextType {
    notifications: EnergyNotification[];
    activeNotifications: EnergyNotification[];
    criticalCount: number;
    isMuted: boolean;
    toggleMute: () => void;
    addNotification: (params: {
        severity: NotificationSeverity;
        title: string;
        message: string;
        gatewayId?: string;
        nodeId?: string;
        lossPercent?: number;
    }) => string | null;
    dismiss: (id: string) => void;
    dismissAll: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let notificationCounter = 0;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<EnergyNotification[]>([]);
    const [isMuted, setIsMuted] = useState(false);

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => !prev);
    }, []);

    const playCriticalAlert = useCallback(() => {
        try {
            const AudioContextClass =
                window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;

            const ctx = new AudioContextClass();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);
        } catch (e) {
            // Silent fallback
        }
    }, []);

    const addNotification = useCallback((params: {
        severity: NotificationSeverity;
        title: string;
        message: string;
        gatewayId?: string;
        nodeId?: string;
        lossPercent?: number;
    }) => {
        const isCritical = params.severity === 'critical';
        const rateLimitKey = params.gatewayId ?? params.nodeId ?? 'global';

        if (!notificationRateLimiter.isAllowed(rateLimitKey, isCritical)) {
            return null;
        }

        const notification: EnergyNotification = {
            id: `notif-${++notificationCounter}-${Date.now()}`,
            ...params,
            timestamp: new Date().toISOString(),
            dismissed: false,
        };

        if (isCritical && !isMuted) {
            playCriticalAlert();
        }

        setNotifications((prev) => [notification, ...prev].slice(0, 20));
        return notification.id;
    }, [playCriticalAlert, isMuted]);

    const dismiss = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n))
        );
    }, []);

    const dismissAll = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, dismissed: true })));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const activeNotifications = notifications.filter((n) => !n.dismissed);
    const criticalCount = activeNotifications.filter((n) => n.severity === 'critical').length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            activeNotifications,
            criticalCount,
            isMuted,
            toggleMute,
            addNotification,
            dismiss,
            dismissAll,
            clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useGlobalNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useGlobalNotifications must be used within NotificationProvider');
    return context;
}
