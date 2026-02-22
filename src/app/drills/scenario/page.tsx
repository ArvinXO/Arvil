'use client';

import { useState, useCallback, useRef } from 'react';
import Navigation from '@/components/Navigation';
import { generateScenario, GOWISELY_STEPS, FIVE_PART_ARREST, NECESSITY_CRITERIA, checkCaution, FULL_CAUTION, type Scenario } from '@/lib/scenarios';
import { playSound, haptic } from '@/lib/audio';
import { saveDrillResult, generateId } from '@/lib/storage';

type Phase = 'menu' | 'observe' | 'decide' | 'gowisely' | 'search-result' | 'arrest' | 'debrief';
type DebriefTab = 'search' | 'arrest';

interface StepScore {
    step: string;
    label: string;
    input: string;
    score: number;
    feedback: string;
    modelAnswer: string;
    category: 'search' | 'arrest';
}

// Generate contextual model answers for GOWISELY based on scenario
function getGoWiselyModelAnswer(scenario: Scenario, stepIndex: number): string {
    const s = scenario;
    switch (stepIndex) {
        case 0: // Grounds
            return `I have reasonable grounds to suspect you are in possession of ${s.offence.toLowerCase().includes('drug') ? 'controlled drugs' : s.offence.toLowerCase().includes('bladed') ? 'a bladed article' : 'stolen property'}. ${s.observation.split('.')[0]}.`;
        case 1: // Object
            return `I am searching for ${s.offence.toLowerCase().includes('drug') ? 'controlled drugs and associated paraphernalia' : s.offence.toLowerCase().includes('bladed') ? 'weapons, namely knives or bladed articles' : 'stolen goods or evidence of theft'}.`;
        case 2: // Warrant Card
            return `I am in full uniform. (If plain clothes: I have shown my warrant card to identify myself as a police officer.)`;
        case 3: // Identity
            return `I am PC Smith, collar number 1234. (Your name and collar number.)`;
        case 4: // Station
            return `I am attached to Newtown Police Station.`;
        case 5: // Entitlement
            return `You are entitled to a copy of the search record. You can obtain this by contacting the station within 3 months, or I can provide you with a receipt.`;
        case 6: // Legislation
            return s.offence.toLowerCase().includes('drug')
                ? `I am using my power under section 23 of the Misuse of Drugs Act 1971 to search you.`
                : s.offence.toLowerCase().includes('bladed')
                    ? `I am using my power under section 1 of PACE 1984 to search you for offensive weapons.`
                    : `I am using my power under section 1 of PACE 1984 to search you for stolen or prohibited articles.`;
        case 7: // You are detained
            return `You are being detained for the purpose of a search. This detention will be as brief as possible. You are not under arrest at this time.`;
        default:
            return '';
    }
}

// Generate contextual model answers for arrest based on scenario
function getArrestModelAnswer(scenario: Scenario, stepIndex: number): string {
    const s = scenario;
    switch (stepIndex) {
        case 0: // Identify
            return `I am PC Smith, collar number 1234, of Newtown Police Station.`;
        case 1: // Time & Offence
            return `The time is ${s.time}. You are under arrest for ${s.offence.toLowerCase()}, contrary to ${s.legislation}.`;
        case 2: // Grounds
            return `The grounds for your arrest are: ${s.searchFinds ? s.searchFinds.split('.')[0] + '.' : s.observation.split('.')[0] + '.'}`;
        case 3: // Necessity (IDCOPPLAN)
            const criteria = NECESSITY_CRITERIA.filter(nc => s.necessityCriteria.includes(nc.code));
            return `It is necessary to arrest you to ${criteria.map(c => c.desc.toLowerCase()).join(', and to ')}.`;
        case 4: // Caution
            return FULL_CAUTION + ' Do you understand?';
        default:
            return '';
    }
}

