import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DoorVisual from "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Door/components/DoorVisual";
import { SCALE } from "../../../../../../../src/pages/PlanningTool/Constants";

// Mock react-konva components
vi.mock("react-konva", () => ({
    Arc: vi.fn(({ x, y, angle, rotation, stroke, strokeWidth, outerRadius, scaleX }) => (
        <div
            data-testid="arc"
            data-x={x}
            data-y={y}
            data-angle={angle}
            data-rotation={rotation}
            data-stroke={stroke}
            data-strokewidth={strokeWidth}
            data-outerradius={outerRadius}
            data-scalex={scaleX}
        />
    )),
    Line: vi.fn(({ points, rotation, stroke, strokeWidth, scaleX }) => (
        <div
            data-testid="line"
            data-points={points.join(",")}
            data-rotation={rotation}
            data-stroke={stroke}
            data-strokewidth={strokeWidth}
            data-scalex={scaleX}
        />
    )),
}));

describe("DoorVisual component", () => {
    const doorBase = {
        width: 90,
        rotation: 180,
        swingDirection: "outward",
    };

    it("renders Arc and Line", () => {
        render(<DoorVisual door={doorBase} selected={false} />);
        const arc = screen.getByTestId("arc");
        const line = screen.getByTestId("line");
        expect(arc).toBeInTheDocument();
        expect(line).toBeInTheDocument();
    });

    it("applies correct stroke color when selected", () => {
        const { rerender } = render(<DoorVisual door={doorBase} selected={false} />);
        let arc = screen.getByTestId("arc");
        let line = screen.getByTestId("line");

        expect(arc.dataset.stroke).toBe("blue");
        expect(line.dataset.stroke).toBe("blue");

        rerender(<DoorVisual door={doorBase} selected={true} />);
        arc = screen.getByTestId("arc");
        line = screen.getByTestId("line");

        expect(arc.dataset.stroke).toBe("orange");
        expect(line.dataset.stroke).toBe("orange");
    });

    it("applies correct rotation, scaleX, and radius/points", () => {
        const door = { ...doorBase, swingDirection: "inward" };
        render(<DoorVisual door={door} selected={false} />);

        const arc = screen.getByTestId("arc");
        const line = screen.getByTestId("line");

        expect(Number(arc.dataset.rotation)).toBe(door.rotation);
        expect(Number(arc.dataset.outerradius)).toBe(door.width / SCALE);
        expect(Number(arc.dataset.scalex)).toBe(-1);

        expect(Number(line.dataset.rotation)).toBe(door.rotation);
        expect(Number(line.dataset.scalex)).toBe(-1);
    });
});
