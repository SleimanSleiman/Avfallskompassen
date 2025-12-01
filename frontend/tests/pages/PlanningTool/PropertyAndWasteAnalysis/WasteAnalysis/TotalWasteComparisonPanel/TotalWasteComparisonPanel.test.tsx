import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TotalWasteComparisonPanel from "../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/TotalWasteComparisonPanel";

vi.mock("../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/hooks/useCostComparison", () => ({
    useCostComparison: () => ({
        propertyCostValue: 1000,
        costAverage: 1200,
        costDifference: -16.7,
        costTrend: "better",
        costTone: "positive",
        costGapSummary: "-17% (-200 kr)",
        costPerApartment: 100,
        dominantCostRow: { displayName: "Restavfall", costPercentage: 50 },
    }),
}));

vi.mock("../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/hooks/useContainerComparison", () => ({
    useContainerComparison: () => ({
        propertyVolumeValue: 500,
        containerAverageVolume: 450,
        containerDifference: 11.1,
        containerTrend: "worse",
        containerLabel: "Större totalt kärlvolym",
        containerGapSummary: "50 L",
        containerTone: "negative",
        totalVolumeLabel: "500 L",
        averageFrequencyAll: 10,
    }),
}));

vi.mock("../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/hooks/useCo2Comparison", () => ({
    useCo2Comparison: () => ({
        totalCo2Savings: 50,
        topCo2Row: { displayName: "Plast" },
        topCo2Value: 30,
        co2HasData: true,
        co2CardValue: "50 kg",
        co2PerApartmentLabel: "5 kg CO₂e",
        co2PerWeekLabel: "1 kg CO₂e",
        co2TopLabel: "Plast (30 kg)",
        co2Tone: "positive",
    }),
}));

vi.mock("../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/components/Co2Summary", () => ({
    default: (props: any) => <div data-testid="co2-summary">{JSON.stringify(props)}</div>,
}));

vi.mock("../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/components/CostSummary", () => ({
    default: (props: any) => <div data-testid="cost-summary">{JSON.stringify(props)}</div>,
}));

vi.mock("../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/components/ContainerVolumeSummary", () => ({
    default: (props: any) => <div data-testid="volume-summary">{JSON.stringify(props)}</div>,
}));

vi.mock("../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/components/ContainerOverviewSummary", () => ({
    default: (props: any) => <div data-testid="overview-summary">{JSON.stringify(props)}</div>,
}));

describe("TotalWasteComparisonPanel", () => {
    const mockDesignStats = {
        containerCount: 2,
        typeMap: new Map([["restavfall", { totalFrequency: 10 }]]),
        totalCost: 1000,
        totalNominalVolume: 500,
    };

    const mockCombinedRows = [
        { displayName: "Restavfall", costPercentage: 50 },
    ];

    const mockComparisonData = {
        costComparison: { averageCost: 1200, propertyCost: 1000 },
        containerSizeComparison: { averageVolume: 450, propertyTotalVolume: 500 },
    };

    it("renders all summaries", () => {
        render(
            <TotalWasteComparisonPanel
                designStats={mockDesignStats}
                combinedRows={mockCombinedRows}
                comparisonData={mockComparisonData}
                safeApartments={10}
                designHasContainers={true}
            />
        );

        expect(screen.getByTestId("co2-summary")).toBeDefined();
        expect(screen.getByTestId("cost-summary")).toBeDefined();
        expect(screen.getByTestId("volume-summary")).toBeDefined();
        expect(screen.getByTestId("overview-summary")).toBeDefined();
    });
});
