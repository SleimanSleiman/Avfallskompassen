/**
 * Main component for the planning tool UI.
 * Manages state and logic for room layout, doors, containers, and service types.
 * Renders the RoomCanvas, Sidebar, and ActionPanel components.
 */
import { useState, useEffect } from 'react';

//Lib
import { fetchServiceTypes } from '../../lib/ServiceType';
import type { ContainerDTO } from '../../lib/Container';

//Components
import RoomCanvas from './RoomCanvas/RoomCanvas';
import Sidebar from './Sidebar/Sidebar';
import ActionPanel from './ActionPanel';

//Hooks
import { useRoom } from './hooks/UseRoom';
import { useDoors } from './hooks/UseDoors';
import { useContainers } from './hooks/UseContainers';
import { useServiceTypes } from './hooks/UseServiceTypes';

export default function PlanningTool() {
    
    /* ──────────────── Room state & logic ──────────────── */
    const {
        room,
        corners,
        handleDragCorner,
        setRoom
    } = useRoom();


    /* ──────────────── Door & Container state ──────────────── */
    const [selectedContainerId, setSelectedContainerId] = useState<number | null>(null);
    const [selectedDoorId, setSelectedDoorId] = useState<number | null>(null);

    /* ──────────────── Door logic ──────────────── */
    const {
        doors,
        handleAddDoor,
        handleDragDoor,
        handleRotateDoor,
        handleRemoveDoor,
        handleSelectDoor,
        getDoorZones,
    } = useDoors(room, setSelectedDoorId, setSelectedContainerId);

    /* ──────────────── Container logic ──────────────── */
    const {
        containersInRoom,
        setDraggedContainer,
        draggedContainer,
        availableContainers,
        isLoadingContainers,

        isStageDropActive,
        setIsStageDropActive,
        stageWrapperRef,

        handleAddContainer,
        handleRemoveContainer,
        handleDragContainer,
        handleSelectContainer,

        fetchAvailableContainers,

        handleStageDrop,
        handleStageDragOver,
        handleStageDragLeave,
        handleRotateContainer,
        selectedContainerInfo,
        setSelectedContainerInfo,
        handleShowContainerInfo,
        getContainerZones,
    } = useContainers(room, setSelectedContainerId, setSelectedDoorId, getDoorZones());

    /* ──────────────── Service Types (API data) ──────────────── */
    const serviceTypes = useServiceTypes();

    /* ──────────────── Sidebar state ──────────────── */
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<{ [key: number]: number | null }>({});
    const [isAddContainersOpen, setIsAddContainersOpen] = useState(false);

    /* ──────────────── Render ──────────────── */
    return (
        <div className="flex w-full h-full p-4 sm:p-6 flex-col lg:flex-row gap-4 lg:gap-6">

            {/* ─────────────── Canvas ──────────────── */}
            <div className="relative flex w-full lg:w-4/6">
                {/* RoomCanvas displays the room, containers, and doors */}
                <RoomCanvas
                    room={room}
                    corners={corners}
                    handleDragCorner={handleDragCorner}
                    setRoom={setRoom}

                    doors={doors}
                    selectedDoorId={selectedDoorId}
                    handleDragDoor={handleDragDoor}
                    handleSelectDoor={handleSelectDoor}
                    doorZones={getDoorZones()}

                    containers={containersInRoom}
                    selectedContainerId={selectedContainerId}
                    handleDragContainer={handleDragContainer}
                    handleSelectContainer={handleSelectContainer}
                    getContainerZones={getContainerZones}
                    draggedContainer={draggedContainer}
                    setSelectedContainerInfo={setSelectedContainerInfo}

                    isStageDropActive={isStageDropActive}
                    stageWrapperRef={stageWrapperRef}
                    handleStageDrop={handleStageDrop}
                    handleStageDragOver={handleStageDragOver}
                    handleStageDragLeave={handleStageDragLeave}
                />

                {/* ActionPanel for selected container or door */}
                {(selectedContainerId !== null || selectedDoorId !== null) && (
                    <div className="absolute top-4 right-4 z-50">
                        <ActionPanel
                            containers={containersInRoom}
                            doors={doors}
                            selectedContainerId={selectedContainerId}
                            selectedDoorId={selectedDoorId}
                            handleRemoveContainer={handleRemoveContainer}
                            handleRemoveDoor={handleRemoveDoor}
                            handleRotateDoor={handleRotateDoor}
                            handleRotateContainer={handleRotateContainer}
                            handleShowContainerInfo={handleShowContainerInfo}
                        />
                    </div>
                )}
            </div>

            {/* ─────────────── Sidebar ──────────────── */}
            <div className="w-full lg:w-2/5 lg:pl-8 flex flex-col lg:h-[600px]">
                <Sidebar
                    //Service types and available containers (from API)
                    serviceTypes={serviceTypes}
                    containers={availableContainers}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    selectedSize={selectedSize}
                    setSelectedSize={setSelectedSize}
                    isLoadingContainers={isLoadingContainers}
                    fetchContainers={fetchAvailableContainers}
                    handleAddContainer={handleAddContainer}
                    setIsStageDropActive={setIsStageDropActive}
                    setDraggedContainer={setDraggedContainer}

                    //UI state for sidebar sections
                    isAddContainersOpen={isAddContainersOpen}
                    setIsAddContainersOpen={setIsAddContainersOpen}
                    selectedContainerInfo={selectedContainerInfo}
                    setSelectedContainerInfo={setSelectedContainerInfo}

                    //Room and door management
                    setRoom={setRoom}
                    handleAddDoor={handleAddDoor}
                />
            </div>
        </div>
    );
}
