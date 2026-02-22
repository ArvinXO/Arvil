'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Debrief from '@/components/Debrief';
import { generateScene, type SceneCard } from '@/lib/generators';
import { saveDrillResult, generateId } from '@/lib/storage';
import { createSpacedItem } from '@/lib/spaced-repetition';

type Phase = 'config' | 'viewing' | 'recall' | 'debrief';

export default function SceneSnapshotPage() {
    const [phase, setPhase] = useState<Phase>('config');
    const [viewDuration, setViewDuration] = useState(8);
    const [scene, setScene] = useState<SceneCard | null>(null);
    const [countdown, setCountdown] = useState(0);

    // Recall fields
    const [recallTime, setRecallTime] = useState('');
    const [recallDate, setRecallDate] = useState('');
    const [recallLocation, setRecallLocation] = useState('');
    const [recallIncident, setRecallIncident] = useState('');
    const [recallNames, setRecallNames] = useState('');
    const [recallDescriptions, setRecallDescriptions] = useState('');
    const [recallVehicles, setRecallVehicles] = useState('');

    const startTimeRef = useRef(0);

    const startDrill = useCallback(() => {
        const newScene = generateScene();
        setScene(newScene);
        setCountdown(viewDuration);
        setPhase('viewing');
        setRecallTime('');
        setRecallDate('');
        setRecallLocation('');
        setRecallIncident('');
        setRecallNames('');
        setRecallDescriptions('');
        setRecallVehicles('');
    }, [viewDuration]);

    // Viewing countdown
    useEffect(() => {
        if (phase !== 'viewing' || countdown <= 0) return;
        const timer = setTimeout(() => {
            if (countdown <= 1) {
                setPhase('recall');
                startTimeRef.current = Date.now();
            } else {
                setCountdown(c => c - 1);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [phase, countdown]);

    const submitRecall = useCallback(() => {
        if (!scene) return;
        const speedMs = Date.now() - startTimeRef.current;

        // Calculate accuracy per field
        const checks = [
            {
                label: 'Time',
                expected: scene.time,
                actual: recallTime,
                correct: recallTime.replace(/\s/g, '') === scene.time.replace(/\s/g, ''),
            },
            {
                label: 'Date',
                expected: scene.date,
                actual: recallDate,
                correct: recallDate.replace(/\s/g, '') === scene.date.replace(/\s/g, ''),
            },
            {
                label: 'Location',
                expected: scene.location,
                actual: recallLocation,
                correct: scene.location.toLowerCase().split(',').some(part =>
                    recallLocation.toLowerCase().includes(part.trim())
                ),
            },
            {
                label: 'Incident',
                expected: scene.incident,
                actual: recallIncident,
                correct: scene.incident.toLowerCase().split(' ').filter(w => w.length > 3).some(word =>
                    recallIncident.toLowerCase().includes(word)
                ),
            },
            {
                label: 'Names',
                expected: scene.persons.map(p => p.name).join(', '),
                actual: recallNames,
                correct: scene.persons.some(p =>
                    recallNames.toLowerCase().includes(p.name.split(' ')[1].toLowerCase()) ||
                    recallNames.toLowerCase().includes(p.name.split(' ')[0].toLowerCase())
                ),
            },
            {
                label: 'Descriptions',
                expected: scene.persons.map(p => `${p.build}, ${p.hair} hair, ${p.top}, ${p.bottom}`).join(' | '),
                actual: recallDescriptions,
                correct: scene.persons.some(p =>
                    [p.build, p.hair, p.top, p.bottom].some(detail =>
                        recallDescriptions.toLowerCase().includes(detail.toLowerCase().split(' ')[0])
                    )
                ),
            },
        ];

        if (scene.vehicles.length > 0) {
            checks.push({
                label: 'Vehicles',
                expected: scene.vehicles.map(v => `${v.color} ${v.type} — ${v.plate}`).join(', '),
                actual: recallVehicles,
                correct: scene.vehicles.some(v =>
                    recallVehicles.toUpperCase().includes(v.plate.replace(/\s/g, '').substring(0, 4)) ||
                    recallVehicles.toLowerCase().includes(v.color) ||
                    recallVehicles.toLowerCase().includes(v.type.split(' ')[0].toLowerCase())
                ),
            });
        }

        const correctCount = checks.filter(c => c.correct).length;
        const accuracy = (correctCount / checks.length) * 100;

        saveDrillResult({
            id: generateId(),
            type: 'scene-snapshot',
            timestamp: Date.now(),
            accuracy,
            speedMs,
            difficulty: Math.ceil(viewDuration <= 5 ? 4 : viewDuration <= 8 ? 3 : 2),
            details: { scene, checks, viewDuration },
        });

        // Create spaced items for missed elements
        checks.filter(c => !c.correct).forEach(c => {
            createSpacedItem('scene-snapshot', `${c.label}: ${c.expected}`);
        });

        setPhase('debrief');
    }, [scene, recallTime, recallDate, recallLocation, recallIncident, recallNames, recallDescriptions, recallVehicles, viewDuration]);

    const debriefItems = scene ? [
        { label: 'Time', expected: scene.time, actual: recallTime, correct: recallTime.replace(/\s/g, '') === scene.time.replace(/\s/g, '') },
        { label: 'Date', expected: scene.date, actual: recallDate, correct: recallDate.replace(/\s/g, '') === scene.date.replace(/\s/g, '') },
        { label: 'Location', expected: scene.location, actual: recallLocation, correct: scene.location.toLowerCase().split(',').some(part => recallLocation.toLowerCase().includes(part.trim())) },
        { label: 'Incident', expected: scene.incident, actual: recallIncident, correct: scene.incident.toLowerCase().split(' ').filter(w => w.length > 3).some(word => recallIncident.toLowerCase().includes(word)) },
        { label: 'Names', expected: scene.persons.map(p => p.name).join(', '), actual: recallNames, correct: scene.persons.some(p => recallNames.toLowerCase().includes(p.name.split(' ')[1].toLowerCase()) || recallNames.toLowerCase().includes(p.name.split(' ')[0].toLowerCase())) },
        { label: 'Descriptions', expected: scene.persons.map(p => `${p.build}, ${p.hair} hair, ${p.top}, ${p.bottom}`).join(' | '), actual: recallDescriptions, correct: scene.persons.some(p => [p.build, p.hair, p.top, p.bottom].some(detail => recallDescriptions.toLowerCase().includes(detail.toLowerCase().split(' ')[0]))) },
        ...(scene.vehicles.length > 0 ? [{ label: 'Vehicles', expected: scene.vehicles.map(v => `${v.color} ${v.type} — ${v.plate}`).join(', '), actual: recallVehicles, correct: scene.vehicles.some(v => recallVehicles.toUpperCase().includes(v.plate.replace(/\s/g, '').substring(0, 4)) || recallVehicles.toLowerCase().includes(v.color) || recallVehicles.toLowerCase().includes(v.type.split(' ')[0].toLowerCase())) }] : []),
    ] : [];

    const accuracy = debriefItems.length > 0
        ? (debriefItems.filter(d => d.correct).length / debriefItems.length) * 100
        : 0;

    return (
        <div className="min-h-screen">
            <Navigation title="Scene Snapshot" />

            <div className="pt-20 pb-12 px-4 max-w-lg mx-auto">
                {/* Config */}
                {phase === 'config' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Scene Snapshot</h2>
                            <p className="text-sm text-muted">A scene card will flash. Recall every detail.</p>
                        </div>

                        <div className="glass-card rounded-lg p-4">
                            <label className="text-xs tracking-wider uppercase text-muted mb-2 block">
                                Viewing Time: {viewDuration}s
                            </label>
                            <input
                                type="range"
                                min="3"
                                max="15"
                                step="1"
                                value={viewDuration}
                                onChange={(e) => setViewDuration(parseInt(e.target.value))}
                                className="w-full accent-accent"
                            />
                            <div className="flex justify-between text-[10px] text-muted mt-1">
                                <span>3s (Hard)</span><span>15s (Easy)</span>
                            </div>
                        </div>

                        <button onClick={startDrill} className="btn-primary w-full text-lg py-4">
                            Start Scene
                        </button>
                    </div>
                )}

                {/* Viewing */}
                {phase === 'viewing' && scene && (
                    <div className="animate-fade-in-scale">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs tracking-wider uppercase text-accent font-semibold">Scene Card</p>
                            <p className={`text-2xl font-bold font-mono ${countdown <= 3 ? 'text-danger animate-pulse' : 'text-foreground'}`}>
                                {countdown}s
                            </p>
                        </div>

                        <div className="glass-card rounded-xl p-5 space-y-4 border-accent/30">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[10px] tracking-wider uppercase text-muted">Time</p>
                                    <p className="text-sm font-semibold font-mono">{scene.time}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] tracking-wider uppercase text-muted">Date</p>
                                    <p className="text-sm font-semibold font-mono">{scene.date}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] tracking-wider uppercase text-muted">Location</p>
                                <p className="text-sm font-semibold">{scene.location}</p>
                            </div>

                            <div>
                                <p className="text-[10px] tracking-wider uppercase text-muted">Incident</p>
                                <p className="text-sm">{scene.incident}</p>
                            </div>

                            <div className="h-px bg-border" />

                            {scene.persons.map((person, i) => (
                                <div key={i}>
                                    <p className="text-[10px] tracking-wider uppercase text-accent mb-1">Person {i + 1}</p>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                                        <p><span className="text-muted">Name:</span> {person.name}</p>
                                        <p><span className="text-muted">Age:</span> {person.age}</p>
                                        <p><span className="text-muted">Build:</span> {person.build}</p>
                                        <p><span className="text-muted">Hair:</span> {person.hair}</p>
                                        <p><span className="text-muted">Top:</span> {person.top}</p>
                                        <p><span className="text-muted">Bottom:</span> {person.bottom}</p>
                                        <p className="col-span-2"><span className="text-muted">Dist:</span> {person.distinguishing}</p>
                                    </div>
                                </div>
                            ))}

                            {scene.vehicles.length > 0 && (
                                <>
                                    <div className="h-px bg-border" />
                                    {scene.vehicles.map((vehicle, i) => (
                                        <div key={i}>
                                            <p className="text-[10px] tracking-wider uppercase text-accent mb-1">Vehicle {i + 1}</p>
                                            <div className="text-sm space-y-0.5">
                                                <p><span className="text-muted">Plate:</span> <span className="font-mono">{vehicle.plate}</span></p>
                                                <p><span className="text-muted">Desc:</span> {vehicle.color} {vehicle.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        <div className="mt-4 progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{
                                    width: `${(countdown / viewDuration) * 100}%`,
                                    transition: 'width 1s linear',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Recall */}
                {phase === 'recall' && (
                    <div className="animate-fade-in space-y-4">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold mb-1">Recall</h2>
                            <p className="text-sm text-muted">What do you remember?</p>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs tracking-wider uppercase text-muted mb-1 block">Time</label>
                                <input
                                    type="text"
                                    value={recallTime}
                                    onChange={(e) => setRecallTime(e.target.value)}
                                    placeholder="HH:MM"
                                    className="input-field font-mono"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs tracking-wider uppercase text-muted mb-1 block">Date</label>
                                <input
                                    type="text"
                                    value={recallDate}
                                    onChange={(e) => setRecallDate(e.target.value)}
                                    placeholder="DD/MM/YYYY"
                                    className="input-field font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-xs tracking-wider uppercase text-muted mb-1 block">Location</label>
                                <input
                                    type="text"
                                    value={recallLocation}
                                    onChange={(e) => setRecallLocation(e.target.value)}
                                    placeholder="Street, area..."
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="text-xs tracking-wider uppercase text-muted mb-1 block">Incident Type</label>
                                <input
                                    type="text"
                                    value={recallIncident}
                                    onChange={(e) => setRecallIncident(e.target.value)}
                                    placeholder="What happened..."
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="text-xs tracking-wider uppercase text-muted mb-1 block">Names</label>
                                <input
                                    type="text"
                                    value={recallNames}
                                    onChange={(e) => setRecallNames(e.target.value)}
                                    placeholder="Names of persons..."
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="text-xs tracking-wider uppercase text-muted mb-1 block">Descriptions</label>
                                <textarea
                                    value={recallDescriptions}
                                    onChange={(e) => setRecallDescriptions(e.target.value)}
                                    placeholder="Build, hair, clothing, distinguishing features..."
                                    className="input-field min-h-[80px] resize-none"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="text-xs tracking-wider uppercase text-muted mb-1 block">Vehicles</label>
                                <input
                                    type="text"
                                    value={recallVehicles}
                                    onChange={(e) => setRecallVehicles(e.target.value)}
                                    placeholder="Plates, color, make/model..."
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <button onClick={submitRecall} className="btn-primary w-full mt-4">
                            Submit Recall
                        </button>
                    </div>
                )}

                {/* Debrief */}
                {phase === 'debrief' && (
                    <div className="space-y-6">
                        <Debrief
                            title="Scene Debrief"
                            items={debriefItems}
                            accuracy={accuracy}
                            onContinue={() => setPhase('config')}
                            continueLabel="New Scene"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
