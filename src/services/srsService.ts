/**
 * Spaced Repetition System (SRS) Service
 * Based on SM-2 algorithm with adaptations for mobile learning
 * Intervals: customizable via settingsStore, adaptive based on performance
 */

import { ConceptRepository, FlashcardRepository, ReviewRepository } from '../db/repositories';
import { getDatabase } from '../db/schema';
import { isoToLocalDateStr } from '@utils/date';
import { getSRSSettings, DEFAULT_SRS_SETTINGS, type SRSSettings, type SRSIntervals } from '../store/settingsStore';

// Rating scale (1-4)
export const RATING = {
  FORGOT: 1,      // "Não lembrei"
  PARTIAL: 2,     // "Parcialmente"
  REMEMBERED: 3,  // "Lembrei"
  EASY: 4,        // "Facilmente"
} as const;

export type Rating = typeof RATING[keyof typeof RATING];

interface SRSConfig {
  minInterval: number;
  maxInterval: number;
  easeFactor: number;
  intervals: SRSIntervals;
}

/**
 * Get current SRS configuration from user settings
 */
function getSRSConfig(): SRSConfig {
  const settings = getSRSSettings();
  return {
    minInterval: Math.max(0, settings.intervals.forgot),
    maxInterval: settings.maxInterval,
    easeFactor: settings.easeFactor,
    intervals: settings.intervals,
  };
}

/**
 * Calculate next review interval based on rating and current state
 * Uses user-customized intervals from settings
 */
export function calculateNextInterval(
  currentInterval: number,
  easeFactor: number,
  rating: Rating,
  config?: SRSConfig
): { interval: number; easeFactor: number } {
  const activeConfig = config || getSRSConfig();
  let newEaseFactor = easeFactor;
  let newInterval: number;

  // Update ease factor (SM-2 style)
  if (rating === RATING.EASY) {
    newEaseFactor = Math.min(3.0, easeFactor + 0.15);
  } else if (rating === RATING.REMEMBERED) {
    newEaseFactor = Math.max(1.3, easeFactor + 0.1);
  } else if (rating === RATING.PARTIAL) {
    newEaseFactor = Math.max(1.3, easeFactor - 0.1);
  } else {
    // Forgot
    newEaseFactor = Math.max(1.3, easeFactor - 0.2);
  }

  // Calculate new interval based on user settings
  if (rating === RATING.FORGOT) {
    // Forgot: reset to the configured "forgot" interval (usually same-day/1).
    // Do NOT grow from the previous interval - memory lapsed, start over.
    newInterval = Math.max(0, activeConfig.intervals.forgot);
  } else if (rating === RATING.PARTIAL) {
    // Partial recall: don't grow; fall back to the configured "partial"
    // interval (or half of the current one, whichever keeps progress without
    // over-promising a card the user only half-remembered).
    if (currentInterval > activeConfig.intervals.partial) {
      newInterval = Math.max(activeConfig.intervals.partial, Math.floor(currentInterval / 2));
    } else {
      newInterval = activeConfig.intervals.partial;
    }
  } else if (rating === RATING.REMEMBERED) {
    // Use configured base interval or grow by ease factor
    if (currentInterval < activeConfig.intervals.remembered) {
      newInterval = activeConfig.intervals.remembered;
    } else {
      newInterval = Math.floor(currentInterval * newEaseFactor);
    }
  } else {
    // Easy - use configured interval or grow significantly
    if (currentInterval < activeConfig.intervals.easy) {
      newInterval = activeConfig.intervals.easy;
    } else {
      newInterval = Math.floor(currentInterval * newEaseFactor * 1.2);
    }
  }

  // Clamp to max interval
  newInterval = Math.min(newInterval, activeConfig.maxInterval);
  // Ensure minimum is 0 (same day review allowed)
  newInterval = Math.max(0, newInterval);

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
  };
}

/**
 * Get the next review date as ISO string
 */
export function getNextReviewDate(intervalDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + intervalDays);
  return date.toISOString();
}

/**
 * Derive the SM-2 ease factor from the stored difficulty value.
 * The schema stores difficulty as 1/ease (0.5 default => ease 2.0, matching
 * SM-2's initial EF). Falls back to 2.5 for legacy/unset rows.
 */
export function easeFromDifficulty(difficulty: number): number {
  if (!difficulty || difficulty <= 0) return 2.5;
  const ef = 1 / difficulty;
  return Math.min(3.0, Math.max(1.3, ef));
}

/**
 * Process a review submission for a concept
 */
