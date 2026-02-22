'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ScoreCard from '@/components/ScoreCard';
import { generatePlate } from '@/lib/generators';
import { saveDrillResult, generateId } from '@/lib/storage';
import { createSpacedItem, accuracyToQuality, processReview } from '@/lib/spaced-repetition';
import { getDueItems } from '@/lib/storage';

type Phase = 'config' | 'ready' | 'flash' | 'delay' | 'recall' | 'result';

interface RoundResult {
    plate: string;
    answer: string;
    correct: boolean;
    timeMs: number;
}

export default function RegPlateForgePage() {
    const [phase, setPhase] = useState<Phase>('config');
    const [flashDuration, setFlashDuration] = useState(2);
    const [delayDuration, setDelayDuration] = useState(5);
    const [plateCount, setPlateCount] = useState(5);
    const [reverseMode, setReverseMode] = useState(false);
    const [showChunking, setShowChunking] = useState(true);

    const [currentPlate, setCurrentPlate] = useState('');
    const [currentRound, setCurrentRound] = useState(0);
    const [answer, setAnswer] = useState('');
    const [results, setResults] = useState<RoundResult[]>([]);
    const [countdown, setCountdown] = useState(0);
    const [plates, setPlates] = useState<string[]>([]);

    const recallStartTime = useRef(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const startDrill = useCallback(() => {
        const newPlates = Array.from({ length: plateCount }, () => generatePlate());
        setPlates(newPlates);
        setResults([]);
        setCurrentRound(0);
        setPhase('ready');

        setTimeout(() => {
            setCurrentPlate(newPlates[0]);
            setPhase('flash');
            // Flash timer
            setTimeout(() => {
                setPhase('delay');
                setCountdown(delayDuration);
            }, flashDuration * 1000);
        }, 1500);
    }, [plateCount, flashDuration, delayDuration]);

    // Delay countdown
    useEffect(() => {
        if (phase !== 'delay' || countdown <= 0) return;
        if (countdown === 0) {
            setPhase('recall');
            recallStartTime.current = Date.now();
            return;
        }
        const timer = setTimeout(() => {
            if (countdown <= 1) {
                setPhase('recall');
                recallStartTime.current = Date.now();
                setTimeout(() => inputRef.current?.focus(), 100);
            } else {
                setCountdown(c => c - 1);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [phase, countdown]);

    const submitAnswer = useCallback(() => {
        const timeMs = Date.now() - recallStartTime.current;
        const normalizedAnswer = answer.replace(/\s+/g, '').toUpperCase();
        const normalizedPlate = currentPlate.replace(/\s+/g, '').toUpperCase();

        let correct: boolean;
        if (reverseMode) {
            // In reverse mode, just check if it's a valid attempt
            correct = normalizedAnswer === normalizedPlate;
        } else {
            correct = normalizedAnswer === normalizedPlate;
        }

        const roundResult: RoundResult = {
            plate: currentPlate,
            answer: answer.toUpperCase(),
            correct,
            timeMs,
        };

        const newResults = [...results, roundResult];
        setResults(newResults);
        setAnswer('');

        // Next round or finish
        const nextRound = currentRound + 1;
        if (nextRound >= plateCount) {
            // Drill complete
            const accuracy = (newResults.filter(r => r.correct).length / newResults.length) * 100;
            const avgSpeed = newResults.reduce((sum, r) => sum + r.timeMs, 0) / newResults.length;

            saveDrillResult({
                id: generateId(),
                type: 'reg-plate',
                timestamp: Date.now(),
                accuracy,
                speedMs: avgSpeed,
                difficulty: Math.ceil(delayDuration / 15) + (reverseMode ? 1 : 0),
                details: { results: newResults, flashDuration, delayDuration, reverseMode },
            });

            // Create spaced items for missed plates
            newResults.filter(r => !r.correct).forEach(r => {
                createSpacedItem('reg-plate', r.plate);
            });

            // Process due items if any were reviewed
            const dueItems = getDueItems().filter(i => i.type === 'reg-plate');
            newResults.forEach(r => {
                const dueItem = dueItems.find(d => d.content === r.plate);
                if (dueItem) {
                    processReview(dueItem, { quality: accuracyToQuality(r.correct ? 100 : 0) });
                }
            });

            setPhase('result');
        } else {
            setCurrentRound(nextRound);
            setCurrentPlate(plates[nextRound]);
            setPhase('flash');
            setTimeout(() => {
                setPhase('delay');
                setCountdown(delayDuration);
            }, flashDuration * 1000);
        }
    }, [answer, currentPlate, results, currentRound, plateCount, plates, flashDuration, delayDuration, reverseMode]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    };

    const totalAccuracy = results.length > 0
        ? (results.filter(r => r.correct).length / results.length) * 100
        : 0;
    const avgSpeed = results.length > 0
        ? results.reduce((sum, r) => sum + r.timeMs, 0) / results.length
        : 0;

    return (
        <div className="min-h-screen">
            <Navigation title="Reg Plate Forge" />

            <div className="pt-20 pb-12 px-4 max-w-lg mx-auto">
                {/* Config Phase */}
                {phase === 'config' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Configure Drill</h2>
                            <p className="text-sm text-muted">Set your training parameters</p>
                        </div>

                        <div className="space-y-4">
                            <div className="glass-card rounded-lg p-4">
                                <label className="text-xs tracking-wider uppercase text-muted mb-2 block">
                                    Flash Duration: {flashDuration}s
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="0.5"
                                    value={flashDuration}
                                    onChange={(e) => setFlashDuration(parseFloat(e.target.value))}
                                    className="w-full accent-accent"
                                />
                                <div className="flex justify-between text-[10px] text-muted mt-1">
                                    <span>1s</span><span>5s</span>
                                </div>
                            </div>

                            <div className="glass-card rounded-lg p-4">
                                <label className="text-xs tracking-wider uppercase text-muted mb-2 block">
                                    Recall Delay: {delayDuration}s
                                </label>
                                <input
                                    type="range"
                                    min="3"
                                    max="60"
                                    step="1"
                                    value={delayDuration}
                                    onChange={(e) => setDelayDuration(parseInt(e.target.value))}
                                    className="w-full accent-accent"
                                />
                                <div className="flex justify-between text-[10px] text-muted mt-1">
                                    <span>3s</span><span>60s</span>
                                </div>
                            </div>

                            <div className="glass-card rounded-lg p-4">
                                <label className="text-xs tracking-wider uppercase text-muted mb-2 block">
                                    Plates per drill: {plateCount}
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="15"
                                    step="1"
                                    value={plateCount}
                                    onChange={(e) => setPlateCount(parseInt(e.target.value))}
                                    className="w-full accent-accent"
                                />
                                <div className="flex justify-between text-[10px] text-muted mt-1">
                                    <span>1</span><span>15</span>
                                </div>
                            </div>

                            <div className="glass-card rounded-lg p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Reverse Recall</p>
                                    <p className="text-[10px] text-muted mt-0.5">Harder: reconstruct from memory</p>
                                </div>
                                <button
                                    onClick={() => setReverseMode(!reverseMode)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${reverseMode ? 'bg-accent' : 'bg-border'
                                        }`}
                                >
                                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${reverseMode ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>

                            <div className="glass-card rounded-lg p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Chunking Prompts</p>
                                    <p className="text-[10px] text-muted mt-0.5">Show AB | 12 | CDE splits initially</p>
                                </div>
                                <button
                                    onClick={() => setShowChunking(!showChunking)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${showChunking ? 'bg-accent' : 'bg-border'
                                        }`}
                                >
                                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${showChunking ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>
                        </div>

                        <button onClick={startDrill} className="btn-primary w-full text-lg py-4 mt-6">
                            Start Drill
                        </button>
                    </div>
                )}

                {/* Ready Phase */}
                {phase === 'ready' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center animate-pulse">
                            <p className="text-4xl font-bold text-accent">GET READY</p>
                            <p className="text-sm text-muted mt-2">Plate incoming...</p>
                        </div>
                    </div>
                )}

                {/* Flash Phase */}
                {phase === 'flash' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center animate-fade-in-scale">
                            <p className="text-[10px] tracking-wider uppercase text-muted mb-4">
                                {currentRound + 1} / {plateCount}
                            </p>
                            {showChunking ? (
                                <div className="plate-display text-5xl sm:text-6xl text-accent flex items-center justify-center gap-3">
                                    <span>{currentPlate.slice(0, 2)}</span>
                                    <span className="text-muted text-2xl">|</span>
                                    <span>{currentPlate.slice(2, 4)}</span>
                                    <span className="text-muted text-2xl">|</span>
                                    <span>{currentPlate.slice(5)}</span>
                                </div>
                            ) : (
                                <p className="plate-display text-5xl sm:text-6xl text-accent">
                                    {currentPlate}
                                </p>
                            )}
                            <div className="mt-6 w-48 mx-auto progress-bar">
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        width: '0%',
                                        animation: `shrinkBar ${flashDuration}s linear forwards`,
                                    }}
                                />
                            </div>
                            <style jsx>{`
                @keyframes shrinkBar {
                  from { width: 100%; }
                  to { width: 0%; }
                }
              `}</style>
                        </div>
                    </div>
                )}

                {/* Delay Phase */}
                {phase === 'delay' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <p className="text-[10px] tracking-wider uppercase text-muted mb-4">
                                Hold in memory...
                            </p>
                            <p className={`text-7xl font-bold font-mono tabular-nums ${countdown <= 3 ? 'text-danger animate-pulse' : 'text-foreground'
                                }`}>
                                {countdown}
                            </p>
                            <p className="text-xs text-muted mt-4">
                                {currentRound + 1} / {plateCount}
                            </p>
                        </div>
                    </div>
                )}

                {/* Recall Phase */}
                {phase === 'recall' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center w-full max-w-sm animate-fade-in-scale">
                            <p className="text-[10px] tracking-wider uppercase text-muted mb-2">
                                {currentRound + 1} / {plateCount}
                            </p>
                            <h2 className="text-xl font-bold mb-6">
                                {reverseMode ? 'What was the plate?' : 'Recall the plate'}
                            </h2>
                            <input
                                ref={inputRef}
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g. AB12 CDE"
                                className="input-field text-center text-2xl font-mono tracking-[0.15em] mb-4"
                                autoFocus
                                maxLength={8}
                            />
                            <button onClick={submitAnswer} className="btn-primary w-full">
                                Submit
                            </button>
                        </div>
                    </div>
                )}

                {/* Result Phase */}
                {phase === 'result' && (
                    <div className="space-y-6 animate-fade-in">
                        <ScoreCard accuracy={totalAccuracy} speedMs={avgSpeed} label="Drill Complete" />

                        <div className="space-y-2">
                            <p className="text-xs tracking-wider uppercase text-muted mb-3">Round Details</p>
                            {results.map((r, i) => (
                                <div key={i} className="glass-card rounded-lg p-3 flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${r.correct ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                                        }`}>
                                        {r.correct ? '✓' : '✗'}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-mono text-sm tracking-wider">{r.plate}</p>
                                        {!r.correct && (
                                            <p className="text-xs text-danger mt-0.5">You typed: {r.answer || '(blank)'}</p>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted font-mono">{(r.timeMs / 1000).toFixed(1)}s</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setPhase('config')} className="btn-secondary flex-1">
                                Settings
                            </button>
                            <button onClick={startDrill} className="btn-primary flex-1">
                                Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
