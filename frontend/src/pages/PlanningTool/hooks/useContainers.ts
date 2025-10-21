/**
 * Custom hook for managing container placement in the canvas and fetching available container
 * types from the API.
 */
import { useState } from "react";
import type { ContainerInRoom, Room } from "../types";
import type { ContainerDTO } from "../../../lib/container";
import { fetchContainersByMunicipalityAndService } from "../../../lib/container";

export function useContainers(room: Room) {

    /* ──────────────── Containers placed in the room canvas ──────────────── */
    const [containersInRoom, setContainersInRoom] = useState<ContainerInRoom[]>([]);
    const [selectedContainerId, setSelectedContainerId] = useState<number | null>(null);

    //Add a new container to the room (centered)
    //TODO: change positioning logic if implementing grid/snapping
    const handleAddContainer = (name: string) => {
        const newContainer: ContainerInRoom = {
            id: Date.now(),
            name,
            x: room.x + room.width / 2 - 15,
            y: room.y + room.height / 2 - 15,
            width: 30,
            height: 30,
            };
        setContainersInRoom((prev) => [...prev, newContainer]);
    };

    //Remove a container from the room
    const handleRemoveContainer = (id: number) => {
        setContainersInRoom((prev) => prev.filter((c) => c.id !== id));
        if (selectedContainerId === id) setSelectedContainerId(null);
    };

    //Handle dragging a container within the room
    const handleDragContainer = (id: number, pos: { x: number; y: number }) => {
        setContainersInRoom((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...pos } : c))
        );
    };

    //Select or deselect a container
    const handleSelectContainer = (id: number) => {
        setSelectedContainerId((prev) => (prev === id ? null : id));
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
        selectedContainerId,
        handleAddContainer,
        handleRemoveContainer,
        handleDragContainer,
        handleSelectContainer,
        availableContainers,
        isLoadingContainers,
        fetchAvailableContainers,
    };
}
