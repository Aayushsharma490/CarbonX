'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Activity,
    Leaf,
    Download,
    Settings,
    Zap,
    Menu,
    X,
    LogOut,
    Bell,
    BellOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalNotifications } from '@/context/NotificationContext';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/machines', label: 'Machine Health', icon: Activity },
    { href: '/carbon', label: 'Carbon Analytics', icon: Leaf },
    { href: '/energy', label: 'Energy Monitor', icon: Zap },
    { href: '/reports', label: 'Reports', icon: Download },
    { href: '/settings', label: 'Settings', icon: Settings },
] as const;

// ─── Desktop Top Navigation (Floating Pill) ──────────────────────────────────
function DesktopNav({ pathname }: { pathname: string }) {
    const { role, logout } = useAuth();
    const { isMuted, toggleMute } = useGlobalNotifications();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const visibleNavItems = NAV_ITEMS.filter(item => {
        if (role === 'ADMIN') return true;
        if (role === 'ENGINEER') return ['/dashboard', '/machines', '/energy', '/settings'].includes(item.href);
        if (role === 'MANAGER') return ['/dashboard', '/carbon', '/reports'].includes(item.href);
        return false;
    });

    return (
        <nav
            id="desktop-nav"
            className={cn(
                "fixed top-2 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 hidden md:flex items-center gap-1 p-1.5 rounded-full border border-white/40 shadow-2xl backdrop-blur-xl print:hidden",
                scrolled ? "bg-white/70 w-[95%] max-w-5xl" : "bg-white/40 w-[90%] max-w-4xl"
            )}
        >
            {/* Logo Section */}
            <Link href="/" className="pl-4 pr-6 flex items-center border-r border-black/5 group">
                <Image src="/carbon_logo.png" alt="Logo" width={90} height={28} className="group-hover:scale-105 transition-transform object-contain" priority />
            </Link>

            {/* Icon Navigation */}
            <ul className="flex items-center gap-1.5 px-4 flex-1 justify-center">
                {visibleNavItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <li key={href} className="relative group/nav">
                            <Link
                                href={href}
                                className={cn(
                                    "relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300",
                                    isActive
                                        ? "bg-brand-green-dark text-white shadow-lg scale-110"
                                        : "text-brand-green-dark/60 hover:bg-brand-green-light/10 hover:text-brand-green-dark"
                                )}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive && "animate-pulse")} />

                                {/* Tooltip */}
                                <span className="absolute top-[120%] left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-green-dark text-white text-[10px] font-black uppercase tracking-widest rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/20 whitespace-nowrap">
                                    {label}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {/* User & Global Actions */}
            <div className="flex items-center gap-3 pr-2 border-l border-black/5 pl-4">
                <button
                    onClick={toggleMute}
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border",
                        isMuted 
                            ? "bg-zinc-100 border-zinc-200 text-zinc-400 hover:text-brand-green-dark" 
                            : "bg-brand-green-light/10 border-brand-green-light/20 text-brand-green-light hover:bg-brand-green-light hover:text-white"
                    )}
                    title={isMuted ? "Unmute Alerts" : "Mute Alerts"}
                >
                    {isMuted ? <BellOff size={16} /> : <Bell size={16} className={cn(!isMuted && "animate-pulse")} />}
                </button>

                <div className="flex items-center gap-2 pr-4 text-[9px] font-black text-brand-green-dark/40 uppercase tracking-widest border-l border-black/5 pl-4">
                    <span className="w-2 h-2 rounded-full bg-brand-green-light animate-pulse" />
                    {role}
                </div>
                <button
                    onClick={logout}
                    className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </nav>
    );
}

// ─── Mobile Navigation (hamburger) ──────────────────────────────────────────
function MobileNav({ pathname }: { pathname: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { role, logout } = useAuth();
    const { isMuted, toggleMute } = useGlobalNotifications();

    const visibleNavItems = NAV_ITEMS.filter(item => {
        if (role === 'ADMIN') return true;
        if (role === 'ENGINEER') return ['/dashboard', '/machines', '/energy', '/settings'].includes(item.href);
        if (role === 'MANAGER') return ['/dashboard', '/carbon', '/reports'].includes(item.href);
        return false;
    });

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <>
            <div
                id="mobile-topbar"
                className="md:hidden flex items-center justify-between px-4 py-2 glass border-b border-brand-green-light/10 shadow-sm sticky top-0 z-50"
            >
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/carbon_logo.png" alt="CarbonX Logo" width={100} height={28} className="object-contain" priority />
                </Link>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleMute}
                        className={cn(
                            "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
                            isMuted ? "text-zinc-400" : "text-brand-green-light"
                        )}
                    >
                        {isMuted ? <BellOff size={20} /> : <Bell size={20} />}
                    </button>
                    <button
                        id="hamburger-btn"
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-brand-green-dark/80 hover:bg-brand-green-light/10 transition-all duration-200 cursor-pointer"
                    >
                        {isOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden fixed inset-0 z-[100] flex" id="mobile-menu">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md" onClick={() => setIsOpen(false)} />
                    <div className="relative ml-auto w-72 h-full glass-thick border-l border-brand-green-light/10 shadow-2xl flex flex-col p-8 gap-8 animate-slide-in overflow-hidden">
                        <div className="absolute inset-0 dot-pattern opacity-20 -z-10" />
                        <div className="flex items-center justify-between">
                            <Image src="/carbon_logo.png" alt="CarbonX Logo" width={90} height={24} className="object-contain" />
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-green-dark/40 hover:text-brand-green-dark transition-colors cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <nav>
                            <ul className="flex flex-col gap-1" role="list">
                                {visibleNavItems.map(({ href, label, icon: Icon }) => {
                                    const isActive = pathname === href;
                                    return (
                                        <li key={href}>
                                            <Link href={href} className={cn('flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200', isActive ? 'bg-brand-green-dark text-white shadow-lg' : 'text-brand-green-dark/70 hover:bg-brand-green-light/5')}>
                                                <Icon size={20} />
                                                {label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                        <div className="mt-auto space-y-4">
                            <button onClick={logout} className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest border border-red-500/10">
                                Sign Out Session
                                <LogOut size={16} />
                            </button>
                            <div className="flex items-center gap-2 text-xs text-brand-green-dark/40 px-1 font-medium">
                                <span className="w-2 h-2 rounded-full bg-brand-green-light animate-pulse" />
                                {role} Connected
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function AppNavigation() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    const hideNav = pathname === '/login' || (!isAuthenticated && pathname === '/');
    if (hideNav) return null;

    return (
        <>
            <MobileNav pathname={pathname} />
            <DesktopNav pathname={pathname} />
        </>
    );
}
