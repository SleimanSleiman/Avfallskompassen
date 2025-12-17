/**
 * Custom hook for managing container placement in the canvas and fetching available container
 * types from the API.
 */
import { useState, useRef, useEffect } from "react";
import type { DragEvent as ReactDragEvent } from "react";
import type { ContainerInRoom, Room, Zone } from "./lib/Types";
import type { ContainerDTO } from "../../../lib/Container";
import { fetchContainersByMunicipalityAndService } from "../../../lib/Container";
import { mmToPixels, clamp, DRAG_DATA_FORMAT, STAGE_WIDTH, STAGE_HEIGHT, SCALE, isOverlapping } from "../lib/Constants";
import { useLayoutHistory } from "./UseLayoutHistory";

/* ──────────────── Helper functions ──────────────── */
//Create rectangle for container at given position
function createContainerRect(container: ContainerDTO, x: number, y: number) {
    const widthPx = mmToPixels(container.width);
    const heightPx = mmToPixels(container.depth);

    return {
        x,
        y,
        width: widthPx,
        height: heightPx,
    };
}

//Calculate initial position for a new container
function calculateInitialPosition(
    room: Room,
    container: ContainerDTO,
    position?: { x: number; y: number }
) {
    const widthPx = mmToPixels(container.width);
    const heightPx = mmToPixels(container.depth);

    const targetX = position ? position.x - widthPx / 2 : room.x + room.width / 2 - widthPx / 2;
    const targetY = position ? position.y - heightPx / 2 : room.y + room.height / 2 - heightPx / 2;

    return {
        x: clamp(targetX, room.x, room.x + room.width - widthPx),
        y: clamp(targetY, room.y, room.y + room.height - heightPx),
    };
}

//Build "no-overlap" zones for existing containers
function buildContainerZones(
    containers: ContainerInRoom[],
    excludeId?: number
): Zone[] {
    const buffer = 0.1 / SCALE; //10cm buffer between containers
    return containers
        .filter(c => c.id !== excludeId)
        .map(c => {
            const rotation = c.rotation || 0;
            const rot = rotation % 180;
            const width = rot === 90 ? c.height : c.width;
            const height = rot === 90 ? c.width : c.height;

            const centerX = c.x + c.width / 2;
            const centerY = c.y + c.height / 2;

            return {
                x: centerX - (width + buffer * 2) / 2,
                y: centerY - (height + buffer * 2) / 2,
                width: width + buffer * 2,
                height: height + buffer * 2,
            };
        });
}

function validateContainerPlacement(
    newRect: Zone,
    doorZones: Zone[] = [],
    containerZones: Zone[] = [],
    otherObjectZones: Zone[] = [],
) {
    const overlapsDoor = doorZones.some(zone => isOverlapping(newRect, zone));
    const overlapsContainer = containerZones.some(zone => isOverlapping(newRect, zone));
    const overlapsOtherObject = otherObjectZones.some(zone => isOverlapping(newRect, zone));

    return !(overlapsDoor || overlapsContainer || overlapsOtherObject);
}

