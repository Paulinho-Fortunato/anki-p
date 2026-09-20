/**
 * Testes unitários para o algoritmo SRS (Spaced Repetition System)
 */

import { calculateNextInterval, RATING, getNextReviewDate } from '../src/services/srsService';

describe('SRS Service - Spaced Repetition Algorithm', () => {
  describe('RATING enum', () => {
    it('deve ter valores de 1 a 4', () => {
      expect(RATING.FORGOT).toBe(1);
      expect(RATING.PARTIAL).toBe(2);
      expect(RATING.REMEMBERED).toBe(3);
      expect(RATING.EASY).toBe(4);
    });

    it('deve mapear corretamente para descrições', () => {
      const ratingMap: Record<number, string> = {
        1: 'Não lembrei',
        2: 'Parcialmente',
        3: 'Lembrei',
        4: 'Facilmente',
      };

      expect(ratingMap[RATING.FORGOT]).toBe('Não lembrei');
      expect(ratingMap[RATING.EASY]).toBe('Facilmente');
    });
  });

  describe('calculateNextInterval', () => {
    const defaultEase = 2.5;

    it('deve resetar para intervalo mínimo quando rating FORGOT', () => {
      const result = calculateNextInterval(30, defaultEase, RATING.FORGOT);
      
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeLessThan(defaultEase);
    });

    it('deve reduzir intervalo quando rating PARTIAL', () => {
      const result = calculateNextInterval(7, defaultEase, RATING.PARTIAL);
      
      expect(result.interval).toBeLessThan(7);
      expect(result.interval).toBeGreaterThanOrEqual(1);
    });

    it('deve aumentar intervalo progressivamente quando rating REMEMBERED', () => {
      const result = calculateNextInterval(7, defaultEase, RATING.REMEMBERED);
      
      expect(result.interval).toBeGreaterThan(7);
      expect(result.easeFactor).toBeGreaterThan(defaultEase);
    });

    it('deve aumentar intervalo significativamente quando rating EASY', () => {
      const result = calculateNextInterval(7, defaultEase, RATING.EASY);
      
      expect(result.interval).toBeGreaterThan(7 * 1.3);
      expect(result.easeFactor).toBeGreaterThan(defaultEase);
    });

    it('deve respeitar limite mínimo do ease factor (1.3)', () => {
      const lowEase = 1.4;
      const result = calculateNextInterval(5, lowEase, RATING.FORGOT);
      
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('deve respeitar limite máximo do ease factor (3.0)', () => {
      const highEase = 2.95;
      const result = calculateNextInterval(30, highEase, RATING.EASY);
      
      expect(result.easeFactor).toBeLessThanOrEqual(3.0);
    });

    it('deve usar base intervals [1, 7, 15, 30] para progressão normal', () => {
      // Do início para primeiro intervalo
      const result1 = calculateNextInterval(1, defaultEase, RATING.REMEMBERED);
      expect(result1.interval).toBeGreaterThanOrEqual(7);

      // De 7 para próximo
      const result2 = calculateNextInterval(7, defaultEase, RATING.REMEMBERED);
      expect(result2.interval).toBeGreaterThanOrEqual(15);
    });

    it('deve aplicar multiplicação por ease após atingir max base interval', () => {
      const result = calculateNextInterval(30, defaultEase, RATING.REMEMBERED);
      
      expect(result.interval).toBeGreaterThan(30);
    });

    it('deve respeitar intervalo máximo de 365 dias', () => {
      const result = calculateNextInterval(300, 2.8, RATING.EASY);
      
      expect(result.interval).toBeLessThanOrEqual(365);
    });

    it('deve retornar ease factor atualizado corretamente', () => {
      const testCases = [
        { rating: RATING.FORGOT, expectedChange: 'decrease' },
        { rating: RATING.PARTIAL, expectedChange: 'decrease' },
        { rating: RATING.REMEMBERED, expectedChange: 'increase' },
        { rating: RATING.EASY, expectedChange: 'increase' },
      ];

      testCases.forEach(({ rating, expectedChange }) => {
        const result = calculateNextInterval(7, defaultEase, rating);
        
        if (expectedChange === 'decrease') {
          expect(result.easeFactor).toBeLessThanOrEqual(defaultEase);
        } else {
          expect(result.easeFactor).toBeGreaterThanOrEqual(defaultEase);
        }
      });
    });
  });

  describe('getNextReviewDate', () => {
    it('deve retornar data ISO string válida', () => {
      const result = getNextReviewDate(1);
      
      expect(typeof result).toBe('string');
      expect(() => new Date(result)).not.toThrow();
    });

    it('deve calcular data futura correta para 1 dia', () => {
      const before = new Date();
      const result = getNextReviewDate(1);
      const after = new Date(result);
      const diffDays = Math.floor((after.getTime() - before.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBeGreaterThanOrEqual(0);
      expect(diffDays).toBeLessThanOrEqual(2);
    });

    it('deve calcular data futura correta para 7 dias', () => {
      const before = new Date();
      const result = getNextReviewDate(7);
      const after = new Date(result);
      const diffDays = Math.floor((after.getTime() - before.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBeGreaterThanOrEqual(6);
      expect(diffDays).toBeLessThanOrEqual(8);
    });

    it('deve calcular data futura correta para 30 dias', () => {
      const before = new Date();
      const result = getNextReviewDate(30);
      const after = new Date(result);
      const diffDays = Math.floor((after.getTime() - before.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBeGreaterThanOrEqual(29);
      expect(diffDays).toBeLessThanOrEqual(31);
    });
  });

  describe('Casos extremos e edge cases', () => {
    it('deve lidar com intervalo zero', () => {
      const result = calculateNextInterval(0, 2.5, RATING.REMEMBERED);
      
      expect(result.interval).toBeGreaterThan(0);
    });

    it('deve lidar com intervalo muito grande', () => {
      const result = calculateNextInterval(365, 2.5, RATING.EASY);
      
      expect(result.interval).toBeLessThanOrEqual(365);
    });

    it('deve lidar com ease factor no mínimo (1.3)', () => {
      const result = calculateNextInterval(7, 1.3, RATING.REMEMBERED);
      
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
      expect(result.interval).toBeGreaterThan(0);
    });

    it('deve lidar com ease factor no máximo (3.0)', () => {
      const result = calculateNextInterval(7, 3.0, RATING.FORGOT);
      
      expect(result.easeFactor).toBeLessThanOrEqual(3.0);
    });

    it('deve ser consistente em múltiplas chamadas', () => {
      const results = Array.from({ length: 5 }, () => 
        calculateNextInterval(7, 2.5, RATING.REMEMBERED)
      );

      // Todos devem ter mesmo intervalo para mesma entrada
      const firstInterval = results[0].interval;
      results.forEach(r => {
        expect(r.interval).toBe(firstInterval);
      });
    });
  });

  describe('Simulação de ciclo completo de revisões', () => {
    it('deve progredir através de intervalos com ratings consistently bons', () => {
      let interval = 1;
      let ease = 2.5;
      const intervals: number[] = [];

      // Simula 6 revisões consecutivas com rating REMEMBERED
      for (let i = 0; i < 6; i++) {
        const result = calculateNextInterval(interval, ease, RATING.REMEMBERED);
        intervals.push(result.interval);
        interval = result.interval;
        ease = result.easeFactor;
      }

      // Intervalos devem crescer progressivamente
      for (let i = 1; i < intervals.length; i++) {
        expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]);
      }

      // Último intervalo deve ser significativamente maior que o primeiro
      expect(intervals[intervals.length - 1]).toBeGreaterThan(intervals[0] * 2);
    });

    it('deve resetar progresso com rating FORGOT após boa sequência', () => {
      let interval = 30;
      let ease = 2.8;

      // Simula boa sequência
      for (let i = 0; i < 3; i++) {
        const result = calculateNextInterval(interval, ease, RATING.REMEMBERED);
        interval = result.interval;
        ease = result.easeFactor;
      }

      const goodInterval = interval;

      // Agora esquece
      const forgotResult = calculateNextInterval(interval, ease, RATING.FORGOT);
      
      expect(forgotResult.interval).toBe(1);
      expect(forgotResult.easeFactor).toBeLessThan(ease);
    });

    it('deve mostrar diferença entre estratégias de estudo', () => {
      // Estratégia 1: Sempre fácil
      let intervalEasy = 1;
      let easeEasy = 2.5;
      for (let i = 0; i < 4; i++) {
        const result = calculateNextInterval(intervalEasy, easeEasy, RATING.EASY);
        intervalEasy = result.interval;
        easeEasy = result.easeFactor;
      }

      // Estratégia 2: Sempre parcial
      let intervalPartial = 1;
      let easePartial = 2.5;
      for (let i = 0; i < 4; i++) {
        const result = calculateNextInterval(intervalPartial, easePartial, RATING.PARTIAL);
        intervalPartial = result.interval;
        easePartial = result.easeFactor;
      }

      // Estratégia fácil deve resultar em intervalo maior
      expect(intervalEasy).toBeGreaterThan(intervalPartial);
    });
  });
});
