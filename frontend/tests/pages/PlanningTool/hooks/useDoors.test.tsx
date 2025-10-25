import { renderHook, act } from "@testing-library/react";
import { useDoors } from "../../../../src/pages/PlanningTool/hooks/useDoors";
import { SCALE } from "../../../src/constants";

//Mock room data
const mockRoom = {
    x: 100,
    y: 100,
    width: 400,
    height: 300,
};

describe("useDoors hook", () => {
    //Test adding a new door
    it("adds a new door to the room", () => {
        const { result } = renderHook(() => useDoors(mockRoom));

        act(() => {
            result.current.handleAddDoor({ width: 1 });
        });

        const door = result.current.doors[0];
        expect(result.current.doors.length).toBe(1);
        expect(door.wall).toBe("bottom");
        expect(result.current.selectedDoorId).toBe(door.id);
    });

    //Test removing a door
    it("removes a door from the room", () => {
        const { result } = renderHook(() => useDoors(mockRoom));

        act(() => {
            result.current.handleAddDoor({ width: 1 });
        });

        const id = result.current.doors[0].id;

        act(() => {
            result.current.handleRemoveDoor(id);
        });

        expect(result.current.doors.length).toBe(0);
    });

    //Test selecting a door
    it("selects a door by id", () => {
        const { result } = renderHook(() => useDoors(mockRoom));

        act(() => {
            result.current.handleAddDoor({ width: 1 });
        });

        const id = result.current.doors[0].id;

        act(() => {
            result.current.handleSelectDoor(id);
        });

        expect(result.current.selectedDoorId).toBe(id);
    });

    //Test rotating a door
    it("updates door rotation and swing direction", () => {
        const { result } = renderHook(() => useDoors(mockRoom));

        act(() => {
            result.current.handleAddDoor({ width: 1 });
        });

        const id = result.current.doors[0].id;

        act(() => {
            result.current.handleRotateDoor(id, 90, "inward");
        });

        const door = result.current.doors.find(d => d.id === id);
        expect(door?.rotation).toBe(90);
        expect(door?.swingDirection).toBe("inward");
    });

    //Test dragging door to another wall
    it("moves door to another wall when dragged across room boundary", () => {
        const { result } = renderHook(() => useDoors(mockRoom));

        act(() => {
            result.current.handleAddDoor({ width: 1 });
        });

        const id = result.current.doors[0].id;
        const initialWall = result.current.doors[0].wall;

        //Drag far to the right (should move to right wall)
        act(() => {
            result.current.handleDragDoor(id, { x: mockRoom.x + mockRoom.width + 50, y: mockRoom.y + 150 });
        });

        const updatedDoor = result.current.doors.find(d => d.id === id);
        expect(updatedDoor?.wall).toBe("right");
        expect(updatedDoor?.wall).not.toBe(initialWall);
    });

    //Test door position updates when room changes
    it("updates door position when room size changes", () => {
        const { result, rerender } = renderHook(({ room }) => useDoors(room), {
            initialProps: { room: mockRoom },
        });

        act(() => {
            result.current.handleAddDoor({ width: 1 });
        });

        const id = result.current.doors[0].id;
        const oldX = result.current.doors[0].x;

        //Change room width → should trigger useEffect
        const newRoom = { ...mockRoom, width: 800 };
        rerender({ room: newRoom });

        const updatedDoor = result.current.doors.find(d => d.id === id);
        expect(updatedDoor?.x).not.toBe(oldX);
    });
});
