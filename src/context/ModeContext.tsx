'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type AppMode = 'organization' | 'personal';

interface ModeContextType {
    mode: 'organization';
    setMode: (mode: AppMode) => void;
    toggleMode: () => void;
    isPersonal: boolean;
    isOrganization: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
    // Mode is locked to industrial / organization
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        localStorage.setItem('carbonx_app_mode', 'organization');
        // Redirect legacy personal-only routes back to the main industrial dashboard
        const personalOnlyRoutes = ['/activities', '/footprint', '/insights', '/what-if', '/target', '/household', '/data-trust'];
        if (personalOnlyRoutes.includes(pathname)) {
            router.replace('/dashboard');
        }
    }, [pathname, router]);

    const setMode = (_newMode: AppMode) => {
        localStorage.setItem('carbonx_app_mode', 'organization');
    };

    const toggleMode = () => {
        localStorage.setItem('carbonx_app_mode', 'organization');
    };

    return (
        <ModeContext.Provider value={{
            mode: 'organization',
            setMode,
            toggleMode,
            isPersonal: false,
            isOrganization: true
        }}>
            {children}
        </ModeContext.Provider>
    );
}

export function useAppMode() {
    const context = useContext(ModeContext);
    if (!context) {
        throw new Error('useAppMode must be used within a ModeProvider');
    }
    return context;
}
