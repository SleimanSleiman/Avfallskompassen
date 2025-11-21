import { computeDragBound } from "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Door/utils/DoorDragUtils";
import { describe, it, expect } from "vitest";

describe("computeDragBound", () => {
    const room = { x: 0, y: 0, width: 500, height: 400 };

    it("clamps a top-wall door above top boundary", () => {
        const door = { id: 1, width: 90, x: 100, y: 0, wall: "top" };
        const pos = { x: -50, y: -100 };
        const result = computeDragBound(door, room, pos);
        expect(result.y).toBe(room.y);
        expect(result.x).toBeGreaterThanOrEqual(room.x);
        expect(result.x).toBeLessThanOrEqual(room.x + room.width);
    });

    it("clamps a left-wall door outside left boundary", () => {
        const door = { id: 2, width: 80, x: 0, y: 100, wall: "left" };
        const pos = { x: -100, y: 200 };
        const result = computeDragBound(door, room, pos);
        expect(result.x).toBe(room.x);
        expect(result.y).toBe(200);
    });
});
