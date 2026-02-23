'use client';

import DrillCard from '@/components/DrillCard';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUserStats, getDueItems } from '@/lib/storage';
import { getCurrentRank, getXPProgress, calculateXP } from '@/lib/achievements';

type ViewMode = 'grid' | 'list';

const MODULES = [
  {
    title: 'Reg Plate Forge', subtitle: 'Memory',
    description: 'Plates flash, you recall. Chunking, reverse mode, accuracy + speed.',
    href: '/drills/reg-plate', accentColor: '#4ade80',
    iconPath: 'M2 6h20v12H2zM6 12h12M6 9h3M15 9h3M6 15h3M15 15h3',
  },
  {
    title: 'Phonetic Alphabet', subtitle: 'Comms',
    description: 'Plate → NATO phonetic. Alpha Bravo One Two.',
    href: '/drills/phonetic', accentColor: '#06b6d4',
    iconPath: 'M12 18.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM12 2v2M12 20v2M2 12h2M20 12h2',
  },
  {
    title: 'Scene Snapshot', subtitle: 'Observation',
    description: '5-10s scene card. Recall time, location, names, descriptions.',
    href: '/drills/scene-snapshot', accentColor: '#3b82f6',
    iconPath: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z',
    circle: { cx: 12, cy: 12, r: 3 },
  },
  {
    title: 'Face-Name Recall', subtitle: 'Association',
    description: 'Study real face-name pairs, then recall them shuffled.',
    href: '/drills/face-name', accentColor: '#f59e0b',
    iconPath: 'M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6',
    circle: { cx: 12, cy: 8, r: 4 },
  },
  {
    title: 'Pressure Mode', subtitle: 'Stress Inoculation',
    description: 'Timed drills with radio chatter and physical stress.',
    href: '/drills/pressure-mode', accentColor: '#ef4444',
    iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  },
  {
    title: 'MG11 Statement', subtitle: 'Evidence',
    description: '5-part witness statement. College of Policing MG11 format.',
    href: '/drills/court-statement', accentColor: '#8b5cf6',
    iconPath: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h6',
  },
  {
    title: 'Scenario Simulator', subtitle: 'Procedure',
    description: 'Observe → GOWISELY → Search → 5-Part Arrest. Full flow.',
    href: '/drills/scenario', accentColor: '#ef4444',
    iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  },
  {
    title: 'NDM Recall Builder', subtitle: 'Framework',
    description: 'File any event using GAPOA+R. Structured recall for reports.',
    href: '/drills/ndm-recall', accentColor: '#a855f7',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 12h6M9 16h4',
    rect: { x: 9, y: 3, width: 6, height: 4, rx: 1 },
  },
];

