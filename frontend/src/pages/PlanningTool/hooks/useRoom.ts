/**
 * Custom hook to manage room's position, size, and resizing logic.
 * Handles corner dragging, constraints, and initial state from localStorage.
 */
import { useState } from "react";
import { SCALE, STAGE_WIDTH, STAGE_HEIGHT, MIN_WIDTH, MIN_HEIGHT, MARGIN, clamp } from "../constants";
import type { Room } from "../types";

export function useRoom() {
    /* ──────────────── Initial Room State ──────────────── */
    const initialRoom = (() => {
        const savedRoom = localStorage.getItem("trashRoomData");

        //if saved room data exists in localStorage, parse and center it
        if (savedRoom) {
            const parsed = JSON.parse(savedRoom);
            const roomWidth = parsed.length ? parsed.length / SCALE : 450;
            const roomHeight = parsed.width ? parsed.width / SCALE : 350;
            return {
                x: (STAGE_WIDTH - roomWidth) / 2,
                y: (STAGE_HEIGHT - roomHeight) / 2,
                width: roomWidth,
                height: roomHeight,
            };
        }

        //Default room size and position
        return { x: 120, y: 120, width: 450, height: 350 };
    })();

    /* ──────────────── Room State ──────────────── */
    const [room, setRoom] = useState<Room>(initialRoom);

    //Resize logic
    const handleDragCorner = (index: number, pos: { x: number; y: number }) => {
        let { x, y, width, height } = room;

        switch (index) {
            case 0: //Top-left corner
                x = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
                y = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                width = room.x + room.width - x;
                height = room.y + room.height - y;
                break;

            case 1: //Top-right corner
                const trX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                const trY = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                width = trX - x;
                height = room.y + room.height - trY;
                y = trY;
                break;

            case 2: //Bottom-right corner
                const brX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                const brY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                width = brX - x;
                height = brY - y;
                break;

            case 3: //Bottom-left corner
                const blX = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
                const blY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                x = blX;
                width = room.x + room.width - x;
                height = blY - y;
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
