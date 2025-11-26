import { render, screen, fireEvent } from "@testing-library/react";
import DoorDrag from "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Door/components/DoorDrag";
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom";

    vi.mock(
    "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Door/components/DoorVisual",
    () => ({
        default: ({ door, selected }: any) => (
            <div data-testid={`door-visual-${door.id}`} data-selected={selected ? "true" : "false"} />
        ),
    })
);

vi.mock("react-konva", () => ({
    Group: (props: any) => {
        return (
            <div
                data-testid="group"
                onClick={props.onClick}
                onDragMove={props.onDragMove}
                draggable={props.draggable}
            >
                {props.children}
            </div>
        );
    },
        Line: (props: any) => <div />,
        Arc: (props: any) => <div />,
}));

afterEach(() => vi.clearAllMocks());

describe("DoorDrag component (Option 1 - partial render with react-konva)", () => {
    const room = { x: 0, y: 0, width: 500, height: 400 };
    const handleDragDoor = vi.fn();
    const handleSelectDoor = vi.fn();
    const door = { id: 1, width: 90, x: 100, y: 0, wall: "top", rotation: 180 };

    it("renders DoorVisual inside the Group", () => {
        render(
            <DoorDrag
                door={door}
                selected={false}
                room={room}
                handleDragDoor={handleDragDoor}
                handleSelectDoor={handleSelectDoor}
            />
        );

        const visual = screen.getByTestId(`door-visual-${door.id}`);
        expect(visual).toBeInTheDocument();
        expect(visual.dataset.selected).toBe("false");
    });

    it("passes selected prop to DoorVisual", () => {
        render(
            <DoorDrag
                door={door}
                selected={true}
                room={room}
                handleDragDoor={handleDragDoor}
                handleSelectDoor={handleSelectDoor}
            />
        );

        const visual = screen.getByTestId(`door-visual-${door.id}`);
        expect(visual.dataset.selected).toBe("true");
    });

    it("calls handleSelectDoor on click", () => {
        render(
            <DoorDrag
                door={door}
                selected={false}
                room={room}
                handleDragDoor={handleDragDoor}
                handleSelectDoor={handleSelectDoor}
            />
        );

        const visual = screen.getByTestId(`door-visual-${door.id}`);
        fireEvent.click(visual);
        expect(handleSelectDoor).toHaveBeenCalledWith(door.id);
    });

    it("calls handleDragDoor on drag move", () => {
        render(
            <DoorDrag
                door={door}
                selected={false}
                room={room}
                handleDragDoor={handleDragDoor}
                handleSelectDoor={handleSelectDoor}
            />
        );

        const visual = screen.getByTestId(`door-visual-${door.id}`);
        fireEvent.drag(visual, { target: { position: () => ({ x: 150, y: 50 }) } });
    });
});
