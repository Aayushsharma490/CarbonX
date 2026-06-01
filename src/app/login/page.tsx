'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Shield, HardHat, BarChart3, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLES: {
    role: UserRole;
    icon: React.ElementType;
    title: string;
    description: string;
    color: string;
    bgColor: string;
}[] = [
    {
        role: 'ADMIN',
        icon: Shield,
        title: 'Plant Director / Admin',
        description: 'Full platform access — configure machines, view all data, manage users',
        color: '#1a5c14',
        bgColor: '#f0fdf4',
    },
    {
        role: 'ENGINEER',
        icon: HardHat,
        title: 'Maintenance Engineer',
        description: 'Monitor machine health, manage energy data and operational alerts',
        color: '#1d4ed8',
        bgColor: '#eff6ff',
    },
    {
        role: 'MANAGER',
        icon: BarChart3,
        title: 'Zone Manager',
        description: 'View carbon analytics, performance reports and sustainability metrics',
        color: '#92400e',
        bgColor: '#fffbeb',
    },
];

export default function LoginPage() {
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = (role: UserRole) => {
        setSelectedRole(role);
        setLoading(true);
        setTimeout(() => login(role), 700);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white via-green-50/30 to-white">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* ── Left: Branding ── */}
                <div className="space-y-8">
                    <div>
                        <div className="inline-block p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
                            <Image src="/carbon_logo.png" alt="CarbonX" width={160} height={46} className="object-contain" priority />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                            Industrial Energy<br />
                            <span className="text-green-600">Management Platform</span>
                        </h1>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            Monitor your factory's energy consumption, track carbon footprint, and get AI-powered machine health alerts — all in one place.
                        </p>
                    </div>

                    {/* Feature list */}
                    <div className="space-y-3">
                        {[
                            'Real-time energy monitoring across all machines',
                            'Automated CO₂ footprint reports',
                            'AI anomaly detection & alerts',
                            'Multi-role access control',
                        ].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                <span className="text-gray-600 text-sm">{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right: Role Selection ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Select Your Role</h2>
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Lock size={16} className="text-gray-500" />
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-6">
                        Choose your access level to enter the platform. Each role has access to relevant tools and data.
                    </p>

                    <div className="space-y-3">
                        {ROLES.map(({ role, icon: Icon, title, description, color, bgColor }) => (
                            <button
                                key={role}
                                onClick={() => handleLogin(role)}
                                disabled={loading}
                                className={cn(
                                    'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group',
                                    selectedRole === role
                                        ? 'border-gray-900 bg-gray-900'
                                        : 'border-gray-100 hover:border-gray-200 hover:shadow-sm bg-white',
                                    loading && selectedRole !== role && 'opacity-50 pointer-events-none'
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                                        style={{
                                            background: selectedRole === role ? 'rgba(255,255,255,0.15)' : bgColor,
                                            color: selectedRole === role ? '#fff' : color
                                        }}
                                    >
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={cn('font-semibold text-sm', selectedRole === role ? 'text-white' : 'text-gray-900')}>
                                            {title}
                                        </div>
                                        <div className={cn('text-xs mt-0.5 leading-relaxed', selectedRole === role ? 'text-gray-300' : 'text-gray-400')}>
                                            {description}
                                        </div>
                                    </div>
                                    <ArrowRight
                                        size={16}
                                        className={cn(
                                            'shrink-0 transition-all',
                                            selectedRole === role ? 'text-white translate-x-1' : 'text-gray-300 group-hover:text-gray-500'
                                        )}
                                    />
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400">
                            This is a demo environment. No real credentials required.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
