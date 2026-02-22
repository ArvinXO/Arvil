'use client';

interface DebriefItem {
    label: string;
    expected: string;
    actual: string;
    correct: boolean;
}

interface DebriefProps {
    title?: string;
    items: DebriefItem[];
    accuracy: number;
    onContinue?: () => void;
    continueLabel?: string;
}

export default function Debrief({
    title = 'Debrief',
    items,
    accuracy,
    onContinue,
    continueLabel = 'Continue',
}: DebriefProps) {
    return (
        <div className="animate-fade-in space-y-4">
            <h2 className="text-lg font-semibold tracking-widest uppercase text-accent">
                {title}
            </h2>

            <div className="space-y-2">
                {items.map((item, i) => (
                    <div
                        key={i}
                        className="glass-card rounded-lg p-4 flex items-start gap-3"
                        style={{
                            animationDelay: `${i * 100}ms`,
                        }}
                    >
                        <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${item.correct
                                ? 'bg-success/20 text-success'
                                : 'bg-danger/20 text-danger'
                            }`}>
                            {item.correct ? '✓' : '✗'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs tracking-wider uppercase text-muted mb-1">
                                {item.label}
                            </p>
                            <p className={`text-sm font-medium ${item.correct ? 'text-foreground' : 'text-danger'}`}>
                                Your answer: {item.actual || '—'}
                            </p>
                            {!item.correct && (
                                <p className="text-sm text-accent mt-1">
                                    Correct: {item.expected}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Overall Accuracy</span>
                    <span className={`text-lg font-bold ${accuracy >= 80 ? 'text-success' : accuracy >= 50 ? 'text-warning' : 'text-danger'
                        }`}>
                        {Math.round(accuracy)}%
                    </span>
                </div>
                <div className="mt-2 progress-bar">
                    <div
                        className="progress-bar-fill"
                        style={{
                            width: `${accuracy}%`,
                            backgroundColor: accuracy >= 80 ? 'var(--success)' : accuracy >= 50 ? 'var(--warning)' : 'var(--danger)',
                        }}
                    />
                </div>
            </div>

            {onContinue && (
                <button onClick={onContinue} className="btn-primary w-full mt-4">
                    {continueLabel}
                </button>
            )}
        </div>
    );
}
