import { describe, it, expect } from 'vitest';
import { clamp, mmToPixels, isOverlapping, SCALE } from '../../../../src/pages/PlanningTool/lib/Constants';

describe('Constants utilities', () => {
    //Test clamp function
    it('clamp should limit value within range', () => {
        expect(clamp(5, 0, 10)).toBe(5); //within range
        expect(clamp(-5, 0, 10)).toBe(0); //below min
        expect(clamp(15, 0, 10)).toBe(10); //above max
    });

    //Test mmToPixels function
    it('mmToPixels should convert millimeters to pixels correctly', () => {
        //1000 mm = 1 m => convert using the active SCALE factor
        expect(mmToPixels(1000)).toBeCloseTo(1 / SCALE);
    });

    //Test isOverlapping function
    it('isOverlapping should return true for overlapping objects', () => {
        const a = { x: 0, y: 0, width: 10, height: 10 };
        const b = { x: 5, y: 5, width: 10, height: 10 };
        expect(isOverlapping(a, b)).toBe(true);
    });

    //Test isOverlapping function for non-overlapping case
    it('isOverlapping should return false for non-overlapping objects', () => {
        const a = { x: 0, y: 0, width: 10, height: 10 };
        const b = { x: 20, y: 20, width: 5, height: 5 };
        expect(isOverlapping(a, b)).toBe(false);
    });
});
