import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import DoorsLayer from "../../../../../../src/pages/PlanningTool/RoomCanvas/components/Door/DoorsLayer";
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom";

// Mock DoorDrag component
vi.mock(
    "../../../../../../src/pages/PlanningTool/RoomCanvas/components/Door/components/DoorDrag",
    () => ({
        default: ({ door, selected, handleSelectDoor }: any) => (
            <div
                data-testid={`door-drag-${door.id}`}
                data-selected={selected ? "true" : "false"}
                onClick={() => handleSelectDoor(door.id)}
            >
                Door {door.id}
            </div>
        ),
    })
);

afterEach(cleanup);

describe("DoorsLayer", () => {
    const room = { x: 0, y: 0, width: 500, height: 400 };
    const handleDragDoor = vi.fn();
    const handleSelectDoor = vi.fn();

    const doors = [
        { id: 1, width: 90, x: 100, y: 0, wall: "top", rotation: 180 },
        { id: 2, width: 80, x: 200, y: 400, wall: "bottom", rotation: 0 },
    ];

    it("renders all doors", () => {
        render(
            <DoorsLayer
                doors={doors}
                selectedDoorId={null}
                room={room}
                handleDragDoor={handleDragDoor}
                handleSelectDoor={handleSelectDoor}
            />
        );

        doors.forEach((door) => {
            const doorElement = screen.getByTestId(`door-drag-${door.id}`);
            expect(doorElement).toBeInTheDocument();
            expect(doorElement).toHaveTextContent(`Door ${door.id}`);
            expect(doorElement.dataset.selected).toBe("false");
        });
    });

    it("marks the selected door correctly", () => {
        render(
            <DoorsLayer
                doors={doors}
                selectedDoorId={2}
                room={room}
                handleDragDoor={handleDragDoor}
                handleSelectDoor={handleSelectDoor}
            />
        );

        expect(screen.getByTestId("door-drag-1").dataset.selected).toBe("false");
        expect(screen.getByTestId("door-drag-2").dataset.selected).toBe("true");
    });

    it("calls handleSelectDoor when a door is clicked", () => {
        render(
            <DoorsLayer
                doors={doors}
                selectedDoorId={null}
                room={room}
                handleDragDoor={handleDragDoor}
                handleSelectDoor={handleSelectDoor}
            />
        );

        fireEvent.click(screen.getByTestId("door-drag-1"));
        expect(handleSelectDoor).toHaveBeenCalledWith(1);

        fireEvent.click(screen.getByTestId("door-drag-2"));
        expect(handleSelectDoor).toHaveBeenCalledWith(2);
    });
});
