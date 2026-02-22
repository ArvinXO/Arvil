'use client';

import { useState, useEffect, useCallback } from 'react';

interface TimerProps {
    duration: number;         // seconds
    onComplete?: () => void;
    autoStart?: boolean;
    showMs?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'countdown' | 'stopwatch';
    className?: string;
}

export default function Timer({
    duration,
    onComplete,
    autoStart = true,
    showMs = false,
    size = 'md',
    variant = 'countdown',
    className = '',
}: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(variant === 'countdown' ? duration * 1000 : 0);
    const [isRunning, setIsRunning] = useState(autoStart);
    const [startTime, setStartTime] = useState<number | null>(autoStart ? Date.now() : null);

    const start = useCallback(() => {
        setIsRunning(true);
        setStartTime(Date.now());
        if (variant === 'countdown') {
            setTimeLeft(duration * 1000);
        } else {
            setTimeLeft(0);
        }
    }, [duration, variant]);

    const stop = useCallback(() => {
        setIsRunning(false);
    }, []);

    const reset = useCallback(() => {
        setIsRunning(false);
        setStartTime(null);
        setTimeLeft(variant === 'countdown' ? duration * 1000 : 0);
    }, [duration, variant]);

    useEffect(() => {
        if (!isRunning || startTime === null) return;

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;

            if (variant === 'countdown') {
                const remaining = Math.max(0, duration * 1000 - elapsed);
                setTimeLeft(remaining);
                if (remaining <= 0) {
                    setIsRunning(false);
                    onComplete?.();
                }
            } else {
                setTimeLeft(elapsed);
                if (elapsed >= duration * 1000) {
                    setIsRunning(false);
                    onComplete?.();
                }
            }
        }, showMs ? 50 : 100);

        return () => clearInterval(interval);
    }, [isRunning, startTime, duration, onComplete, variant, showMs]);

    const totalSeconds = Math.ceil(timeLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((timeLeft % 1000) / 10);
    const progress = variant === 'countdown'
        ? timeLeft / (duration * 1000)
        : Math.min(timeLeft / (duration * 1000), 1);

    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-3xl',
        lg: 'text-5xl',
    };

    const isUrgent = variant === 'countdown' && totalSeconds <= 5 && totalSeconds > 0;

    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            <div
                className={`font-mono font-bold tabular-nums ${sizeClasses[size]} ${isUrgent ? 'text-danger animate-pulse' : 'text-foreground'
                    }`}
            >
                {minutes > 0 && `${minutes}:`}
                {seconds.toString().padStart(2, '0')}
                {showMs && <span className="text-muted">.{ms.toString().padStart(2, '0')}</span>}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-[200px] progress-bar">
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `${progress * 100}%`,
                        backgroundColor: isUrgent ? 'var(--danger)' : 'var(--accent)',
                    }}
                />
            </div>

            {/* Expose controls */}
            <TimerControls start={start} stop={stop} reset={reset} isRunning={isRunning} />
        </div>
    );
}

function TimerControls({
    start: _start,
    stop: _stop,
    reset: _reset,
    isRunning: _isRunning,
}: {
    start: () => void;
    stop: () => void;
    reset: () => void;
    isRunning: boolean;
}) {
    // Controls are hidden by default — drills manage timer state
    return null;
}

// Export a hook version for drill pages that need more control
export function useTimer(duration: number, variant: 'countdown' | 'stopwatch' = 'countdown') {
    const [timeLeft, setTimeLeft] = useState(variant === 'countdown' ? duration * 1000 : 0);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);

    const start = useCallback(() => {
        setIsRunning(true);
        setStartTime(Date.now());
        if (variant === 'countdown') {
            setTimeLeft(duration * 1000);
        } else {
            setTimeLeft(0);
        }
    }, [duration, variant]);

    const stop = useCallback(() => {
        setIsRunning(false);
        return timeLeft;
    }, [timeLeft]);

    const reset = useCallback(() => {
        setIsRunning(false);
        setStartTime(null);
        setTimeLeft(variant === 'countdown' ? duration * 1000 : 0);
    }, [duration, variant]);

    const getElapsed = useCallback(() => {
        if (startTime === null) return 0;
        return Date.now() - startTime;
    }, [startTime]);

    useEffect(() => {
        if (!isRunning || startTime === null) return;

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (variant === 'countdown') {
                const remaining = Math.max(0, duration * 1000 - elapsed);
                setTimeLeft(remaining);
                if (remaining <= 0) {
                    setIsRunning(false);
                }
            } else {
                setTimeLeft(elapsed);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isRunning, startTime, duration, variant]);

    const totalSeconds = Math.ceil(timeLeft / 1000);

    return {
        timeLeft,
        totalSeconds,
        isRunning,
        start,
        stop,
        reset,
        getElapsed,
        progress: variant === 'countdown'
            ? timeLeft / (duration * 1000)
            : Math.min(timeLeft / (duration * 1000), 1),
    };
}
