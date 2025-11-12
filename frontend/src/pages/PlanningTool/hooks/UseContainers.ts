/**
 * Custom hook for managing container placement in the canvas and fetching available container
 * types from the API.
 */
import { useState, useRef } from "react";
import type { ContainerInRoom, Room } from "../Types";
import type { ContainerDTO } from "../../../lib/Container";
import { fetchContainersByMunicipalityAndService } from "../../../lib/Container";
import { mmToPixels, clamp, DRAG_DATA_FORMAT, STAGE_WIDTH, STAGE_HEIGHT, SCALE, isOverlapping } from "../Constants";
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

    let targetX = position ? position.x - widthPx / 2 : room.x + room.width / 2 - widthPx / 2;
    let targetY = position ? position.y - heightPx / 2 : room.y + room.height / 2 - heightPx / 2;

    return {
        x: clamp(targetX, room.x, room.x + room.width - widthPx),
        y: clamp(targetY, room.y, room.y + room.height - heightPx),
    };
}

//Build "no-overlap" zones for existing containers
function buildContainerZones(
    containers: ContainerInRoom[],
    excludeId?: number
) {
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
    newRect: { x: number; y: number; width: number; height: number },
    doorZones: { x: number; y: number; width: number; height: number }[],
    containerZones: { x: number; y: number; width: number; height: number }[]
) {
    const overlapsDoor = doorZones.some(zone => isOverlapping(newRect, zone));
    const overlapsContainer = containerZones.some(zone => isOverlapping(newRect, zone));

    return !(overlapsDoor || overlapsContainer);
}

/* ──────────────── Main Hook ──────────────── */
export function useContainers(
  room: Room,
  setSelectedContainerId: (id: number | null) => void,
  setSelectedDoorId: (id: number | null) => void,
  doorZones: { x: number; y: number; width: number; height: number }[] = []
) {

    /* ──────────────── Containers State ──────────────── */
    const { state: containersInRoom, save: saveContainers, undo, redo } = useLayoutHistory<ContainerInRoom[]>([]);
    const [selectedContainerInfo, setSelectedContainerInfo] = useState<ContainerDTO | null>(null);
    const [draggedContainer, setDraggedContainer] = useState<ContainerDTO | null>(null);
    const [availableContainers, setAvailableContainers] = useState<ContainerDTO[]>([]);
    const [isLoadingContainers, setIsLoadingContainers] = useState(false);

    /* ─────────────── Stage State ──────────────── */
    const [isStageDropActive, setIsStageDropActive] = useState(false);
    const stageWrapperRef = useRef<HTMLDivElement | null>(null);

    //Add a new container to the room
    const handleAddContainer = (container: ContainerDTO, position?: { x: number; y: number }) => {
        const { x, y } = calculateInitialPosition(room, container, position);
        const newRect = createContainerRect(container, x, y);

        const containerZones = buildContainerZones(containersInRoom);
        const isValid = validateContainerPlacement(newRect, doorZones, containerZones);

        if(!isValid) {
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

    //Select or deselect a container
    const handleSelectContainer = (id: number | null) => {
        setSelectedContainerId(id);
        setSelectedDoorId(null);
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
        if (container) setSelectedContainerInfo(container.container);
    };

    /* ──────────────── Drag & Drop Handlers ──────────────── */
    //Handle dropping a container onto the stage
    const handleStageDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsStageDropActive(false);

        const data = event.dataTransfer.getData(DRAG_DATA_FORMAT);
        if (!data) return;

        try {
            const container = JSON.parse(data) as ContainerDTO;
            const rect = stageWrapperRef.current?.getBoundingClientRect();
            if (!rect) return;

            const dropX = clamp(event.clientX - rect.left, 0, STAGE_WIDTH);
            const dropY = clamp(event.clientY - rect.top, 0, STAGE_HEIGHT);
            handleAddContainer(container, { x: dropX, y: dropY });
        } catch (error) {
            console.error("Failed to parse dropped container data", error);
        }
    };

    //Handle drag over event to allow dropping
    const handleStageDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        if (!Array.from(event.dataTransfer.types).includes(DRAG_DATA_FORMAT)) return;

        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";

        if (!isStageDropActive) setIsStageDropActive(true);
    };

    //Handle drag leave event to reset drop state
    const handleStageDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return;
        setIsStageDropActive(false);
    };

    /* ──────────────── API Fetch ──────────────── */
    const fetchAvailableContainers = async (serviceId: number) => {
        setIsLoadingContainers(true);
        try {
            const data = await fetchContainersByMunicipalityAndService(1, serviceId);
            setAvailableContainers(data);
        } catch (error) {
            console.error("Failed to fetch available containers:", error);
            setAvailableContainers([]);
        } finally {
            setIsLoadingContainers(false);
        }
    };

    /* ──────────────── Return ──────────────── */
    return {
        containersInRoom,
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
        handleSelectContainer,
        handleRotateContainer,

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
    };
}
