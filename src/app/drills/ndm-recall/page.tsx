'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { saveNDMEntry, getNDMEntries, generateId, type NDMEntry } from '@/lib/storage';

type Phase = 'form' | 'saved' | 'review';

const GAPOA_STEPS = [
    {
        key: 'gather' as const,
        label: 'Gather',
        prompt: 'What information did you gather? What did you see, hear, or receive?',
        icon: '🔍',
        color: '#4ade80',
    },
    {
        key: 'assess' as const,
        label: 'Assess',
        prompt: 'How did you assess the situation? What were the key risks and considerations?',
        icon: '🧠',
        color: '#3b82f6',
    },
    {
        key: 'powers' as const,
        label: 'Powers',
        prompt: 'What powers/authorities were available to you? What legislation applied?',
        icon: '⚖️',
        color: '#a855f7',
    },
    {
        key: 'options' as const,
        label: 'Options',
        prompt: 'What options did you consider? What were the alternatives?',
        icon: '🔀',
        color: '#f59e0b',
    },
    {
        key: 'action' as const,
        label: 'Action',
        prompt: 'What action did you take and why? What was the rationale?',
        icon: '⚡',
        color: '#ef4444',
    },
    {
        key: 'review' as const,
        label: 'Review',
        prompt: 'What was the outcome? What would you do differently?',
        icon: '📋',
        color: '#06b6d4',
    },
];

export default function NDMRecallPage() {
    const [phase, setPhase] = useState<Phase>('form');
    const [currentStep, setCurrentStep] = useState(0);
    const [entries, setEntries] = useState<NDMEntry[]>([]);
    const [formData, setFormData] = useState({
        gather: '',
        assess: '',
        powers: '',
        options: '',
        action: '',
        review: '',
    });

    const step = GAPOA_STEPS[currentStep];
    const isLastStep = currentStep === GAPOA_STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            // Save entry
            const entry: NDMEntry = {
                id: generateId(),
                timestamp: Date.now(),
                ...formData,
            };
            saveNDMEntry(entry);
            setPhase('saved');
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const resetForm = () => {
        setFormData({ gather: '', assess: '', powers: '', options: '', action: '', review: '' });
        setCurrentStep(0);
        setPhase('form');
    };

    const loadEntries = () => {
        setEntries(getNDMEntries().reverse());
        setPhase('review');
    };

    const progress = ((currentStep + 1) / GAPOA_STEPS.length) * 100;

    return (
        <div className="min-h-screen">
            <Navigation title="NDM Recall" />

            <div className="pt-20 pb-12 px-4 max-w-lg mx-auto">
                {/* Form Phase */}
                {phase === 'form' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Header */}
                        <div className="text-center mb-2">
                            <h2 className="text-xl font-bold mb-1">GAPOA+R Framework</h2>
                            <p className="text-sm text-muted">File your recall using the NDM decision model</p>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] tracking-wider uppercase text-muted">
                                <span>Step {currentStep + 1} of {GAPOA_STEPS.length}</span>
                                <span>{step.label}</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="flex gap-1">
                                {GAPOA_STEPS.map((s, i) => (
                                    <button
                                        key={s.key}
                                        onClick={() => setCurrentStep(i)}
                                        className={`flex-1 h-1.5 rounded-full transition-colors ${i <= currentStep ? 'opacity-100' : 'opacity-30'
                                            }`}
                                        style={{ backgroundColor: s.color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Step Card */}
                        <div className="glass-card rounded-xl p-6" style={{ borderColor: `${step.color}30` }}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">{step.icon}</span>
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: step.color }}>
                                        {step.label}
                                    </h3>
                                    <p className="text-xs text-muted">{step.prompt}</p>
                                </div>
                            </div>

                            <textarea
                                value={formData[step.key]}
                                onChange={(e) => setFormData(prev => ({ ...prev, [step.key]: e.target.value }))}
                                placeholder={`Enter your ${step.label.toLowerCase()} notes...`}
                                className="input-field min-h-[150px] resize-none"
                                style={{ borderColor: formData[step.key] ? `${step.color}50` : undefined }}
                                autoFocus
                            />
                        </div>

                        {/* Navigation */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className={`btn-secondary flex-1 ${currentStep === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                                Back
                            </button>
                            <button onClick={handleNext} className="btn-primary flex-1">
                                {isLastStep ? 'Save Entry' : 'Next'}
                            </button>
                        </div>

                        {/* Review link */}
                        <button
                            onClick={loadEntries}
                            className="w-full text-center text-xs text-muted hover:text-accent transition-colors py-2"
                        >
                            View past entries →
                        </button>
                    </div>
                )}

                {/* Saved Phase */}
                {phase === 'saved' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center animate-fade-in-scale space-y-6">
                            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Entry Saved</h2>
                                <p className="text-sm text-muted">Your GAPOA+R recall has been filed locally.</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={resetForm} className="btn-primary flex-1">
                                    New Entry
                                </button>
                                <button onClick={loadEntries} className="btn-secondary flex-1">
                                    Review All
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Review Phase */}
                {phase === 'review' && (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Past Entries</h2>
                            <button onClick={resetForm} className="btn-secondary text-sm py-1.5 px-3">
                                New Entry
                            </button>
                        </div>

                        {entries.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted">No entries yet. Complete a drill and file your recall.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {entries.map((entry) => (
                                    <details key={entry.id} className="glass-card rounded-xl overflow-hidden group">
                                        <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-card-hover transition-colors">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {new Date(entry.timestamp).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                                <p className="text-xs text-muted mt-0.5 line-clamp-1">
                                                    {entry.gather.substring(0, 80) || 'No gather notes'}
                                                </p>
                                            </div>
                                            <svg className="w-4 h-4 text-muted transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </summary>
                                        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                                            {GAPOA_STEPS.map((s) => (
                                                <div key={s.key}>
                                                    <p className="text-[10px] tracking-wider uppercase font-semibold mb-0.5" style={{ color: s.color }}>
                                                        {s.icon} {s.label}
                                                    </p>
                                                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                                                        {entry[s.key] || '—'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
