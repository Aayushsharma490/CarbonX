'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { SystemProvider } from '@/context/SystemContext';
import { TelemetryProvider } from '@/context/TelemetryContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ModeProvider } from '@/context/ModeContext';
import { PersonalDataProvider } from '@/context/PersonalDataContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ModeProvider>
                <PersonalDataProvider>
                    <SystemProvider>
                        <NotificationProvider>
                            <TelemetryProvider>
                                {children}
                            </TelemetryProvider>
                        </NotificationProvider>
                    </SystemProvider>
                </PersonalDataProvider>
            </ModeProvider>
        </AuthProvider>
    );
}

