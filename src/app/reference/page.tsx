'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { MG11_SECTIONS, ADVOKATE, GOWISELY as GOWISELY_REF, NASCH, CUSTODY_PROCEDURE, PNB_REQUIREMENTS, CUSTODY_FRONT_SHEET } from '@/lib/policing';
import { FIVE_PART_ARREST, NECESSITY_CRITERIA, FULL_CAUTION } from '@/lib/scenarios';

type RefTab = 'mg11' | 'arrest' | 'idcopplan' | 'gowisely' | 'nasch' | 'custody' | 'frontsheet' | 'pnb' | 'advokate';

const TABS: { key: RefTab; label: string; icon: string }[] = [
    { key: 'mg11', label: 'MG11', icon: '📝' },
    { key: 'arrest', label: 'Arrest', icon: '⚖️' },
    { key: 'idcopplan', label: 'IDCOPPLAN', icon: '📋' },
    { key: 'gowisely', label: 'GOWISELY', icon: '🔍' },
    { key: 'nasch', label: 'NASCH', icon: '🔎' },
    { key: 'custody', label: 'Custody', icon: '🔒' },
    { key: 'frontsheet', label: 'Front Sheet', icon: '📄' },
    { key: 'pnb', label: 'PNB', icon: '📓' },
    { key: 'advokate', label: 'ADVOKATE', icon: '👁️' },
];

