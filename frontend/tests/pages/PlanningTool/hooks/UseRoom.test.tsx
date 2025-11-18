import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRoom } from "../../../../src/pages/PlanningTool/hooks/UseRoom";
import { STAGE_WIDTH, STAGE_HEIGHT, SCALE, MIN_WIDTH, MIN_HEIGHT, ROOM_HORIZONTAL_OFFSET, ROOM_VERTICAL_OFFSET } from "../../../../src/pages/PlanningTool/Constants";

describe("useRoom", () => {
    const defaultRoomWidthMeters = 5;
    const defaultRoomHeightMeters = 5;
    const defaultRoomWidthPx = defaultRoomWidthMeters / SCALE;
    const defaultRoomHeightPx = defaultRoomHeightMeters / SCALE;

    beforeEach(() => {
        localStorage.clear();
    });

    //Test initialization of room from defaults
    it("initializes room from defaults when no localStorage is present", () => {
        const { result } = renderHook(() => useRoom());

        const { room } = result.current;
        expect(room.width).toBeCloseTo(defaultRoomWidthPx);
        expect(room.height).toBeCloseTo(defaultRoomHeightPx);

        expect(room.x).toBeCloseTo((STAGE_WIDTH - defaultRoomWidthPx) / 2 + ROOM_HORIZONTAL_OFFSET);
        expect(room.y).toBeCloseTo((STAGE_HEIGHT - defaultRoomHeightPx) / 2 + ROOM_VERTICAL_OFFSET);
    });

    //Test restoration of room from localStorage
    it("falls back to defaults when legacy room dimensions are stored", () => {
        localStorage.setItem(
            "enviormentRoomData",
            JSON.stringify({ width: 12, height: 9 })
        );

        const { result } = renderHook(() => useRoom());

        expect(result.current.room.width).toBeCloseTo(defaultRoomWidthPx);
        expect(result.current.room.height).toBeCloseTo(defaultRoomHeightPx);
    });

    //Test resizing room by dragging a corner
    it("updates room size when dragging a corner (bottom-right)", () => {
        const { result } = renderHook(() => useRoom());

        const initialRoom = result.current.room;

        act(() => {
            result.current.handleDragCorner(2, {
                x: initialRoom.x + initialRoom.width + 100,
                y: initialRoom.y + initialRoom.height + 50,
            });
        });

        const newRoom = result.current.room;
        expect(newRoom.width).toBeGreaterThan(initialRoom.width);
        expect(newRoom.height).toBeGreaterThan(initialRoom.height);
    });

    //Test constraints on minimum room size
    it("does not allow resizing smaller than MIN_WIDTH or MIN_HEIGHT", () => {
        const { result } = renderHook(() => useRoom());

        const initialRoom = result.current.room;

        act(() => {
            result.current.handleDragCorner(0, {
                x: initialRoom.x + initialRoom.width - 10,
                y: initialRoom.y + initialRoom.height - 10,
            });
        });

        const newRoom = result.current.room;
        expect(newRoom.width).toBeCloseTo(MIN_WIDTH, 10);
        expect(newRoom.height).toBeCloseTo(MIN_HEIGHT, 10);
    });

    //Test calculation of corners for resizing handles
    it("returns correct corners for resizing handles", () => {
        const { result } = renderHook(() => useRoom());

        const { corners, room } = result.current;
        expect(corners.length).toBe(4);

        expect(corners[0]).toEqual({ x: room.x, y: room.y });
        expect(corners[2]).toEqual({
            x: room.x + room.width,
            y: room.y + room.height,
        });
    });
});
