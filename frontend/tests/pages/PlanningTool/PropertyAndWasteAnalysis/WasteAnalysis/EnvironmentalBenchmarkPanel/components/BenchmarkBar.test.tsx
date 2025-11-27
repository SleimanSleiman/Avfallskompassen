import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BenchmarkBar from "../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/EnvironmentalBenchmarkPanel/components/BenchmarkBar";
import React from "react";

describe("BenchmarkBar", () => {
    it("renders empty container when value is null", () => {
        const { container } = render(<BenchmarkBar value={null} benchmark={100} className="custom-class" />);
        const barContainer = container.querySelector(".benchmark-bar-container");
        expect(barContainer).toBeDefined();
        expect(barContainer?.className).toContain("custom-class");
        expect(barContainer?.querySelector("div")).toBeNull();
    });

    it("renders normal bar when value is below benchmark", () => {
        const { container } = render(<BenchmarkBar value={50} benchmark={100} />);
        const bar = container.querySelector(".benchmark-bar-normal") as HTMLElement;
        expect(bar).toBeDefined();
        expect(bar.style.width).toBe("50%");
    });

    it("renders full bar when value equals benchmark", () => {
        const { container } = render(<BenchmarkBar value={100} benchmark={100} />);
        const bar = container.querySelector(".benchmark-bar-normal") as HTMLElement;
        expect(bar).toBeDefined();
        expect(bar.style.width).toBe("100%");
    });

    it("renders overflow bar when value exceeds benchmark", () => {
        const { container } = render(<BenchmarkBar value={150} benchmark={100} />);
        const bar = container.querySelector(".benchmark-bar-overflow") as HTMLElement;
        expect(bar).toBeDefined();
        expect(bar.style.width).toBe("100%");
    });

    it("clamps negative values to zero", () => {
        const { container } = render(<BenchmarkBar value={-50} benchmark={100} />);
        const bar = container.querySelector(".benchmark-bar-normal") as HTMLElement;
        expect(bar).toBeDefined();
        expect(bar.style.width).toBe("0%");
    });
});
