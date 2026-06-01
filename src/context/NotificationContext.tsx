'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EnergyNotification, NotificationSeverity } from '@/types/energy';
import { notificationRateLimiter } from '@/lib/debounce';

interface NotificationContextType {
    notifications: EnergyNotification[];
    activeNotifications: EnergyNotification[];
    criticalCount: number;
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

        // No sounds — alerts are stored and visible only on the Alerts page
        setNotifications((prev) => [notification, ...prev].slice(0, 100));
        return notification.id;
    }, []);

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