export default function Home() {
  const [stats, setStats] = useState({ totalDrills: 0, streak: 0 });
  const [dueCount, setDueCount] = useState(0);
  const [rank, setRank] = useState({ rank: 'Recruit', icon: '🔰', color: '#737373', minXP: 0 });
  const [xpProgress, setXpProgress] = useState({ current: 0, nextThreshold: 100, percent: 0 });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    const s = getUserStats();
    setStats(s);
    setDueCount(getDueItems().length);
    setRank(getCurrentRank());
    setXpProgress(getXPProgress());
    // Restore preference
    const saved = localStorage.getItem('arvil-view-mode');
    if (saved === 'list' || saved === 'grid') setViewMode(saved);
  }, []);

  const toggleView = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('arvil-view-mode', mode);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-shrink-0 flex flex-col items-center justify-center pt-20 pb-12 px-4">
        <div className="animate-fade-in text-center mb-8">
          <h1 className="text-6xl sm:text-8xl font-black tracking-[0.25em] text-foreground mb-3 select-none">
            ARVIL
          </h1>
          <p className="text-xs sm:text-sm tracking-[0.4em] uppercase text-accent font-medium">
            Cognitive Performance Training
          </p>
        </div>

        {/* Science strip */}
        <div className="animate-fade-in stagger-2 opacity-0 flex flex-wrap justify-center gap-3 sm:gap-6 mb-8" style={{ animationFillMode: 'forwards' }}>
          {[
            { label: 'Retrieval Practice', desc: 'Testing effect' },
            { label: 'Spaced Repetition', desc: 'Spacing effect' },
            { label: 'Stress Inoculation', desc: 'Pressure training' },
          ].map((item) => (
            <div key={item.label} className="text-center px-3 py-2">
              <p className="text-[10px] tracking-[0.2em] uppercase text-accent font-semibold">
                {item.label}
              </p>
              <p className="text-[10px] text-muted mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Rank & Quick stats */}
        {stats.totalDrills > 0 && (
          <div className="animate-fade-in stagger-3 opacity-0 space-y-3 w-full max-w-sm" style={{ animationFillMode: 'forwards' }}>
            {/* Rank bar */}
            <div className="glass-card rounded-lg p-3 flex items-center gap-3">
              <span className="text-xl">{rank.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: rank.color }}>{rank.rank}</span>
                  <span className="text-[10px] text-muted font-mono">{xpProgress.current} XP</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${xpProgress.percent}%`, backgroundColor: rank.color }} />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="glass-card rounded-lg p-3 flex-1 text-center">
                <p className="text-xl font-bold text-foreground">{stats.totalDrills}</p>
                <p className="text-[10px] tracking-wider uppercase text-muted">Drills</p>
              </div>
              <div className="glass-card rounded-lg p-3 flex-1 text-center">
                <p className="text-xl font-bold text-accent">{stats.streak}</p>
                <p className="text-[10px] tracking-wider uppercase text-muted">Streak</p>
              </div>
              {dueCount > 0 && (
                <div className="glass-card rounded-lg p-3 flex-1 text-center">
                  <p className="text-xl font-bold text-warning">{dueCount}</p>
                  <p className="text-[10px] tracking-wider uppercase text-muted">Due</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Separator */}
      <div className="w-full max-w-lg mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Module Grid/List */}
      <section className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted font-medium">
            Training Modules
          </p>

          {/* View toggle */}
          <div className="flex gap-1 bg-card-hover rounded-lg p-0.5">
            <button
              onClick={() => toggleView('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-accent text-background' : 'text-muted hover:text-foreground'}`}
              title="Grid view"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => toggleView('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-accent text-background' : 'text-muted hover:text-foreground'}`}
              title="List view"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            {MODULES.map((mod, i) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="glass-card rounded-xl p-4 hover:bg-card-hover transition-all group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={mod.accentColor} strokeWidth="1.5" className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <path d={mod.iconPath} />
                    {mod.circle && <circle cx={mod.circle.cx} cy={mod.circle.cy} r={mod.circle.r} />}
                    {mod.rect && <rect x={mod.rect.x} y={mod.rect.y} width={mod.rect.width} height={mod.rect.height} rx={mod.rect.rx} />}
                  </svg>
                </div>
                <p className="text-sm font-bold text-foreground mb-0.5 group-hover:text-accent transition-colors">{mod.title}</p>
                <p className="text-[10px] tracking-wider uppercase font-semibold mb-1" style={{ color: mod.accentColor }}>{mod.subtitle}</p>
                <p className="text-[10px] text-muted leading-tight line-clamp-2">{mod.description}</p>
              </Link>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-2 animate-fade-in">
            {MODULES.map((mod, i) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="glass-card rounded-lg p-3 flex items-center gap-3 hover:bg-card-hover transition-all group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${mod.accentColor}15` }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={mod.accentColor} strokeWidth="1.5">
                    <path d={mod.iconPath} />
                    {mod.circle && <circle cx={mod.circle.cx} cy={mod.circle.cy} r={mod.circle.r} />}
                    {mod.rect && <rect x={mod.rect.x} y={mod.rect.y} width={mod.rect.width} height={mod.rect.height} rx={mod.rect.rx} />}
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">{mod.title}</p>
                    <span className="text-[9px] tracking-wider uppercase font-semibold px-1.5 py-0.5 rounded" style={{ color: mod.accentColor, backgroundColor: `${mod.accentColor}15` }}>
                      {mod.subtitle}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted truncate">{mod.description}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/50 group-hover:text-accent transition-colors flex-shrink-0">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        )}

        {/* Dashboard, Powers & Reference links */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h4l3-9 4 18 3-9h4" />
            </svg>
            Dashboard
          </Link>
          <Link
            href="/powers"
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Powers
          </Link>
          <Link
            href="/reference"
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
            Reference
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-[10px] text-muted tracking-wider">
          ALL DATA STORED LOCALLY • PRIVACY FIRST • NO SERVER SYNC
        </p>
      </footer>
    </main>
  );
}