export default function ScenarioSimPage() {
    const [phase, setPhase] = useState<Phase>('menu');
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [goWiselyStep, setGoWiselyStep] = useState(0);
    const [goWiselyAnswers, setGoWiselyAnswers] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [arrestStep, setArrestStep] = useState(0);
    const [arrestAnswers, setArrestAnswers] = useState<string[]>([]);
    const [selectedNecessity, setSelectedNecessity] = useState<string[]>([]);
    const [scores, setScores] = useState<StepScore[]>([]);
    const [debriefTab, setDebriefTab] = useState<DebriefTab>('search');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const startScenario = useCallback(() => {
        const s = generateScenario();
        setScenario(s);
        setGoWiselyStep(0);
        setGoWiselyAnswers([]);
        setArrestStep(0);
        setArrestAnswers([]);
        setSelectedNecessity([]);
        setScores([]);
        setCurrentInput('');
        setDebriefTab('search');
        setPhase('observe');
        playSound('start');
    }, []);

    const proceedToDecide = () => {
        setPhase('decide');
        playSound('beep');
    };

    const startSearch = () => {
        setPhase('gowisely');
        setGoWiselyStep(0);
        setGoWiselyAnswers([]);
        setCurrentInput('');
        playSound('beep');
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const submitGoWisely = () => {
        if (!scenario) return;
        const step = GOWISELY_STEPS[goWiselyStep];
        const input = currentInput.trim();
        const lower = input.toLowerCase();

        const keywordsFound = step.keywords.filter(k => lower.includes(k));
        const score = input.length > 10 ? Math.min(100, (keywordsFound.length / Math.max(step.keywords.length, 1)) * 100 + (input.length > 30 ? 20 : 0)) : 0;

        const modelAnswer = getGoWiselyModelAnswer(scenario, goWiselyStep);

        const newScores = [...scores, {
            step: `${step.letter}: ${step.word}`,
            label: step.word,
            input,
            score: Math.round(score),
            feedback: score >= 60 ? 'Adequate' : `Missing: ${step.keywords.filter(k => !lower.includes(k)).join(', ')}`,
            modelAnswer,
            category: 'search' as const,
        }];
        setScores(newScores);

        const newAnswers = [...goWiselyAnswers, input];
        setGoWiselyAnswers(newAnswers);
        setCurrentInput('');

        if (score >= 60) playSound('success');
        else { playSound('fail'); haptic('light'); }

        const next = goWiselyStep + 1;
        if (next >= GOWISELY_STEPS.length) {
            setPhase('search-result');
            playSound('complete');
        } else {
            setGoWiselyStep(next);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const proceedAfterSearch = () => {
        if (!scenario) return;
        if (scenario.arrestRequired) {
            setPhase('arrest');
            setArrestStep(0);
            setArrestAnswers([]);
            setCurrentInput('');
            playSound('beep');
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setPhase('debrief');
            setDebriefTab('search');
            playSound('complete');
        }
    };

    const submitArrest = () => {
        if (!scenario) return;
        const step = FIVE_PART_ARREST[arrestStep];
        const input = currentInput.trim();

        let score = 0;
        let feedback = '';

        if (step.part === 5) {
            const result = checkCaution(input);
            score = result.accuracy;
            feedback = result.missing.length > 0
                ? `Missing: "${result.missing[0]}"${result.missing.length > 1 ? ` +${result.missing.length - 1} more` : ''}`
                : 'Caution delivered correctly';
        } else if (step.part === 4) {
            const correctCriteria = scenario.necessityCriteria;
            const matchCount = selectedNecessity.filter(n => correctCriteria.includes(n)).length;
            const contentScore = input.length > 15 ? 40 : 10;
            score = Math.min(100, contentScore + (matchCount / Math.max(correctCriteria.length, 1)) * 60);
            feedback = matchCount >= 1 ? 'Necessity criteria identified' : 'Review IDCOPPLAN criteria';
        } else {
            score = input.length > 20 ? 70 : input.length > 10 ? 40 : 10;
            if (step.part === 2 && input.toLowerCase().includes(scenario.offence.toLowerCase().split(' ')[0])) score = Math.min(100, score + 30);
            if (step.part === 3 && input.length > 30) score = Math.min(100, score + 20);
            feedback = score >= 60 ? 'Good' : 'Refer to the hint for guidance';
        }

        if (score >= 60) { playSound('success'); haptic('light'); }
        else { playSound('fail'); haptic('medium'); }

        const modelAnswer = getArrestModelAnswer(scenario, arrestStep);

        const newScores = [...scores, {
            step: `Part ${step.part}: ${step.label}`,
            label: step.label,
            input,
            score: Math.round(score),
            feedback,
            modelAnswer,
            category: 'arrest' as const,
        }];
        setScores(newScores);

        const newAnswers = [...arrestAnswers, input];
        setArrestAnswers(newAnswers);
        setCurrentInput('');

        const next = arrestStep + 1;
        if (next >= FIVE_PART_ARREST.length) {
            setPhase('debrief');
            setDebriefTab('search');
            playSound('complete');

            const totalScore = newScores.reduce((sum, s) => sum + s.score, 0) / newScores.length;
            saveDrillResult({
                id: generateId(),
                type: 'pressure-mode',
                timestamp: Date.now(),
                accuracy: totalScore,
                speedMs: 0,
                difficulty: 5,
                details: { drillType: 'scenario', scenarioId: scenario.id, scores: newScores },
            });
        } else {
            setArrestStep(next);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (phase === 'gowisely') submitGoWisely();
            else if (phase === 'arrest') submitArrest();
        }
    };

    const totalScore = scores.length > 0
        ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0;
    const searchScores = scores.filter(s => s.category === 'search');
    const arrestScores = scores.filter(s => s.category === 'arrest');
    const searchAvg = searchScores.length > 0 ? searchScores.reduce((sum, s) => sum + s.score, 0) / searchScores.length : 0;
    const arrestAvg = arrestScores.length > 0 ? arrestScores.reduce((sum, s) => sum + s.score, 0) / arrestScores.length : 0;

    return (
        <div className="min-h-screen">
            <Navigation title="Scenario Simulator" />

            <div className="pt-20 pb-12 px-4 max-w-lg mx-auto">
                {/* Menu */}
                {phase === 'menu' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Street Scenario Simulator</h2>
                            <p className="text-sm text-muted">Observe → Stop & Search → Arrest (if required)</p>
                            <p className="text-xs text-muted mt-1">Practice GOWISELY, 5-part arrest, and caution delivery</p>
                        </div>

                        <div className="glass-card rounded-xl p-5 space-y-3">
                            <p className="text-xs tracking-wider uppercase text-accent font-semibold">What you&apos;ll practice:</p>
                            <div className="space-y-2">
                                {[
                                    { icon: '👁️', label: 'Observe a scenario and assess the situation' },
                                    { icon: '📋', label: 'Deliver GOWISELY for stop & search' },
                                    { icon: '🔍', label: 'Review search findings' },
                                    { icon: '⚖️', label: '5-part arrest with time, grounds, necessity & caution' },
                                    { icon: '📊', label: 'Tabbed debrief: your answer vs. expected answer' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-lg">{item.icon}</span>
                                        <span className="text-sm text-muted">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button onClick={startScenario} className="btn-primary w-full text-lg py-4">
                            Generate Scenario
                        </button>
                    </div>
                )}

                {/* Observe */}
                {phase === 'observe' && scenario && (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                            <span className="text-xs tracking-wider uppercase text-danger font-semibold">Live Scenario</span>
                        </div>

                        <div className="glass-card rounded-xl p-5 border-l-4 border-accent space-y-4">
                            <div>
                                <p className="text-xs tracking-wider uppercase text-muted">Setting</p>
                                <p className="text-sm">{scenario.setting}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs tracking-wider uppercase text-muted">Time</p>
                                    <p className="text-sm font-mono">{scenario.time}</p>
                                </div>
                                <div>
                                    <p className="text-xs tracking-wider uppercase text-muted">Suspect</p>
                                    <p className="text-sm font-semibold">{scenario.suspectName}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs tracking-wider uppercase text-muted">Description</p>
                                <p className="text-sm">{scenario.suspectDescription}</p>
                            </div>
                        </div>

                        <div className="glass-card rounded-xl p-5 border-l-4 border-warning space-y-3">
                            <p className="text-xs tracking-wider uppercase text-warning font-semibold">Your Observation</p>
                            <p className="text-sm leading-relaxed">{scenario.observation}</p>
                        </div>

                        {scenario.intelligence && (
                            <div className="glass-card rounded-xl p-4 border-l-4 border-blue-500">
                                <p className="text-xs tracking-wider uppercase text-blue-400 font-semibold mb-1">Intelligence</p>
                                <p className="text-xs text-muted leading-relaxed">{scenario.intelligence}</p>
                            </div>
                        )}

                        <button onClick={proceedToDecide} className="btn-primary w-full">
                            I&apos;ve assessed the situation →
                        </button>
                    </div>
                )}

                {/* Decide */}
                {phase === 'decide' && scenario && (
                    <div className="animate-fade-in space-y-4">
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-bold mb-1">What do you do?</h2>
                            <p className="text-xs text-muted">Based on your observations, what is your next action?</p>
                        </div>

                        <button onClick={startSearch} className="glass-card rounded-xl p-5 w-full text-left hover:border-accent transition-colors group">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🔍</span>
                                <div>
                                    <p className="text-sm font-bold group-hover:text-accent transition-colors">Stop & Search</p>
                                    <p className="text-xs text-muted">You have reasonable grounds to suspect. Deliver GOWISELY.</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                setPhase('arrest');
                                setArrestStep(0);
                                setCurrentInput('');
                                playSound('beep');
                            }}
                            className="glass-card rounded-xl p-5 w-full text-left hover:border-danger transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚖️</span>
                                <div>
                                    <p className="text-sm font-bold group-hover:text-danger transition-colors">Arrest immediately</p>
                                    <p className="text-xs text-muted">Sufficient evidence/threat for immediate arrest.</p>
                                </div>
                            </div>
                        </button>
                    </div>
                )}

                {/* GOWISELY */}
                {phase === 'gowisely' && scenario && (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs tracking-wider uppercase text-accent font-semibold">
                                GOWISELY — Stop & Search
                            </p>
                            <p className="text-xs text-muted font-mono">{goWiselyStep + 1}/8</p>
                        </div>

                        <div className="flex gap-1">
                            {GOWISELY_STEPS.map((_, i) => (
                                <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i < goWiselyStep ? 'bg-accent' : i === goWiselyStep ? 'bg-accent/50' : 'bg-border'}`} />
                            ))}
                        </div>

                        <div className="glass-card rounded-xl p-5 border-l-4 border-accent">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                                    {GOWISELY_STEPS[goWiselyStep].letter}
                                </span>
                                <span className="text-sm font-bold">{GOWISELY_STEPS[goWiselyStep].word}</span>
                            </div>
                            <p className="text-sm text-muted mb-3">{GOWISELY_STEPS[goWiselyStep].question}</p>

                            <textarea
                                ref={inputRef}
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={GOWISELY_STEPS[goWiselyStep].placeholder}
                                className="input-field text-sm min-h-[80px] resize-none"
                                autoFocus
                            />
                        </div>

                        <button onClick={submitGoWisely} className="btn-primary w-full">
                            Submit {GOWISELY_STEPS[goWiselyStep].letter}
                        </button>
                    </div>
                )}

                {/* Search Result */}
                {phase === 'search-result' && scenario && (
                    <div className="animate-fade-in space-y-4">
                        <div className="text-center mb-4">
                            <p className="text-xs tracking-wider uppercase text-accent font-semibold mb-2">Search Complete</p>
                            <p className="text-2xl mb-2">🔍</p>
                        </div>

                        <div className="glass-card rounded-xl p-5 border-l-4 border-warning">
                            <p className="text-xs tracking-wider uppercase text-warning font-semibold mb-2">Search Findings</p>
                            <p className="text-sm leading-relaxed">{scenario.searchFinds}</p>
                        </div>

                        {scenario.arrestRequired ? (
                            <div className="glass-card rounded-xl p-4 border-l-4 border-danger">
                                <p className="text-xs tracking-wider uppercase text-danger font-semibold mb-1">Assessment</p>
                                <p className="text-xs text-muted">
                                    Suspicion NOT allayed. These findings constitute grounds for arrest for <span className="text-foreground font-semibold">{scenario.offence}</span> contrary to <span className="text-accent">{scenario.legislation}</span>.
                                </p>
                            </div>
                        ) : (
                            <div className="glass-card rounded-xl p-4 border-l-4 border-accent">
                                <p className="text-xs tracking-wider uppercase text-accent font-semibold mb-1">Assessment</p>
                                <p className="text-xs text-muted">
                                    Findings are minor. Consider disposal options: Community Resolution, Cannabis Warning, or reported summons. Full arrest may not be necessary or proportionate.
                                </p>
                            </div>
                        )}

                        <button onClick={proceedAfterSearch} className="btn-primary w-full">
                            {scenario.arrestRequired ? 'Proceed to Arrest →' : 'Complete — View Debrief →'}
                        </button>
                    </div>
                )}

                {/* Arrest */}
                {phase === 'arrest' && scenario && (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs tracking-wider uppercase text-danger font-semibold">
                                5-Part Arrest
                            </p>
                            <p className="text-xs text-muted font-mono">{arrestStep + 1}/5</p>
                        </div>

                        <div className="flex gap-1">
                            {FIVE_PART_ARREST.map((_, i) => (
                                <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i < arrestStep ? 'bg-danger' : i === arrestStep ? 'bg-danger/50' : 'bg-border'}`} />
                            ))}
                        </div>

                        <div className="glass-card rounded-xl p-5 border-l-4 border-danger">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-8 h-8 rounded-lg bg-danger/20 flex items-center justify-center text-danger font-bold text-sm">
                                    {FIVE_PART_ARREST[arrestStep].part}
                                </span>
                                <span className="text-sm font-bold">{FIVE_PART_ARREST[arrestStep].label}</span>
                            </div>
                            <p className="text-xs text-muted mb-3">{FIVE_PART_ARREST[arrestStep].hint}</p>

                            {FIVE_PART_ARREST[arrestStep].part === 4 && (
                                <div className="mb-3 space-y-1.5">
                                    <p className="text-xs tracking-wider uppercase text-muted">Select IDCOPPLAN criteria:</p>
                                    {NECESSITY_CRITERIA.map(nc => (
                                        <button
                                            key={nc.code}
                                            onClick={() => setSelectedNecessity(prev =>
                                                prev.includes(nc.code) ? prev.filter(c => c !== nc.code) : [...prev, nc.code]
                                            )}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${selectedNecessity.includes(nc.code)
                                                ? 'bg-danger/20 border border-danger/40 text-foreground'
                                                : 'bg-card-hover border border-border text-muted'
                                                }`}
                                        >
                                            <span className="font-bold text-accent mr-1">{nc.letter}</span>
                                            <span className="font-semibold">{nc.label}</span> — {nc.desc}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <textarea
                                ref={inputRef}
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={FIVE_PART_ARREST[arrestStep].placeholder}
                                className="input-field text-sm min-h-[80px] resize-none"
                                autoFocus
                            />
                        </div>

                        <button onClick={submitArrest} className="btn-primary w-full">
                            Deliver Part {FIVE_PART_ARREST[arrestStep].part}
                        </button>
                    </div>
                )}

                {/* ═══════════════ DEBRIEF ═══════════════ */}
                {phase === 'debrief' && scenario && (
                    <div className="animate-fade-in space-y-5">
                        {/* Overall score */}
                        <div className="text-center">
                            <p className="text-xs tracking-wider uppercase text-muted mb-2">Scenario Complete</p>
                            <p className={`text-5xl font-bold ${totalScore >= 70 ? 'text-success' : totalScore >= 40 ? 'text-warning' : 'text-danger'}`}>
                                {Math.round(totalScore)}%
                            </p>
                            <p className="text-xs text-muted mt-2">{scenario.title} — {scenario.time}</p>
                        </div>

                        {/* Category scores */}
                        <div className="flex gap-3">
                            {searchScores.length > 0 && (
                                <div className="glass-card rounded-lg p-3 flex-1 text-center">
                                    <p className={`text-xl font-bold ${searchAvg >= 60 ? 'text-success' : 'text-danger'}`}>{Math.round(searchAvg)}%</p>
                                    <p className="text-[10px] tracking-wider uppercase text-muted">Stop & Search</p>
                                </div>
                            )}
                            {arrestScores.length > 0 && (
                                <div className="glass-card rounded-lg p-3 flex-1 text-center">
                                    <p className={`text-xl font-bold ${arrestAvg >= 60 ? 'text-success' : 'text-danger'}`}>{Math.round(arrestAvg)}%</p>
                                    <p className="text-[10px] tracking-wider uppercase text-muted">Arrest</p>
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-card-hover rounded-lg p-1">
                            {searchScores.length > 0 && (
                                <button
                                    onClick={() => setDebriefTab('search')}
                                    className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors ${debriefTab === 'search' ? 'bg-accent text-background' : 'text-muted hover:text-foreground'
                                        }`}
                                >
                                    🔍 Stop & Search ({searchScores.length})
                                </button>
                            )}
                            {arrestScores.length > 0 && (
                                <button
                                    onClick={() => setDebriefTab('arrest')}
                                    className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors ${debriefTab === 'arrest' ? 'bg-danger text-white' : 'text-muted hover:text-foreground'
                                        }`}
                                >
                                    ⚖️ Arrest ({arrestScores.length})
                                </button>
                            )}
                        </div>

                        {/* Tab content — step by step with answer comparison */}
                        <div className="space-y-3">
                            {(debriefTab === 'search' ? searchScores : arrestScores).map((s, i) => (
                                <div key={i} className="glass-card rounded-xl overflow-hidden">
                                    {/* Header */}
                                    <div className="px-4 py-2.5 flex items-center justify-between border-b border-border">
                                        <p className="text-xs font-bold">{s.step}</p>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.score >= 80 ? 'bg-success/20 text-success'
                                                : s.score >= 60 ? 'bg-warning/20 text-warning'
                                                    : 'bg-danger/20 text-danger'
                                            }`}>
                                            {s.score}%
                                        </span>
                                    </div>

                                    {/* Your Answer */}
                                    <div className="px-4 py-3 border-b border-border/50">
                                        <p className="text-[10px] tracking-wider uppercase text-muted mb-1">Your Answer</p>
                                        <p className={`text-xs leading-relaxed ${s.input ? 'text-foreground' : 'text-danger italic'}`}>
                                            {s.input || '(no answer given)'}
                                        </p>
                                        {s.score < 60 && (
                                            <p className="text-[10px] text-danger mt-1">⚠ {s.feedback}</p>
                                        )}
                                    </div>

                                    {/* Expected Answer */}
                                    <div className="px-4 py-3 bg-accent/5">
                                        <p className="text-[10px] tracking-wider uppercase text-accent mb-1">Expected Answer</p>
                                        <p className="text-xs text-foreground/80 leading-relaxed italic">
                                            &quot;{s.modelAnswer}&quot;
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Scenario reference */}
                        <div className="glass-card rounded-xl p-4 space-y-2">
                            <p className="text-xs font-bold text-accent">Scenario Reference</p>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div>
                                    <p className="text-muted uppercase tracking-wider">Offence</p>
                                    <p className="text-foreground font-medium">{scenario.offence}</p>
                                </div>
                                <div>
                                    <p className="text-muted uppercase tracking-wider">Legislation</p>
                                    <p className="text-foreground font-medium">{scenario.legislation}</p>
                                </div>
                            </div>
                            {scenario.necessityCriteria.length > 0 && (
                                <div>
                                    <p className="text-[10px] text-muted uppercase tracking-wider mb-1">IDCOPPLAN Necessity</p>
                                    <div className="flex flex-wrap gap-1">
                                        {NECESSITY_CRITERIA.filter(nc => scenario.necessityCriteria.includes(nc.code)).map(nc => (
                                            <span key={nc.code} className="text-[10px] px-2 py-0.5 rounded bg-danger/15 text-danger font-semibold">
                                                {nc.letter} {nc.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setPhase('menu')} className="btn-secondary flex-1">
                                Menu
                            </button>
                            <button onClick={startScenario} className="btn-primary flex-1">
                                New Scenario
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
