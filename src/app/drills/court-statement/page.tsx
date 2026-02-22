'use client';

import { useState, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { generateScene, type SceneCard } from '@/lib/generators';
import { MG11_SECTIONS, ADVOKATE } from '@/lib/policing';
import { playSound, haptic } from '@/lib/audio';
import { saveDrillResult, generateId } from '@/lib/storage';

type Phase = 'config' | 'viewing' | 'writing' | 'scoring';

interface PartScore {
    part: number;
    title: string;
    content: string;
    score: number;
    feedback: string;
}

export default function CourtStatementPage() {
    const [phase, setPhase] = useState<Phase>('config');
    const [viewDuration, setViewDuration] = useState(15);
    const [scene, setScene] = useState<SceneCard | null>(null);
    const [countdown, setCountdown] = useState(0);

    // 5-part statement content
    const [parts, setParts] = useState<Record<number, string>>({ 1: '', 2: '', 3: '', 4: '', 5: '' });
    const [activePart, setActivePart] = useState(1);
    const [partScores, setPartScores] = useState<PartScore[]>([]);
    const [totalScore, setTotalScore] = useState(0);

    const startDrill = useCallback(() => {
        const newScene = generateScene();
        setScene(newScene);
        setCountdown(viewDuration);
        setParts({ 1: '', 2: '', 3: '', 4: '', 5: '' });
        setActivePart(1);
        setPartScores([]);
        setPhase('viewing');
        playSound('start');

        let count = viewDuration;
        const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count <= 3 && count > 0) playSound('countdown');
            if (count <= 0) {
                clearInterval(timer);
                setPhase('writing');
                playSound('beep');
            }
        }, 1000);
    }, [viewDuration]);

    const scoreStatement = useCallback(() => {
        if (!scene) return;

        const text = Object.values(parts).join(' ').toLowerCase();
        const scores: PartScore[] = [];

        // Part 1: Introduction & Summary
        const p1 = parts[1].toLowerCase();
        const p1Score = [
            p1.includes('pc') || p1.includes('officer') || p1.includes('constable') ? 20 : 0,
            p1.match(/\d{2}:\d{2}/) || p1.includes(scene.time) ? 20 : 0,
            p1.length > 30 ? 20 : p1.length > 15 ? 10 : 0,
            p1.includes('on duty') || p1.includes('patrol') || p1.includes('responding') || p1.includes('attached') ? 20 : 0,
            p1.includes('i am') || p1.includes('my name') ? 20 : 0,
        ].reduce((a, b) => a + b, 0);
        scores.push({
            part: 1,
            title: 'Introduction & Summary',
            content: parts[1],
            score: Math.min(100, p1Score),
            feedback: p1Score >= 60 ? 'Good introduction' : 'Include: your name/rank, collar number, date/time, reason for being present',
        });

        // Part 2: Cast of Known Individuals
        const p2 = parts[2].toLowerCase();
        const namesFound = scene.persons.filter(p => p.name.toLowerCase().split(' ').some(n => p2.includes(n)));
        const p2Score = [
            namesFound.length >= scene.persons.length ? 50 : (namesFound.length / scene.persons.length) * 50,
            p2.includes('victim') || p2.includes('suspect') || p2.includes('witness') || p2.includes('complainant') ? 25 : 0,
            p2.length > 20 ? 25 : p2.length > 10 ? 15 : 0,
        ].reduce((a, b) => a + b, 0);
        scores.push({
            part: 2,
            title: 'Cast of Known Individuals',
            content: parts[2],
            score: Math.min(100, p2Score),
            feedback: namesFound.length >= scene.persons.length ? 'All persons identified' : `Identified ${namesFound.length}/${scene.persons.length} persons. Missing: ${scene.persons.filter(p => !p.name.toLowerCase().split(' ').some(n => p2.includes(n))).map(p => p.name).join(', ')}`,
        });

        // Part 3: Description of Location
        const p3 = parts[3].toLowerCase();
        const locationParts = scene.location.toLowerCase().split(',').map(s => s.trim());
        const p3Score = [
            locationParts.some(lp => p3.includes(lp.split(' ')[0])) ? 30 : 0,
            p3.includes('street') || p3.includes('road') || p3.includes('building') || p3.includes('area') || p3.includes('junction') ? 20 : 0,
            p3.includes('lighting') || p3.includes('dark') || p3.includes('light') || p3.includes('visibility') || p3.includes('weather') ? 25 : 0,
            p3.length > 40 ? 25 : p3.length > 20 ? 15 : 0,
        ].reduce((a, b) => a + b, 0);
        scores.push({
            part: 3,
            title: 'Description of Location',
            content: parts[3],
            score: Math.min(100, p3Score),
            feedback: p3Score >= 60 ? 'Good scene description' : 'Include: full location/address, layout, lighting, weather, CCTV, visibility',
        });

        // Part 4: Action & Dialogue
        const p4 = parts[4].toLowerCase();
        const p4Score = [
            p4.length > 80 ? 25 : p4.length > 40 ? 15 : 5,
            p4.includes('observed') || p4.includes('noticed') || p4.includes('saw') || p4.includes('attention') ? 15 : 0,
            p4.includes('then') || p4.includes('subsequently') || p4.includes('following') || p4.includes('at this point') ? 15 : 0,
            scene.incident.toLowerCase().split(' ').filter(w => w.length > 4).some(w => p4.includes(w)) ? 15 : 0,
            p4.includes('"') || p4.includes('stated') || p4.includes('said') || p4.includes('CAPITALS') ? 15 : 5,
            p4.includes('i') ? 15 : 0,
        ].reduce((a, b) => a + b, 0);
        scores.push({
            part: 4,
            title: 'Action & Dialogue',
            content: parts[4],
            score: Math.min(100, p4Score),
            feedback: p4Score >= 60 ? 'Good narrative' : 'Include: chronological account, direct speech in CAPITALS, your actions, observations, ADVOKATE considerations',
        });

        // Part 5: Closure
        const p5 = parts[5].toLowerCase();
        const descTerms = scene.persons.flatMap(p => [p.build, p.hair, p.top, p.bottom].map(s => s.toLowerCase().split(' ')[0]));
        const descFound = descTerms.filter(t => p5.includes(t) || p4.includes(t)).length;
        const vehicleFound = scene.vehicles.some(v =>
            p5.includes(v.plate.toLowerCase().replace(/\s/g, '').substring(0, 4)) ||
            p5.includes(v.color.toLowerCase()) ||
            text.includes(v.plate.toLowerCase().replace(/\s/g, '').substring(0, 4))
        );
        const p5Score = [
            descFound >= 3 ? 30 : (descFound / 3) * 30,
            vehicleFound || scene.vehicles.length === 0 ? 20 : 0,
            p5.includes('injur') || p5.includes('damage') || p5.includes('impact') || p5.includes('victim') ? 25 : 0,
            p5.length > 30 ? 25 : p5.length > 15 ? 15 : 0,
        ].reduce((a, b) => a + b, 0);
        scores.push({
            part: 5,
            title: 'Closure',
            content: parts[5],
            score: Math.min(100, p5Score),
            feedback: p5Score >= 60 ? 'Good closure' : 'Include: full 10-point descriptions, vehicle details/plates, injuries, damage, VPS, exhibits',
        });

        const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
        setPartScores(scores);
        setTotalScore(avg);

        saveDrillResult({
            id: generateId(),
            type: 'scene-snapshot',
            timestamp: Date.now(),
            accuracy: avg,
            speedMs: 0,
            difficulty: 5,
            details: { drillType: 'mg11-statement', scores, parts },
        });

        if (avg >= 70) playSound('complete');
        else playSound('fail');

        setPhase('scoring');
    }, [scene, parts]);

    const totalWords = Object.values(parts).join(' ').split(/\s+/).filter(Boolean).length;

    return (
        <div className="min-h-screen">
            <Navigation title="MG11 Statement" />

            <div className="pt-20 pb-12 px-4 max-w-lg mx-auto">
                {/* Config */}
                {phase === 'config' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold mb-2">MG11 Witness Statement</h2>
                            <p className="text-sm text-muted">Observe a scene, then write a structured 5-part statement.</p>
                            <p className="text-xs text-muted mt-1">College of Policing format — scored per section.</p>
                        </div>

                        <div className="glass-card rounded-lg p-4">
                            <label className="text-xs tracking-wider uppercase text-muted mb-2 block">
                                Scene viewing time: {viewDuration}s
                            </label>
                            <input
                                type="range" min="10" max="30" step="1" value={viewDuration}
                                onChange={(e) => setViewDuration(parseInt(e.target.value))}
                                className="w-full accent-accent"
                            />
                        </div>

                        {/* 5-part overview */}
                        <div className="space-y-2">
                            <p className="text-xs tracking-wider uppercase text-accent font-semibold">The 5 Parts:</p>
                            {MG11_SECTIONS.map(sec => (
                                <div key={sec.part} className="glass-card rounded-lg p-3 flex items-start gap-3">
                                    <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: sec.color + '22', color: sec.color }}>
                                        {sec.part}
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold">{sec.title}</p>
                                        <p className="text-[10px] text-muted">{sec.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button onClick={startDrill} className="btn-primary w-full text-lg py-4">
                            Begin Scene
                        </button>
                    </div>
                )}

                {/* Viewing */}
                {phase === 'viewing' && scene && (
                    <div className="animate-fade-in-scale">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs tracking-wider uppercase text-accent font-semibold">Observe Carefully</p>
                            <p className={`text-2xl font-bold font-mono ${countdown <= 5 ? 'text-danger animate-pulse' : 'text-foreground'}`}>
                                {countdown}s
                            </p>
                        </div>

                        <div className="glass-card rounded-xl p-5 space-y-4 border-accent/30">
                            <div className="grid grid-cols-2 gap-3">
                                <div><p className="text-[10px] tracking-wider uppercase text-muted">Time</p><p className="text-sm font-semibold font-mono">{scene.time}</p></div>
                                <div><p className="text-[10px] tracking-wider uppercase text-muted">Date</p><p className="text-sm font-semibold font-mono">{scene.date}</p></div>
                            </div>
                            <div><p className="text-[10px] tracking-wider uppercase text-muted">Location</p><p className="text-sm font-semibold">{scene.location}</p></div>
                            <div><p className="text-[10px] tracking-wider uppercase text-muted">Incident</p><p className="text-sm">{scene.incident}</p></div>

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
                                    {scene.vehicles.map((v, i) => (
                                        <div key={i}>
                                            <p className="text-[10px] tracking-wider uppercase text-accent mb-1">Vehicle {i + 1}</p>
                                            <p className="text-sm"><span className="text-muted">Plate:</span> <span className="font-mono">{v.plate}</span></p>
                                            <p className="text-sm"><span className="text-muted">Desc:</span> {v.color} {v.type}</p>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Writing — 5-part tabbed */}
                {phase === 'writing' && (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs tracking-wider uppercase text-accent font-semibold">Write Your MG11</p>
                            <span className="text-xs text-muted font-mono">{totalWords} words</span>
                        </div>

                        {/* Part tabs */}
                        <div className="flex gap-1">
                            {MG11_SECTIONS.map(sec => (
                                <button
                                    key={sec.part}
                                    onClick={() => setActivePart(sec.part)}
                                    className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${activePart === sec.part
                                            ? 'text-background'
                                            : parts[sec.part].length > 0
                                                ? 'text-foreground bg-card-hover'
                                                : 'text-muted bg-card-hover/50'
                                        }`}
                                    style={activePart === sec.part ? { backgroundColor: sec.color } : {}}
                                >
                                    {sec.part}
                                </button>
                            ))}
                        </div>

                        {/* Active part */}
                        {MG11_SECTIONS.filter(s => s.part === activePart).map(sec => (
                            <div key={sec.part} className="space-y-3">
                                <div className="glass-card rounded-lg p-4 border-l-4" style={{ borderColor: sec.color }}>
                                    <p className="text-sm font-bold mb-1" style={{ color: sec.color }}>{sec.title}</p>
                                    <p className="text-xs text-muted mb-2">{sec.description}</p>
                                    <ul className="space-y-0.5">
                                        {sec.prompts.map((prompt, i) => (
                                            <li key={i} className="text-[10px] text-muted">• {prompt}</li>
                                        ))}
                                    </ul>
                                </div>

                                <textarea
                                    value={parts[sec.part]}
                                    onChange={(e) => setParts(prev => ({ ...prev, [sec.part]: e.target.value }))}
                                    placeholder={sec.tips[0]}
                                    className="input-field min-h-[150px] resize-none text-sm leading-relaxed"
                                    autoFocus
                                />
                            </div>
                        ))}

                        {/* ADVOKATE reminder */}
                        <details className="glass-card rounded-lg overflow-hidden">
                            <summary className="p-3 cursor-pointer text-xs font-medium text-muted hover:text-foreground">
                                📋 ADVOKATE Reminder
                            </summary>
                            <div className="px-3 pb-3 space-y-1">
                                {ADVOKATE.map(a => (
                                    <p key={a.word} className="text-[10px]">
                                        <span className="font-bold text-accent">{a.letter}</span> — <span className="text-muted">{a.word}: {a.description}</span>
                                    </p>
                                ))}
                            </div>
                        </details>

                        <button
                            onClick={scoreStatement}
                            disabled={totalWords < 10}
                            className={`btn-primary w-full ${totalWords < 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Submit Statement
                        </button>
                    </div>
                )}

                {/* Scoring */}
                {phase === 'scoring' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="text-center">
                            <p className="text-xs tracking-wider uppercase text-muted mb-2">MG11 Score</p>
                            <p className={`text-5xl font-bold ${totalScore >= 70 ? 'text-success' : totalScore >= 40 ? 'text-warning' : 'text-danger'}`}>
                                {Math.round(totalScore)}%
                            </p>
                        </div>

                        {/* Part-by-part scores */}
                        <div className="space-y-2">
                            {partScores.map((ps) => {
                                const sec = MG11_SECTIONS.find(s => s.part === ps.part)!;
                                return (
                                    <div key={ps.part} className="glass-card rounded-lg p-4 border-l-4" style={{ borderColor: sec.color }}>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-semibold" style={{ color: sec.color }}>Part {ps.part}: {ps.title}</p>
                                            <span className={`text-sm font-bold ${ps.score >= 60 ? 'text-success' : 'text-danger'}`}>
                                                {Math.round(ps.score)}%
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted mb-2">{ps.feedback}</p>
                                        <div className="progress-bar h-1">
                                            <div className="progress-bar-fill h-1" style={{ width: `${ps.score}%`, backgroundColor: sec.color }} />
                                        </div>
                                        <details className="mt-2 text-[10px]">
                                            <summary className="text-muted cursor-pointer">Your text</summary>
                                            <p className="mt-1 text-foreground whitespace-pre-wrap">{ps.content || '(blank)'}</p>
                                        </details>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setPhase('config')} className="btn-secondary flex-1">Settings</button>
                            <button onClick={startDrill} className="btn-primary flex-1">New Scene</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
