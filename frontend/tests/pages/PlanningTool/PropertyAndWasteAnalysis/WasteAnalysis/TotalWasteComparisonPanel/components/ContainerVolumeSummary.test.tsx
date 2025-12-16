import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ContainerVolumeSummary from "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/components/ContainerVolumeSummary";

vi.mock(
    "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/components/SummaryStat",
    () => ({
        default: ({ title, value, description, badge }: any) => (
            <div>
                <div data-testid="summary-title">{title}</div>
                <div data-testid="summary-value">{value}</div>
                <div data-testid="summary-description">{description}</div>
                <div data-testid="summary-badge">{badge}</div>
            </div>
        ),
    })
);

vi.mock(
    "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/components/TrendBadge",
    () => ({
        default: ({ children }: any) => <div data-testid="trend-badge">{children}</div>,
    })
);

describe("ContainerVolumeSummary", () => {
    it("renders all container summary data", () => {
        render(
            <ContainerVolumeSummary
                totalVolumeLabel="1200 L"
                containerAverageVolume={950}
                containerGapSummary="+250 L över snittet"
                containerTrend="up"
                containerLabel="Ökar"
                containerTone="neutral"
            />
        );

        expect(screen.getByTestId("summary-title")).toHaveTextContent("Total kärlvolym");
        expect(screen.getByTestId("summary-value")).toHaveTextContent("1200 L");

        expect(screen.getByText("Snitt i gruppen")).toBeDefined();
        expect(screen.getByText("950 L")).toBeDefined();

        expect(screen.getByText("Avvikelse")).toBeDefined();
        expect(screen.getByText("+250 L över snittet")).toBeDefined();

        expect(screen.getByTestId("trend-badge")).toHaveTextContent("Ökar");
    });

    it("hides comparison when average is null", () => {
        render(
            <ContainerVolumeSummary
                totalVolumeLabel="800 L"
                containerAverageVolume={null}
                containerGapSummary="—"
                containerTrend="neutral"
                containerLabel="Oförändrad"
                containerTone="neutral"
            />
        );

        expect(screen.queryByText("Snitt i gruppen")).toBeNull();
        expect(screen.queryByText("Avvikelse")).toBeNull();
    });

    it("hides comparison when average is 0", () => {
        render(
            <ContainerVolumeSummary
                totalVolumeLabel="800 L"
                containerAverageVolume={0}
                containerGapSummary="—"
                containerTrend="neutral"
                containerLabel="Oförändrad"
                containerTone="neutral"
            />
        );

        expect(screen.queryByText("Snitt i gruppen")).toBeNull();
        expect(screen.queryByText("Avvikelse")).toBeNull();
    });
});
