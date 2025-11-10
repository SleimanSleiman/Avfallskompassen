/**
 * Custom hook to manage room's position, size, and resizing logic.
 * Handles corner dragging, constraints, and initial state from localStorage.
 */
import { useState } from "react";
import { SCALE, STAGE_WIDTH, STAGE_HEIGHT, MIN_WIDTH, MIN_HEIGHT, MARGIN, clamp } from "../Constants";
import type { Room, ContainerInRoom } from "../Types";

export function useRoom(
    containersInRoom: ContainerInRoom[],
    setContainersInRoom: React.Dispatch<React.SetStateAction<ContainerInRoom[]>>
) {
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

    /* ──────────────── Helpers ──────────────── */
    //Get bounding box of all containers in the room to enforce constraints during resizing
    function getContainersBoundingBox() {
        if (containersInRoom.length === 0) {
            return {
                minX: room.x + MIN_WIDTH,
                minY: room.y + MIN_HEIGHT,
                maxX: room.x + room.width - MIN_WIDTH,
                maxY: room.y + room.height - MIN_HEIGHT
            };
        }

        const minX = Math.min(...containersInRoom.map(c => c.x));
        const minY = Math.min(...containersInRoom.map(c => c.y));
        const maxX = Math.max(...containersInRoom.map(c => c.x + c.width));
        const maxY = Math.max(...containersInRoom.map(c => c.y + c.height));

        return { minX, minY, maxX, maxY };
    }

    //Ensure containers stay within room bounds after resizing
    function keepContainersInside(newRoom: Room) {
        setContainersInRoom(prev => prev.map(c => {
            let newX = c.x;
            let newY = c.y;

            if (c.x < newRoom.x) newX = newRoom.x;
            if (c.y < newRoom.y) newY = newRoom.y;
            if (c.x + c.width > newRoom.x + newRoom.width) newX = newRoom.x + newRoom.width - c.width;
            if (c.y + c.height > newRoom.y + newRoom.height) newY = newRoom.y + newRoom.height - c.height;

            return { ...c, x: newX, y: newY };
        }) );
    }

    //Resize logic
    const handleDragCorner = (index: number, pos: { x: number; y: number }) => {
        let { x, y, width, height } = room;
        const bounds = getContainersBoundingBox();
        switch (index) {
            case 0: // Top-left
                const newX = clamp(pos.x, MARGIN, x + width - MIN_WIDTH, bounds.minX);
                const newY = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT, bounds.minY);
                width = x + width - newX;
                height = y + height - newY;
                x = newX;
                y = newY;
                break;
            case 1: // Top-right
                const newTRX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN, bounds.maxX);
                const newTRY = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT, bounds.minY);
                width = newTRX - x;
                height = y + height - newTRY;
                y = newTRY;
                break;
            case 2: // Bottom-right
                const newBRX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN, bounds.maxX);
                const newBRY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN, bounds.maxY);
                width = newBRX - x;
                height = newBRY - y;
                break;
            case 3: // Bottom-left
                const newBLX = clamp(pos.x, MARGIN, x + width - MIN_WIDTH, bounds.minX);
                const newBLY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN, bounds.maxY);
                width = x + width - newBLX;
                height = newBLY - y;
                x = newBLX;
                break;
        }

        const newRoom = { x, y, width, height };
        setRoom(newRoom);
        keepContainersInside(newRoom);
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
        handleDragCorner,
        getContainersBoundingBox
    };
}
