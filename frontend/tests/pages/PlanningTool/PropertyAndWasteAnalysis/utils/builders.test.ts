import { describe, it, expect } from 'vitest';
import { buildDesignStats, mapWasteComparisons, mapFrequencyComparisons, buildCombinedRows, findRowForBenchmark } from '../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/builders';
import { normalizeWasteTypeKey } from '../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/utils';

describe('builders', () => {
    it('buildDesignStats aggregates containers correctly', () => {
        const containers = [
            { container: { name: 'Plastic', size: 10, emptyingFrequencyPerYear: 12, cost: 100 } },
            { container: { name: 'Plastic', size: 5, emptyingFrequencyPerYear: 12, cost: 50 } },
            { container: { name: 'Metal', size: 8, emptyingFrequencyPerYear: 10, cost: 80 } },
        ];
        const stats = buildDesignStats(containers);
        expect(stats.containerCount).toBe(3);
        expect(stats.totalCost).toBe(230);
        expect(stats.typeMap.size).toBe(2);
        const plastic = stats.typeMap.get(normalizeWasteTypeKey('Plastic'))!;
        expect(plastic.totalAnnualVolume).toBe(10*12 + 5*12);
        expect(plastic.containerCount).toBe(2);
    });

    it('maps waste comparisons correctly', () => {
        const comparisonData = {
            wasteAmountComparisons: [{ wasteType: 'Plastic', propertyWasteAmount: 50 }]
        } as any;
        const map = mapWasteComparisons(comparisonData);
        expect(map.get(normalizeWasteTypeKey('Plastic'))?.propertyWasteAmount).toBe(50);
    });

    it('maps frequency comparisons correctly', () => {
        const comparisonData = {
            frequencyComparisons: [{ wasteType: 'Plastic', propertyFrequency: 10 }]
        } as any;
        const map = mapFrequencyComparisons(comparisonData);
        expect(map.get(normalizeWasteTypeKey('Plastic'))?.propertyFrequency).toBe(10);
    });

    it('buildCombinedRows computes derived fields correctly', () => {
        const designStats = {
            totalCost: 200,
            typeMap: new Map([
                ['plastic', { key: 'plastic', displayName: 'Plastic', totalAnnualVolume: 60, totalNominalVolume: 15, totalFrequency: 12, containerCount: 2, totalCost: 120 }],
                ['metal', { key: 'metal', displayName: 'Metal', totalAnnualVolume: 40, totalNominalVolume: 8, totalFrequency: 10, containerCount: 1, totalCost: 80 }],
            ])
        } as any;
        const wasteMap = new Map();
        const freqMap = new Map();
        const rows = buildCombinedRows({ designStats, wasteComparisonMap: wasteMap, frequencyComparisonMap: freqMap, safeApartments: 10 });
        expect(rows.find(r => r.key==='plastic')?.containerCount).toBe(2);
        expect(rows.find(r => r.key==='plastic')?.costPercentage).toBeCloseTo(60);
        expect(rows.find(r => r.key==='metal')?.costPercentage).toBeCloseTo(40);
    });

    it('findRowForBenchmark finds the correct row', () => {
        const rows = [{ displayName: 'Plastic', key: 'plastic', aliases: [] } as any];
        const def = { key: 'plastic', aliases: [] } as any;
        expect(findRowForBenchmark(def, rows)?.displayName).toBe('Plastic');
        const def2 = { key: 'Metal', aliases: [] } as any;
        expect(findRowForBenchmark(def2, rows)).toBeNull();
    });
});
