import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CostSection from "../../../../src/pages/PlanningTool/Sidebar/CostSection";

// ─────────────── Mock components ───────────────
vi.mock("../../../../src/pages/PlanningTool/components/InfoTooltip", () => ({
    default: (props: any) => <div data-testid="mock-tooltip">{props.text}</div>,
}));

describe("CostSection", () => {
    //Test rendering of CostSection component
    it("renders without crashing", () => {
        render(<CostSection />);
        expect(screen.getByText("Kostnader och jämförelse")).toBeDefined();
    });

    //Test rendering of InfoTooltip component within CostSection
    it("renders the InfoTooltip", () => {
        render(<CostSection />);
        const tooltip = screen.getByTestId("mock-tooltip");
        expect(tooltip).toBeDefined();
        expect(tooltip.textContent).toContain(
            "Här visas en översikt över hanteringskostnaderna"
        );
    });

    //Test rendering of placeholder content
    it("renders placeholder content", () => {
        render(<CostSection />);
        expect(screen.getByText("Innehåll för kostnadssektionen kommer här.")).toBeDefined();
    });
});
