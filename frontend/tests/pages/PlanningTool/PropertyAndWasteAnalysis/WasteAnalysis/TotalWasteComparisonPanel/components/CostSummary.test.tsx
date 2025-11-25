import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CostSummary from "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/components/CostSummary";

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

vi.mock(
    "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/utils",
    () => ({
        formatCurrency: (val: number | null) =>
            val === null ? "—" : `${val} kr`,
    })
);

vi.mock(
    "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/constants",
    () => ({
        TREND_CONFIG: {
            up: { label: "Ökar" },
            down: { label: "Minskar" },
            neutral: { label: "Oförändrad" },
        },
    })
);

describe("CostSummary", () => {
    it("renders full cost summary", () => {
        render(
            <CostSummary
                propertyCostValue={120000}
                costAverage={100000}
                costPerApartment={3000}
                costGapSummary="+20%"
                costTrend="up"
                costTone="neutral"
            />
        );

        expect(screen.getByTestId("summary-title")).toHaveTextContent("Årlig kostnad");
        expect(screen.getByTestId("summary-value")).toHaveTextContent("120000 kr");
        expect(screen.getByText("Snitt i gruppen")).toBeDefined();
        expect(screen.getByText("100000 kr")).toBeDefined();
        expect(screen.getByText("Per lägenhet")).toBeDefined();
        expect(screen.getByText("3000 kr")).toBeDefined();
        expect(screen.getByText("Avvikelse")).toBeDefined();
        expect(screen.getByText("+20%")).toBeDefined();
        expect(screen.getByTestId("trend-badge")).toHaveTextContent("Ökar");
    });

    it("renders placeholders when values are null", () => {
        render(
            <CostSummary
                propertyCostValue={null}
                costAverage={null}
                costPerApartment={null}
                costGapSummary="—"
                costTrend="neutral"
                costTone="neutral"
            />
        );

        expect(screen.getByTestId("summary-value")).toHaveTextContent("—");

        const placeholders = screen.getAllByText("—");
        expect(placeholders.length).toBe(4); // value + 3 description rows
        expect(screen.getByTestId("trend-badge")).toHaveTextContent("Oförändrad");
    });
});