export default function ReferencePage() {
    const [activeTab, setActiveTab] = useState<RefTab>('mg11');

    return (
        <div className="min-h-screen">
            <Navigation title="Policing Reference" />

            <div className="pt-20 pb-12 px-4 max-w-lg mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-1">Quick Reference</h2>
                    <p className="text-xs text-muted">Key procedures and mnemonics</p>
                </div>

                {/* Tab bar — scrollable */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab.key
                                    ? 'bg-accent text-background'
                                    : 'bg-card-hover text-muted hover:text-foreground'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* MG11 */}
                {activeTab === 'mg11' && (
                    <div className="space-y-3 animate-fade-in">
                        <h3 className="text-sm font-bold text-accent">MG11 — 5-Part Witness Statement</h3>
                        <p className="text-xs text-muted">College of Policing structured format for evidential statements.</p>
                        {MG11_SECTIONS.map(sec => (
                            <div key={sec.part} className="glass-card rounded-lg p-4 border-l-4" style={{ borderColor: sec.color }}>
                                <p className="text-sm font-bold mb-1" style={{ color: sec.color }}>Part {sec.part}: {sec.title}</p>
                                <p className="text-xs text-muted mb-2">{sec.description}</p>
                                <div className="space-y-0.5">
                                    {sec.prompts.map((p, i) => (
                                        <p key={i} className="text-[10px] text-muted">• {p}</p>
                                    ))}
                                </div>
                                <details className="mt-2">
                                    <summary className="text-[10px] text-accent cursor-pointer">Tips</summary>
                                    <div className="mt-1 space-y-0.5">
                                        {sec.tips.map((t, i) => (
                                            <p key={i} className="text-[10px] text-muted italic">💡 {t}</p>
                                        ))}
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                )}

                {/* 5-Part Arrest */}
                {activeTab === 'arrest' && (
                    <div className="space-y-3 animate-fade-in">
                        <h3 className="text-sm font-bold text-danger">5-Part Arrest</h3>
                        <p className="text-xs text-muted">Structure for lawful arrest under PACE s.24.</p>
                        {FIVE_PART_ARREST.map(step => (
                            <div key={step.part} className="glass-card rounded-lg p-4 border-l-4 border-danger">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-6 h-6 rounded bg-danger/20 flex items-center justify-center text-danger text-xs font-bold">{step.part}</span>
                                    <span className="text-sm font-bold">{step.label}</span>
                                </div>
                                <p className="text-xs text-muted mb-1">{step.hint}</p>
                                <p className="text-[10px] text-foreground/70 italic">&quot;{step.template}&quot;</p>
                            </div>
                        ))}
                        <div className="glass-card rounded-lg p-4 border-l-4 border-warning">
                            <p className="text-xs font-bold text-warning mb-1">Full Caution</p>
                            <p className="text-xs italic">&quot;{FULL_CAUTION}&quot;</p>
                        </div>
                    </div>
                )}

                {/* IDCOPPLAN */}
                {activeTab === 'idcopplan' && (
                    <div className="space-y-3 animate-fade-in">
                        <h3 className="text-sm font-bold text-accent">IDCOPPLAN — Necessity for Arrest</h3>
                        <p className="text-xs text-muted">PACE s.24(5) — Why arrest is NECESSARY. Must satisfy at least one criterion.</p>
                        <div className="glass-card rounded-xl p-4 mb-2">
                            <div className="flex items-center gap-1 text-lg font-bold">
                                {NECESSITY_CRITERIA.map((nc, i) => (
                                    <span key={i} className="w-7 h-7 rounded flex items-center justify-center bg-accent/20 text-accent text-sm">
                                        {nc.letter}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {NECESSITY_CRITERIA.map((nc, i) => (
                            <div key={i} className="glass-card rounded-lg p-3 flex items-start gap-3">
                                <span className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                                    {nc.letter}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">{nc.label}</p>
                                    <p className="text-xs text-muted">{nc.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* GOWISELY */}
                {activeTab === 'gowisely' && (
                    <div className="space-y-3 animate-fade-in">
                        <h3 className="text-sm font-bold text-accent">GOWISELY — Stop & Search</h3>
                        <p className="text-xs text-muted">PACE s.1 and Misuse of Drugs Act s.23 compliance.</p>
                        {GOWISELY_REF.map(item => (
                            <div key={item.word} className="glass-card rounded-lg p-3 flex items-start gap-3">
                                <span className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                                    {item.letter}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">{item.word}</p>
                                    <p className="text-xs text-muted">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* NASCH */}
                {activeTab === 'nasch' && (
                    <div className="space-y-3 animate-fade-in">
                        <h3 className="text-sm font-bold text-accent">NASCH — PNC Name Check</h3>
                        <p className="text-xs text-muted">The 5 pieces of information required for a PNC name check.</p>
                        {NASCH.map(item => (
                            <div key={item.word} className="glass-card rounded-lg p-4 flex items-start gap-3">
                                <span className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                                    {item.letter}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">{item.word}</p>
                                    <p className="text-xs text-muted mb-1">{item.description}</p>
                                    <div className="space-y-0.5">
                                        {item.prompts.map((p, i) => (
                                            <p key={i} className="text-[10px] text-muted/70">• {p}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Custody */}
                {activeTab === 'custody' && (
                    <div className="space-y-3 animate-fade-in">
                        <h3 className="text-sm font-bold text-accent">Custody — PACE Code C</h3>
                        <p className="text-xs text-muted">Step-by-step custody procedure.</p>
                        {CUSTODY_PROCEDURE.map(step => (
                            <div key={step.order} className={`glass-card rounded-lg p-4 border-l-4 ${step.critical ? 'border-danger' : 'border-border'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${step.critical ? 'bg-danger/20 text-danger' : 'bg-card-hover text-muted'}`}>
                                        {step.order}
                                    </span>
                                    <span className="text-sm font-bold">{step.title}</span>
                                    <span className="text-[9px] text-muted ml-auto">{step.legalRef}</span>
                                </div>
                                <p className="text-xs text-muted mb-2">{step.description}</p>
                                <div className="space-y-0.5">
                                    {step.requirements.map((r, i) => (
                                        <p key={i} className="text-[10px] text-muted">• {r}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Custody Front Sheet */}
                {activeTab === 'frontsheet' && (
                    <div className="space-y-3 animate-fade-in">
                        <h3 className="text-sm font-bold text-accent">Custody Front Sheet</h3>
                        <p className="text-xs text-muted">Exactly what you need to provide when presenting at custody.</p>
                        {CUSTODY_FRONT_SHEET.map(section => (
                            <div key={section.section} className="glass-card rounded-lg overflow-hidden">
                                <div className="px-4 py-2 border-b border-border" style={{ borderLeftWidth: 4, borderLeftColor: section.color }}>
                                    <p className="text-sm font-bold" style={{ color: section.color }}>{section.section}</p>
                                </div>
                                <div className="p-3 space-y-2">
                                    {section.fields.map((field, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            {field.critical && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                                            )}
                                            {!field.critical && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-muted/30 mt-1.5 flex-shrink-0" />
                                            )}
                                            <div>
                                                <p className="text-xs font-semibold">{field.label}</p>
                                                <p className="text-[10px] text-muted">{field.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="glass-card rounded-lg p-3 border-l-4 border-danger">
                            <p className="text-[10px] text-muted">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger mr-1" /> = Critical / mandatory field
                            </p>
                        </div>
                    </div>
                )}

                {/* PNB */}
                {activeTab === 'pnb' && (
                    <div className="space-y-3 animate-fade-in">
                        <h3 className="text-sm font-bold text-accent">PNB Entry Requirements</h3>
                        <p className="text-xs text-muted">Pocket Notebook — what to record and when.</p>
                        {PNB_REQUIREMENTS.map(req => (
                            <div key={req.category} className="glass-card rounded-lg p-4">
                                <p className="text-sm font-bold mb-2">{req.category}</p>
                                <div className="space-y-0.5 mb-2">
                                    {req.items.map((item, i) => (
                                        <p key={i} className="text-xs text-muted">• {item}</p>
                                    ))}
                                </div>
                                <p className="text-[10px] text-accent/80 italic">💡 {req.tip}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ADVOKATE */}
                {activeTab === 'advokate' && (
                    <div className="space-y-3 animate-fade-in">
                        <h3 className="text-sm font-bold text-accent">ADVOKATE — Witness Assessment</h3>
                        <p className="text-xs text-muted">Factors to consider when assessing the reliability of a witness.</p>
                        {ADVOKATE.map(item => (
                            <div key={item.word} className="glass-card rounded-lg p-3 flex items-start gap-3">
                                <span className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                                    {item.letter}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">{item.word}</p>
                                    <p className="text-xs text-muted">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