/* ──────────────── Main Hook ──────────────── */
export function useContainers(
    room: Room,
    setSelectedContainerId: (id: number | null) => void,
    setSelectedDoorId: (id: number | null) => void,
    setSelectedOtherObjectId: (id: number | null) => void,
    doorZones: { x: number; y: number; width: number; height: number }[] = [],
    otherObjectZones: { x: number; y: number; width: number; height: number }[] = [],
    setError,
    setMsg,
    isDoorDragging?: boolean,
) {

    /* ──────────────── Containers State ──────────────── */
    const { state: containersInRoom, save: saveContainers, undo, redo } = useLayoutHistory<ContainerInRoom[]>([]);
    const [selectedContainerInfo, setSelectedContainerInfo] = useState<ContainerInRoom | null>(null);
    const [draggedContainer, setDraggedContainer] = useState<ContainerDTO | null>(null);
    const [availableContainers, setAvailableContainers] = useState<ContainerDTO[]>([]);
    const [isLoadingContainers, setIsLoadingContainers] = useState(false);

    /* ─────────────── Stage State ──────────────── */
    const [isStageDropActive, setIsStageDropActive] = useState(false);
    const stageWrapperRef = useRef<HTMLDivElement | null>(null);

    //Add a new container to the room
    const handleAddContainer = (container: ContainerDTO, position?: { x: number; y: number}, lockILock: boolean = false ) => {
        let { x, y } = calculateInitialPosition(room, container, position);
        const newRect = createContainerRect(container, x, y);

        const containerZones = buildContainerZones(containersInRoom);
        const isValid = validateContainerPlacement(newRect, doorZones, containerZones, otherObjectZones);

       //If initial position is invalid, try to find a valid spot
        if (!isValid && !position) {
            const widthPx = mmToPixels(container.width);
            const heightPx = mmToPixels(container.depth);

            const step = 20;
            let foundSpot = false;

            for (let tryY = room.y; tryY < room.y + room.height - heightPx; tryY += step) {
                for (let tryX = room.x; tryX < room.x + room.width - widthPx; tryX += step) {
                    const testRect = { x: tryX, y: tryY, width: widthPx, height: heightPx };
                    if (validateContainerPlacement(testRect, doorZones, containerZones, otherObjectZones)) {
                        x = tryX;
                        y = tryY;
                        foundSpot = true;
                        break;
                    }
                }
                if (foundSpot) break;
            }

            //If no valid spot found, alert user and exit
            if (!foundSpot) {
                setMsg("");
                setError("");
                setTimeout(() => setError("Det finns ingen ledig plats för att lägga till detta kärl i rummet"), 10);
                return;
            }
        } else if (!isValid) {
            return;
        }

        const newContainer: ContainerInRoom = {
            id: Date.now(),
            container,
            x,
            y,
            width: newRect.width,
            height: newRect.height,
            rotation: 0,
            lockILock,
        };

        handleSelectContainer(newContainer.id);
        const newState = [...containersInRoom, newContainer];
        saveContainers(newState);
    };

    //Remove a container from the room
    const handleRemoveContainer = (id: number) => {
        const newState = containersInRoom.filter(c => c.id !== id);
        saveContainers(newState);
        setSelectedContainerId(null);
    };

    //Handle dragging a container within the room
    const handleDragContainer = (id: number, pos: { x: number; y: number }) => {
        const newState = containersInRoom.map(c =>
            c.id === id ? { ...c, ...pos } : c
        );
        saveContainers(newState);
    };

    //Moves all containers within the room when the room itself is dragged
    const moveAllContainers = (dx: number, dy: number) => {
        const newState = containersInRoom.map(c => ({
            ...c,
            x: c.x + dx,
            y: c.y + dy,
        }));

        saveContainers(newState);
    };

    //Select or deselect a container
    const handleSelectContainer = (id: number | null) => {
        setSelectedContainerId(id);
        setSelectedDoorId(null);
        setSelectedOtherObjectId(null);

        if (selectedContainerInfo) {
            handleShowContainerInfo(id);
        }
    };

    //Container rotation
    const handleRotateContainer = (id: number) => {
        const newState = containersInRoom.map(c =>
            c.id === id ? { ...c, rotation: ((c.rotation || 0) + 90) % 360 } : c
        );
        saveContainers(newState);
    };

    //Show container info in sidebar
    const handleShowContainerInfo = (id: number) => {
        const container = containersInRoom.find(c => c.id === id);
        if (container) setSelectedContainerInfo(container);
    };

    /* ──────────────── Drag & Drop Handlers ──────────────── */
    //Handle dropping a container onto the stage
    const handleStageDrop = (event: ReactDragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsStageDropActive(false);

        const data = event.dataTransfer.getData(DRAG_DATA_FORMAT);
        if (!data) return;

        try {
            const container = JSON.parse(data) as ContainerDTO;
            const stageContainer = stageWrapperRef.current?.querySelector("canvas");
            const stageRect = stageContainer?.getBoundingClientRect();
            if (!stageRect) return;

            const dropX = clamp(event.clientX - stageRect.left, 0, stageRect.width);
            const dropY = clamp(event.clientY - stageRect.top, 0, stageRect.height);
            handleAddContainer(container, { x: dropX, y: dropY });
        } catch (error) {
            console.error("Failed to parse dropped container data", error);
        }
    };

    //Handle drag over event to allow dropping
    const handleStageDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
        if (!Array.from(event.dataTransfer.types).includes(DRAG_DATA_FORMAT)) return;

        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";

        if (!isStageDropActive) setIsStageDropActive(true);
    };

    //Handle drag leave event to reset drop state
    const handleStageDragLeave = (event: ReactDragEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return;
        setIsStageDropActive(false);
    };

    const handleAddLockILock = (id: number) => {
        const newState = containersInRoom.map(c =>
            c.id === id ? { ...c, lockILock: true } : c
        );
        saveContainers(newState);
    };

    const handleRemoveLockILock = (id: number) => {
        const newState = containersInRoom.map(c =>
            c.id === id ? { ...c, lockILock: false } : c
        );
        saveContainers(newState);
    };

    /* ──────────────── API Fetch ──────────────── */
    const fetchAvailableContainers = async (service: { id: number; name: string }) => {
        setIsLoadingContainers(true);
        try {
            const data = await fetchContainersByMunicipalityAndService(1, service.id);
            const enriched = data.map(container => ({
                ...container,
                serviceTypeId: service.id,
                serviceTypeName: service.name,
            }));
            setAvailableContainers(enriched);
        } catch (error) {
            console.error("Failed to fetch available containers:", error);
            setAvailableContainers([]);
        } finally {
            setIsLoadingContainers(false);
        }
    };

    //Checks if a container is inside the boundaries of a room
    const isContainerInsideRoom = (
        c: { x: number; y: number; width: number; height: number; rotation?: number },
        room: Room
    ) => {
        const rotation = (c.rotation ?? 0) % 360;

        // Swap width/height if rotated 90 or 270 degrees
        const aabbWidth = rotation === 90 || rotation === 270 ? c.height : c.width;
        const aabbHeight = rotation === 90 || rotation === 270 ? c.width : c.height;

        const centerX = c.x + c.width / 2;
        const centerY = c.y + c.height / 2;

        // Axis-aligned bounding box
        const aabbX = centerX - aabbWidth / 2;
        const aabbY = centerY - aabbHeight / 2;

        return (
            aabbX >= room.x &&
            aabbY >= room.y &&
            aabbX + aabbWidth <= room.x + room.width &&
            aabbY + aabbHeight <= room.y + room.height
        );
    };

    //When door zones change, push overlapping containers away from doors
    useEffect(() => {
        if (!isDoorDragging) return;
        if (doorZones.length === 0) return;

        const STEP = 10;
        const MAX = 200;

        //Generate offsets sorted by distance
        const offsets: { dx: number; dy: number; dist: number }[] = [];
        for (let dy = -MAX; dy <= MAX; dy += STEP) {
            for (let dx = -MAX; dx <= MAX; dx += STEP) {
                offsets.push({ dx, dy, dist: Math.abs(dx) + Math.abs(dy) });
            }
        }
        offsets.sort((a, b) => a.dist - b.dist);

        const temp = [...containersInRoom];
        let changed = false;

        //Try to move each overlapping container
        for (let i = 0; i < temp.length; i++) {
            const c = temp[i];

            //Check if container overlaps any door zone
            const cRect = { x: c.x, y: c.y, width: c.width, height: c.height };
            const overlapsDoor = doorZones.some(dz => isOverlapping(cRect, dz));
            if (!overlapsDoor) continue;

            //Try offsets until a valid position is found
            for (const { dx, dy } of offsets) {
                const testX = clamp(c.x + dx, room.x, room.x + room.width - c.width);
                const testY = clamp(c.y + dy, room.y, room.y + room.height - c.height);
                const testRect = { x: testX, y: testY, width: c.width, height: c.height };

                const containerZones = buildContainerZones(temp, c.id);

                if (validateContainerPlacement(testRect, doorZones, containerZones)) {
                    temp[i] = { ...c, x: testX, y: testY };
                    changed = true;
                    break;
                }
            }
        }

        //If any containers were moved, save the new state
        if (changed) {
            saveContainers(temp);
        }
    }, [doorZones]);

    /* ──────────────── Return ──────────────── */
    return {
        containersInRoom,
        saveContainers,
        draggedContainer,
        setDraggedContainer,
        availableContainers,
        isLoadingContainers,

        isStageDropActive,
        setIsStageDropActive,
        stageWrapperRef,

        handleAddContainer,
        handleRemoveContainer,
        handleDragContainer,
        moveAllContainers,
        handleSelectContainer,
        handleRotateContainer,
        handleAddLockILock,
        handleRemoveLockILock,

        fetchAvailableContainers,

        handleStageDrop,
        handleStageDragOver,
        handleStageDragLeave,
        selectedContainerInfo,
        setSelectedContainerInfo,
        handleShowContainerInfo,

        getContainerZones: (excludeId?: number) => buildContainerZones(containersInRoom, excludeId),

        undo,
        redo,
        isContainerInsideRoom,
    };
}
