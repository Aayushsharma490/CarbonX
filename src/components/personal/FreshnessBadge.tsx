import React from 'react';
import { cn } from '@/lib/utils';
import type { DataFreshness } from '@/types/personal';

export function FreshnessBadge({ freshness, className }: { freshness: DataFreshness; className?: string }) {
    const config = {
        LIVE: {
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            dot: 'bg-emerald-500 animate-pulse',
            label: 'LIVE'
        },
        RECENT: {
            bg: 'bg-sky-50 text-sky-700 border-sky-200',
            dot: 'bg-sky-500',
            label: 'RECENT'
        },
        ESTIMATED: {
            bg: 'bg-amber-50 text-amber-700 border-amber-200',
            dot: 'bg-amber-500',
            label: 'ESTIMATED'
        },
        MANUAL: {
            bg: 'bg-purple-50 text-purple-700 border-purple-200',
            dot: 'bg-purple-400',
            label: 'MANUAL'
        }
    }[freshness] || {
        bg: 'bg-gray-50 text-gray-700 border-gray-200',
        dot: 'bg-gray-400',
        label: freshness
    };

    return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase', config.bg, className)}>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
            {config.label}
        </span>
    );
}
