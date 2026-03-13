'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { SystemProvider } from '@/context/SystemContext';
import { TelemetryProvider } from '@/context/TelemetryContext';
import { NotificationProvider } from '@/context/NotificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SystemProvider>
                <NotificationProvider>
                    <TelemetryProvider>
                        {children}
                    </TelemetryProvider>
                </NotificationProvider>
            </SystemProvider>
        </AuthProvider>
    );
}
