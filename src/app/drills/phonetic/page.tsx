'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import ScoreCard from '@/components/ScoreCard';
import { generatePlate } from '@/lib/generators';
import { plateToNATO, checkNATOAnswer, NATO_ALPHABET } from '@/lib/phonetic';
import { playSound, haptic } from '@/lib/audio';
import { saveDrillResult, generateId } from '@/lib/storage';

type Phase = 'config' | 'ready' | 'flash' | 'recall' | 'result';

interface RoundResult {
    plate: string;
    expected: string[];
    answer: string;
    matches: boolean[];
    accuracy: number;
    timeMs: number;
}

export default function PhoneticDrillPage() {
    const [phase, setPhase] = useState<Phase>('config');
    const [flashDuration, setFlashDuration] = useState(3);
    const [roundCount, setRoundCount] = useState(5);
    const [showReference, setShowReference] = useState(true);

    const [currentPlate, setCurrentPlate] = useState('');
    const [currentNATO, setCurrentNATO] = useState<string[]>([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [answer, setAnswer] = useState('');
    const [results, setResults] = useState<RoundResult[]>([]);

    const recallStart = useRef(0);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const startDrill = useCallback(() => {
        setResults([]);
        setCurrentRound(0);
        playSound('start');
        setPhase('ready');

        setTimeout(() => {
            const plate = generatePlate();
            setCurrentPlate(plate);
            setCurrentNATO(plateToNATO(plate));
            setPhase('flash');
            playSound('beep');

            setTimeout(() => {
                setPhase('recall');
                recallStart.current = Date.now();
                setTimeout(() => inputRef.current?.focus(), 100);
            }, flashDuration * 1000);
        }, 1500);
    }, [flashDuration]);

    const submitAnswer = useCallback(() => {
        const timeMs = Date.now() - recallStart.current;
        const { matches, accuracy } = checkNATOAnswer(currentNATO, answer);

        if (accuracy >= 80) {
            playSound('success');
            haptic('light');
        } else {
            playSound('fail');
            haptic('medium');
        }

        const roundResult: RoundResult = {
            plate: currentPlate,
            expected: currentNATO,
            answer,
            matches,
            accuracy,
            timeMs,
        };

        const newResults = [...results, roundResult];
        setResults(newResults);
        setAnswer('');

        const nextRound = currentRound + 1;
        if (nextRound >= roundCount) {
            const totalAccuracy = newResults.reduce((sum, r) => sum + r.accuracy, 0) / newResults.length;
            const avgSpeed = newResults.reduce((sum, r) => sum + r.timeMs, 0) / newResults.length;

            saveDrillResult({
                id: generateId(),
                type: 'reg-plate',
                timestamp: Date.now(),
                accuracy: totalAccuracy,
                speedMs: avgSpeed,
                difficulty: 3,
                details: { drillType: 'phonetic', results: newResults },
            });

            playSound('complete');
            setPhase('result');
        } else {
            setCurrentRound(nextRound);
            const plate = generatePlate();
            setCurrentPlate(plate);
            setCurrentNATO(plateToNATO(plate));
            setPhase('flash');
            playSound('beep');

            setTimeout(() => {
                setPhase('recall');
                recallStart.current = Date.now();
                setTimeout(() => inputRef.current?.focus(), 100);
            }, flashDuration * 1000);
        }
    }, [answer, currentPlate, currentNATO, results, currentRound, roundCount, flashDuration]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitAnswer();
        }
    };

    const totalAccuracy = results.length > 0
        ? results.reduce((sum, r) => sum + r.accuracy, 0) / results.length
        : 0;
    const avgSpeed = results.length > 0
        ? results.reduce((sum, r) => sum + r.timeMs, 0) / results.length
        : 0;

    return (
        <div className="min-h-screen">
            <Navigation title="Phonetic Alphabet" />

            <div className="pt-20 pb-12 px-4 max-w-lg mx-auto">
                {/* Config */}
                {phase === 'config' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Phonetic Alphabet Drill</h2>
                            <p className="text-sm text-muted">A plate flashes. You type it in NATO phonetic.</p>
                            <p className="text-xs text-muted mt-1">e.g. AB12 → Alpha Bravo One Two</p>
                        </div>

                        <div className="glass-card rounded-lg p-4">
                            <label className="text-xs tracking-wider uppercase text-muted mb-2 block">
                                Flash Duration: {flashDuration}s
                            </label>
                            <input
                                type="range" min="1" max="5" step="0.5" value={flashDuration}
                                onChange={(e) => setFlashDuration(parseFloat(e.target.value))}
                                className="w-full accent-accent"
                            />
                        </div>

                        <div className="glass-card rounded-lg p-4">
                            <label className="text-xs tracking-wider uppercase text-muted mb-2 block">
                                Rounds: {roundCount}
                            </label>
                            <input
                                type="range" min="3" max="10" step="1" value={roundCount}
                                onChange={(e) => setRoundCount(parseInt(e.target.value))}
                                className="w-full accent-accent"
                            />
                        </div>

                        <div className="glass-card rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Show Reference Card</p>
                                <p className="text-[10px] text-muted mt-0.5">NATO alphabet reference during recall</p>
                            </div>
                            <button
                                onClick={() => setShowReference(!showReference)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${showReference ? 'bg-accent' : 'bg-border'
                                    }`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${showReference ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>

                        {/* Quick reference */}
                        <details className="glass-card rounded-lg overflow-hidden">
                            <summary className="p-4 cursor-pointer text-sm font-medium flex items-center justify-between hover:bg-card-hover transition-colors">
                                NATO Alphabet Reference
                                <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </summary>
                            <div className="px-4 pb-4 grid grid-cols-3 gap-1 text-xs">
                                {Object.entries(NATO_ALPHABET).map(([key, word]) => (
                                    <div key={key} className="flex gap-1">
                                        <span className="font-mono font-bold text-accent w-4">{key}</span>
                                        <span className="text-muted">{word}</span>
                                    </div>
                                ))}
                            </div>
                        </details>

                        <button onClick={startDrill} className="btn-primary w-full text-lg py-4">
                            Start Drill
                        </button>
                    </div>
                )}

                {/* Ready */}
                {phase === 'ready' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center animate-pulse">
                            <p className="text-4xl font-bold text-accent">GET READY</p>
                            <p className="text-sm text-muted mt-2">Plate incoming → translate to NATO</p>
                        </div>
                    </div>
                )}

                {/* Flash */}
                {phase === 'flash' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center animate-fade-in-scale">
                            <p className="text-[10px] tracking-wider uppercase text-muted mb-4">
                                {currentRound + 1} / {roundCount}
                            </p>
                            <p className="plate-display text-5xl sm:text-6xl text-accent">{currentPlate}</p>
                            <p className="text-xs text-muted mt-4">Memorize → translate to phonetic</p>
                        </div>
                    </div>
                )}

                {/* Recall */}
                {phase === 'recall' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="text-center">
                            <p className="text-[10px] tracking-wider uppercase text-muted mb-1">
                                {currentRound + 1} / {roundCount}
                            </p>
                            <h2 className="text-xl font-bold mb-1">Type in NATO phonetic</h2>
                            <p className="text-xs text-muted">Separate words with spaces</p>
                        </div>

                        <textarea
                            ref={inputRef}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Alpha Bravo One Two Charlie Delta Echo..."
                            className="input-field text-center text-sm min-h-[80px] resize-none"
                            autoFocus
                        />

                        <button onClick={submitAnswer} className="btn-primary w-full">
                            Submit
                        </button>

                        {showReference && (
                            <div className="glass-card rounded-lg p-3">
                                <p className="text-[10px] tracking-wider uppercase text-muted mb-2">Reference</p>
                                <div className="grid grid-cols-4 gap-1 text-[10px]">
                                    {Object.entries(NATO_ALPHABET).map(([key, word]) => (
                                        <div key={key} className="flex gap-0.5">
                                            <span className="font-mono font-bold text-accent">{key}</span>
                                            <span className="text-muted">{word}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Result */}
                {phase === 'result' && (
                    <div className="space-y-6 animate-fade-in">
                        <ScoreCard accuracy={totalAccuracy} speedMs={avgSpeed} label="Phonetic Drill Complete" />

                        <div className="space-y-2">
                            <p className="text-xs tracking-wider uppercase text-muted mb-3">Round Details</p>
                            {results.map((r, i) => (
                                <div key={i} className="glass-card rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-sm tracking-wider text-accent">{r.plate}</span>
                                        <span className={`text-sm font-bold ${r.accuracy >= 80 ? 'text-success' : r.accuracy >= 50 ? 'text-warning' : 'text-danger'}`}>
                                            {Math.round(r.accuracy)}%
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {r.expected.map((word, j) => (
                                            <span
                                                key={j}
                                                className={`text-xs px-1.5 py-0.5 rounded ${r.matches[j]
                                                        ? 'bg-success/20 text-success'
                                                        : 'bg-danger/20 text-danger'
                                                    }`}
                                            >
                                                {word}
                                            </span>
                                        ))}
                                    </div>
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
