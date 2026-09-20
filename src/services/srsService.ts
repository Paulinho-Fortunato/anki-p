/**
 * Spaced Repetition System (SRS) Service
 * Based on SM-2 algorithm with adaptations for mobile learning
 * Intervals: customizable via settingsStore, adaptive based on performance
 */

import { ConceptRepository, FlashcardRepository, ReviewRepository } from '../db/repositories';
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
    // Use configured interval for "forgot" (usually 0 or 1 day), minimum 1
    newInterval = Math.max(1, activeConfig.intervals.forgot);
  } else if (rating === RATING.PARTIAL) {
    // Use configured interval for "partial"
    newInterval = activeConfig.intervals.partial;
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

  const currentInterval = concept.next_review_at
    ? Math.floor((new Date().getTime() - new Date(concept.next_review_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const easeFactor = concept.difficulty > 0 ? 2.5 + (concept.difficulty - 0.5) * 0.5 : 2.5;

  const { interval, easeFactor: newEaseFactor } = calculateNextInterval(
    Math.max(1, currentInterval),
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
    ? Math.floor((new Date().getTime() - new Date(flashcard.next_review_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const easeFactor = flashcard.difficulty > 0 ? 2.5 + (flashcard.difficulty - 0.5) * 0.5 : 2.5;

  const { interval, easeFactor: newEaseFactor } = calculateNextInterval(
    Math.max(1, currentInterval),
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
  const db = require('@db/schema').getDatabase();
  const now = new Date().toISOString();
  
  let query = `
    SELECT c.* FROM concepts c
    WHERE c.next_review_at IS NULL OR c.next_review_at <= ?
    ORDER BY c.next_review_at ASC, c.created_at ASC
  `;
  
  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  
  return db.getAllSync(query, [now]);
}

/**
 * Get flashcards due for review
 */
export function getDueFlashcards(limit?: number): any[] {
  const db = require('@db/schema').getDatabase();
  const now = new Date().toISOString();
  
  let query = `
    SELECT f.* FROM flashcards f
    WHERE f.next_review_at IS NULL OR f.next_review_at <= ?
    ORDER BY f.next_review_at ASC, f.created_at ASC
  `;
  
  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  
  return db.getAllSync(query, [now]);
}

/**
 * Get review statistics
 */
export function getReviewStats(days: number = 7): {
  totalReviews: number;
  averageRating: number;
  reviewsByDay: Array<{ date: string; count: number }>;
} {
  const db = require('@db/schema').getDatabase();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const reviews = db.getAllSync(
    'SELECT reviewed_at, rating FROM reviews WHERE date(reviewed_at) >= date(?)',
    [startDate.toISOString()]
  ) as { reviewed_at: string; rating: number }[];

  const reviewsByDay: Record<string, number> = {};
  let totalRating = 0;

  (reviews as Array<{ reviewed_at: string; rating: number }>).forEach((review: { reviewed_at: string; rating: number }) => {
    const date = review.reviewed_at.split('T')[0];
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
