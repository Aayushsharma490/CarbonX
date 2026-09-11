'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type AppMode = 'personal' | 'organization';

interface ModeContextType {
    mode: AppMode;
    setMode: (mode: AppMode) => void;
    toggleMode: () => void;
    isPersonal: boolean;
    isOrganization: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
    // Default mode is personal
    const [mode, setModeState] = useState<AppMode>('personal');
    const [isLoaded, setIsLoaded] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const savedMode = localStorage.getItem('carbonx_app_mode') as AppMode | null;
        if (savedMode === 'personal' || savedMode === 'organization') {
            setModeState(savedMode);
        }
        setIsLoaded(true);
    }, []);

    const setMode = (newMode: AppMode) => {
        setModeState(newMode);
        localStorage.setItem('carbonx_app_mode', newMode);

        // Intelligently route if current route is mode-specific
        const personalOnlyRoutes = ['/activities', '/footprint', '/insights', '/what-if', '/target', '/household', '/data-trust'];
        const orgOnlyRoutes = ['/machines', '/carbon', '/energy', '/reports', '/alerts', '/settings'];

        if (newMode === 'organization' && personalOnlyRoutes.includes(pathname)) {
            router.push('/dashboard');
        } else if (newMode === 'personal' && orgOnlyRoutes.includes(pathname)) {
            router.push('/dashboard');
        }
    };

    const toggleMode = () => {
        setMode(mode === 'personal' ? 'organization' : 'personal');
    };

    return (
        <ModeContext.Provider value={{
            mode,
            setMode,
            toggleMode,
            isPersonal: mode === 'personal',
            isOrganization: mode === 'organization'
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
