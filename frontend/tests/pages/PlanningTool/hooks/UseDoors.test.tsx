import { renderHook, act } from "@testing-library/react";
import { useDoors } from "../../../../src/pages/PlanningTool/hooks/useDoors";
import { SCALE } from "../../../../src/pages/PlanningTool/lib/Constants";

//Mock room data
const mockRoom = {
    x: 100,
    y: 100,
    width: 400,
    height: 300,
};

describe("useDoors hook", () => {
    const mockSetSelectedDoorId = vi.fn();
    const mockSetSelectedContainerId = vi.fn();
    const mockSetSelectedOtherObjectId = vi.fn();
    const mockSetError = vi.fn();
    const mockSetMsg = vi.fn();
    vi.useFakeTimers();

    //Mock global alert
    beforeAll(() => {
            global.alert = vi.fn();
    });

    beforeEach(() => {
        let counter = 1;
        vi.spyOn(Date, "now").mockImplementation(() => counter++);
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });


    //Test adding a new door
    it("adds a new door to the room", () => {

        const { result } = renderHook(() => useDoors(mockRoom, mockSetSelectedDoorId, mockSetSelectedContainerId, mockSetSelectedOtherObjectId, mockSetError, mockSetMsg));

        let added: boolean;
        act(() => {
            added = result.current.handleAddDoor({ width: 1.2 });
        });

        expect(added).toBe(true);
        expect(result.current.doors.length).toBe(1);
        const door = result.current.doors[0];
        expect(door.wall).toBe("bottom");
        expect(mockSetSelectedDoorId).toHaveBeenCalledWith(door.id);
    });

    //Test adding a door with width less than 1.2m when it's the first door
    it("does not add a door if first door is smaller than 1.2m", () => {
        const { result } = renderHook(() => useDoors(mockRoom, mockSetSelectedDoorId, mockSetSelectedContainerId, mockSetSelectedOtherObjectId, mockSetError, mockSetMsg))

        let added: boolean;
        act(() => {
            added = result.current.handleAddDoor({ width: 1 });
        });

        act(() => {
            vi.runAllTimers();
        });

        expect(added).toBe(false);
        expect(result.current.doors.length).toBe(0);
        expect(mockSetError).toHaveBeenCalledWith("Minst en dörr måste vara 1.2 meter bred.");
    });

    //Test adding a smaller door after a large door exists
    it("allows adding smaller doors after a large door exists", () => {
        const { result } = renderHook(() => useDoors(mockRoom, mockSetSelectedDoorId, mockSetSelectedContainerId, mockSetSelectedOtherObjectId, mockSetError, mockSetMsg))

        act(() => {
            result.current.handleAddDoor({ width: 1.2 });
        });

        let added: boolean;
        act(() => {
            added = result.current.handleAddDoor({ width: 0.9 });
        });

        expect(added).toBe(true);
        expect(result.current.doors.length).toBe(2);
    });

    //Test removing a door >=1.2m when it's the only large door
    it("prevents removing the last large door (≥1.2m)", () => {
        const { result } = renderHook(() => useDoors(mockRoom, mockSetSelectedDoorId, mockSetSelectedContainerId, mockSetSelectedOtherObjectId, mockSetError, mockSetMsg))

        act(() => {
            result.current.handleAddDoor({ width: 1.2 });
        });

        act(() => {
            result.current.handleAddDoor({ width: 0.9 });
        });

        const largeDoor = result.current.doors.find(d => d.width >= 1.2)!;

        act(() => {
            result.current.handleRemoveDoor(largeDoor.id);
        });

        act(() => {
            vi.runAllTimers();
        });

        const stillExists = result.current.doors.some(d => d.id === largeDoor.id);
        expect(stillExists).toBe(true);
        expect(mockSetError).toHaveBeenCalledWith("Minst en dörr måste vara 1.2 meter bred.");
    });

    //Test removing a small door normally
    it("removes a small door normally", async () => {
        const { result } = renderHook(() => useDoors(mockRoom, mockSetSelectedDoorId, mockSetSelectedContainerId, mockSetSelectedOtherObjectId, mockSetError, mockSetMsg))

        act(() => {
            result.current.handleAddDoor({ width: 1.2 });
        });

        act(() => {
            result.current.handleAddDoor({ width: 0.9 });
        });

        const smallDoor = result.current.doors.find(d => d.width < 1.2)!;
        act(() => {
            result.current.handleRemoveDoor(smallDoor.id);
        });

        const stillExists = result.current.doors.some(d => d.id === smallDoor.id);
        expect(stillExists).toBe(false);
    });


    //Test selecting a door
    it("selects a door by id", () => {
        const { result } = renderHook(() => useDoors(mockRoom, mockSetSelectedDoorId, mockSetSelectedContainerId,mockSetSelectedOtherObjectId, mockSetError, mockSetMsg));

        act(() => {
            result.current.handleAddDoor({ width: 1.2 });
        });

        const door = result.current.doors[0];

        act(() => {
            result.current.handleSelectDoor(door.id);
        });

        expect(mockSetSelectedDoorId).toHaveBeenCalledWith(door.id);
    });

    //Test rotating a door
    it("updates door rotation and swing direction", () => {
        const { result } = renderHook(() =>
            useDoors(mockRoom, mockSetSelectedDoorId, mockSetSelectedContainerId, mockSetSelectedOtherObjectId, mockSetError, mockSetMsg)
        );

        act(() => {
            result.current.handleAddDoor({ width: 1.2 });
        });

        const id = result.current.doors[0].id;
        const before = result.current.doors.find(d => d.id === id)!;

        act(() => {
            result.current.handleRotateDoor(id);
        });

        const after = result.current.doors.find(d => d.id === id)!;

        expect(after.rotation).toBe((before.rotation + 180) % 360);
        expect(after.swingDirection).toBe(
            before.swingDirection === "inward" ? "outward" : "inward"
        );
    });

    //Test dragging door to another wall
    it("moves door to another wall when dragged across room boundary", () => {
        const { result } = renderHook(() => useDoors(mockRoom, mockSetSelectedDoorId, mockSetSelectedContainerId,mockSetSelectedOtherObjectId, mockSetError, mockSetMsg));

        act(() => {
            result.current.handleAddDoor({ width: 1.2 });
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

    //Test rotation update when dragging inward-swing door to new wall
    it("updates rotation correctly when dragging inward-swing door to new wall", () => {
        const { result } = renderHook(() =>
            useDoors(mockRoom, mockSetSelectedDoorId, mockSetSelectedContainerId, mockSetSelectedOtherObjectId, mockSetError, mockSetMsg)
        );

        act(() => {
            result.current.handleAddDoor({ width: 1.2 });
        });

        const id = result.current.doors[0].id;

        act(() => {
            result.current.handleRotateDoor(id, 0, "inward");
        });

        act(() => {
            result.current.handleDragDoor(id, { x: mockRoom.x + mockRoom.width + 50, y: 150 });
        });

        const door = result.current.doors.find(d => d.id === id);
        expect(door?.wall).toBe("right");
        expect(door?.rotation).toBe(-90 + 180);
    });

    //Test door position updates when room changes
    it("updates door position when room size changes", () => {
        const { result, rerender } = renderHook(({ room }) => useDoors(room, mockSetSelectedDoorId, mockSetSelectedContainerId, mockSetSelectedOtherObjectId, mockSetError, mockSetMsg), {
            initialProps: { room: mockRoom },
        });

        act(() => {
            result.current.handleAddDoor({ width: 1.2 });
        });

        const id = result.current.doors[0].id;
        const oldX = result.current.doors[0].x;

        const newRoom = { ...mockRoom, width: 800 };
        rerender({ room: newRoom });

        const updatedDoor = result.current.doors.find(d => d.id === id);
        expect(updatedDoor?.x).not.toBe(oldX);
    });

    //Test door zone generation
    it("generates door zones correctly", () => {
        const { result } = renderHook(() => useDoors(mockRoom, mockSetSelectedDoorId, mockSetSelectedContainerId, mockSetSelectedOtherObjectId, mockSetError, mockSetMsg));
        act(() => result.current.handleAddDoor({ width: 1.2 }));

        const zones = result.current.getDoorZones();
        expect(Array.isArray(zones)).toBe(true);
        expect(zones.length).toBe(1);

        const door = result.current.doors[0];
        const zone = zones[0];
        expect(zone.width).toBe(door.width / SCALE);
        expect(zone.height).toBe(door.width / SCALE);
    });
});
