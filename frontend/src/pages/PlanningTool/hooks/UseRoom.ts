/**
 * Custom hook to manage room's position, size, and resizing logic.
 * Handles corner dragging, constraints, and initial state from localStorage.
 */
import { useState } from "react";
import { SCALE, STAGE_WIDTH, STAGE_HEIGHT, MIN_WIDTH, MIN_HEIGHT, MARGIN, clamp, mmToPixels, ROOM_VERTICAL_OFFSET, ROOM_HORIZONTAL_OFFSET } from "../Constants";
import type { Room, Door } from "../Types";

type StoredContainerDTO = {
    imageTopViewUrl?: string;
    imageFrontViewUrl?: string;
    width?: number;
    depth?: number;
    height?: number;
    name?: string;
    size?: number;
};

type StoredContainer = {
    id?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    angle?: number;
    rotation?: number;
    containerDTO?: StoredContainerDTO;
};

type StoredDoor = {
    id?: number;
    x?: number;
    y?: number;
    width?: number;
    wall?: Door["wall"];
    rotation?: number;
    swingDirection?: Door["swingDirection"];
};

type StoredRoom = {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    containers?: StoredContainer[];
    doors?: StoredDoor[];
};

export function useRoom() {
    /* ──────────────── Initial Room State ──────────────── */
    const initialRoom = (() => {
        const savedRoom = localStorage.getItem("enviormentRoomData") ?? localStorage.getItem("trashRoomData");
        const defaultWidthMeters = 10;
        const defaultHeightMeters = 8;
        const defaultX = (STAGE_WIDTH - defaultWidthMeters / SCALE) / 2 + ROOM_HORIZONTAL_OFFSET;
        const defaultY = (STAGE_HEIGHT - defaultHeightMeters / SCALE) / 2 + ROOM_VERTICAL_OFFSET;

        const defaultRoom = {
            x: defaultX,
            y: defaultY,
            width: defaultWidthMeters / SCALE,
            height: defaultHeightMeters / SCALE,
        } satisfies Room;

        if (!savedRoom) {
            return defaultRoom;
        }

        try {
            const parsed = JSON.parse(savedRoom) as StoredRoom;

            const widthMeters = parsed?.width ?? defaultWidthMeters;
            const heightMeters = parsed?.height ?? defaultHeightMeters;

            const x = parsed?.x ?? defaultX;
            const y = parsed?.y ?? defaultY;

            const containers = Array.isArray(parsed?.containers)
                ? parsed.containers.map((container) => {
                    const containerInfo = container?.containerDTO ?? {
                        imageTopViewUrl: "/images/containers/tempTopView.png",
                        imageFrontViewUrl: "/images/containers/tempFrontView.png",
                        width: 1,
                        depth: 1,
                        height: 1,
                        name: "Unknown",
                        size: 0,
                    };

                    return {
                        ...container,
                        x: container?.x ?? 0,
                        y: container?.y ?? 0,
                        width: mmToPixels(containerInfo.width),
                        height: mmToPixels(containerInfo.depth),
                        container: containerInfo,
                        rotation: container?.angle ?? container?.rotation ?? 0,
                    };
                })
                : [];

            const doors = Array.isArray(parsed?.doors)
                ? parsed.doors.map((door) => ({
                    id: door?.id ?? Date.now(),
                    x: door?.x ?? 0,
                    y: door?.y ?? 0,
                    width: door?.width ?? 1.2,
                    wall: door?.wall ?? "bottom",
                    rotation: door?.rotation ?? 0,
                    swingDirection: door?.swingDirection ?? "inward",
                }))
                : [];

            return {
                x,
                y,
                width: widthMeters / SCALE,
                height: heightMeters / SCALE,
                doors,
                containers,
            };
        } catch (error) {
            console.warn("Failed to parse stored room data", error);
            return defaultRoom;
        }
    })();


    /* ──────────────── Room State ──────────────── */
    const [room, setRoom] = useState<Room>(initialRoom);

    //Resize logic
    const handleDragCorner = (index: number, pos: { x: number; y: number }) => {
        let { x, y, width, height } = room;

        switch (index) {
            case 0: { // Top-left
                const newX = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
                const newY = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                width = x + width - newX;
                height = y + height - newY;
                x = newX;
                y = newY;
                break;
            }
            case 1: { // Top-right
                const newTRX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                const newTRY = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                width = newTRX - x;
                height = y + height - newTRY;
                y = newTRY;
                break;
            }
            case 2: { // Bottom-right
                const newBRX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                const newBRY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                width = newBRX - x;
                height = newBRY - y;
                break;
            }
            case 3: { // Bottom-left
                const newBLX = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
                const newBLY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                width = x + width - newBLX;
                height = newBLY - y;
                x = newBLX;
                break;
            }
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
