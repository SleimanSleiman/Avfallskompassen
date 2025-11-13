/**
 * Custom hook to manage room's position, size, and resizing logic.
 * Handles corner dragging, constraints, and initial state from localStorage.
 */
import { useState } from "react";
import { SCALE, STAGE_WIDTH, STAGE_HEIGHT, MIN_WIDTH, MIN_HEIGHT, MARGIN, clamp, mmToPixels, ROOM_VERTICAL_OFFSET, ROOM_HORIZONTAL_OFFSET } from "../Constants";
import type { Room, Door, ContainerInRoom } from "../Types";
import type { ContainerDTO } from "../../../lib/Container";

type StoredContainerDTO = {
    id?: number;
    imageTopViewUrl?: string;
    imageFrontViewUrl?: string;
    width?: number;
    depth?: number;
    height?: number;
    name?: string;
    size?: number;
    emptyingFrequencyPerYear?: number;
    cost?: number;
    serviceTypeId?: number;
    serviceTypeName?: string;
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
    const defaultWidthMeters = 5;
    const defaultHeightMeters = 5;
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

            const toMeters = (value?: number) => {
                if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
                    return undefined;
                }

                // Legacy data might come in millimetres
                if (value > 100) {
                    return value / 1000;
                }

                return value;
            };

            const parsedWidth = toMeters(parsed?.width);
            const parsedHeight = toMeters(parsed?.height);

            const legacyDefaultSizes = (
                (parsedWidth === 12 && parsedHeight === 9) ||
                (parsedWidth === 10 && parsedHeight === 8)
            );

            const widthMeters = legacyDefaultSizes
                ? defaultWidthMeters
                : parsedWidth ?? defaultWidthMeters;

            const heightMeters = legacyDefaultSizes
                ? defaultHeightMeters
                : parsedHeight ?? defaultHeightMeters;

            const x = parsed?.x ?? defaultX;
            const y = parsed?.y ?? defaultY;

            const containers: ContainerInRoom[] = Array.isArray(parsed?.containers)
                ? parsed.containers.map((container, index): ContainerInRoom => {
                    const seed = Date.now() + index;
                    const storedContainer = container?.containerDTO ?? {};
                    const fallbackId = storedContainer.id ?? container?.id ?? seed;

                    const normalizedContainer: ContainerDTO = {
                        id: fallbackId,
                        name: storedContainer.name ?? "Unknown",
                        size: storedContainer.size ?? 0,
                        width: storedContainer.width ?? 1,
                        depth: storedContainer.depth ?? 1,
                        height: storedContainer.height ?? 1,
                        imageFrontViewUrl: storedContainer.imageFrontViewUrl ?? "/images/containers/tempFrontView.png",
                        imageTopViewUrl: storedContainer.imageTopViewUrl ?? "/images/containers/tempTopView.png",
                        emptyingFrequencyPerYear: storedContainer.emptyingFrequencyPerYear ?? 0,
                        cost: storedContainer.cost ?? 0,
                        serviceTypeId: storedContainer.serviceTypeId,
                        serviceTypeName: storedContainer.serviceTypeName,
                    };

                    return {
                        id: fallbackId,
                        x: container?.x ?? 0,
                        y: container?.y ?? 0,
                        width: mmToPixels(normalizedContainer.width),
                        height: mmToPixels(normalizedContainer.depth),
                        container: normalizedContainer,
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
