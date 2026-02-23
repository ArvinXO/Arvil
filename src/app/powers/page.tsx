'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import {
    USE_OF_FORCE_LEVELS,
    FORCE_LEGAL_BASIS,
    POLICE_POWERS,
    POWER_CATEGORIES,
} from '@/lib/powers';

type MainTab = 'use-of-force' | 'legal-basis' | 'powers';
type PowerCategory = typeof POWER_CATEGORIES[number]['key'] | 'all';

export default function PowersPage() {
    const [mainTab, setMainTab] = useState<MainTab>('use-of-force');
    const [powerCategory, setPowerCategory] = useState<PowerCategory>('all');
    const [expandedForce, setExpandedForce] = useState<number | null>(null);
    const [expandedPower, setExpandedPower] = useState<string | null>(null);

    const filteredPowers = powerCategory === 'all'
        ? POLICE_POWERS
        : POLICE_POWERS.filter(p => p.category === powerCategory);

    return (
        <div className="min-h-screen">
            <Navigation title="Powers" />

            <div className="pt-20 pb-12 px-4 max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-1">Police Powers</h2>
                    <p className="text-xs text-muted">Use of force • Legal basis • Common powers by category</p>
                </div>

                {/* Main Tabs */}
                <div className="flex gap-1 bg-card-hover rounded-lg p-1 mb-6">
                    {([
                        { key: 'use-of-force', label: '💪 Use of Force', shortLabel: 'Force' },
                        { key: 'legal-basis', label: '⚖️ Legal Basis', shortLabel: 'Legal' },
                        { key: 'powers', label: '📋 Powers', shortLabel: 'Powers' },
                    ] as const).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setMainTab(tab.key)}
                            className={`flex-1 py-2.5 rounded-md text-xs font-semibold transition-colors ${mainTab === tab.key ? 'bg-accent text-background' : 'text-muted hover:text-foreground'
                                }`}
                        >
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.shortLabel}</span>
                        </button>
                    ))}
                </div>

                {/* ═══════ USE OF FORCE ═══════ */}
                {mainTab === 'use-of-force' && (
                    <div className="animate-fade-in space-y-3">
                        {/* Intro */}
                        <div className="glass-card rounded-xl p-4 border-l-4 border-warning mb-4">
                            <p className="text-xs font-bold text-warning mb-1">National Decision Model</p>
                            <p className="text-xs text-muted leading-relaxed">
                                Force is a <span className="text-foreground font-semibold">last resort</span>. Always start at Level 1 and only escalate if the threat increases.
                                Every use of force must be <span className="text-foreground font-semibold">necessary</span>, <span className="text-foreground font-semibold">proportionate</span>, and <span className="text-foreground font-semibold">reasonable</span>.
                            </p>
                        </div>

                        {/* Force Ladder */}
                        {USE_OF_FORCE_LEVELS.map((level) => (
                            <div key={level.level} className="glass-card rounded-xl overflow-hidden">
                                {/* Header */}
                                <button
                                    onClick={() => setExpandedForce(expandedForce === level.level ? null : level.level)}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-card-hover transition-colors"
                                >
                                    {/* Level badge */}
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
                                        style={{ backgroundColor: `${level.color}20`, color: level.color }}
                                    >
                                        L{level.level}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-bold">{level.name}</p>
                                        <p className="text-[10px] text-muted truncate">{level.description}</p>
                                    </div>
                                    {/* Severity bar */}
                                    <div className="flex gap-0.5 flex-shrink-0">
                                        {Array.from({ length: 7 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1.5 h-4 rounded-sm"
                                                style={{
                                                    backgroundColor: i < level.level ? level.color : 'var(--color-border)',
                                                    opacity: i < level.level ? 1 : 0.3,
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-muted transition-transform flex-shrink-0 ${expandedForce === level.level ? 'rotate-180' : ''}`}>
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>

                                {/* Expanded content */}
                                {expandedForce === level.level && (
                                    <div className="px-4 pb-4 space-y-3 border-t border-border animate-fade-in">
                                        {/* ELI5 */}
                                        <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: `${level.color}08` }}>
                                            <p className="text-[10px] tracking-wider uppercase font-semibold mb-1" style={{ color: level.color }}>
                                                In Plain English
                                            </p>
                                            <p className="text-xs text-foreground leading-relaxed">{level.eli5}</p>
                                        </div>

                                        {/* When to use */}
                                        <div>
                                            <p className="text-[10px] tracking-wider uppercase text-muted font-semibold mb-1">When To Use</p>
                                            <p className="text-xs text-muted leading-relaxed">{level.whenToUse}</p>
                                        </div>

                                        {/* Examples */}
                                        <div>
                                            <p className="text-[10px] tracking-wider uppercase text-muted font-semibold mb-1">Examples</p>
                                            <div className="space-y-1">
                                                {level.examples.map((ex, i) => (
                                                    <p key={i} className="text-xs text-muted flex items-start gap-1.5">
                                                        <span className="text-[10px] mt-0.5" style={{ color: level.color }}>●</span>
                                                        {ex}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Scenario */}
                                        <div className="p-3 rounded-lg bg-card-hover border-l-3" style={{ borderLeftColor: level.color, borderLeftWidth: '3px' }}>
                                            <p className="text-[10px] tracking-wider uppercase text-accent font-semibold mb-1">💡 Scenario</p>
                                            <p className="text-xs text-foreground leading-relaxed italic">{level.scenario}</p>
                                        </div>

                                        {/* Legal basis */}
                                        <p className="text-[10px] text-muted">
                                            <span className="font-semibold">Legal basis:</span> {level.legalBasis}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ═══════ LEGAL BASIS ═══════ */}
                {mainTab === 'legal-basis' && (
                    <div className="animate-fade-in space-y-3">
                        <div className="glass-card rounded-xl p-4 border-l-4 border-accent mb-4">
                            <p className="text-xs font-bold text-accent mb-1">Key Question</p>
                            <p className="text-xs text-muted leading-relaxed">
                                Before using force, ask yourself: <span className="text-foreground font-semibold">&quot;What legal power am I using, and is the force I&apos;m about to use necessary and proportionate?&quot;</span>
                            </p>
                        </div>

                        {FORCE_LEGAL_BASIS.map((basis, i) => (
                            <div key={i} className="glass-card rounded-xl p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-full rounded-full flex-shrink-0 self-stretch" style={{ backgroundColor: basis.color, minHeight: '20px' }} />
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <p className="text-sm font-bold">{basis.title}</p>
                                            <span className="text-[10px] px-2 py-0.5 rounded font-mono flex-shrink-0" style={{ backgroundColor: `${basis.color}15`, color: basis.color }}>
                                                {basis.reference}
                                            </span>
                                        </div>

                                        {/* ELI5 */}
                                        <div className="p-2.5 rounded-lg mb-2" style={{ backgroundColor: `${basis.color}08` }}>
                                            <p className="text-xs text-foreground leading-relaxed">{basis.eli5}</p>
                                        </div>

                                        {/* Detail */}
                                        <p className="text-[10px] text-muted leading-relaxed italic">{basis.detail}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Quick test */}
                        <div className="glass-card rounded-xl p-4 border-l-4 border-warning mt-4">
                            <p className="text-xs font-bold text-warning mb-2">⚡ Use of Force Checklist</p>
                            <div className="space-y-1.5">
                                {[
                                    'Is there a lawful objective? (arrest, prevent crime, self-defence)',
                                    'Is force actually necessary? (no other option?)',
                                    'Is the force proportionate to the threat?',
                                    'Am I using the minimum force required?',
                                    'Can I articulate and justify my actions?',
                                ].map((item, i) => (
                                    <p key={i} className="text-xs text-muted flex items-start gap-2">
                                        <span className="text-warning font-bold text-[10px] mt-0.5">{i + 1}</span>
                                        {item}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════ POWERS ═══════ */}
                {mainTab === 'powers' && (
                    <div className="animate-fade-in space-y-4">
                        {/* Category filter — grid */}
                        <div className="grid grid-cols-4 gap-2 mb-2">
                            {/* All button */}
                            <button
                                onClick={() => setPowerCategory('all')}
                                className={`p-2.5 rounded-lg text-center transition-colors ${powerCategory === 'all'
                                        ? 'bg-accent/20 border border-accent/40'
                                        : 'bg-card-hover border border-border hover:border-accent/30'
                                    }`}
                            >
                                <span className="text-base block mb-0.5">📋</span>
                                <span className="text-[9px] font-semibold tracking-wider uppercase block">All</span>
                                <span className="text-[9px] text-muted">{POLICE_POWERS.length}</span>
                            </button>

                            {POWER_CATEGORIES.map(cat => {
                                const count = POLICE_POWERS.filter(p => p.category === cat.key).length;
                                return (
                                    <button
                                        key={cat.key}
                                        onClick={() => setPowerCategory(cat.key)}
                                        className={`p-2.5 rounded-lg text-center transition-colors ${powerCategory === cat.key
                                                ? 'border' : 'bg-card-hover border border-border hover:border-accent/30'
                                            }`}
                                        style={powerCategory === cat.key ? { backgroundColor: `${cat.color}15`, borderColor: `${cat.color}60` } : undefined}
                                    >
                                        <span className="text-base block mb-0.5">{cat.icon}</span>
                                        <span className="text-[9px] font-semibold tracking-wider uppercase block"
                                            style={powerCategory === cat.key ? { color: cat.color } : undefined}
                                        >{cat.label}</span>
                                        <span className="text-[9px] text-muted">{count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Power cards */}
                        <div className="space-y-2">
                            {filteredPowers.map((power, i) => {
                                const cat = POWER_CATEGORIES.find(c => c.key === power.category);
                                const isExpanded = expandedPower === `${power.reference}-${i}`;

                                return (
                                    <div key={`${power.reference}-${i}`} className="glass-card rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setExpandedPower(isExpanded ? null : `${power.reference}-${i}`)}
                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-card-hover transition-colors"
                                        >
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                                                style={{ backgroundColor: `${cat?.color || '#888'}15` }}
                                            >
                                                {cat?.icon}
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <p className="text-sm font-bold">{power.title}</p>
                                                <p className="text-[10px] text-muted font-mono">{power.reference}</p>
                                            </div>
                                            <svg
                                                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                                className={`text-muted transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                                            >
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </button>

                                        {isExpanded && (
                                            <div className="px-4 pb-4 space-y-3 border-t border-border animate-fade-in">
                                                {/* ELI5 */}
                                                <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: `${cat?.color || '#888'}08` }}>
                                                    <p className="text-[10px] tracking-wider uppercase font-semibold mb-1" style={{ color: cat?.color }}>
                                                        In Plain English
                                                    </p>
                                                    <p className="text-xs text-foreground leading-relaxed">{power.eli5}</p>
                                                </div>

                                                {/* Detail */}
                                                <div>
                                                    <p className="text-[10px] tracking-wider uppercase text-muted font-semibold mb-1">Legal Wording</p>
                                                    <p className="text-[10px] text-muted leading-relaxed italic">{power.detail}</p>
                                                </div>

                                                {/* Key Points */}
                                                <div>
                                                    <p className="text-[10px] tracking-wider uppercase text-muted font-semibold mb-1">Key Points</p>
                                                    <div className="space-y-1">
                                                        {power.keyPoints.map((pt, j) => (
                                                            <p key={j} className="text-xs text-muted flex items-start gap-1.5">
                                                                <span className="text-accent text-[10px] mt-0.5">✓</span> {pt}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Scenario */}
                                                <div className="p-3 rounded-lg bg-card-hover" style={{ borderLeft: `3px solid ${cat?.color || '#888'}` }}>
                                                    <p className="text-[10px] tracking-wider uppercase text-accent font-semibold mb-1">💡 Scenario</p>
                                                    <p className="text-xs text-foreground leading-relaxed italic">{power.scenario}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
