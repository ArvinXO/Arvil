'use client';

import Link from 'next/link';

interface DrillCardProps {
    title: string;
    subtitle: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    accentColor?: string;
    delay?: number;
}

export default function DrillCard({
    title,
    subtitle,
    description,
    href,
    icon,
    accentColor = 'var(--accent)',
    delay = 0,
}: DrillCardProps) {
    return (
        <Link href={href} className="block group">
            <div
                className="animate-slide-up opacity-0 glass-card rounded-xl p-6 transition-all duration-300 hover:border-accent/50 hover:bg-card-hover group-hover:shadow-lg"
                style={{
                    animationDelay: `${delay}ms`,
                    animationFillMode: 'forwards',
                }}
            >
                <div className="flex items-start gap-4">
                    <div
                        className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)` }}
                    >
                        <div style={{ color: accentColor }}>{icon}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                            <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                                {title}
                            </h3>
                            <span className="text-[10px] tracking-widest uppercase text-muted font-medium">
                                {subtitle}
                            </span>
                        </div>
                        <p className="text-sm text-muted leading-relaxed">{description}</p>
                    </div>
                    <svg
                        className="w-5 h-5 text-muted group-hover:text-accent transition-all duration-300 group-hover:translate-x-1 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 20 20"
                    >
                        <path d="M7 4L13 10L7 16" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
