import { describe, it, expect } from 'vitest';
import {
    formatNumber,
    formatNumberSigned,
    formatCurrency,
    formatCurrencySigned,
    formatVolume,
    formatLitersPerWeek,
    formatPercentage,
    formatPercentageSigned,
    computePerApartmentPerWeek,
} from '../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/utils';

describe('utils', () => {
    it('formatNumber and formatNumberSigned handle null and numbers', () => {
        expect(formatNumber(null)).toBe('—');
        expect(formatNumber(1234.56)).toMatch(/1\s*234,6/);
        expect(formatNumberSigned(null)).toBe('—');
        expect(formatNumberSigned(1234.56)).toMatch(/[+]1\s*234,6/);
    });

    it('formatCurrency and formatCurrencySigned handle null and numbers', () => {
        expect(formatCurrency(null)).toBe('—');
        expect(formatCurrency(1000)).toMatch(/1\s*000\s*kr/);
        expect(formatCurrencySigned(null)).toBe('—');
        expect(formatCurrencySigned(1000)).toMatch(/[+]1\s*000\s*kr/);
    });

    it('formatVolume formats correctly', () => {
        expect(formatVolume(1234.56)).toMatch(/1\s*235\s*L/);
        expect(formatVolume(null)).toBe('—');
    });

    it('formatLitersPerWeek formats correctly', () => {
        expect(formatLitersPerWeek(12.3)).toBe('12 L / lägenhet · vecka');
        expect(formatLitersPerWeek(null)).toBe('—');
    });

    it('formatPercentage and formatPercentageSigned formats correctly', () => {
        expect(formatPercentage(12.34)).toBe('12,3%');
        expect(formatPercentage(null)).toBe('—');
        expect(formatPercentageSigned(12.34)).toBe('+12,3%');
        expect(formatPercentageSigned(null)).toBe('—');
    });

    it('computePerApartmentPerWeek handles numbers and zero apartments safely', () => {
        expect(computePerApartmentPerWeek(520, 10)).toBeCloseTo(1, 5);
        expect(computePerApartmentPerWeek(520, 0)).toBeCloseTo(10, 5);
        expect(computePerApartmentPerWeek(null, 10)).toBeNull();
        expect(computePerApartmentPerWeek(520, null)).toBeCloseTo(10, 5);
    });
});
