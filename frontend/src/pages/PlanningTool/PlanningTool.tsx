/**
 * Main component for the planning tool UI.
 * Manages state and logic for room layout, doors, containers, and service types.
 * Renders the RoomCanvas, Sidebar, and ActionPanel components.
 */
import { useState, useEffect } from 'react';
import { MapPin, Home, Users } from "lucide-react";

//Lib
import type { Property } from '../../lib/Property';

//Components
import RoomCanvas from './RoomCanvas/RoomCanvas';
import Sidebar from './Sidebar/Sidebar';
import ActionPanel from './ActionPanel';

//Hooks
import { useRoom } from './hooks/UseRoom';
import { useDoors } from './hooks/UseDoors';
import { useContainers } from './hooks/UseContainers';
import { useServiceTypes } from './hooks/UseServiceTypes';
import { useComparison } from './hooks/useComparison';

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

    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const stored = localStorage.getItem('trashRoomData');
            if (!stored) {
                setSelectedProperty(null);
                return;
            }

            const parsed = JSON.parse(stored);
            if (parsed?.property?.id) {
                setSelectedProperty(parsed.property as Property);
            } else {
                setSelectedProperty(null);
            }
        } catch (error) {
            console.error('Failed to parse stored property data', error);
            setSelectedProperty(null);
        }
    }, []);

    /* ──────────────── Comparison data ──────────────── */
    const { data: comparisonData, loading: comparisonLoading, error: comparisonError } = useComparison(selectedProperty?.id ?? null);

    /* ──────────────── Sidebar state ──────────────── */
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<{ [key: number]: number | null }>({});

    const displayAddress = comparisonData?.address ?? selectedProperty?.address ?? null;
    const apartmentCount = comparisonData?.numberOfApartments ?? selectedProperty?.numberOfApartments ?? null;
    const apartmentLabel = apartmentCount && apartmentCount > 0 ? `${apartmentCount} lägenheter` : "Antal lägenheter saknas";
    const comparisonGroupSize = comparisonData?.costComparison?.comparisonGroupSize
        ?? comparisonData?.containerSizeComparison?.comparisonGroupSize
        ?? 0;
    const similarPropertiesLabel = comparisonLoading
        ? "Hämtar jämförelsedata..."
        : comparisonData
            ? comparisonGroupSize > 1
                ? `${comparisonGroupSize} liknande fastigheter i jämförelsen`
                : comparisonGroupSize === 1
                    ? "1 liknande fastighet i jämförelsen"
                    : "Inga matchande fastigheter i jämförelsen"
            : "Jämförelsedata saknas";

    /* ──────────────── Render ──────────────── */
    return (
    <div className="flex w-full h-full p-3 sm:p-5 flex-col lg:flex-row gap-4 lg:gap-5">

            {/* ─────────────── Canvas ──────────────── */}
            <div className="relative flex w-full min-w-0 flex-col lg:flex-[5]">
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
                    handleAddDoor={handleAddDoor}
                    doorZones={getDoorZones()}

                    containers={containersInRoom}
                    selectedContainerId={selectedContainerId}
                    handleDragContainer={handleDragContainer}
                    handleSelectContainer={handleSelectContainer}
                    getContainerZones={getContainerZones}
                    draggedContainer={draggedContainer}
                    setSelectedContainerInfo={setSelectedContainerInfo}
                    selectedContainerInfo={selectedContainerInfo}

                    isStageDropActive={isStageDropActive}
                    stageWrapperRef={stageWrapperRef}
                    handleStageDrop={handleStageDrop}
                    handleStageDragOver={handleStageDragOver}
                    handleStageDragLeave={handleStageDragLeave}
                    serviceTypes={serviceTypes}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    availableContainers={availableContainers}
                    selectedSize={selectedSize}
                    setSelectedSize={setSelectedSize}
                    isLoadingContainers={isLoadingContainers}
                    fetchContainers={fetchAvailableContainers}
                    handleAddContainer={handleAddContainer}
                    setIsStageDropActive={setIsStageDropActive}
                    setDraggedContainer={setDraggedContainer}
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

                <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-4 w-4 text-nsr-teal" />
                            {displayAddress ?? "Ingen fastighet vald"}
                        </span>
                        <span className="flex items-center gap-2 text-gray-700">
                            <Home className="h-4 w-4 text-nsr-teal" />
                            {apartmentLabel}
                        </span>
                        <span className="flex items-center gap-2 text-gray-700">
                            <Users className="h-4 w-4 text-nsr-teal" />
                            {similarPropertiesLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* ─────────────── Sidebar ──────────────── */}
            <div className="w-full lg:flex-[6] lg:pl-6 flex flex-col min-w-0">
                <Sidebar
                    //Comparison data
                    comparisonData={comparisonData}
                    comparisonLoading={comparisonLoading}
                    comparisonError={comparisonError}
                    selectedProperty={selectedProperty}
                    containersInRoom={containersInRoom}
                />
            </div>
        </div>
    );
}
