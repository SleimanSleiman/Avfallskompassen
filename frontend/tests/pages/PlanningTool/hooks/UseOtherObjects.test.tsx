import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOtherObjects } from "../../../../src/pages/PlanningTool/hooks/useOtherObjects";

// ─────────────── Test data ───────────────
const room = { x: 0, y: 0, width: 500, height: 400 };

// ─────────────── Mock functions ───────────────
let setSelectedOtherObjectId: ReturnType<typeof vi.fn>;
let setSelectedContainerId: ReturnType<typeof vi.fn>;
let setSelectedDoorId: ReturnType<typeof vi.fn>;

describe("useOtherObjects hook", () => {
    beforeEach(() => {
        setSelectedOtherObjectId = vi.fn();
        setSelectedContainerId = vi.fn();
        setSelectedDoorId = vi.fn();
        vi.clearAllMocks();
    });

    it("should add a new other object at valid position", () => {
        const { result } = renderHook(() =>
            useOtherObjects(room, setSelectedOtherObjectId, setSelectedContainerId, setSelectedDoorId)
        );

        act(() => {
            const success = result.current.handleAddOtherObject("Cabinet", 50, 60);
            expect(success).toBe(true);
        });

        expect(result.current.otherObjects.length).toBe(1);
        expect(result.current.otherObjects[0].name).toBe("Cabinet");
        expect(setSelectedOtherObjectId).toHaveBeenCalledWith(expect.any(Number));
    });

    it("should remove an object", () => {
        const { result } = renderHook(() =>
            useOtherObjects(room, setSelectedOtherObjectId, setSelectedContainerId, setSelectedDoorId)
        );

        act(() => {
            result.current.handleAddOtherObject("Cabinet", 50, 60);
        });

        const id = result.current.otherObjects[0].id;

        act(() => {
            result.current.handleRemoveOtherObject(id);
        });

        expect(result.current.otherObjects.length).toBe(0);
        expect(setSelectedOtherObjectId).toHaveBeenCalledWith(null);
    });

    it("should rotate an object", () => {
        const { result } = renderHook(() =>
            useOtherObjects(room, setSelectedOtherObjectId, setSelectedContainerId, setSelectedDoorId)
        );

        act(() => {
            result.current.handleAddOtherObject("Cabinet", 50, 60);
        });

        const id = result.current.otherObjects[0].id;

        act(() => {
            result.current.handleRotateOtherObject(id);
        });

        expect(result.current.otherObjects[0].rotation).toBe(90);

        act(() => {
            result.current.handleRotateOtherObject(id);
        });

        expect(result.current.otherObjects[0].rotation).toBe(180);
    });

    it("should drag an object to a new position", () => {
        const { result } = renderHook(() =>
            useOtherObjects(room, setSelectedOtherObjectId, setSelectedContainerId, setSelectedDoorId)
        );

        act(() => {
            result.current.handleAddOtherObject("Cabinet", 50, 60);
        });

        const id = result.current.otherObjects[0].id;

        act(() => {
            result.current.handleDragOtherObject(id, { x: 100, y: 150 });
        });

        const obj = result.current.otherObjects.find(o => o.id === id);
        expect(obj!.x).toBe(100);
        expect(obj!.y).toBe(150);
    });

    it("should handle object selection", () => {
        const { result } = renderHook(() =>
            useOtherObjects(room, setSelectedOtherObjectId, setSelectedContainerId, setSelectedDoorId)
        );

        act(() => {
            result.current.handleSelectOtherObject(42);
        });

        expect(setSelectedOtherObjectId).toHaveBeenCalledWith(42);
        expect(setSelectedContainerId).toHaveBeenCalledWith(null);
        expect(setSelectedDoorId).toHaveBeenCalledWith(null);
    });

    it("should correctly report if object is inside or outside the room", () => {
        const { result } = renderHook(() =>
            useOtherObjects(room, setSelectedOtherObjectId, setSelectedContainerId, setSelectedDoorId)
        );

        act(() => {
            result.current.handleAddOtherObject("Cabinet", 50, 60);
        });

        const obj = result.current.otherObjects[0];

        // inside room
        expect(result.current.isObjectInsideRoom(obj, room)).toBe(true);

        // move outside room
        act(() => {
            result.current.handleDragOtherObject(obj.id, { x: 1000, y: 1000 });
        });

        expect(result.current.isObjectInsideRoom(result.current.otherObjects[0], room)).toBe(false);
    });
});
