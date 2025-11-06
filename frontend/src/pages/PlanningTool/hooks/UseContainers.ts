/**
 * Custom hook for managing container placement in the canvas and fetching available container
 * types from the API.
 */
import { useState, useRef } from "react";
import type { ContainerInRoom, Room } from "../Types";
import type { ContainerDTO } from "../../../lib/Container";
import { fetchContainersByMunicipalityAndService } from "../../../lib/Container";
import { mmToPixels, clamp, DRAG_DATA_FORMAT, STAGE_WIDTH, STAGE_HEIGHT } from "../Constants";

export function useContainers(
  room: Room,
  setSelectedContainerId: (id: number | null) => void,
  setSelectedDoorId: (id: number | null) => void
) {

    /* ──────────────── Containers ──────────────── */
    const [containersInRoom, setContainersInRoom] = useState<ContainerInRoom[]>([]);
    const [selectedContainerInfo, setSelectedContainerInfo] = useState<ContainerDTO | null>(null);

    /* ─────────────── Stage Drop State & Ref ──────────────── */
    const [isStageDropActive, setIsStageDropActive] = useState(false);
    const stageWrapperRef = useRef<HTMLDivElement | null>(null);

    //Add a new container to the room (centered)
    //TODO: change positioning logic if implementing grid/snapping
    const handleAddContainer = (container: ContainerDTO, position?: { x: number; y: number }) => {
        //Default size if no API data is provided
        const widthPx = mmToPixels(container.width)
        const heightPx = mmToPixels(container.depth)

        //If user clicked somewhere, center container on that position
        let targetX = position ? position.x - widthPx / 2 : room.x + room.width / 2 - widthPx / 2;
        let targetY = position ? position.y - heightPx / 2 : room.y + room.height / 2 - heightPx / 2;

        //Clamp so container cannot leave the room area
        targetX = clamp(targetX, room.x, room.x + room.width - widthPx);
        targetY = clamp(targetY, room.y, room.y + room.height - heightPx);

        const newContainer: ContainerInRoom = {
            id: Date.now(),
            container,
            x: targetX,
            y: targetY,
            width: widthPx,
            height: heightPx,
            rotation: 0,
            };
        setContainersInRoom((prev) => [...prev, newContainer]);
        handleSelectContainer(newContainer.id);
    };

    //Remove a container from the room
    const handleRemoveContainer = (id: number) => {
        setContainersInRoom((prev) => prev.filter((c) => c.id !== id));
        setSelectedContainerId(null);
    };

    //Handle dragging a container within the room
    const handleDragContainer = (id: number, pos: { x: number; y: number }) => {
        setContainersInRoom((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...pos } : c))
        );
    };

    //Select or deselect a container
    const handleSelectContainer = (id: number | null) => {
        setSelectedContainerId(id);
        setSelectedDoorId(null); // Clear door selection
    };

    //Container rotation
    const handleRotateContainer = (id: number) => {
        setContainersInRoom((prev) =>
        prev.map((container) =>
            container.id === id
                ? { ...container, rotation: ((container.rotation || 0) + 90) % 360 }
                : container
            )
        );

        console.log("Rotating ID " + id);
    };

    //Show container info in sidebar
    const handleShowContainerInfo = (id: number) => {
        const container = containersInRoom.find(c => c.id === id);
        if (container) setSelectedContainerInfo(container.container);
    };

    /* ──────────────── Drag & Drop Handlers ──────────────── */
    //Handle dropping a container onto the stage
    const handleStageDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsStageDropActive(false);

        const data = event.dataTransfer.getData(DRAG_DATA_FORMAT);
        if (!data) return;

        let container: ContainerDTO;
        try {
            container = JSON.parse(data) as ContainerDTO;
        } catch (error) {
            console.error("Failed to parse dropped container data", error);
            return;
        }

        if (!stageWrapperRef.current) return;

        const rect = stageWrapperRef.current.getBoundingClientRect();
        const dropX = clamp(event.clientX - rect.left, 0, STAGE_WIDTH);
        const dropY = clamp(event.clientY - rect.top, 0, STAGE_HEIGHT);

        handleAddContainer(container, { x: dropX, y: dropY });
    };

    //Handle drag over event to allow dropping
    const handleStageDragOver = (event: DragEvent<HTMLDivElement>) => {
        if (!Array.from(event.dataTransfer.types).includes(DRAG_DATA_FORMAT)) return;

        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";

        if (!isStageDropActive) setIsStageDropActive(true);
    };

    //Handle drag leave event to reset drop state
    const handleStageDragLeave = (event: DragEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return;
        setIsStageDropActive(false);
    };

    /* ──────────────── Available container types (from API) ──────────────── */
    const [availableContainers, setAvailableContainers] = useState<ContainerDTO[]>([]);
    const [isLoadingContainers, setIsLoadingContainers] = useState(false);

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
        setSelectedContainerId,
        handleAddContainer,
        handleRemoveContainer,
        handleDragContainer,
        handleSelectContainer,
        handleRotateContainer,
        availableContainers,
        isLoadingContainers,
        fetchAvailableContainers,
        isStageDropActive,
        setIsStageDropActive,
        stageWrapperRef,
        handleStageDrop,
        handleStageDragOver,
        handleStageDragLeave,
        selectedContainerInfo,
        setSelectedContainerInfo,
        handleShowContainerInfo,
    };
}
