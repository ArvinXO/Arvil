// SM-2 Spaced Repetition Algorithm (same family as Anki)
// Adapted for drill-based training items

import { type SpacedItem, saveSpacedItem, generateId } from './storage';

export interface ReviewGrade {
    quality: number; // 0-5 (0=complete fail, 5=perfect recall)
}

/**
 * SM-2 Algorithm:
 * - quality 0-2: reset to beginning (failed recall)
 * - quality 3-5: advance interval
 * 
 * New interval = old_interval * ease_factor
 * Ease factor adjusted based on quality
 */
export function processReview(item: SpacedItem, grade: ReviewGrade): SpacedItem {
    const { quality } = grade;
    let { easeFactor, interval, repetitions } = item;

    if (quality < 3) {
        // Failed — reset
        repetitions = 0;
        interval = 1;
    } else {
        // Passed — advance
        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        repetitions++;
    }

    // Adjust ease factor (minimum 1.3)
    easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    const updated: SpacedItem = {
        ...item,
        easeFactor,
        interval,
        repetitions,
        lastReview: Date.now(),
        nextReview: Date.now() + interval * 24 * 60 * 60 * 1000,
    };

    saveSpacedItem(updated);
    return updated;
}

/**
 * Create a new spaced item from a drill result
 */
export function createSpacedItem(
    type: string,
    content: string,
): SpacedItem {
    const item: SpacedItem = {
        id: generateId(),
        type,
        content,
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        nextReview: Date.now() + 24 * 60 * 60 * 1000, // Review tomorrow
        lastReview: Date.now(),
    };

    saveSpacedItem(item);
    return item;
}

/**
 * Convert accuracy percentage to SM-2 quality grade
 */
export function accuracyToQuality(accuracy: number): number {
    if (accuracy >= 95) return 5;
    if (accuracy >= 80) return 4;
    if (accuracy >= 60) return 3;
    if (accuracy >= 40) return 2;
    if (accuracy >= 20) return 1;
    return 0;
}

/**
 * Get competency level based on accuracy
 */
export function getCompetencyLevel(accuracy: number): {
    level: 'bronze' | 'silver' | 'gold';
    label: string;
    color: string;
} {
    if (accuracy >= 90) {
        return { level: 'gold', label: 'GOLD', color: '#fbbf24' };
    }
    if (accuracy >= 70) {
        return { level: 'silver', label: 'SILVER', color: '#94a3b8' };
    }
    return { level: 'bronze', label: 'BRONZE', color: '#d97706' };
}
