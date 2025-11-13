import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import CornerHandles from "../../../../src/pages/PlanningTool/RoomCanvas/CornerHandles";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../../../src/pages/PlanningTool/Constants";
import { Circle } from "react-konva";

// ─────────────── Mock react-konva Circle ───────────────
vi.mock("react-konva", () => ({
    Circle: vi.fn(({ onDragMove, dragBoundFunc }) => {
        return (
            <div
                data-testid="corner-circle"
                onMouseMove={() =>
                    onDragMove?.({
                        target: { position: () => ({ x: 50, y: 50 }) },
                    })
                }
                data-bound-func={!!dragBoundFunc}
            />
        );
    }),
}));

describe("CornerHandles component", () => {
    const mockHandleDragCorner = vi.fn();
    const mockGetContainersBoundingBox = vi.fn(() => ({
        minX: 0,
        minY: 0,
        maxX: 1000,
        maxY: 1000,
    }));

    const mockRoom = {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
    };

    const corners = [
        { x: 100, y: 100 },
        { x: 300, y: 100 },
        { x: 300, y: 250 },
        { x: 100, y: 250 },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    //Test rendering of CornerHandles component
    it("renders four draggable corner circles", () => {
        const { getAllByTestId } = render(
            <CornerHandles
                corners={corners}
                room={mockRoom}
                handleDragCorner={mockHandleDragCorner}
                getContainersBoundingBox={mockGetContainersBoundingBox}
            />
        );

        const circles = getAllByTestId("corner-circle");
        expect(circles).toHaveLength(4);
    });

    //Test that dragging a corner calls the appropriate handler
    it("calls handleDragCorner when onDragMove triggers", () => {
        const { getAllByTestId } = render(
            <CornerHandles
                corners={corners}
                room={mockRoom}
                handleDragCorner={mockHandleDragCorner}
                getContainersBoundingBox={mockGetContainersBoundingBox}
            />
        );

        const firstCircle = getAllByTestId("corner-circle")[0];
        fireEvent.mouseMove(firstCircle);

        expect(mockHandleDragCorner).toHaveBeenCalledTimes(1);
        expect(mockHandleDragCorner).toHaveBeenCalledWith(
            0,
            expect.objectContaining({ x: 50, y: 50 })
        );
    });

    //Test dragBoundFunc constraints
    it("each Circle receives a dragBoundFunc", () => {
        render(
            <CornerHandles
                corners={corners}
                room={mockRoom}
                handleDragCorner={mockHandleDragCorner}
                getContainersBoundingBox={mockGetContainersBoundingBox}
            />
        );

        expect(Circle).toHaveBeenCalledTimes(4);
        Circle.mock.calls.forEach(([props]: any) => {
            expect(typeof props.dragBoundFunc).toBe("function");
            const result = props.dragBoundFunc({ x: 200, y: 200 });
            expect(result).toHaveProperty("x");
            expect(result).toHaveProperty("y");
        });
    });

    //Test that dragBoundFunc keeps corners within stage limits
    it("dragBoundFunc keeps position within stage limits", () => {
        render(
            <CornerHandles
                corners={corners}
                room={mockRoom}
                handleDragCorner={mockHandleDragCorner}
                getContainersBoundingBox={mockGetContainersBoundingBox}
            />
        );

        const { dragBoundFunc } = Circle.mock.calls[0][0];
        const pos = dragBoundFunc({ x: 99999, y: 99999 });

        expect(pos.x).toBeLessThanOrEqual(STAGE_WIDTH);
        expect(pos.y).toBeLessThanOrEqual(STAGE_HEIGHT);
    });
});
