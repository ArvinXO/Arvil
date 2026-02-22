'use client';

interface BadgeProps {
    level: 'bronze' | 'silver' | 'gold';
    size?: 'sm' | 'md' | 'lg';
}

const BADGE_CONFIG = {
    bronze: {
        label: 'BRONZE',
        color: '#d97706',
        bg: 'rgba(217, 119, 6, 0.15)',
        border: 'rgba(217, 119, 6, 0.3)',
    },
    silver: {
        label: 'SILVER',
        color: '#94a3b8',
        bg: 'rgba(148, 163, 184, 0.15)',
        border: 'rgba(148, 163, 184, 0.3)',
    },
    gold: {
        label: 'GOLD',
        color: '#fbbf24',
        bg: 'rgba(251, 191, 36, 0.15)',
        border: 'rgba(251, 191, 36, 0.3)',
    },
};

export default function Badge({ level, size = 'md' }: BadgeProps) {
    const config = BADGE_CONFIG[level];
    const sizeClasses = {
        sm: 'text-[9px] px-2 py-0.5',
        md: 'text-[10px] px-3 py-1',
        lg: 'text-xs px-4 py-1.5',
    };

    return (
        <span
            className={`inline-flex items-center font-bold tracking-[0.2em] rounded-full ${sizeClasses[size]}`}
            style={{
                color: config.color,
                backgroundColor: config.bg,
                border: `1px solid ${config.border}`,
            }}
        >
            {config.label}
        </span>
    );
}
