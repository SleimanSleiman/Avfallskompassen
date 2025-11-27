import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SummaryStat from "../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/components/SummaryStat";
import React from "react";

describe("SummaryStat", () => {
    it("renders title and value correctly", () => {
        render(<SummaryStat title="Test Title" value="123" />);
        expect(screen.getByText("Test Title")).toBeDefined();
        expect(screen.getByText("123")).toBeDefined();
    });

    it("renders description when provided", () => {
        render(<SummaryStat title="Title" value="Value" description="Extra info" />);
        expect(screen.getByText("Extra info")).toBeDefined();
    });

    it("renders invisible placeholder when no description is provided", () => {
        render(<SummaryStat title="Title" value="Value" />);
        const placeholder = screen.getByText("—");
        expect(placeholder).toBeDefined();
        expect(placeholder).toHaveClass("invisible");
    });

    it("applies correct tone classes", () => {
        render(<SummaryStat title="Title" value="Value" tone="positive" />);
        const valueEl = screen.getByText("Value");
        expect(valueEl.className).toContain("summary-tone-positive-value");
    });

    it("applies correct size classes", () => {
        render(<SummaryStat title="Title" value="Value" size="compact" />);
        const container = screen.getByText("Title").closest("div.summary-stat-container");
        expect(container).toHaveClass("summary-size-compact-container");
    });
});
