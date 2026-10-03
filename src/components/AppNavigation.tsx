'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
    Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalNotifications } from '@/context/NotificationContext';

// ─── Navigation Routes ────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { href: '/dashboard',  label: 'Dashboard',        icon: LayoutDashboard },
    { href: '/machines',   label: 'Machine Health',   icon: Activity },
    { href: '/carbon',     label: 'Carbon Analytics', icon: Leaf },
    { href: '/energy',     label: 'Energy Monitor',   icon: Zap },
    { href: '/reports',    label: 'Reports',          icon: Download },
    { href: '/settings',   label: 'Settings',         icon: Settings },
] as const;

// ─── Desktop Navigation ───────────────────────────────────────────────────────
function DesktopNav({ pathname }: { pathname: string }) {
    const { role, logout, user } = useAuth();
    const { criticalCount } = useGlobalNotifications();

    const navItems = NAV_ITEMS.filter(item => {
        if (role === 'ADMIN') return true;
        if (role === 'ENGINEER') return ['/dashboard', '/machines', '/energy', '/settings'].includes(item.href);
        if (role === 'MANAGER') return ['/dashboard', '/carbon', '/reports'].includes(item.href);
        return true;
    });

    const canSeeAlerts = role === 'ADMIN' || role === 'ENGINEER';

    return (
        <nav
            id="desktop-nav"
            className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] hidden lg:flex items-center gap-1 px-3 py-1.5 nav-pill print:hidden w-auto max-w-6xl shadow-md bg-white/90 backdrop-blur-md rounded-full border border-gray-100"
        >
            {/* Logo */}
            <Link href="/dashboard" className="pl-2 pr-4 flex items-center border-r border-gray-100 mr-2">
                <Image src="/carbon_logo.png" alt="CarbonX" width={78} height={24} className="object-contain" priority />
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-0.5">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href + label}
                            href={href}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150',
                                isActive
                                    ? 'bg-gray-900 text-white shadow-xs'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            )}
                        >
                            <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 pl-3 ml-2 border-l border-gray-100">
                {/* Alerts bell */}
                {canSeeAlerts && (
                    <Link
                        href="/alerts"
                        className={cn(
                            'relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150',
                            pathname === '/alerts'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        )}
                        title="Alerts"
                    >
                        <Bell size={14} strokeWidth={2} />
                        {criticalCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                                {criticalCount > 9 ? '9+' : criticalCount}
                            </span>
                        )}
                    </Link>
                )}

                {/* User / Role badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold text-gray-700">{user?.name || role || 'User'}</span>
                </div>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Sign out"
                >
                    <LogOut size={14} />
                </button>
            </div>
        </nav>
    );
}

// ─── Mobile Navigation ────────────────────────────────────────────────────────
function MobileNav({ pathname }: { pathname: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { role, logout, user } = useAuth();
    const { criticalCount } = useGlobalNotifications();

    const navItems = NAV_ITEMS.filter(item => {
        if (role === 'ADMIN') return true;
        if (role === 'ENGINEER') return ['/dashboard', '/machines', '/energy', '/settings'].includes(item.href);
        if (role === 'MANAGER') return ['/dashboard', '/carbon', '/reports'].includes(item.href);
        return true;
    });

    const canSeeAlerts = role === 'ADMIN' || role === 'ENGINEER';

    return (
        <>
            {/* Mobile top bar */}
            <div
                id="mobile-topbar"
                className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-xs sticky top-0 z-50"
            >
                <Link href="/dashboard" className="flex items-center">
                    <Image src="/carbon_logo.png" alt="CarbonX" width={80} height={24} className="object-contain" priority />
                </Link>

                <div className="flex items-center gap-2">
                    {canSeeAlerts && (
                        <Link href="/alerts" className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-all">
                            <Bell size={18} />
                            {criticalCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5">
                                    {criticalCount}
                                </span>
                            )}
                        </Link>
                    )}
                    <button
                        id="hamburger-btn"
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all"
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu overlay */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-[110] flex" id="mobile-menu">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsOpen(false)} />
                    <div className="relative ml-auto w-72 h-full bg-white shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div>
                                <div className="font-bold text-gray-900 text-sm">CarbonX</div>
                                <div className="text-xs text-gray-500 font-medium">{user?.name || role || 'Platform'}</div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Nav items */}
                        <nav className="flex-1 px-3 py-4 overflow-y-auto">
                            <div className="flex flex-col gap-1">
                                {navItems.map(({ href, label, icon: Icon }) => {
                                    const isActive = pathname === href;
                                    return (
                                        <Link
                                            key={href + label}
                                            href={href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all',
                                                isActive
                                                    ? 'bg-gray-900 text-white'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            )}
                                        >
                                            <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                            {label}
                                        </Link>
                                    );
                                })}

                                {canSeeAlerts && (
                                    <Link
                                        href="/alerts"
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all',
                                            pathname === '/alerts'
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        )}
                                    >
                                        <Bell size={16} />
                                        <span>Alerts</span>
                                        {criticalCount > 0 && (
                                            <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                                                {criticalCount}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            </div>
                        </nav>

                        {/* Footer */}
                        <div className="px-3 py-4 border-t border-gray-100">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-all"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function AppNavigation() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    const hideNav = pathname === '/login' || (!isAuthenticated && pathname === '/');
    if (hideNav) return null;

    return (
        <>
            <MobileNav pathname={pathname} />
            <DesktopNav pathname={pathname} />
            {/* Spacer for fixed desktop nav */}
            <div className="hidden lg:block h-14" />
        </>
    );
}
