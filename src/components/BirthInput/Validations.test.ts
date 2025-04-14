/**
 * Validation.test.ts
 *
 * Tests for the Validation class.
 * Run these tests using a test runner like Jest.
 */
import { Validation } from './Validations';

describe('Validation', () => {
    describe('validateDate', () => {
        test('should return true for valid date format (YYYY-MM-DD)', () => {
            expect(Validation.validateDate('2025-04-12')).toBe(true);
            expect(Validation.validateDate('1999-12-31')).toBe(true);
        });

        test('should return false for invalid date formats', () => {
            expect(Validation.validateDate('04/12/2025')).toBe(false);
            expect(Validation.validateDate('2025/04/12')).toBe(false);
            expect(Validation.validateDate('20250412')).toBe(false);
        });
    });

    describe('validateTime', () => {
        test('should return true for valid time (HH:MM)', () => {
            expect(Validation.validateTime('23:45')).toBe(true);
            expect(Validation.validateTime('00:00')).toBe(true);
        });

        test('should return true for valid time with seconds (HH:MM:SS)', () => {
            expect(Validation.validateTime('14:30:15')).toBe(true);
            expect(Validation.validateTime('09:05:59')).toBe(true);
        });

        test('should return false for invalid time formats', () => {
            expect(Validation.validateTime('24:00')).toBe(false);
            expect(Validation.validateTime('12:60')).toBe(false);
            expect(Validation.validateTime('abc')).toBe(false);
            expect(Validation.validateTime('1:30')).toBe(false);
        });
    });

    describe('validateTimezone', () => {
        test('should return true for valid numeric timezone values', () => {
            expect(Validation.validateTimezone('330')).toBe(true);
            expect(Validation.validateTimezone('-60')).toBe(true);
        });

        test('should return false for non-numeric timezone values', () => {
            expect(Validation.validateTimezone('abc')).toBe(false);
            expect(Validation.validateTimezone('')).toBe(false);
        });
    });

    describe('validateLatitude', () => {
        test('should accept valid latitude values between -90 and 90', () => {
            expect(Validation.validateLatitude('0')).toBe(true);
            expect(Validation.validateLatitude('45.123')).toBe(true);
            expect(Validation.validateLatitude('-89.999')).toBe(true);
        });

        test('should reject latitude values out of range or non-numeric', () => {
            expect(Validation.validateLatitude('91')).toBe(false);
            expect(Validation.validateLatitude('-91')).toBe(false);
            expect(Validation.validateLatitude('abc')).toBe(false);
        });
    });

    describe('validateLongitude', () => {
        test('should accept valid longitude values between -180 and 180', () => {
            expect(Validation.validateLongitude('0')).toBe(true);
            expect(Validation.validateLongitude('120.456')).toBe(true);
            expect(Validation.validateLongitude('-179.999')).toBe(true);
        });

        test('should reject longitude values out of range or non-numeric', () => {
            expect(Validation.validateLongitude('181')).toBe(false);
            expect(Validation.validateLongitude('-181')).toBe(false);
            expect(Validation.validateLongitude('abc')).toBe(false);
        });
    });

    describe('validateLocationName', () => {
        test('should return true for non-empty location names', () => {
            expect(Validation.validateLocationName('New Delhi')).toBe(true);
            expect(Validation.validateLocationName('  Mumbai  ')).toBe(true);
        });

        test('should return false for empty or whitespace-only names', () => {
            expect(Validation.validateLocationName('')).toBe(false);
            expect(Validation.validateLocationName('   ')).toBe(false);
        });
    });

    describe('validateAltitude', () => {
        test('should return true for valid numeric altitude', () => {
            expect(Validation.validateAltitude('100')).toBe(true);
            expect(Validation.validateAltitude('-50')).toBe(true);
            expect(Validation.validateAltitude('0')).toBe(true);
        });

        test('should return true for empty altitude (optional field)', () => {
            expect(Validation.validateAltitude('')).toBe(true);
            expect(Validation.validateAltitude('    ')).toBe(true);
        });

        test('should return false for non-numeric altitude values', () => {
            expect(Validation.validateAltitude('abc')).toBe(false);
            expect(Validation.validateAltitude('50m')).toBe(false);
        });
    });

    describe('validateHouseSystem', () => {
        test('should accept "W" for Whole Sign Houses and "P" for Placidus', () => {
            expect(Validation.validateHouseSystem('W')).toBe(true);
            expect(Validation.validateHouseSystem('P')).toBe(true);
        });

        test('should reject other values', () => {
            expect(Validation.validateHouseSystem('X')).toBe(false);
            expect(Validation.validateHouseSystem('')).toBe(false);
        });
    });
});
