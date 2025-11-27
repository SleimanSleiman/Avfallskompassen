import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCo2Comparison } from "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/hooks/useCo2Comparison";
import * as utils from "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/utils";
import { CO2_SAVING_DEFINITIONS, WEEK_PER_YEAR } from "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/constants";

vi.mock("../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/constants", () => ({
    CO2_SAVING_DEFINITIONS: [
        { key: "restavfall", kgPerLiter: 0.1, aliases: [] },
        { key: "plast", kgPerLiter: 0.05, aliases: [] },
    ],
    WEEK_PER_YEAR: 52,
}));

vi.mock("../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/utils", () => ({
    normalizeWasteTypeKey: (key: string) => key.toLowerCase(),
    formatNumber: (num: number) => num.toFixed(1),
    formatCo2: (num: number) => `${num.toFixed(1)} kg`,
}));

describe("useCo2Comparison", () => {
    it("returns placeholders when no containers exist", () => {
        const { result } = renderHook(() =>
            useCo2Comparison({ designStats: { containerCount: 0 }, combinedRows: [], safeApartments: 10 })
        );

        expect(result.current.co2HasData).toBe(false);
        expect(result.current.co2CardValue).toBe("—");
        expect(result.current.co2Tone).toBe("negative");
        expect(result.current.co2PerApartmentLabel).toBe("—");
        expect(result.current.co2PerWeekLabel).toBe("—");
        expect(result.current.co2TopLabel).toBe("—");
    });

    it("calculates total CO2 and top contributor correctly", () => {
        const rows = [
            { displayName: "Restavfall", propertyAnnualVolume: 100 },
            { displayName: "Plast", propertyAnnualVolume: 200 },
        ];

        const { result } = renderHook(() =>
            useCo2Comparison({ designStats: { containerCount: 2 }, combinedRows: rows, safeApartments: 10 })
        );

        expect(result.current.totalCo2Savings).toBeCloseTo(100 * 0.1 + 200 * 0.05);
        expect(result.current.co2HasData).toBe(true);
        expect(result.current.co2Tone).toBe("positive");
        expect(result.current.co2PerApartmentLabel).toBe(`${((100*0.1 + 200*0.05)/10).toFixed(1)} kg CO₂e`);
        expect(result.current.co2PerWeekLabel).toBe(`${((100*0.1 + 200*0.05)/52).toFixed(1)} kg CO₂e`);
        expect(result.current.co2TopLabel).toBe("Restavfall (10.0 kg)");

    });

    it("returns neutral tone when containers exist but no CO2 savings", () => {
        const rows = [
            { displayName: "Okänt", propertyAnnualVolume: 100 },
        ];

        const { result } = renderHook(() =>
            useCo2Comparison({ designStats: { containerCount: 2 }, combinedRows: rows, safeApartments: 10 })
        );

        expect(result.current.co2HasData).toBe(false);
        expect(result.current.co2Tone).toBe("neutral");
        expect(result.current.co2CardValue).toBe("—");
    });
});
