/**
 * Custom hook to manage room's position, size, and resizing logic.
 * Handles corner dragging, constraints, and initial state from localStorage.
 */
import { useState } from "react";
import { SCALE, STAGE_WIDTH, STAGE_HEIGHT, MIN_WIDTH, MIN_HEIGHT, MARGIN, clamp } from "../Constants";
import type { Room } from "../Types";

export function useRoom() {
    /* ──────────────── Initial Room State ──────────────── */
    const initialRoom = (() => {
        const savedRoom = localStorage.getItem("trashRoomData");
        const defaultWidthMeters = 10;
        const defaultHeightMeters = 8;
        const defaultX = (STAGE_WIDTH - defaultWidthMeters / SCALE) / 2;
        const defaultY = (STAGE_HEIGHT - defaultHeightMeters / SCALE) / 2;

        if (savedRoom) {
            try {
                const parsed = JSON.parse(savedRoom);

                const widthMeters = parsed.width ?? defaultWidthMeters;
                const heightMeters = parsed.height ?? defaultHeightMeters;

                return {
                    x: (STAGE_WIDTH - widthMeters / SCALE) / 2,
                    y: (STAGE_HEIGHT - heightMeters / SCALE) / 2,
                    width: widthMeters / SCALE,
                    height: heightMeters / SCALE,
                };
            } catch {
                return { x: defaultX, y: defaultY, width: defaultWidthMeters / SCALE, height: defaultHeightMeters / SCALE };
            }
        }

        return { x: defaultX, y: defaultY, width: defaultWidthMeters / SCALE, height: defaultHeightMeters / SCALE };
    })();


    /* ──────────────── Room State ──────────────── */
    const [room, setRoom] = useState<Room>(initialRoom);

    //Resize logic
    const handleDragCorner = (index: number, pos: { x: number; y: number }) => {
        let { x, y, width, height } = room;

        switch (index) {
            case 0: // Top-left
                const newX = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
                const newY = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                width = x + width - newX;
                height = y + height - newY;
                x = newX;
                y = newY;
                break;
            case 1: // Top-right
                const newTRX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                const newTRY = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                width = newTRX - x;
                height = y + height - newTRY;
                y = newTRY;
                break;
            case 2: // Bottom-right
                const newBRX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                const newBRY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                width = newBRX - x;
                height = newBRY - y;
                break;
            case 3: // Bottom-left
                const newBLX = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
                const newBLY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                width = x + width - newBLX;
                height = newBLY - y;
                x = newBLX;
                break;
        }

        setRoom({ x, y, width, height });
    };


    //Define corners for resizing handles
    const corners = [
        { x: room.x, y: room.y },
        { x: room.x + room.width, y: room.y },
        { x: room.x + room.width, y: room.y + room.height },
        { x: room.x, y: room.y + room.height },
    ];

    /* ──────────────── Return ──────────────── */
    return {
        room,
        setRoom,
        corners,
        handleDragCorner
    };
}
