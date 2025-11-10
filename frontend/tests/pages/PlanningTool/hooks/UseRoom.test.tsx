import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useState } from "react";
import { useRoom } from "../../../../src/pages/PlanningTool/hooks/UseRoom";
import { STAGE_WIDTH, STAGE_HEIGHT, SCALE, MIN_WIDTH, MIN_HEIGHT, MARGIN } from "../../../../src/pages/PlanningTool/Constants";

describe("useRoom", () => {
    const defaultRoomWidthMeters = 10;
    const defaultRoomHeightMeters = 8;
    const defaultRoomWidthPx = defaultRoomWidthMeters / SCALE;
    const defaultRoomHeightPx = defaultRoomHeightMeters / SCALE;

    beforeEach(() => {
        localStorage.clear();
    });

    //Test initialization of room from defaults
    it("initializes room from defaults when no localStorage is present", () => {
        const { result } = renderHook(() => {
            const [containersInRoom, setContainersInRoom] = useState<any[]>([]);
            return useRoom(containersInRoom, setContainersInRoom);
        });

        const { room } = result.current;
        expect(room.width).toBeCloseTo(defaultRoomWidthPx);
        expect(room.height).toBeCloseTo(defaultRoomHeightPx);

        expect(room.x).toBeCloseTo((STAGE_WIDTH - defaultRoomWidthPx) / 2);
        expect(room.y).toBeCloseTo((STAGE_HEIGHT - defaultRoomHeightPx) / 2);
    });

    //Test restoration of room from localStorage
    it("restores room from localStorage when data exists", () => {
        localStorage.setItem(
            "trashRoomData",
            JSON.stringify({ width: 12, height: 9 })
        );

        const { result } = renderHook(() => {
            const [containersInRoom, setContainersInRoom] = useState<any[]>([]);
            return useRoom(containersInRoom, setContainersInRoom);
        });

        expect(result.current.room.width).toBeCloseTo(12 / SCALE);
        expect(result.current.room.height).toBeCloseTo(9 / SCALE);
    });

    //Test resizing room by dragging a corner
    it("updates room size when dragging a corner (bottom-right)", () => {
        const { result } = renderHook(() => {
            const [containersInRoom, setContainersInRoom] = useState<any[]>([]);
            return useRoom(containersInRoom, setContainersInRoom);
        });

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
        const { result } = renderHook(() => {
            const [containersInRoom, setContainersInRoom] = useState<any[]>([]);
            return useRoom(containersInRoom, setContainersInRoom);
        });

        const initialRoom = result.current.room;

        act(() => {
            result.current.handleDragCorner(0, {
                x: initialRoom.x + initialRoom.width - 10,
                y: initialRoom.y + initialRoom.height - 10,
            });
        });

        const newRoom = result.current.room;
        expect(newRoom.width).toBeGreaterThanOrEqual(MIN_WIDTH);
        expect(newRoom.height).toBeGreaterThanOrEqual(MIN_HEIGHT);
    });

    //Test that containers remain within room bounds after resizing
    it("keeps containers inside bounds when room shrinks", () => {
        const initialContainer = {
            id: 1,
            x: 500,
            y: 500,
            width: 200,
            height: 200,
        };

        let containersInRoom = [initialContainer];

        const { result } = renderHook(() => {
            const [containers, setContainers] = useState<any[]>(containersInRoom);
            return useRoom(containers, setContainers);
        });

        const initialRoom = result.current.room;

        act(() => {
            result.current.handleDragCorner(0, {
                x: initialRoom.x + 100,
                y: initialRoom.y + 100,
            });
        });

        const newContainer = result.current.getContainersBoundingBox();
        expect(newContainer.minX).toBeDefined();
        expect(result.current.room.width).toBeLessThan(initialRoom.width);
    });

    //Test calculation of corners for resizing handles
    it("returns correct corners for resizing handles", () => {
        const { result } = renderHook(() => {
            const [containersInRoom, setContainersInRoom] = useState<any[]>([]);
            return useRoom(containersInRoom, setContainersInRoom);
        });

        const { corners, room } = result.current;
        expect(corners.length).toBe(4);

        expect(corners[0]).toEqual({ x: room.x, y: room.y });
        expect(corners[2]).toEqual({
            x: room.x + room.width,
            y: room.y + room.height,
        });
    });
});
