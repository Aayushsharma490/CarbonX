'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRole?: 'ADMIN' | 'ENGINEER' | 'MANAGER';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
    const { isAuthenticated, role, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            const publicPaths = ['/login', '/'];
            const isPublicPath = publicPaths.includes(pathname);

            if (!isAuthenticated && !isPublicPath) {
                router.push('/login');
            } else if (isAuthenticated && pathname === '/login') {
                router.push('/dashboard');
            } else if (isAuthenticated && requiredRole && role !== 'ADMIN' && role !== requiredRole) {
                router.push('/dashboard');
            } else if (isAuthenticated && pathname === '/alerts' && role === 'MANAGER') {
                // Alerts page is restricted to ADMIN and ENGINEER only
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, role, loading, router, pathname, requiredRole]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-[999] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-green-light border-t-transparent rounded-full animate-spin" />
                    <p className="text-brand-green-dark font-black text-xs uppercase tracking-widest animate-pulse">
                        Authenticating...
                    </p>
                </div>
            </div>
        );
    }

    const isPublicPath = ['/login', '/'].includes(pathname);

    // Don't render content if we are about to redirect
    if (!isAuthenticated && !isPublicPath) return null;
    if (isAuthenticated && requiredRole && role !== 'ADMIN' && role !== requiredRole) return null;

    return <>{children}</>;
}
