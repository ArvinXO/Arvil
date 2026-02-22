// Local-first storage wrapper — all data stays on-device

export interface DrillResult {
    id: string;
    type: 'reg-plate' | 'scene-snapshot' | 'pressure-mode';
    timestamp: number;
    accuracy: number;       // 0-100
    speedMs: number;        // response time in ms
    difficulty: number;     // 1-5
    details: Record<string, unknown>;
}

export interface SpacedItem {
    id: string;
    type: string;
    content: string;
    easeFactor: number;     // starts at 2.5
    interval: number;       // days
    repetitions: number;
    nextReview: number;     // timestamp
    lastReview: number;     // timestamp
}

export interface NDMEntry {
    id: string;
    timestamp: number;
    drillId?: string;
    gather: string;
    assess: string;
    powers: string;
    options: string;
    action: string;
    review: string;
}

export interface UserStats {
    totalDrills: number;
    totalAccuracy: number;
    streak: number;
    lastDrillDate: string;
    bestAccuracy: number;
    platesAttempted: number;
    platesCorrect: number;
    scenesAttempted: number;
    scenesCorrect: number;
}

const KEYS = {
    DRILL_RESULTS: 'arvil_drill_results',
    SPACED_ITEMS: 'arvil_spaced_items',
    NDM_ENTRIES: 'arvil_ndm_entries',
    USER_STATS: 'arvil_user_stats',
} as const;

function isClient(): boolean {
    return typeof window !== 'undefined';
}

function getItem<T>(key: string, fallback: T): T {
    if (!isClient()) return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function setItem<T>(key: string, value: T): void {
    if (!isClient()) return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('Storage write failed:', e);
    }
}

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Drill Results
export function getDrillResults(): DrillResult[] {
    return getItem<DrillResult[]>(KEYS.DRILL_RESULTS, []);
}

export function saveDrillResult(result: DrillResult): void {
    const results = getDrillResults();
    results.push(result);
    setItem(KEYS.DRILL_RESULTS, results);
    updateStats(result);
}

// User Stats
export function getUserStats(): UserStats {
    return getItem<UserStats>(KEYS.USER_STATS, {
        totalDrills: 0,
        totalAccuracy: 0,
        streak: 0,
        lastDrillDate: '',
        bestAccuracy: 0,
        platesAttempted: 0,
        platesCorrect: 0,
        scenesAttempted: 0,
        scenesCorrect: 0,
    });
}

function updateStats(result: DrillResult): void {
    const stats = getUserStats();
    stats.totalDrills++;
    stats.totalAccuracy = ((stats.totalAccuracy * (stats.totalDrills - 1)) + result.accuracy) / stats.totalDrills;
    stats.bestAccuracy = Math.max(stats.bestAccuracy, result.accuracy);

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (stats.lastDrillDate === today) {
        // same day, no streak change
    } else if (stats.lastDrillDate === yesterday) {
        stats.streak++;
    } else {
        stats.streak = 1;
    }
    stats.lastDrillDate = today;

    if (result.type === 'reg-plate') {
        stats.platesAttempted++;
        if (result.accuracy >= 80) stats.platesCorrect++;
    } else if (result.type === 'scene-snapshot') {
        stats.scenesAttempted++;
        if (result.accuracy >= 60) stats.scenesCorrect++;
    }

    setItem(KEYS.USER_STATS, stats);
}

// Spaced Items
export function getSpacedItems(): SpacedItem[] {
    return getItem<SpacedItem[]>(KEYS.SPACED_ITEMS, []);
}

export function saveSpacedItem(item: SpacedItem): void {
    const items = getSpacedItems();
    const existing = items.findIndex(i => i.id === item.id);
    if (existing >= 0) {
        items[existing] = item;
    } else {
        items.push(item);
    }
    setItem(KEYS.SPACED_ITEMS, items);
}

export function getDueItems(): SpacedItem[] {
    const items = getSpacedItems();
    const now = Date.now();
    return items.filter(item => item.nextReview <= now);
}

// NDM Entries
export function getNDMEntries(): NDMEntry[] {
    return getItem<NDMEntry[]>(KEYS.NDM_ENTRIES, []);
}

export function saveNDMEntry(entry: NDMEntry): void {
    const entries = getNDMEntries();
    entries.push(entry);
    setItem(KEYS.NDM_ENTRIES, entries);
}

// Export/Import
export function exportAllData(): string {
    return JSON.stringify({
        drillResults: getDrillResults(),
        spacedItems: getSpacedItems(),
        ndmEntries: getNDMEntries(),
        userStats: getUserStats(),
        exportDate: new Date().toISOString(),
    }, null, 2);
}

export function clearAllData(): void {
    if (!isClient()) return;
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}
