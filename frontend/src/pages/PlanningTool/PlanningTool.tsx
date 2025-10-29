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

    /* ──────────────── Door state & logic ──────────────── */
    const {
        doors,
        handleAddDoor,
        selectedDoorId,
        handleDragDoor,
        handleRotateDoor,
        handleRemoveDoor,
        handleSelectDoor
    } = useDoors(room);

    /* ──────────────── Container state & logic ──────────────── */
    const {
        containersInRoom,
        selectedContainerId,
        handleAddContainer,
        handleRemoveContainer,
        handleDragContainer,
        handleSelectContainer,
        availableContainers,
        isLoadingContainers,
        fetchAvailableContainers,
        isStageDropActive,
        setIsStageDropActive,
        stageWrapperRef,
        handleStageDrop,
        handleStageDragOver,
        handleStageDragLeave,
    } = useContainers(room);

    /* ──────────────── Service Types (API data) ──────────────── */
    const serviceTypes = useServiceTypes();

    /* ──────────────── Sidebar state ──────────────── */
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<{ [key: number]: number | null }>({});
    const [isAddContainersOpen, setIsAddContainersOpen] = useState(false);
    const [showCosts, setShowCosts] = useState(false);
    const [isAlterRoomSizeOpen, setIsAlterRoomSizeOpen] = useState(false);

    /* ──────────────── Render ──────────────── */
    return (
        <div className="flex w-full h-full p-6">

            {/* ─────────────── Canvas & Action Panel ──────────────── */}
            <div className="flex flex-col items-center w-3/5">
                {/* RoomCanvas displays the room, containers, and doors */}
                <RoomCanvas
                    room={room}
                    corners={corners}
                    handleDragCorner={handleDragCorner}

                    doors={doors}
                    selectedDoorId={selectedDoorId}
                    handleDragDoor={handleDragDoor}
                    handleSelectDoor={handleSelectDoor}

                    containers={containersInRoom}
                    selectedContainerId={selectedContainerId}
                    handleDragContainer={handleDragContainer}
                    handleSelectContainer={handleSelectContainer}

                    isStageDropActive={isStageDropActive}
                    stageWrapperRef={stageWrapperRef}
                    handleStageDrop={handleStageDrop}
                    handleStageDragOver={handleStageDragOver}
                    handleStageDragLeave={handleStageDragLeave}
                />

                {/* ActionPanel for moving/rotating/removing selected items */}
                <ActionPanel
                    containers={containersInRoom}
                    doors={doors}
                    selectedContainerId={selectedContainerId}
                    selectedDoorId={selectedDoorId}
                    setSelectedContainerId={handleSelectContainer}
                    handleRemoveContainer={handleRemoveContainer}
                    handleRemoveDoor={handleRemoveDoor}
                    handleRotateDoor={handleRotateDoor}
                />
            </div>

            {/* ─────────────── Sidebar ──────────────── */}
            <div className="w-2/5 pl-8 flex flex-col h-[600px]">
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

                    //UI state for sidebar sections
                    isAddContainersOpen={isAddContainersOpen}
                    setIsAddContainersOpen={setIsAddContainersOpen}
                    showCosts={showCosts}
                    setShowCosts={setShowCosts}
                    isAlterRoomSizeOpen={isAlterRoomSizeOpen}
                    setIsAlterRoomSizeOpen={setIsAlterRoomSizeOpen}

                    //Room and door management
                    setRoom={setRoom}
                    handleAddDoor={handleAddDoor}
                />
            </div>
        </div>
    );
}
