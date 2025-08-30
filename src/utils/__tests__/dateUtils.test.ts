import {
  getTodayDate,
  formatDateForDisplay,
  getDateDaysAgo,
  isValidDateString,
  getDaysDifference,
  getLastNDays
} from '../dateUtils';

describe('dateUtils', () => {
  describe('getTodayDate', () => {
    it('should return today\'s date in YYYY-MM-DD format', () => {
      const today = getTodayDate();
      const expected = new Date().toISOString().split('T')[0];
      
      expect(today).toBe(expected);
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return consistent results when called multiple times within the same day', () => {
      const date1 = getTodayDate();
      const date2 = getTodayDate();
      
      expect(date1).toBe(date2);
    });
  });

  describe('formatDateForDisplay', () => {
    it('should format date string correctly', () => {
      const dateString = '2024-01-15';
      const formatted = formatDateForDisplay(dateString);
      
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should handle different dates correctly', () => {
      const testCases = [
        { input: '2024-01-01', expected: 'Monday, January 1, 2024' },
        { input: '2024-12-31', expected: 'Tuesday, December 31, 2024' },
        { input: '2023-07-04', expected: 'Tuesday, July 4, 2023' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = formatDateForDisplay(input);
        expect(result).toBe(expected);
      });
    });

    it('should handle leap year dates correctly', () => {
      const leapYearDate = '2024-02-29';
      const formatted = formatDateForDisplay(leapYearDate);
      
      expect(formatted).toContain('February');
      expect(formatted).toContain('29');
      expect(formatted).toContain('2024');
    });
  });

  describe('getDateDaysAgo', () => {
    it('should return yesterday when passed 1', () => {
      const yesterday = getDateDaysAgo(1);
      const today = new Date();
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - 1);
      const expected = expectedDate.toISOString().split('T')[0];
      
      expect(yesterday).toBe(expected);
    });

    it('should return today when passed 0', () => {
      const today = getDateDaysAgo(0);
      const expected = new Date().toISOString().split('T')[0];
      
      expect(today).toBe(expected);
    });

    it('should handle large numbers correctly', () => {
      const hundredDaysAgo = getDateDaysAgo(100);
      const today = new Date();
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - 100);
      const expected = expectedDate.toISOString().split('T')[0];
      
      expect(hundredDaysAgo).toBe(expected);
      expect(hundredDaysAgo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle month/year boundaries correctly', () => {
      // Mock the Date constructor to return a fixed date
      const mockDate = new Date('2024-01-01');
      const OriginalDate = Date;
      
      // @ts-ignore
      global.Date = jest.fn().mockImplementation(() => mockDate);
      global.Date.now = OriginalDate.now;
      global.Date.UTC = OriginalDate.UTC;
      global.Date.parse = OriginalDate.parse;

      const thirtyDaysAgo = getDateDaysAgo(30);
      expect(thirtyDaysAgo).toBe('2023-12-02');

      // Restore
      global.Date = OriginalDate;
    });
  });

  describe('isValidDateString', () => {
    it('should validate correct date format', () => {
      const validDates = [
        '2024-01-15',
        '2023-12-31',
        '2000-02-29', // Leap year
        '1999-01-01'
      ];

      validDates.forEach(date => {
        expect(isValidDateString(date)).toBe(true);
      });
    });

    it('should reject invalid date formats', () => {
      const invalidDates = [
        '24-01-15',        // Wrong year format
        '2024-1-15',       // Wrong month format
        '2024-01-5',       // Wrong day format
        '2024/01/15',      // Wrong separator
        '15-01-2024',      // Wrong order
        '2024-13-01',      // Invalid month
        '2024-01-32',      // Invalid day
        '2023-02-29',      // Not a leap year
        'not-a-date',      // Not a date
        '',                // Empty string
        '2024-01',         // Incomplete
        '2024-01-15-01'    // Too many parts
      ];

      invalidDates.forEach(date => {
        expect(isValidDateString(date)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(isValidDateString('2000-02-29')).toBe(true);  // Leap year
      expect(isValidDateString('2100-02-29')).toBe(false); // Not a leap year (century)
      expect(isValidDateString('2000-02-30')).toBe(false); // February doesn't have 30 days
      expect(isValidDateString('2024-04-31')).toBe(false); // April doesn't have 31 days
    });
  });

  describe('getDaysDifference', () => {
    it('should calculate difference between same dates', () => {
      const diff = getDaysDifference('2024-01-15', '2024-01-15');
      expect(diff).toBe(0);
    });

    it('should calculate difference between consecutive dates', () => {
      const diff = getDaysDifference('2024-01-15', '2024-01-16');
      expect(diff).toBe(1);
    });

    it('should calculate difference regardless of date order', () => {
      const diff1 = getDaysDifference('2024-01-15', '2024-01-20');
      const diff2 = getDaysDifference('2024-01-20', '2024-01-15');
      
      expect(diff1).toBe(5);
      expect(diff2).toBe(5);
    });

    it('should handle month boundaries', () => {
      const diff = getDaysDifference('2024-01-31', '2024-02-01');
      expect(diff).toBe(1);
    });

    it('should handle year boundaries', () => {
      const diff = getDaysDifference('2023-12-31', '2024-01-01');
      expect(diff).toBe(1);
    });

    it('should handle leap years', () => {
      const diff = getDaysDifference('2024-02-28', '2024-03-01');
      expect(diff).toBe(2); // 2024 is a leap year, so Feb has 29 days
    });

    it('should handle large differences', () => {
      const diff = getDaysDifference('2024-01-01', '2024-12-31');
      expect(diff).toBe(365); // 2024 is a leap year
    });
  });

  describe('getLastNDays', () => {
    it('should return array of correct length', () => {
      const days = getLastNDays(7);
      expect(days).toHaveLength(7);
    });

    it('should return dates in chronological order (oldest to newest)', () => {
      const days = getLastNDays(3);
      
      expect(days).toHaveLength(3);
      
      // Each date should be one day after the previous
      for (let i = 1; i < days.length; i++) {
        const diff = getDaysDifference(days[i - 1], days[i]);
        expect(diff).toBe(1);
      }
    });

    it('should include today as the last date', () => {
      const days = getLastNDays(5);
      const today = getTodayDate();
      
      expect(days[days.length - 1]).toBe(today);
    });

    it('should handle edge case of 1 day', () => {
      const days = getLastNDays(1);
      const today = getTodayDate();
      
      expect(days).toHaveLength(1);
      expect(days[0]).toBe(today);
    });

    it('should handle edge case of 0 days', () => {
      const days = getLastNDays(0);
      expect(days).toHaveLength(0);
      expect(days).toEqual([]);
    });

    it('should return valid date strings', () => {
      const days = getLastNDays(10);
      
      days.forEach(day => {
        expect(isValidDateString(day)).toBe(true);
      });
    });

    it('should handle larger ranges correctly', () => {
      const days = getLastNDays(365);
      
      expect(days).toHaveLength(365);
      expect(days[days.length - 1]).toBe(getTodayDate());
      
      // All dates should be valid
      days.forEach(day => {
        expect(isValidDateString(day)).toBe(true);
      });
      
      // First and last dates should be 364 days apart
      const diff = getDaysDifference(days[0], days[days.length - 1]);
      expect(diff).toBe(364);
    });
  });

  describe('integration tests', () => {
    it('should work together for common use cases', () => {
      const today = getTodayDate();
      const yesterday = getDateDaysAgo(1);
      const lastWeek = getLastNDays(7);
      
      expect(isValidDateString(today)).toBe(true);
      expect(isValidDateString(yesterday)).toBe(true);
      expect(getDaysDifference(yesterday, today)).toBe(1);
      expect(lastWeek[lastWeek.length - 1]).toBe(today);
      expect(lastWeek[lastWeek.length - 2]).toBe(yesterday);
    });

    it('should format dates consistently', () => {
      const dates = getLastNDays(3);
      
      dates.forEach(date => {
        expect(isValidDateString(date)).toBe(true);
        const formatted = formatDateForDisplay(date);
        expect(formatted).toBeTruthy();
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
        // Should contain day of week, month, day, and year
        expect(formatted).toMatch(/\w+,\s+\w+\s+\d+,\s+\d{4}/);
      });
    });
  });
});