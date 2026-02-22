// Achievements & XP system — local-first progression engine

import { getDrillResults, getUserStats } from './storage';

// ─── XP & Ranks ────────────────────────────────────────────

export interface RankInfo {
    rank: string;
    minXP: number;
    icon: string;
    color: string;
}

export const RANKS: RankInfo[] = [
    { rank: 'Recruit', minXP: 0, icon: '🔰', color: '#737373' },
    { rank: 'Probationer', minXP: 100, icon: '📋', color: '#94a3b8' },
    { rank: 'Constable', minXP: 350, icon: '⭐', color: '#4ade80' },
    { rank: 'Senior Constable', minXP: 750, icon: '⭐', color: '#22c55e' },
    { rank: 'Sergeant', minXP: 1500, icon: '🔷', color: '#3b82f6' },
    { rank: 'Inspector', minXP: 3000, icon: '💎', color: '#a855f7' },
    { rank: 'Superintendent', minXP: 5000, icon: '👑', color: '#fbbf24' },
    { rank: 'Commander', minXP: 8000, icon: '🏆', color: '#ef4444' },
];

export function calculateXP(): number {
    const results = getDrillResults();
    let xp = 0;
    for (const r of results) {
        // Base XP for completing a drill
        xp += 10;
        // Bonus for accuracy
        xp += Math.round(r.accuracy * 0.2);
        // Bonus for speed (under 5s average)
        if (r.speedMs < 5000) xp += 5;
        // Bonus for difficulty
        xp += r.difficulty * 3;
        // Pressure mode bonus
        if (r.type === 'pressure-mode') xp += 15;
    }
    return xp;
}

export function getCurrentRank(): RankInfo {
    const xp = calculateXP();
    let current = RANKS[0];
    for (const rank of RANKS) {
        if (xp >= rank.minXP) current = rank;
    }
    return current;
}

export function getNextRank(): RankInfo | null {
    const xp = calculateXP();
    for (const rank of RANKS) {
        if (xp < rank.minXP) return rank;
    }
    return null;
}

export function getXPProgress(): { current: number; nextThreshold: number; percent: number } {
    const xp = calculateXP();
    const current = getCurrentRank();
    const next = getNextRank();
    if (!next) return { current: xp, nextThreshold: xp, percent: 100 };

    const rangeStart = current.minXP;
    const rangeEnd = next.minXP;
    const progress = ((xp - rangeStart) / (rangeEnd - rangeStart)) * 100;
    return { current: xp, nextThreshold: rangeEnd, percent: Math.min(progress, 100) };
}

// ─── Achievements ──────────────────────────────────────────

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: () => boolean;
    category: 'drill' | 'accuracy' | 'streak' | 'pressure' | 'milestone';
}

const ACHIEVEMENTS: Achievement[] = [
    // Drill count milestones
    {
        id: 'first_drill', title: 'First Contact', description: 'Complete your first drill', icon: '🎯',
        condition: () => getUserStats().totalDrills >= 1, category: 'milestone'
    },
    {
        id: 'ten_drills', title: 'Warming Up', description: 'Complete 10 drills', icon: '🔥',
        condition: () => getUserStats().totalDrills >= 10, category: 'milestone'
    },
    {
        id: 'fifty_drills', title: 'Dedicated', description: 'Complete 50 drills', icon: '💪',
        condition: () => getUserStats().totalDrills >= 50, category: 'milestone'
    },
    {
        id: 'hundred_drills', title: 'Centurion', description: 'Complete 100 drills', icon: '🏛️',
        condition: () => getUserStats().totalDrills >= 100, category: 'milestone'
    },

    // Accuracy achievements
    {
        id: 'perfect_plate', title: 'Eagle Eye', description: '100% accuracy on a plate drill', icon: '🦅',
        condition: () => getDrillResults().some(r => r.type === 'reg-plate' && r.accuracy === 100), category: 'accuracy'
    },
    {
        id: 'five_perfect', title: 'Sharpshooter', description: '100% accuracy on 5 drills', icon: '🎖️',
        condition: () => getDrillResults().filter(r => r.accuracy === 100).length >= 5, category: 'accuracy'
    },
    {
        id: 'gold_standard', title: 'Gold Standard', description: 'Reach 90% average accuracy', icon: '🥇',
        condition: () => getUserStats().totalAccuracy >= 90, category: 'accuracy'
    },

    // Streak achievements
    {
        id: 'three_day', title: 'Consistent', description: '3-day training streak', icon: '📆',
        condition: () => getUserStats().streak >= 3, category: 'streak'
    },
    {
        id: 'seven_day', title: 'Committed', description: '7-day training streak', icon: '🗓️',
        condition: () => getUserStats().streak >= 7, category: 'streak'
    },
    {
        id: 'thirty_day', title: 'Iron Discipline', description: '30-day training streak', icon: '⚔️',
        condition: () => getUserStats().streak >= 30, category: 'streak'
    },

    // Pressure mode
    {
        id: 'first_pressure', title: 'Under Fire', description: 'Complete a Pressure Mode drill', icon: '🔥',
        condition: () => getDrillResults().some(r => r.type === 'pressure-mode'), category: 'pressure'
    },
    {
        id: 'pressure_ace', title: 'Ice Veins', description: '80%+ accuracy in Pressure Mode', icon: '🧊',
        condition: () => getDrillResults().some(r => r.type === 'pressure-mode' && r.accuracy >= 80), category: 'pressure'
    },
    {
        id: 'pressure_survivor', title: 'Survivor', description: 'Complete 60s Pressure Mode with 70%+ accuracy', icon: '🛡️',
        condition: () => getDrillResults().some(r =>
            r.type === 'pressure-mode' &&
            r.accuracy >= 70 &&
            (r.details as Record<string, unknown>)?.totalTime &&
            ((r.details as Record<string, unknown>).totalTime as number) >= 60
        ), category: 'pressure'
    },

    // Scene snapshots
    {
        id: 'scene_master', title: 'Photographic', description: '90%+ on a Scene Snapshot', icon: '📸',
        condition: () => getDrillResults().some(r => r.type === 'scene-snapshot' && r.accuracy >= 90), category: 'accuracy'
    },

    // Speed achievements
    {
        id: 'speed_demon', title: 'Speed Demon', description: 'Average recall under 3 seconds', icon: '⚡',
        condition: () => getDrillResults().some(r => r.speedMs < 3000 && r.accuracy >= 80), category: 'drill'
    },
];

export function getAchievements(): { achievement: Achievement; unlocked: boolean }[] {
    return ACHIEVEMENTS.map(a => ({
        achievement: a,
        unlocked: a.condition(),
    }));
}

export function getUnlockedCount(): number {
    return ACHIEVEMENTS.filter(a => a.condition()).length;
}

export function getTotalAchievements(): number {
    return ACHIEVEMENTS.length;
}

export function getNewlyUnlocked(previousCount: number): Achievement[] {
    const all = getAchievements();
    const unlocked = all.filter(a => a.unlocked);
    if (unlocked.length > previousCount) {
        return unlocked.slice(previousCount).map(a => a.achievement);
    }
    return [];
}
