import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import EnvironmentalBenchmarkPanel from "../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/EnvironmentalBenchmarkPanel/EnvironmentalBenchmarkPanel";
import React from "react";
import SummaryStat from "../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/components/SummaryStat";
import BenchmarkBar from "../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/EnvironmentalBenchmarkPanel/components/BenchmarkBar";

vi.mock(
    "../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/components/SummaryStat",
    () => ({
        default: ({ title, value, description }: any) => (
            <div data-testid="summary-stat">
                {title}: {value}
                <div data-testid="description">{description}</div>
            </div>
        ),
    })
);

vi.mock(
    "../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/EnvironmentalBenchmarkPanel/components/BenchmarkBar",
    () => ({
        default: ({ value, benchmark }: any) => (
            <div data-testid="benchmark-bar">
            {   value}/{benchmark}
            </div>
        ),
    })
);

describe("EnvironmentalBenchmarkPanel", () => {
    const mockDesignStats = {
        typeMap: new Map(),
        totalCost: 0,
        totalNominalVolume: 0,
        containerCount: 0,
    };

    const combinedRows = [
        {
            key: "restavfall",
            displayName: "Restavfall",
            propertyPerWeek: 20,
            averagePerWeek: 30,
            propertyAnnualVolume: 1000,
            containerCount: 2,
            wasteDiff: -33.3,
            propertyFrequency: 10,
            averageFrequency: 12,
            frequencyDiff: -16.7,
            frequencyTrend: "better",
            totalCost: 100,
            costPercentage: 50,
        },
    ];

    const activeBenchmarks = [
        { key: "restavfall", label: "Restavfall", benchmark: 30, aliases: [] },
        { key: "plastforpackningar", label: "Plastförpackningar", benchmark: 25, aliases: [] },
    ];

    it("renders a message when no active benchmarks exist", () => {
        render(
            <EnvironmentalBenchmarkPanel
                designStats={mockDesignStats}
                combinedRows={[]}
                activeBenchmarks={[]}
                designHasContainers={false}
            />
        );

        expect(screen.getByText(/Lägg till fraktioner i ritningen/)).toBeDefined();
    });

    it("renders benchmarks with data correctly", () => {
        render(
            <EnvironmentalBenchmarkPanel
                designStats={mockDesignStats}
                combinedRows={combinedRows}
                activeBenchmarks={activeBenchmarks}
                designHasContainers={true}
            />
        );

        const stats = screen.getAllByTestId("summary-stat");
        expect(stats.length).toBe(activeBenchmarks.length);
        expect(screen.getByText("20/30")).toBeDefined();
        expect(stats[1]).toHaveTextContent("Plastförpackningar: —");
    });

    it("renders missing container message when no propertyPerWeek", () => {
        render(
            <EnvironmentalBenchmarkPanel
                designStats={mockDesignStats}
                combinedRows={[]}
                activeBenchmarks={activeBenchmarks}
                designHasContainers={true}
            />
        );

        expect(screen.getAllByText(/Lägg till kärl i ritningen/).length).toBeGreaterThan(0);
    });
});
