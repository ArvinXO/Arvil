'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ScoreCard from '@/components/ScoreCard';
import { generateName } from '@/lib/generators';
import { playSound, haptic } from '@/lib/audio';
import { saveDrillResult, generateId } from '@/lib/storage';

type Phase = 'config' | 'study' | 'delay' | 'recall' | 'result';

interface FacePerson {
    name: string;
    imageUrl: string;
    gender: 'men' | 'women';
    photoId: number;
}

interface RecallResult {
    person: FacePerson;
    answer: string;
    correct: boolean;
    timeMs: number;
}

// Use randomuser.me portrait library — 100 male + 100 female portraits
// These are real-looking headshots, consistent URLs
const usedIds = new Set<string>();

function generatePerson(): FacePerson {
    const name = generateName();
    const gender: 'men' | 'women' = Math.random() > 0.5 ? 'men' : 'women';

    // Pick unique photo ID (0–99) for each gender
    let photoId: number;
    let key: string;
    do {
        photoId = Math.floor(Math.random() * 100);
        key = `${gender}-${photoId}`;
    } while (usedIds.has(key));
    usedIds.add(key);

    const imageUrl = `https://randomuser.me/api/portraits/${gender}/${photoId}.jpg`;
    return { name, imageUrl, gender, photoId };
}

