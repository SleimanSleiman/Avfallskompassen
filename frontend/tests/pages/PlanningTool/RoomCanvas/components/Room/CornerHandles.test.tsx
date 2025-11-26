import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import CornerHandles from "../../../../../../src/pages/PlanningTool/RoomCanvas/components/Room/CornerHandles";

vi.mock("../../../../../../src/pages/PlanningTool/Constants", () => ({
    MARGIN: 10,
    STAGE_WIDTH: 800,
    STAGE_HEIGHT: 600,
    MIN_WIDTH: 50,
    MIN_HEIGHT: 40,
    clamp: (v: number, min: number, max: number) => Math.min(Math.max(v, min), max),
}));

vi.mock("react-konva", () => {
    const propsStore = new WeakMap<any, any>();
    return {
        Circle: (props: any) => (
            <div
                data-testid={`circle-${props.index}`}
                ref={(el) => el && propsStore.set(el, props)}
            />
        ),
        getKonvaProps: (el: any) => propsStore.get(el),
    };
});

describe("CornerHandles (dragBoundFunc test with getKonvaProps)", () => {
    const corners = [
        { x: 100, y: 100 },
        { x: 300, y: 100 },
        { x: 300, y: 300 },
        { x: 100, y: 300 },
    ];

    const room = { id: 1, x: 100, y: 100, width: 200, height: 200 };
    const handleDragCorner = vi.fn();

    it("renders 4 corner circles", () => {
        const { getAllByTestId } = render(
          <CornerHandles corners={corners} room={room} handleDragCorner={handleDragCorner} />
        );

        const circles = getAllByTestId(/circle-/);
        expect(circles).toHaveLength(4);
      });

    it("dragBoundFunc clamps top-left and bottom-right corners", async () => {
        const { getByTestId } = render(
            <CornerHandles corners={corners} room={room} handleDragCorner={handleDragCorner} />
        );

        const { getKonvaProps } = await import("react-konva");

        const circle0 = getByTestId("circle-0");
        const props0 = getKonvaProps(circle0);
        const pos0 = props0.dragBoundFunc({ x: -50, y: -50 });
        expect(pos0.x).toBe(10);
        expect(pos0.y).toBe(10);

        const circle2 = getByTestId("circle-2");
        const props2 = getKonvaProps(circle2);
        const pos2 = props2.dragBoundFunc({ x: 1000, y: 1000 });
        expect(pos2.x).toBe(800 - 10);
        expect(pos2.y).toBe(600 - 10);
    });
});
