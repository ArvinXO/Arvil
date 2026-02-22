'use client';

import Badge from './Badge';
import { getCompetencyLevel } from '@/lib/spaced-repetition';

interface ScoreCardProps {
    accuracy: number;
    speedMs?: number;
    label?: string;
    showBadge?: boolean;
}

export default function ScoreCard({
    accuracy,
    speedMs,
    label = 'Score',
    showBadge = true,
}: ScoreCardProps) {
    const competency = getCompetencyLevel(accuracy);
    const speedSeconds = speedMs ? (speedMs / 1000).toFixed(1) : null;

    return (
        <div className="animate-fade-in-scale glass-card rounded-xl p-6 text-center">
            <p className="text-xs tracking-widest uppercase text-muted mb-3">{label}</p>

            <div className="flex items-center justify-center gap-4 mb-4">
                <div>
                    <span
                        className="text-5xl font-bold tabular-nums"
                        style={{ color: competency.color }}
                    >
                        {Math.round(accuracy)}
                    </span>
                    <span className="text-xl text-muted">%</span>
                </div>
            </div>

            {showBadge && (
                <div className="mb-3">
                    <Badge level={competency.level} size="md" />
                </div>
            )}

            {speedSeconds && (
                <p className="text-sm text-muted">
                    Response time: <span className="text-foreground font-mono">{speedSeconds}s</span>
                </p>
            )}

            <div className="mt-4 progress-bar">
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `${accuracy}%`,
                        backgroundColor: competency.color,
                    }}
                />
            </div>
        </div>
    );
}
