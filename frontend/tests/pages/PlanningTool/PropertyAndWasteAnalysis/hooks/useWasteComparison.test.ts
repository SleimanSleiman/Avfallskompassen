import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWasteComparison } from '../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/hooks/useWasteComparison';
import * as builders from '../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/builders';
import { normalizeWasteTypeKey } from '../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/utils';
import { WASTE_BENCHMARKS } from '../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/constants';

vi.mock('../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/builders', () => ({
    buildDesignStats: vi.fn(),
    mapWasteComparisons: vi.fn(),
    mapFrequencyComparisons: vi.fn(),
    buildCombinedRows: vi.fn(),
}));

vi.mock('../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/utils', () => ({
    normalizeWasteTypeKey: vi.fn((key: string) => key.toLowerCase()),
}));

describe('useWasteComparison', () => {
    const mockContainers = [{ container: { name: 'Plastic', serviceTypeName: 'Plastic' } }];
    const mockComparisonData = { numberOfApartments: 10 };

    const designStatsMock = { containerCount: 1, typeMap: new Map([['plastic', { key: 'plastic', displayName: 'Plastic' }]]) };
    const combinedRowsMock = [{ displayName: 'Plastic' }];

    beforeEach(() => {
        (builders.buildDesignStats as any).mockReturnValue(designStatsMock);
        (builders.mapWasteComparisons as any).mockReturnValue({});
        (builders.mapFrequencyComparisons as any).mockReturnValue({});
        (builders.buildCombinedRows as any).mockReturnValue(combinedRowsMock);
    });

    it('computes safeApartments fallback correctly', () => {
        const { result } = renderHook(() => useWasteComparison({
            comparisonData: null,
            selectedProperty: null,
            containersInRoom: [],
        }));
        expect(result.current.safeApartments).toBe(1);
    });

    it('computes safeApartments from comparisonData', () => {
        const { result } = renderHook(() => useWasteComparison({
            comparisonData: { numberOfApartments: 5 } as any,
            selectedProperty: null,
            containersInRoom: [],
        }));
        expect(result.current.safeApartments).toBe(5);
    });

    it('computes safeApartments from selectedProperty if comparisonData missing', () => {
        const { result } = renderHook(() => useWasteComparison({
            comparisonData: null,
            selectedProperty: { numberOfApartments: 7 } as any,
            containersInRoom: [],
        }));
        expect(result.current.safeApartments).toBe(7);
    });

    it('returns designStats and combinedRows correctly', () => {
        const { result } = renderHook(() => useWasteComparison({
            comparisonData: mockComparisonData as any,
            selectedProperty: null,
            containersInRoom: mockContainers as any,
        }));
        expect(result.current.designStats).toEqual(designStatsMock);
        expect(result.current.combinedRows).toEqual(combinedRowsMock);
        expect(result.current.designHasContainers).toBe(true);
    });

    it('computes activeBenchmarks including predefined and custom benchmarks', () => {
        const { result } = renderHook(() => useWasteComparison({
            comparisonData: mockComparisonData as any,
            selectedProperty: null,
            containersInRoom: mockContainers as any,
        }));

        const keys = result.current.activeBenchmarks.map(b => b.key);
        expect(keys).toContain('plastic');
        WASTE_BENCHMARKS.forEach(b => {
            if (b.aliases.some(a => a.toLowerCase() === 'plastic') || b.key.toLowerCase() === 'plastic') {
                expect(keys).toContain(b.key);
            }
        });
    });
});
