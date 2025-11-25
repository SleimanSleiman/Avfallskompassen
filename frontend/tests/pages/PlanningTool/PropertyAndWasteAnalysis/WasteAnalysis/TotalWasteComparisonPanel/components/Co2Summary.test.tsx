import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Co2Summary from "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/TotalWasteComparisonPanel/components/Co2Summary";

vi.mock("../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/components/SummaryStat", () => ({
    default: ({ title, value, description }: any) => (
        <div>
            <div data-testid="summary-title">{title}</div>
            <div data-testid="summary-value">{value}</div>
            <div data-testid="summary-description">{description}</div>
        </div>
    ),
}));

describe("Co2Summary", () => {
    it("renders summary data when co2HasData is true", () => {
        render(
            <Co2Summary
                co2CardValue="120 kg"
                co2Tone="positive"
                co2HasData={true}
                co2PerApartmentLabel="5 kg"
                co2PerWeekLabel="2 kg"
                co2TopLabel="Plast"
        />
    );

        expect(screen.getByTestId("summary-title")).toHaveTextContent("Årlig CO₂-besparing");
        expect(screen.getByText("5 kg")).toBeDefined();
        expect(screen.getByText("2 kg")).toBeDefined();
        expect(screen.getByText("Plast")).toBeDefined();
    });

    it("renders fallback message when co2HasData is false", () => {
        render(
            <Co2Summary
                co2CardValue="0"
                co2Tone="neutral"
                co2HasData={false}
                co2PerApartmentLabel=""
                co2PerWeekLabel=""
                co2TopLabel=""
            />
        );

        expect(
            screen.getByText("Lägg till sorterade fraktioner för att uppskatta klimatvinsten.")
        ).toBeDefined();
    });
});
