/**
 * SRS Service Tests
 * Tests for spaced repetition algorithm
 */

import { calculateNextInterval, getNextReviewDate, RATING } from '../src/services/srsService';

describe('SRS Service', () => {
  describe('calculateNextInterval', () => {
    it('should reset interval when user forgets', () => {
      const result = calculateNextInterval(30, 2.5, RATING.FORGOT);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('should give short interval for partial recall', () => {
      const result = calculateNextInterval(15, 2.5, RATING.PARTIAL);
      expect(result.interval).toBeLessThan(15);
    });

    it('should extend interval for easy items', () => {
      const result = calculateNextInterval(30, 2.5, RATING.EASY);
      expect(result.interval).toBeGreaterThan(30);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it('should progress normally for remembered items', () => {
      const result = calculateNextInterval(7, 2.5, RATING.REMEMBERED);
      expect(result.interval).toBeGreaterThanOrEqual(7);
    });

    it('should clamp interval to max value', () => {
      const result = calculateNextInterval(365, 3.0, RATING.EASY);
      expect(result.interval).toBeLessThanOrEqual(365);
    });

    it('should clamp ease factor between 1.3 and 3.0', () => {
      const forgotResult = calculateNextInterval(1, 1.5, RATING.FORGOT);
      expect(forgotResult.easeFactor).toBeGreaterThanOrEqual(1.3);

      const easyResult = calculateNextInterval(1, 2.9, RATING.EASY);
      expect(easyResult.easeFactor).toBeLessThanOrEqual(3.0);
    });
  });

  describe('getNextReviewDate', () => {
    it('should return ISO string format', () => {
      const result = getNextReviewDate(7);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
