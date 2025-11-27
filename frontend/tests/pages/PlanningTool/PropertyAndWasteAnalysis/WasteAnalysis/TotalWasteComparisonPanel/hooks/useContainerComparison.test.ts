import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useContainerComparison } from "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/hooks/useContainerComparison";

vi.mock("../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/utils", () => ({
    calculatePercentageDifference: (a: number | null, b: number | null) =>
        a != null && b != null ? ((a - b) / b) * 100 : null,
    getTrend: (diff: number | null) => {
        if (diff == null) return "neutral"; // <--- match real behavior
        if (diff > 0) return "better";
        if (diff < 0) return "worse";
        return "neutral";
    },
    formatNumber: (num: number | null) =>
        num != null ? num.toFixed(0) : "—",
    normalizeWasteTypeKey: (key: string) => key.toLowerCase(),
}));

describe("useContainerComparison", () => {
    it("returns placeholders when no containers exist", () => {
        const { result } = renderHook(() =>
            useContainerComparison({ designStats: { containerCount: 0 }, comparisonData: {} })
        );

        expect(result.current.containerTone).toBe("neutral");
        expect(result.current.containerLabel).toBe("Ingen kärldata");
        expect(result.current.totalVolumeLabel).toBe("—");
        expect(result.current.containerGapSummary).toBe("Lägg till kärl för att få rekommendation");
    });

    it("calculates difference and trend correctly", () => {
        const { result } = renderHook(() =>
            useContainerComparison({
                designStats: { containerCount: 2, totalNominalVolume: 120, typeMap: new Map([["a",{totalFrequency:10}],["b",{totalFrequency:14}]]) },
                comparisonData: { containerSizeComparison: { averageVolume: 100, propertyTotalVolume: 120 } }
            })
        );

        expect(result.current.containerDifference).toBeCloseTo(20);
        expect(result.current.containerTrend).toBe("better");
        expect(result.current.containerLabel).toBe("Större totalt kärlvolym");
        expect(result.current.containerGapSummary).toBe("20 L");
        expect(result.current.totalVolumeLabel).toBe("120 L");
        expect(result.current.averageFrequencyAll).toBe(12);
    });

    it("handles null comparison data gracefully", () => {
        const { result } = renderHook(() =>
            useContainerComparison({
                designStats: { containerCount: 1, totalNominalVolume: 50, typeMap: new Map([["a",{totalFrequency:5}]]) },
                comparisonData: {}
            })
        );

        expect(result.current.containerDifference).toBe(null);
        expect(result.current.containerTrend).toBe("neutral");
        expect(result.current.containerLabel).toBe("I nivå med snittet");
        expect(result.current.containerGapSummary).toBe("—");
    });
});