export function processConceptReview(
  conceptId: string,
  rating: Rating
): { concept: any; review: any } {
  const concept = ConceptRepository.getById(conceptId);
  if (!concept) {
    throw new Error('Concept not found');
  }

  // The "current interval" is the one that was actually scheduled and just
  // elapsed: derived from the previous review date up to the due date
  // (next_review_at), NOT from how late the user happened to be. Being late
  // must not inflate the next interval.
  const currentInterval = concept.next_review_at
    ? (() => {
        const dueMs = new Date(concept.next_review_at).getTime();
        const lastMs = concept.last_reviewed_at
          ? new Date(concept.last_reviewed_at).getTime()
          : dueMs - 24 * 60 * 60 * 1000; // first scheduled review: treat as ~1 day
        return Math.max(0, Math.round((dueMs - lastMs) / (1000 * 60 * 60 * 24)));
      })()
    : 0;

  const easeFactor = easeFromDifficulty(concept.difficulty);

  const { interval, easeFactor: newEaseFactor } = calculateNextInterval(
    currentInterval,
    easeFactor,
    rating
  );

  const nextReviewAt = getNextReviewDate(interval);
  const now = new Date().toISOString();

  // Update concept
  const updatedConcept = ConceptRepository.update(conceptId, {
    last_reviewed_at: now,
    next_review_at: nextReviewAt,
    review_count: concept.review_count + 1,
    difficulty: 1 / newEaseFactor, // Store inverse of ease as difficulty
    mastery_level: Math.min(1, concept.mastery_level + (rating / 4) * 0.1),
  });

  // Create review record
  const review = ReviewRepository.create({
    concept_id: conceptId,
    rating,
    interval_days: interval,
    ease_factor: newEaseFactor,
  });

  return { concept: updatedConcept, review };
}

/**
 * Process a review submission for a flashcard
 */
export function processFlashcardReview(
  flashcardId: string,
  rating: Rating
): { flashcard: any; review: any } {
  const flashcard = FlashcardRepository.getById(flashcardId);
  if (!flashcard) {
    throw new Error('Flashcard not found');
  }

  const currentInterval = flashcard.next_review_at
    ? (() => {
        const dueMs = new Date(flashcard.next_review_at).getTime();
        const lastMs = flashcard.last_reviewed_at
          ? new Date(flashcard.last_reviewed_at).getTime()
          : dueMs - 24 * 60 * 60 * 1000; // first scheduled review: treat as ~1 day
        return Math.max(0, Math.round((dueMs - lastMs) / (1000 * 60 * 60 * 24)));
      })()
    : 0;

  const easeFactor = easeFromDifficulty(flashcard.difficulty);

  const { interval, easeFactor: newEaseFactor } = calculateNextInterval(
    currentInterval,
    easeFactor,
    rating
  );

  const nextReviewAt = getNextReviewDate(interval);
  const now = new Date().toISOString();

  // Update flashcard
  const updatedFlashcard = FlashcardRepository.update(flashcardId, {
    last_reviewed_at: now,
    next_review_at: nextReviewAt,
    review_count: flashcard.review_count + 1,
    difficulty: 1 / newEaseFactor,
  });

  // Create review record
  const review = ReviewRepository.create({
    flashcard_id: flashcardId,
    rating,
    interval_days: interval,
    ease_factor: newEaseFactor,
  });

  return { flashcard: updatedFlashcard, review };
}

/**
 * Get concepts due for review
 */
export function getDueConcepts(limit?: number): any[] {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  let query = `
    SELECT c.* FROM concepts c
    WHERE c.next_review_at IS NULL OR c.next_review_at <= ?
    ORDER BY c.next_review_at ASC, c.created_at ASC
  `;
  const params: (string | number)[] = [now];
  
  if (limit && Number.isFinite(limit) && limit > 0) {
    query += ` LIMIT ?`;
    params.push(Math.floor(limit));
  }
  
  return db.getAllSync(query, params);
}

/**
 * Get flashcards due for review
 */
export function getDueFlashcards(limit?: number): any[] {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  let query = `
    SELECT f.* FROM flashcards f
    WHERE f.next_review_at IS NULL OR f.next_review_at <= ?
    ORDER BY f.next_review_at ASC, f.created_at ASC
  `;
  const params: (string | number)[] = [now];
  
  if (limit && Number.isFinite(limit) && limit > 0) {
    query += ` LIMIT ?`;
    params.push(Math.floor(limit));
  }
  
  return db.getAllSync(query, params);
}

/**
 * Get review statistics
 */
export function getReviewStats(days: number = 7): {
  totalReviews: number;
  averageRating: number;
  reviewsByDay: Array<{ date: string; count: number }>;
} {
  const db = getDatabase();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const reviews = db.getAllSync(
    'SELECT reviewed_at, rating FROM reviews WHERE date(reviewed_at) >= date(?)',
    [startDate.toISOString()]
  ) as { reviewed_at: string; rating: number }[];

  const reviewsByDay: Record<string, number> = {};
  let totalRating = 0;

  reviews.forEach((review) => {
    // Bucket by LOCAL calendar date so the "day" flips at local midnight,
    // not at 03:00 BRT (UTC boundary).
    const date = isoToLocalDateStr(review.reviewed_at);
    if (!date) return;
    reviewsByDay[date] = (reviewsByDay[date] || 0) + 1;
    totalRating += review.rating;
  });

  return {
    totalReviews: reviews.length,
    averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
    reviewsByDay: Object.entries(reviewsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}
