'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Badge from '@/components/Badge';
import { getUserStats, getDrillResults, getDueItems, getSpacedItems, type DrillResult } from '@/lib/storage';
import { getCompetencyLevel } from '@/lib/spaced-repetition';
import { getCurrentRank, getNextRank, getXPProgress, calculateXP, getAchievements, getUnlockedCount, getTotalAchievements, RANKS } from '@/lib/achievements';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalDrills: 0, totalAccuracy: 0, streak: 0, lastDrillDate: '',
        bestAccuracy: 0, platesAttempted: 0, platesCorrect: 0, scenesAttempted: 0, scenesCorrect: 0,
    });
    const [results, setResults] = useState<DrillResult[]>([]);
    const [dueCount, setDueCount] = useState(0);
    const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'analytics'>('overview');

    useEffect(() => {
        setStats(getUserStats());
        setResults(getDrillResults().reverse());
        setDueCount(getDueItems().length);
    }, []);

    const competency = getCompetencyLevel(stats.totalAccuracy);
    const rank = getCurrentRank();
    const nextRank = getNextRank();
    const xpProgress = getXPProgress();
    const totalXP = calculateXP();
    const achievements = getAchievements();
    const unlockedCount = getUnlockedCount();

    // Drill type breakdowns
    const plateResults = results.filter(r => r.type === 'reg-plate');
    const sceneResults = results.filter(r => r.type === 'scene-snapshot');
    const pressureResults = results.filter(r => r.type === 'pressure-mode');

    const avgPlateAccuracy = plateResults.length > 0 ? plateResults.reduce((sum, r) => sum + r.accuracy, 0) / plateResults.length : 0;
    const avgSceneAccuracy = sceneResults.length > 0 ? sceneResults.reduce((sum, r) => sum + r.accuracy, 0) / sceneResults.length : 0;
    const avgPressureAccuracy = pressureResults.length > 0 ? pressureResults.reduce((sum, r) => sum + r.accuracy, 0) / pressureResults.length : 0;

    // Calm vs pressure comparison
    const calmResults = results.filter(r => r.type !== 'pressure-mode' && r.accuracy > 0);
    const avgCalm = calmResults.length > 0 ? calmResults.reduce((sum, r) => sum + r.accuracy, 0) / calmResults.length : 0;
    const avgPressure = pressureResults.length > 0 ? pressureResults.reduce((sum, r) => sum + r.accuracy, 0) / pressureResults.length : 0;
    const pressureDrop = avgCalm - avgPressure;

    // Recent 10 for chart
    const recentResults = results.slice(0, 10).reverse();

    // Forgetting curve — items from spaced repetition
    const spacedItems = typeof window !== 'undefined' ? getSpacedItems() : [];
    const dueItems = spacedItems.filter(i => i.nextReview <= Date.now());
    const upcomingItems = spacedItems
        .filter(i => i.nextReview > Date.now())
        .sort((a, b) => a.nextReview - b.nextReview)
        .slice(0, 8);

    return (
        <div className="min-h-screen">
            <Navigation title="Dashboard" />

            <div className="pt-20 pb-12 px-4 max-w-2xl mx-auto">
                {stats.totalDrills === 0 ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center animate-fade-in">
                            <p className="text-4xl mb-4">📊</p>
                            <h2 className="text-xl font-bold mb-2">No data yet</h2>
                            <p className="text-sm text-muted mb-6">Complete your first drill to see progress here.</p>
                            <a href="/" className="btn-primary inline-block">Start Training</a>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in space-y-6">
                        {/* Tab Navigation */}
                        <div className="flex gap-1 glass-card rounded-lg p-1">
                            {(['overview', 'achievements', 'analytics'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 text-xs font-semibold tracking-wider uppercase rounded transition-colors ${activeTab === tab
                                            ? 'bg-accent text-background'
                                            : 'text-muted hover:text-foreground'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* ─── OVERVIEW TAB ─── */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* XP / Rank Card */}
                                <div className="glass-card rounded-xl p-5">
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className="text-3xl">{rank.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-lg font-bold" style={{ color: rank.color }}>{rank.rank}</p>
                                            <div className="flex items-center justify-between text-xs text-muted">
                                                <span>{totalXP} XP</span>
                                                {nextRank && <span>{nextRank.minXP} XP for {nextRank.rank}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="progress-bar h-2 rounded">
                                        <div className="progress-bar-fill h-2 rounded" style={{ width: `${xpProgress.percent}%`, backgroundColor: rank.color }} />
                                    </div>
                                    {/* Rank ladder preview */}
                                    <div className="flex gap-1 mt-3">
                                        {RANKS.map((r, i) => (
                                            <div
                                                key={r.rank}
                                                className="flex-1 h-1 rounded-full"
                                                style={{
                                                    backgroundColor: totalXP >= r.minXP ? r.color : 'var(--border)',
                                                    opacity: totalXP >= r.minXP ? 1 : 0.3,
                                                }}
                                                title={`${r.rank} (${r.minXP} XP)`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Top Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="glass-card rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-foreground">{stats.totalDrills}</p>
                                        <p className="text-[10px] tracking-wider uppercase text-muted mt-1">Drills</p>
                                    </div>
                                    <div className="glass-card rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold" style={{ color: competency.color }}>
                                            {Math.round(stats.totalAccuracy)}%
                                        </p>
                                        <p className="text-[10px] tracking-wider uppercase text-muted mt-1">Accuracy</p>
                                    </div>
                                    <div className="glass-card rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-accent">{stats.streak}</p>
                                        <p className="text-[10px] tracking-wider uppercase text-muted mt-1">Streak</p>
                                    </div>
                                    <div className="glass-card rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-warning">{dueCount}</p>
                                        <p className="text-[10px] tracking-wider uppercase text-muted mt-1">Due</p>
                                    </div>
                                </div>

                                {/* Competency Level */}
                                <div className="glass-card rounded-xl p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs tracking-wider uppercase text-muted mb-1">Competency</p>
                                        <Badge level={competency.level} size="lg" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted">Best: <span className="text-foreground font-bold">{Math.round(stats.bestAccuracy)}%</span></p>
                                        <p className="text-xs text-muted mt-1">
                                            {competency.level === 'bronze' && 'Hit 70% avg for Silver'}
                                            {competency.level === 'silver' && 'Hit 90% avg for Gold'}
                                            {competency.level === 'gold' && 'Peak performance ✓'}
                                        </p>
                                    </div>
                                </div>

                                {/* Recent Accuracy Chart */}
                                {recentResults.length > 1 && (
                                    <div className="glass-card rounded-xl p-5">
                                        <p className="text-xs tracking-wider uppercase text-muted mb-4">Recent Accuracy</p>
                                        <div className="flex items-end gap-1.5 h-28">
                                            {recentResults.map((r, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                    <span className="text-[9px] text-muted font-mono">{Math.round(r.accuracy)}%</span>
                                                    <div
                                                        className="w-full rounded-t transition-all"
                                                        style={{
                                                            height: `${Math.max((r.accuracy / 100) * 80, 4)}px`,
                                                            backgroundColor: getCompetencyLevel(r.accuracy).color,
                                                            opacity: 0.6 + (i / recentResults.length) * 0.4,
                                                        }}
                                                    />
                                                    <span className="text-[8px] text-muted">
                                                        {r.type === 'reg-plate' ? 'RP' : r.type === 'scene-snapshot' ? 'SS' : 'PM'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent History */}
                                <div className="glass-card rounded-xl p-5">
                                    <p className="text-xs tracking-wider uppercase text-muted mb-4">Recent Drills</p>
                                    <div className="space-y-2">
                                        {results.slice(0, 8).map((r) => (
                                            <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                                                <span className={`w-2 h-2 rounded-full ${r.accuracy >= 80 ? 'bg-success' : r.accuracy >= 50 ? 'bg-warning' : 'bg-danger'
                                                    }`} />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">
                                                        {r.type === 'reg-plate' && 'Reg Plate Forge'}
                                                        {r.type === 'scene-snapshot' && 'Scene Snapshot'}
                                                        {r.type === 'pressure-mode' && 'Pressure Mode'}
                                                    </p>
                                                    <p className="text-[10px] text-muted">
                                                        {new Date(r.timestamp).toLocaleDateString('en-GB', {
                                                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-mono font-bold" style={{ color: getCompetencyLevel(r.accuracy).color }}>
                                                    {Math.round(r.accuracy)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── ACHIEVEMENTS TAB ─── */}
                        {activeTab === 'achievements' && (
                            <div className="space-y-6">
                                <div className="glass-card rounded-xl p-5 text-center">
                                    <p className="text-4xl font-bold text-accent">{unlockedCount}</p>
                                    <p className="text-xs tracking-wider uppercase text-muted mt-1">
                                        of {getTotalAchievements()} Achievements Unlocked
                                    </p>
                                    <div className="progress-bar mt-3">
                                        <div className="progress-bar-fill" style={{ width: `${(unlockedCount / getTotalAchievements()) * 100}%` }} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {achievements.map(({ achievement: a, unlocked }) => (
                                        <div
                                            key={a.id}
                                            className={`glass-card rounded-lg p-4 flex items-center gap-3 transition-opacity ${unlocked ? 'opacity-100' : 'opacity-40'
                                                }`}
                                        >
                                            <span className="text-2xl">{a.icon}</span>
                                            <div className="flex-1">
                                                <p className={`text-sm font-semibold ${unlocked ? 'text-foreground' : 'text-muted'}`}>
                                                    {a.title}
                                                </p>
                                                <p className="text-xs text-muted">{a.description}</p>
                                            </div>
                                            {unlocked && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success font-bold">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─── ANALYTICS TAB ─── */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                {/* Calm vs Pressure */}
                                {(calmResults.length > 0 && pressureResults.length > 0) && (
                                    <div className="glass-card rounded-xl p-5">
                                        <p className="text-xs tracking-wider uppercase text-muted mb-4">Calm vs Pressure</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <p className="text-3xl font-bold text-accent">{Math.round(avgCalm)}%</p>
                                                <p className="text-xs text-muted mt-1">Calm Accuracy</p>
                                                <div className="progress-bar mt-2">
                                                    <div className="progress-bar-fill" style={{ width: `${avgCalm}%`, backgroundColor: 'var(--accent)' }} />
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-3xl font-bold text-danger">{Math.round(avgPressure)}%</p>
                                                <p className="text-xs text-muted mt-1">Pressure Accuracy</p>
                                                <div className="progress-bar mt-2">
                                                    <div className="progress-bar-fill" style={{ width: `${avgPressure}%`, backgroundColor: 'var(--danger)' }} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center mt-4 py-2 rounded-lg" style={{
                                            backgroundColor: pressureDrop > 20 ? 'rgba(239,68,68,0.1)' : pressureDrop > 10 ? 'rgba(245,158,11,0.1)' : 'rgba(74,222,128,0.1)',
                                        }}>
                                            <p className="text-sm font-semibold" style={{
                                                color: pressureDrop > 20 ? 'var(--danger)' : pressureDrop > 10 ? 'var(--warning)' : 'var(--accent)',
                                            }}>
                                                {pressureDrop > 0 ? `−${Math.round(pressureDrop)}%` : `+${Math.round(Math.abs(pressureDrop))}%`} under pressure
                                            </p>
                                            <p className="text-[10px] text-muted mt-0.5">
                                                {pressureDrop > 20 && 'Significant drop — keep practicing under stress'}
                                                {pressureDrop > 10 && pressureDrop <= 20 && 'Moderate impact — improving'}
                                                {pressureDrop <= 10 && 'Minimal impact — strong resilience'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Performance Heat Map */}
                                <div className="glass-card rounded-xl p-5">
                                    <p className="text-xs tracking-wider uppercase text-muted mb-4">Performance Heat Map</p>
                                    <div className="space-y-3">
                                        <HeatMapRow label="Reg Plates" count={plateResults.length} accuracy={avgPlateAccuracy} />
                                        <HeatMapRow label="Scenes" count={sceneResults.length} accuracy={avgSceneAccuracy} />
                                        <HeatMapRow label="Pressure" count={pressureResults.length} accuracy={avgPressureAccuracy} />
                                    </div>
                                </div>

                                {/* Forgetting Curve */}
                                {spacedItems.length > 0 && (
                                    <div className="glass-card rounded-xl p-5">
                                        <p className="text-xs tracking-wider uppercase text-muted mb-4">Forgetting Curve — Spaced Review</p>

                                        {dueItems.length > 0 && (
                                            <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
                                                <p className="text-sm font-semibold text-warning">
                                                    {dueItems.length} item{dueItems.length > 1 ? 's' : ''} due for review
                                                </p>
                                                <p className="text-[10px] text-muted mt-0.5">These items are at risk of being forgotten</p>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            {[...dueItems.slice(0, 4), ...upcomingItems].map((item) => {
                                                const isDue = item.nextReview <= Date.now();
                                                const daysUntil = Math.ceil((item.nextReview - Date.now()) / (24 * 60 * 60 * 1000));
                                                const retention = Math.max(0, Math.min(100,
                                                    100 * Math.pow(item.easeFactor * 0.4, -(Date.now() - item.lastReview) / (item.interval * 24 * 60 * 60 * 1000))
                                                ));

                                                return (
                                                    <div key={item.id} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                                                        <div className="w-2 h-2 rounded-full" style={{
                                                            backgroundColor: isDue ? 'var(--danger)' : retention > 70 ? 'var(--accent)' : 'var(--warning)',
                                                        }} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs truncate">{item.content}</p>
                                                            <p className="text-[10px] text-muted">{item.type} • interval: {item.interval}d</p>
                                                        </div>
                                                        <div className="text-right">
                                                            {isDue ? (
                                                                <span className="text-xs text-danger font-bold">DUE NOW</span>
                                                            ) : (
                                                                <span className="text-[10px] text-muted">in {daysUntil}d</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {spacedItems.length > 8 && (
                                            <p className="text-[10px] text-muted text-center mt-3">
                                                {spacedItems.length} total items tracked
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* PDF Export placeholder */}
                                <button
                                    onClick={() => exportToPDF()}
                                    className="btn-secondary w-full flex items-center justify-center gap-2"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                        <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
                                    </svg>
                                    Export Training Report (PDF)
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function HeatMapRow({ label, count, accuracy }: { label: string; count: number; accuracy: number }) {
    const competency = getCompetencyLevel(accuracy);
    return (
        <div className="flex items-center gap-3">
            <div className="w-20 text-xs text-muted">{label}</div>
            <div className="flex-1 progress-bar">
                <div className="progress-bar-fill" style={{
                    width: count > 0 ? `${accuracy}%` : '0%',
                    backgroundColor: count > 0 ? competency.color : 'var(--border)',
                }} />
            </div>
            <div className="w-14 text-right">
                {count > 0 ? (
                    <span className="text-xs font-mono" style={{ color: competency.color }}>{Math.round(accuracy)}%</span>
                ) : (
                    <span className="text-[10px] text-muted">—</span>
                )}
            </div>
            <span className="text-[10px] text-muted w-6 text-right">{count}×</span>
        </div>
    );
}

function exportToPDF() {
    const stats = getUserStats();
    const results = getDrillResults();

    // Build HTML content for print
    const html = `
    <html>
    <head>
      <title>ARVIL Training Report</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px; color: #222; }
        h1 { font-size: 28px; letter-spacing: 0.2em; margin-bottom: 4px; }
        h2 { font-size: 16px; color: #666; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
        .subtitle { color: #4ade80; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; }
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; }
        .stat { text-align: center; padding: 12px; border: 1px solid #eee; border-radius: 8px; }
        .stat-value { font-size: 24px; font-weight: bold; }
        .stat-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
        th { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; }
        .footer { margin-top: 40px; font-size: 10px; color: #aaa; text-align: center; }
      </style>
    </head>
    <body>
      <h1>ARVIL</h1>
      <p class="subtitle">Cognitive Performance Training Report</p>
      <p style="font-size:12px;color:#888;">Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

      <h2>Summary</h2>
      <div class="stat-grid">
        <div class="stat"><div class="stat-value">${stats.totalDrills}</div><div class="stat-label">Total Drills</div></div>
        <div class="stat"><div class="stat-value">${Math.round(stats.totalAccuracy)}%</div><div class="stat-label">Avg Accuracy</div></div>
        <div class="stat"><div class="stat-value">${stats.streak}</div><div class="stat-label">Day Streak</div></div>
        <div class="stat"><div class="stat-value">${Math.round(stats.bestAccuracy)}%</div><div class="stat-label">Best Score</div></div>
      </div>

      <h2>Drill History</h2>
      <table>
        <thead><tr><th>Date</th><th>Type</th><th>Accuracy</th><th>Speed</th></tr></thead>
        <tbody>
          ${results.slice(-20).reverse().map(r => `
            <tr>
              <td>${new Date(r.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
              <td>${r.type === 'reg-plate' ? 'Reg Plate' : r.type === 'scene-snapshot' ? 'Scene' : 'Pressure'}</td>
              <td>${Math.round(r.accuracy)}%</td>
              <td>${(r.speedMs / 1000).toFixed(1)}s</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        ARVIL — All data stored locally. This report is for CPD/training portfolio purposes only.
      </div>
    </body>
    </html>
  `;

    const w = window.open('', '_blank');
    if (w) {
        w.document.write(html);
        w.document.close();
        setTimeout(() => w.print(), 500);
    }
}
