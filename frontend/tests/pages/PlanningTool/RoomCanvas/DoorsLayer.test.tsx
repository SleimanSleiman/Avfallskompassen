import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import DoorsLayer from "../../../../src/pages/PlanningTool/RoomCanvas/DoorsLayer";
import type { Door } from "../../../../src/pages/PlanningTool/Types";
import * as KonvaMock from "react-konva";
import { vi, describe, it, expect } from "vitest";

// ─────────────── Mock react-konva ───────────────
vi.mock("react-konva", async () => {
    const actual: any = await vi.importActual("react-konva");
    const groupPropsStore = new Map<string, any>();

    return {
        ...actual,
        Group: ({ children, ...props }: any) => {
            const id = props["data-testid"];
            if (id) groupPropsStore.set(id, props);
            return <div {...props}>{children}</div>;
        },
        Arc: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        Line: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        __groupStore: groupPropsStore,
    };
});

const defaultDoors: Door[] = [
    { id: "d1", x: 100, y: 100, rotation: 0, wall: "top", width: 80 },
];

const defaultRoom = { x: 0, y: 0, width: 500, height: 400 };

// ─────────────── Helper function ───────────────
const renderDoorsLayer = (overrideProps: Partial<React.ComponentProps<typeof DoorsLayer>> = {}) =>
    render(
        <DoorsLayer
            doors={defaultDoors}
            selectedDoorId={null}
            handleSelectDoor={() => {}}
            handleDragDoor={() => {}}
            room={defaultRoom}
            {...overrideProps}
        />
    );

function getProps(id: string) {
    return (KonvaMock as any).__groupStore.get(id);
}

// ─────────────── Tests ───────────────
describe("DoorsLayer", () => {
    it("renders a group per door", () => {
        renderDoorsLayer();
        expect(screen.getByTestId("door-group-d1")).toBeInTheDocument();
    });

    it("calls handleSelectDoor when clicked", async () => {
        const user = userEvent.setup();
        const mockSelect = vi.fn();
        renderDoorsLayer({ handleSelectDoor: mockSelect });

        const group = screen.getByTestId("door-group-d1");
        await user.click(group);

        expect(mockSelect).toHaveBeenCalledWith("d1");
    });

    it("highlights when selected", () => {
        renderDoorsLayer({ selectedDoorId: "d1" });

        const arc = screen.getByTestId("door-arc-d1");
        expect(arc.getAttribute("stroke")).toBe("orange");
    });

    it("snaps dragging to the closest allowed wall", () => {
        renderDoorsLayer();

        const props = getProps("door-group-d1");
        const dragBoundFunc = props.dragBoundFunc;

        const bottom = dragBoundFunc({ x: 200, y: 999 });
        expect(bottom.y).toBe(defaultRoom.height);

        const top = dragBoundFunc({ x: 200, y: -50 });
        expect(top.y).toBe(defaultRoom.y);

        const left = dragBoundFunc({ x: -50, y: 200 });
        expect(left.x).toBe(defaultRoom.x);

        const right = dragBoundFunc({ x: 600, y: 200 });
        expect(right.x).toBe(defaultRoom.width);
    });

    it("calls handleDragDoor on drag move", () => {
        const mockDrag = vi.fn();
        renderDoorsLayer({ handleDragDoor: mockDrag });

        const props = getProps("door-group-d1");
        const mockEvent = { target: { position: () => ({ x: 150, y: 40 }) } };

        props.onDragMove(mockEvent);

        expect(mockDrag).toHaveBeenCalledWith(
            "d1",
            { x: 150, y: 40 },
            defaultRoom
        );
    });
});