export default function FaceNamePage() {
    const [phase, setPhase] = useState<Phase>('config');
    const [faceCount, setFaceCount] = useState(4);
    const [studyTime, setStudyTime] = useState(4);
    const [delayTime, setDelayTime] = useState(5);

    const [faces, setFaces] = useState<FacePerson[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [results, setResults] = useState<RecallResult[]>([]);
    const [countdown, setCountdown] = useState(0);
    const [studyCountdown, setStudyCountdown] = useState(0);
    const [recallOrder, setRecallOrder] = useState<number[]>([]);

    const recallStart = useRef(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const startDrill = useCallback(() => {
        usedIds.clear();
        const newFaces = Array.from({ length: faceCount }, () => generatePerson());
        setFaces(newFaces);
        setResults([]);
        setCurrentIndex(0);
        setRecallOrder([]);
        setStudyCountdown(studyTime * faceCount);
        setPhase('study');
        playSound('start');
    }, [faceCount, studyTime]);

    // Study countdown
    useEffect(() => {
        if (phase !== 'study' || studyCountdown <= 0) return;
        const timer = setTimeout(() => {
            if (studyCountdown <= 1) {
                setPhase('delay');
                setCountdown(delayTime);
                playSound('beep');
            } else {
                setStudyCountdown(c => c - 1);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [phase, studyCountdown, delayTime]);

    // Delay countdown
    useEffect(() => {
        if (phase !== 'delay' || countdown <= 0) return;
        const timer = setTimeout(() => {
            if (countdown <= 1) {
                const order = faces.map((_, i) => i).sort(() => Math.random() - 0.5);
                setRecallOrder(order);
                setCurrentIndex(0);
                setPhase('recall');
                recallStart.current = Date.now();
                setTimeout(() => inputRef.current?.focus(), 100);
            } else {
                setCountdown(c => c - 1);
                if (countdown <= 4) playSound('countdown');
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [phase, countdown, faces]);

    const currentFace = recallOrder.length > 0 ? faces[recallOrder[currentIndex]] : null;

    const submitAnswer = useCallback(() => {
        if (!currentFace) return;
        const timeMs = Date.now() - recallStart.current;

        const correct = currentFace.name
            .toLowerCase()
            .split(' ')
            .some(part => answer.toLowerCase().trim().includes(part));

        if (correct) { playSound('success'); haptic('light'); }
        else { playSound('fail'); haptic('medium'); }

        const result: RecallResult = { person: currentFace, answer, correct, timeMs };
        const newResults = [...results, result];
        setResults(newResults);
        setAnswer('');

        const nextIndex = currentIndex + 1;
        if (nextIndex >= faces.length) {
            const accuracy = (newResults.filter(r => r.correct).length / newResults.length) * 100;
            const avgSpeed = newResults.reduce((sum, r) => sum + r.timeMs, 0) / newResults.length;
            saveDrillResult({
                id: generateId(), type: 'scene-snapshot', timestamp: Date.now(),
                accuracy, speedMs: avgSpeed, difficulty: Math.min(5, Math.ceil(faceCount / 2)),
                details: { drillType: 'face-name', faceCount },
            });
            playSound('complete');
            setPhase('result');
        } else {
            setCurrentIndex(nextIndex);
            recallStart.current = Date.now();
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [answer, currentFace, results, currentIndex, faces, faceCount]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') submitAnswer();
    };

    const totalAccuracy = results.length > 0
        ? (results.filter(r => r.correct).length / results.length) * 100 : 0;
    const avgSpeed = results.length > 0
        ? results.reduce((sum, r) => sum + r.timeMs, 0) / results.length : 0;

    return (
        <div className="min-h-screen">
            <Navigation title="Face-Name Recall" />

            <div className="pt-20 pb-12 px-4 max-w-lg mx-auto">
                {/* Config */}
                {phase === 'config' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Face-Name Association</h2>
                            <p className="text-sm text-muted">Study real faces and names, then recall them in a different order.</p>
                        </div>

                        <div className="glass-card rounded-lg p-4">
                            <label className="text-xs tracking-wider uppercase text-muted mb-2 block">
                                Number of faces: {faceCount}
                            </label>
                            <input type="range" min="2" max="8" step="1" value={faceCount}
                                onChange={(e) => setFaceCount(parseInt(e.target.value))} className="w-full accent-accent" />
                            <div className="flex justify-between text-[10px] text-muted mt-1">
                                <span>2 (Easy)</span><span>8 (Hard)</span>
                            </div>
                        </div>

                        <div className="glass-card rounded-lg p-4">
                            <label className="text-xs tracking-wider uppercase text-muted mb-2 block">
                                Study time per face: {studyTime}s
                            </label>
                            <input type="range" min="2" max="8" step="1" value={studyTime}
                                onChange={(e) => setStudyTime(parseInt(e.target.value))} className="w-full accent-accent" />
                        </div>

                        <div className="glass-card rounded-lg p-4">
                            <label className="text-xs tracking-wider uppercase text-muted mb-2 block">
                                Delay before recall: {delayTime}s
                            </label>
                            <input type="range" min="3" max="30" step="1" value={delayTime}
                                onChange={(e) => setDelayTime(parseInt(e.target.value))} className="w-full accent-accent" />
                        </div>

                        <button onClick={startDrill} className="btn-primary w-full text-lg py-4">Start Drill</button>
                    </div>
                )}

                {/* Study Phase */}
                {phase === 'study' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <p className="text-xs tracking-wider uppercase text-accent font-semibold">Memorize these faces</p>
                            <p className={`text-xl font-bold font-mono ${studyCountdown <= 3 ? 'text-danger animate-pulse' : 'text-foreground'}`}>
                                {studyCountdown}s
                            </p>
                        </div>

                        <div className={`grid gap-4 ${faceCount <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                            {faces.map((face, i) => (
                                <div key={i} className="glass-card rounded-xl p-3 text-center animate-fade-in-scale" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="mx-auto mb-2 w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-border">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={face.imageUrl}
                                            alt={`Person ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-foreground">{face.name}</p>
                                </div>
                            ))}
                        </div>

                        <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: `${(studyCountdown / (studyTime * faceCount)) * 100}%`, transition: 'width 1s linear' }} />
                        </div>
                    </div>
                )}

                {/* Delay */}
                {phase === 'delay' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <p className="text-[10px] tracking-wider uppercase text-muted mb-4">Hold in memory...</p>
                            <p className={`text-7xl font-bold font-mono tabular-nums ${countdown <= 3 ? 'text-danger animate-pulse' : 'text-foreground'}`}>
                                {countdown}
                            </p>
                        </div>
                    </div>
                )}

                {/* Recall */}
                {phase === 'recall' && currentFace && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center w-full max-w-sm animate-fade-in-scale">
                            <p className="text-[10px] tracking-wider uppercase text-muted mb-3">
                                {currentIndex + 1} / {faces.length}
                            </p>

                            <div className="mx-auto mb-4 w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-3 border-accent shadow-lg shadow-accent/20">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={currentFace.imageUrl}
                                    alt="Who is this?"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <h2 className="text-lg font-bold mb-4">Who is this?</h2>
                            <input
                                ref={inputRef} type="text" value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter their name..."
                                className="input-field text-center text-lg mb-4" autoFocus
                            />
                            <button onClick={submitAnswer} className="btn-primary w-full">Submit</button>
                        </div>
                    </div>
                )}

                {/* Result */}
                {phase === 'result' && (
                    <div className="space-y-6 animate-fade-in">
                        <ScoreCard accuracy={totalAccuracy} speedMs={avgSpeed} label="Face-Name Drill Complete" />

                        <div className="space-y-2">
                            {results.map((r, i) => (
                                <div key={i} className="glass-card rounded-lg p-3 flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-border">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={r.person.imageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold">{r.person.name}</p>
                                        {!r.correct && (
                                            <p className="text-xs text-danger truncate">You said: {r.answer || '(blank)'}</p>
                                        )}
                                    </div>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${r.correct ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                                        }`}>
                                        {r.correct ? '✓' : '✗'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => { setPhase('config'); setRecallOrder([]); }} className="btn-secondary flex-1">Settings</button>
                            <button onClick={startDrill} className="btn-primary flex-1">Again</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
