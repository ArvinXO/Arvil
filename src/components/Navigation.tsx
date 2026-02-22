'use client';

import Link from 'next/link';

interface NavigationProps {
    title?: string;
    backHref?: string;
}

export default function Navigation({ title, backHref = '/' }: NavigationProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
                <Link
                    href={backHref}
                    className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 4L7 10L13 16" />
                    </svg>
                    <span className="text-sm font-medium hidden sm:inline">Back</span>
                </Link>
                {title && (
                    <h1 className="text-sm font-semibold tracking-widest uppercase text-accent">
                        {title}
                    </h1>
                )}
                <div className="ml-auto">
                    <Link
                        href="/"
                        className="text-xs font-bold tracking-[0.3em] text-muted hover:text-foreground transition-colors"
                    >
                        ARVIL
                    </Link>
                </div>
            </div>
        </nav>
    );
}
