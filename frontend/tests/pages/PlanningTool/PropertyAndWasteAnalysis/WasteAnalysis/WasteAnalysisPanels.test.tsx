import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import WasteAnalysisPanels from "../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/WasteAnalysisPanels";

vi.mock("../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/hooks/useWasteComparison", () => ({
    useWasteComparison: () => ({
        safeApartments: 10,
        designStats: { containerCount: 2, typeMap: new Map(), totalCost: 1000, totalNominalVolume: 500 },
        combinedRows: [{ displayName: "Restavfall", costPercentage: 50 }],
        activeBenchmarks: [],
        designHasContainers: true,
    }),
}));

vi.mock("../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/TotalWasteComparisonPanel", () => ({
    default: (props: any) => <div data-testid="total-comparison">{JSON.stringify(props)}</div>,
}));

vi.mock("../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/EnvironmentalBenchmarkPanel/EnvironmentalBenchmarkPanel", () => ({
    default: (props: any) => <div data-testid="environmental-benchmark">{JSON.stringify(props)}</div>,
}));

vi.mock("../../../../../src/pages/PlanningTool/components/InfoTooltip", () => ({
    default: (props: any) => <div data-testid="info-tooltip">{props.text}</div>,
}));

vi.mock("../../../../../src/components/LoadingBar", () => ({
    default: (props: any) => (
        <div data-testid="loading-bar">{props.message}</div>
    ),
}));

vi.mock("lucide-react", () => ({
    Loader2: () => <div data-testid="loader" />,
    AlertCircle: () => <div data-testid="alert-circle" />,
    TrendingDown: () => <div data-testid="trending-down" />,
    TrendingUp: () => <div data-testid="trending-up" />,
    Minus: () => <div data-testid="minus" />,
    CheckCircle: () => <div data-testid="check-circle" />
}));

describe("WasteAnalysisPanels", () => {
    it("renders loading state", () => {
        render(
            <WasteAnalysisPanels
                comparisonData={null}
                comparisonLoading={true}
                comparisonError={null}
                selectedProperty={null}
                containersInRoom={[]}
            />
        );

        expect(screen.getByTestId("loading-bar")).toBeDefined();
        expect(screen.getByText("Hämtar jämförelsedata...")).toBeDefined();
    });

    it("renders error state", () => {
        render(
            <WasteAnalysisPanels
                comparisonData={null}
                comparisonLoading={false}
                comparisonError="Test error"
                selectedProperty={null}
                containersInRoom={[]}
            />
        );

        expect(screen.getByTestId("alert-circle")).toBeDefined();
        expect(screen.getByText("Kunde inte ladda jämförelsen")).toBeDefined();
        expect(screen.getByText("Test error")).toBeDefined();
    });

    it("renders no comparison data message", () => {
        render(
            <WasteAnalysisPanels
                comparisonData={null}
                comparisonLoading={false}
                comparisonError={null}
                selectedProperty={null}
                containersInRoom={[]}
            />
        );

        expect(screen.getByText(/Öppna planeringsverktyget via en fastighet/)).toBeDefined();
    });

    it("renders comparison panels when data is available", () => {
        render(
            <WasteAnalysisPanels
                comparisonData={{ some: "data" }}
                comparisonLoading={false}
                comparisonError={null}
                selectedProperty={{ id: 1, name: "Property 1" }}
                containersInRoom={[]}
            />
        );

        expect(screen.getByTestId("total-comparison")).toBeDefined();
        expect(screen.getByTestId("environmental-benchmark")).toBeDefined();
        expect(screen.getByTestId("info-tooltip")).toHaveTextContent(
            "Se hur ditt miljörum står sig mot liknande fastigheter i samma kommun."
        );
    });
});
