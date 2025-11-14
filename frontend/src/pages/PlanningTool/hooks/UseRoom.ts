/**
 * Custom hook to manage room's position, size, and resizing logic.
 * Handles corner dragging, constraints, and initial state from localStorage.
 */
import { useState } from "react";
import { Scale } from "lucide-react";
import { SCALE, mmToPixels, STAGE_WIDTH, STAGE_HEIGHT, MIN_WIDTH, MIN_HEIGHT, MARGIN, clamp } from "../Constants";
import type { Room, ContainerInRoom } from "../Types";

export function useRoom(
    containersInRoom: ContainerInRoom[],
    setContainersInRoom: React.Dispatch<React.SetStateAction<ContainerInRoom[]>>
) {
    /* ──────────────── Initial Room State ──────────────── */
    const initialRoom = (() => {
        const savedRoom = localStorage.getItem("enviormentRoomData");
        const defaultWidthMeters = 10;
        const defaultHeightMeters = 8;
        const defaultX = (STAGE_WIDTH - defaultWidthMeters / SCALE) / 2;
        const defaultY = (STAGE_HEIGHT - defaultHeightMeters / SCALE) / 2;

        if (savedRoom) {
            try {
                const parsed = JSON.parse(savedRoom);

                const widthMeters = parsed.width ?? defaultWidthMeters;
                const heightMeters = parsed.height ?? defaultHeightMeters;
                const x = parsed.x !== undefined ? parsed.x : defaultX;
                const y = parsed.y !== undefined ? parsed.y : defaultY;
                console.log(parsed.containers);

                const containers = (parsed.containers ?? []).map(c => {
                const containerInfo = c.containerDTO ?? {
                imageTopViewUrl: "/images/containers/tempTopView.png",
                imageFrontViewUrl: "/images/containers/tempFrontView.png",
                width: 1,
                depth: 1,
                height: 1,
                name: "Unknown",
                size: 0,
            };

            return {
                ...c,
                x: c.x ?? 0,
                y: c.y ?? 0,
                width: mmToPixels(containerInfo.width),
                height: mmToPixels(containerInfo.depth),

                container: containerInfo,
                rotation: c.angle ?? 0,
            };
            });

            const doors = (parsed.doors ?? []).map(d => ({
                id: d.id ?? Date.now(),
                x: d.x ?? 0,
                y: d.y ?? 0,
                width: d.width ?? 1.2,
                wall: d.wall ?? "bottom",
                rotation: d.rotation ?? 0,
                swingDirection: d.swingDirection ?? "inward",
            }));



            return {
                x,
                y,
                width: widthMeters / SCALE,
                height: heightMeters / SCALE,
                doors,
                containers,
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
            case 0: //top-left corner
                const newX = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
                const newY = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                width = x + width - newX;
                height = y + height - newY;
                x = newX;
                y = newY;
                break;
            case 1: //top-right corner
                const newTRX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                const newTRY = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                width = newTRX - x;
                height = y + height - newTRY;
                y = newTRY;
                break;
            case 2: //bottom-right corner
                const newBRX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                const newBRY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                width = newBRX - x;
                height = newBRY - y;
                break;
            case 3: //bottom-left corner
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
        handleDragCorner,
    };
}
