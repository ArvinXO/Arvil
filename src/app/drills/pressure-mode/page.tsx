'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import ScoreCard from '@/components/ScoreCard';
import { generatePlate, generateScene, type SceneCard } from '@/lib/generators';
import { saveDrillResult, generateId } from '@/lib/storage';

type DrillType = 'plates' | 'scenes';
type Phase = 'config' | 'physical' | 'flash' | 'delay' | 'recall' | 'result';

interface PressureResult {
    correct: boolean;
    timeMs: number;
    expected: string;
    actual: string;
}

export default function PressureModePage() {
    const [phase, setPhase] = useState<Phase>('config');
    const [drillType, setDrillType] = useState<DrillType>('plates');
    const [totalTime, setTotalTime] = useState(60);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [physicalStress, setPhysicalStress] = useState(false);
    const [physicalCountdown, setPhysicalCountdown] = useState(0);

    const [timeRemaining, setTimeRemaining] = useState(0);
    const [currentPlate, setCurrentPlate] = useState('');
    const [currentScene, setCurrentScene] = useState<SceneCard | null>(null);
    const [answer, setAnswer] = useState('');
    const [results, setResults] = useState<PressureResult[]>([]);
    const [delayCount, setDelayCount] = useState(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const recallStart = useRef(0);
    const drillStartTime = useRef(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Radio chatter audio (generated noise)
    useEffect(() => {
        if (audioEnabled && (phase === 'flash' || phase === 'delay' || phase === 'recall')) {
            // Create audio context for radio chatter simulation
            try {
                const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.03, ctx.currentTime);

                // Modulate for radio chatter effect
                const lfo = ctx.createOscillator();
                const lfoGain = ctx.createGain();
                lfo.frequency.setValueAtTime(3, ctx.currentTime);
                lfoGain.gain.setValueAtTime(100, ctx.currentTime);
                lfo.connect(lfoGain);
                lfoGain.connect(oscillator.frequency);

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                oscillator.start();
                lfo.start();

                return () => {
                    oscillator.stop();
                    lfo.stop();
                    ctx.close();
                };
            } catch {
                // Audio not supported, continue silently
            }
        }
    }, [audioEnabled, phase]);

    // Main drill timer
    useEffect(() => {
        if ((phase === 'flash' || phase === 'delay' || phase === 'recall') && timeRemaining > 0) {
            const timer = setInterval(() => {
                const elapsed = (Date.now() - drillStartTime.current) / 1000;
                const remaining = Math.max(0, totalTime - elapsed);
                setTimeRemaining(remaining);
                if (remaining <= 0) {
                    finishDrill();
                }
            }, 100);
            return () => clearInterval(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, totalTime]);

    const startDrill = useCallback(() => {
        setResults([]);
        if (physicalStress) {
            setPhase('physical');
            setPhysicalCountdown(20);
        } else {
            beginDrill();
        }
    }, [physicalStress]);

    // Physical stress countdown
    useEffect(() => {
        if (phase !== 'physical' || physicalCountdown <= 0) return;
        const timer = setTimeout(() => {
            if (physicalCountdown <= 1) {
                beginDrill();
            } else {
                setPhysicalCountdown(c => c - 1);
            }
        }, 1000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, physicalCountdown]);

    const beginDrill = useCallback(() => {
        drillStartTime.current = Date.now();
        setTimeRemaining(totalTime);
        nextRound();
    }, [totalTime]);

    const nextRound = useCallback(() => {
        if (drillType === 'plates') {
            setCurrentPlate(generatePlate());
            setPhase('flash');
            setTimeout(() => {
                setPhase('delay');
                setDelayCount(3);
            }, 2000);
        } else {
            setCurrentScene(generateScene());
            setPhase('flash');
            setTimeout(() => {
                setPhase('recall');
                recallStart.current = Date.now();
                setTimeout(() => inputRef.current?.focus(), 100);
            }, 6000);
        }
    }, [drillType]);

    // Delay for plates
    useEffect(() => {
        if (phase !== 'delay' || delayCount <= 0) return;
        const timer = setTimeout(() => {
            if (delayCount <= 1) {
                setPhase('recall');
                recallStart.current = Date.now();
                setTimeout(() => inputRef.current?.focus(), 100);
            } else {
                setDelayCount(c => c - 1);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [phase, delayCount]);

    const submitAnswer = useCallback(() => {
        const timeMs = Date.now() - recallStart.current;
        let correct = false;
        let expected = '';

        if (drillType === 'plates') {
            expected = currentPlate;
            correct = answer.replace(/\s+/g, '').toUpperCase() === currentPlate.replace(/\s+/g, '');
        } else if (currentScene) {
            expected = `${currentScene.time} | ${currentScene.location}`;
            correct = answer.toLowerCase().includes(currentScene.time.split(':')[0]) ||
                currentScene.location.toLowerCase().split(',').some(p => answer.toLowerCase().includes(p.trim().toLowerCase()));
        }

        setResults(prev => [...prev, { correct, timeMs, expected, actual: answer }]);
        setAnswer('');

        // Check if time is up
        const elapsed = (Date.now() - drillStartTime.current) / 1000;
        if (elapsed >= totalTime) {
            finishDrill();
        } else {
            nextRound();
        }
    }, [answer, currentPlate, currentScene, drillType, totalTime, nextRound]);

    const finishDrill = useCallback(() => {
        setPhase('result');
        const accuracy = results.length > 0
            ? (results.filter(r => r.correct).length / results.length) * 100
            : 0;
        const avgSpeed = results.length > 0
            ? results.reduce((sum, r) => sum + r.timeMs, 0) / results.length
            : 0;

        saveDrillResult({
            id: generateId(),
            type: 'pressure-mode',
            timestamp: Date.now(),
            accuracy,
            speedMs: avgSpeed,
            difficulty: 5,
            details: {
                drillType,
                totalTime,
                audioEnabled,
                physicalStress,
                roundCount: results.length,
            },
        });
    }, [results, drillType, totalTime, audioEnabled, physicalStress]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') submitAnswer();
    };

    const totalAccuracy = results.length > 0
        ? (results.filter(r => r.correct).length / results.length) * 100
        : 0;
    const avgSpeed = results.length > 0
        ? results.reduce((sum, r) => sum + r.timeMs, 0) / results.length
        : 0;

    return (
        <div className="min-h-screen">
            <Navigation title="Pressure Mode" />

            <div className="pt-20 pb-12 px-4 max-w-lg mx-auto">
                {/* Config */}
                {phase === 'config' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2 text-danger">Pressure Mode</h2>
                            <p className="text-sm text-muted">Train under stress. This is where it counts.</p>
                        </div>

                        <div className="glass-card rounded-lg p-4">
                            <p className="text-xs tracking-wider uppercase text-muted mb-3">Drill Type</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDrillType('plates')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${drillType === 'plates'
                                            ? 'bg-accent text-background'
                                            : 'bg-card border border-border text-muted hover:text-foreground'
                                        }`}
                                >
                                    Reg Plates
                                </button>
                                <button
                                    onClick={() => setDrillType('scenes')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${drillType === 'scenes'
                                            ? 'bg-accent text-background'
                                            : 'bg-card border border-border text-muted hover:text-foreground'
                                        }`}
                                >
                                    Scenes
                                </button>
                            </div>
                        </div>

                        <div className="glass-card rounded-lg p-4">
                            <label className="text-xs tracking-wider uppercase text-muted mb-2 block">
                                Total Time: {totalTime}s
                            </label>
                            <input
                                type="range"
                                min="30"
                                max="180"
                                step="15"
                                value={totalTime}
                                onChange={(e) => setTotalTime(parseInt(e.target.value))}
                                className="w-full accent-danger"
                            />
                            <div className="flex justify-between text-[10px] text-muted mt-1">
                                <span>30s</span><span>3 min</span>
                            </div>
                        </div>

                        <div className="glass-card rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Radio Chatter</p>
                                <p className="text-[10px] text-muted mt-0.5">Audio distraction layer</p>
                            </div>
                            <button
                                onClick={() => setAudioEnabled(!audioEnabled)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${audioEnabled ? 'bg-danger' : 'bg-border'
                                    }`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${audioEnabled ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>

                        <div className="glass-card rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Physical Stress</p>
                                <p className="text-[10px] text-muted mt-0.5">20s exercise before recall</p>
                            </div>
                            <button
                                onClick={() => setPhysicalStress(!physicalStress)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${physicalStress ? 'bg-danger' : 'bg-border'
                                    }`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${physicalStress ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>

                        <button onClick={startDrill} className="w-full text-lg py-4 bg-danger text-white font-bold rounded-lg hover:bg-red-600 transition-all">
                            Enter Pressure Zone
                        </button>
                    </div>
                )}

                {/* Physical stress phase */}
                {phase === 'physical' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center animate-pulse">
                            <p className="text-xs tracking-wider uppercase text-danger mb-4">PHYSICAL STRESS</p>
                            <p className="text-6xl font-bold font-mono text-danger">{physicalCountdown}</p>
                            <p className="text-lg font-semibold mt-4">DO 15 PRESS-UPS NOW</p>
                            <p className="text-sm text-muted mt-2">Drill starts when timer hits zero</p>
                        </div>
                    </div>
                )}

                {/* Flash Phase */}
                {phase === 'flash' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        {/* Timer bar at top */}
                        <div className="fixed top-14 left-0 right-0 h-1 bg-border">
                            <div
                                className="h-full bg-danger transition-all duration-100"
                                style={{ width: `${(timeRemaining / totalTime) * 100}%` }}
                            />
                        </div>

                        <div className="text-center animate-fade-in-scale">
                            {drillType === 'plates' ? (
                                <>
                                    <p className="text-[10px] tracking-wider uppercase text-muted mb-4">MEMORIZE</p>
                                    <p className="plate-display text-5xl sm:text-6xl text-accent">{currentPlate}</p>
                                </>
                            ) : currentScene && (
                                <>
                                    <p className="text-[10px] tracking-wider uppercase text-muted mb-4">OBSERVE</p>
                                    <div className="glass-card rounded-xl p-4 text-left text-sm space-y-2">
                                        <p><span className="text-muted">Time:</span> {currentScene.time}</p>
                                        <p><span className="text-muted">Location:</span> {currentScene.location}</p>
                                        <p><span className="text-muted">Incident:</span> {currentScene.incident}</p>
                                        {currentScene.persons[0] && (
                                            <p><span className="text-muted">Person:</span> {currentScene.persons[0].name}, {currentScene.persons[0].build}, {currentScene.persons[0].top}</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Delay Phase */}
                {phase === 'delay' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="fixed top-14 left-0 right-0 h-1 bg-border">
                            <div
                                className="h-full bg-danger transition-all duration-100"
                                style={{ width: `${(timeRemaining / totalTime) * 100}%` }}
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-7xl font-bold font-mono text-danger animate-pulse">{delayCount}</p>
                        </div>
                    </div>
                )}

                {/* Recall Phase */}
                {phase === 'recall' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="fixed top-14 left-0 right-0 h-1 bg-border">
                            <div
                                className="h-full bg-danger transition-all duration-100"
                                style={{ width: `${(timeRemaining / totalTime) * 100}%` }}
                            />
                        </div>
                        <div className="text-center w-full max-w-sm animate-fade-in-scale">
                            <p className="text-xs tracking-wider uppercase text-danger mb-1 font-bold">
                                {Math.ceil(timeRemaining)}s REMAINING
                            </p>
                            <p className="text-sm text-muted mb-4">Round {results.length + 1}</p>
                            <input
                                ref={inputRef}
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                                onKeyDown={handleKeyDown}
                                placeholder={drillType === 'plates' ? 'Recall plate...' : 'Time, location...'}
                                className="input-field text-center text-xl font-mono mb-4 border-danger/50 focus:border-danger"
                                autoFocus
                            />
                            <button
                                onClick={submitAnswer}
                                className="w-full py-3 bg-danger text-white font-bold rounded-lg hover:bg-red-600 transition-all"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                )}

                {/* Results */}
                {phase === 'result' && (
                    <div className="space-y-6 animate-fade-in">
                        <ScoreCard accuracy={totalAccuracy} speedMs={avgSpeed} label="Pressure Drill Complete" />

                        <div className="glass-card rounded-lg p-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{results.length}</p>
                                    <p className="text-[10px] tracking-wider uppercase text-muted">Rounds</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-success">{results.filter(r => r.correct).length}</p>
                                    <p className="text-[10px] tracking-wider uppercase text-muted">Correct</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-danger">{results.filter(r => !r.correct).length}</p>
                                    <p className="text-[10px] tracking-wider uppercase text-muted">Missed</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted glass-card rounded-lg p-3">
                            <span>Modifiers:</span>
                            {audioEnabled && <span className="px-2 py-0.5 rounded bg-danger/20 text-danger">Radio Chatter</span>}
                            {physicalStress && <span className="px-2 py-0.5 rounded bg-danger/20 text-danger">Physical</span>}
                            {!audioEnabled && !physicalStress && <span>None</span>}
                        </div>

                        <div className="space-y-2">
                            {results.map((r, i) => (
                                <div key={i} className="glass-card rounded-lg p-3 flex items-center gap-3">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${r.correct ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                                        }`}>
                                        {r.correct ? '✓' : '✗'}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-mono text-xs">{r.expected}</p>
                                        {!r.correct && <p className="text-[10px] text-danger">You: {r.actual || '—'}</p>}
                                    </div>
                                    <span className="text-[10px] text-muted font-mono">{(r.timeMs / 1000).toFixed(1)}s</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setPhase('config')} className="btn-secondary flex-1">
                                Settings
                            </button>
                            <button onClick={startDrill} className="flex-1 py-3 bg-danger text-white font-bold rounded-lg hover:bg-red-600 transition-all">
                                Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
