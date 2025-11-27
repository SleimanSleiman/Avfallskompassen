import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCostComparison } from "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/hooks/useCostComparison";

vi.mock("../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/utils", () => ({
    calculatePercentageDifference: (a: number | null, b: number | null) =>
        a != null && b != null ? ((a - b) / b) * 100 : null,
    getTrend: (diff: number | null) => {
        if (diff == null) return "neutral";
        if (diff > 0) return "worse";
        if (diff < 0) return "better";
        return "neutral";
    },
    formatPercentageSigned: (num: number | null) => (num != null ? `${num.toFixed(0)}%` : "—"),
    formatCurrencySigned: (num: number | null) => (num != null ? `${num.toFixed(0)} kr` : "—"),
}));

describe("useCostComparison", () => {
    it("returns placeholders when no containers exist", () => {
        const { result } = renderHook(() =>
            useCostComparison({
                designStats: { containerCount: 0 },
                comparisonData: {},
                safeApartments: 10,
                combinedRows: [],
            })
        );

        expect(result.current.propertyCostValue).toBe(null);
        expect(result.current.costAverage).toBe(null);
        expect(result.current.costDifference).toBe(null);
        expect(result.current.costTrend).toBe("neutral");
        expect(result.current.costTone).toBe("neutral");
        expect(result.current.costGapSummary).toBe("—");
        expect(result.current.costPerApartment).toBe(null);
        expect(result.current.dominantCostRow).toBe(null);
    });

    it("calculates cost and trend correctly when data exists", () => {
        const combinedRows = [
            { displayName: "Restavfall", costPercentage: 30 },
            { displayName: "Plast", costPercentage: 45 },
        ];

        const { result } = renderHook(() =>
            useCostComparison({
                designStats: { containerCount: 2, totalCost: 2000 },
                comparisonData: { costComparison: { averageCost: 1500, propertyCost: 1800 } },
                safeApartments: 10,
                combinedRows,
            })
        );

        expect(result.current.propertyCostValue).toBe(2000);
        expect(result.current.costAverage).toBe(1500);
        expect(result.current.costDifference).toBeCloseTo((2000 - 1500) / 1500 * 100);
        expect(result.current.costTrend).toBe("worse");
        expect(result.current.costTone).toBe("negative");
        expect(result.current.costPerApartment).toBe(200);
        expect(result.current.dominantCostRow).toEqual(combinedRows[1]);
    });

    it("handles missing costPercentage gracefully", () => {
        const combinedRows = [
            { displayName: "Restavfall", costPercentage: null },
            { displayName: "Plast", costPercentage: undefined },
        ];

        const { result } = renderHook(() =>
            useCostComparison({
                designStats: { containerCount: 2, totalCost: 1000 },
                comparisonData: { costComparison: { averageCost: 1000, propertyCost: 1000 } },
                safeApartments: 5,
                combinedRows,
            })
        );

        expect(result.current.dominantCostRow).toBeNull();
    });
});
