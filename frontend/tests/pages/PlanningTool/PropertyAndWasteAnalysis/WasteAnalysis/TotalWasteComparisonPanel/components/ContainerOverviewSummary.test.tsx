import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ContainerOverviewSummary from "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/components/ContainerOverviewSummary";

vi.mock("../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/components/SummaryStat", () => ({
    default: ({ title, value, description }: any) => (
        <div>
            <div data-testid="summary-title">{title}</div>
            <div data-testid="summary-value">{value}</div>
            <div data-testid="summary-description">{description}</div>
        </div>
    ),
}));

describe("ContainerOverviewSummary", () => {
    it("renders container data when designHasContainers is true", () => {
        render(
            <ContainerOverviewSummary
                designHasContainers={true}
                containerCount={4}
                typeMapSize={3}
                averageFrequencyAll={12.5}
                comparisonAverageFrequency={10.0}
                frequencyDifference={25}
                dominantCostRow={{
                    displayName: "Restavfall",
                    costPercentage: 0.45,
                } as any}
            />
        );

        expect(screen.getByTestId("summary-title")).toHaveTextContent("Kärlöversikt");
        expect(screen.getByTestId("summary-value")).toHaveTextContent("4 kärl");
        expect(screen.getByText("Fraktioner")).toBeDefined();
        expect(screen.getByText("3")).toBeDefined();
        expect(screen.getByText(/12,5/)).toBeDefined(); 
        expect(screen.getByText(/Restavfall/)).toBeDefined();
        expect(screen.getByText(/\(0,5%\)/)).toBeDefined();
    });

    it("displays frequency difference with correct color when provided (positive/red)", () => {
        render(
            <ContainerOverviewSummary
                designHasContainers={true}
                containerCount={4}
                typeMapSize={3}
                averageFrequencyAll={12.5}
                comparisonAverageFrequency={10.0}
                frequencyDifference={25}
                dominantCostRow={{
                    displayName: "Restavfall",
                    costPercentage: 0.45,
                } as any}
            />
        );

        const diffElement = screen.getByText("+25%");
        expect(diffElement).toBeDefined();
        expect(diffElement).toHaveClass("text-red-500");
    });

    it("displays frequency difference with correct color when provided (negative/green)", () => {
        render(
            <ContainerOverviewSummary
                designHasContainers={true}
                containerCount={4}
                typeMapSize={3}
                averageFrequencyAll={8.0}
                comparisonAverageFrequency={10.0}
                frequencyDifference={-20}
                dominantCostRow={{
                    displayName: "Restavfall",
                    costPercentage: 0.45,
                } as any}
            />
        );

        const diffElement = screen.getByText(/[-−]20%/);
        expect(diffElement).toBeDefined();
        expect(diffElement).toHaveClass("text-green-500");
    });

    it("hides frequency section when averageFrequencyAll is null", () => {
        render(
            <ContainerOverviewSummary
                designHasContainers={true}
                containerCount={4}
                typeMapSize={3}
                averageFrequencyAll={null}
                dominantCostRow={null}
            />
        );

        expect(screen.queryByText(/Genomsnittlig tömning/)).toBeNull();
    });

    it("renders fallback when designHasContainers is false", () => {
        render(
            <ContainerOverviewSummary
                designHasContainers={false}
                containerCount={0}
                typeMapSize={0}
                averageFrequencyAll={null}
                dominantCostRow={null}
            />
        );

        expect(screen.getByText("Inga kärl")).toBeDefined();
        expect(
            screen.getByText(
                "Lägg till kärl i ritningen för att se hur kostnaderna fördelas mellan fraktioner."
            )
        ).toBeDefined();
    });
});
