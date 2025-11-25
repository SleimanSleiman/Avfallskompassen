/**
 * Main component for the planning tool UI.
 * Manages state and logic for room layout, doors, containers, and service types.
 * Renders the RoomCanvas, Sidebar, and ActionPanel components.
 */
import { useState, useEffect } from 'react';
import { MapPin, Home, Users } from "lucide-react";

//Lib
import type { Property } from '../../lib/Property';
import type { ContainerDTO } from '../../lib/Container';

import { useComparison } from './hooks/useComparison';
import { useLayoutHistory } from './hooks/UseLayoutHistory';
import { useSaveRoom, useWasteRoomRequestBuilder } from './hooks/UseSaveRoom';

//Components
import RoomCanvas from './RoomCanvas/RoomCanvas';
import Sidebar from './Sidebar/Sidebar';
import { WasteTypeComparisonPanel } from "./Sidebar/CostSection";
import ActionPanel from './ActionPanel';

//Hooks
import { useRoom } from './hooks/UseRoom';
import { useDoors } from './hooks/UseDoors';
import { useContainers } from './hooks/UseContainers';
import { useServiceTypes } from './hooks/UseServiceTypes';

type PlanningToolProps = {
    isAdminMode?: boolean;
};

export default function PlanningTool({ isAdminMode = false }: PlanningToolProps) {

    /* ──────────────── Room state & logic ──────────────── */
    const {
        room,
        corners,
        handleDragCorner,
        setRoom
    } = useRoom();


    /* ──────────────── Door state & logic ──────────────── */
    const [selectedContainerId, setSelectedContainerId] = useState<number | null>(null);
    const [selectedDoorId, setSelectedDoorId] = useState<number | null>(null);

    const {
        doors,
        setDoors,
        handleAddDoor,
        handleDragDoor,
        handleRotateDoor,
        handleRemoveDoor,
        handleSelectDoor,
        getDoorZones,
        doorOffsetRef,
    } = useDoors(room, setSelectedDoorId, setSelectedContainerId);

    /* ──────────────── Container state & logic ──────────────── */
    const {
        containersInRoom,
        saveContainers,
        draggedContainer,
        setDraggedContainer,

        handleAddContainer,
        handleRemoveContainer,
        handleDragContainer,
        moveAllContainers,
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
        handleRotateContainer,
        handleShowContainerInfo,
        selectedContainerInfo,
        setSelectedContainerInfo,
        undo,
        redo,
        getContainerZones,
        isContainerInsideRoom,
    } = useContainers(room, setSelectedContainerId, setSelectedDoorId, getDoorZones());

    /* ──────────────── Sync the doors and containers when changes are made to the room ──────────────── */
    useEffect(() => {
        if (room.doors && room.doors.length > 0) {

        const leftX = room.x;
        const topY = room.y;

        const offsets: Record<number, number> = {};

        room.doors.forEach(d => {
            let offset = 0.5;

            switch (d.wall) {
                case "top":
                case "bottom":
                    offset = (d.x - leftX) / room.width;
                    break;

                case "left":
                case "right":
                    offset = (d.y - topY) / room.height;
                    break;
            }

            offsets[d.id] = offset;
        });

        doorOffsetRef.current = offsets;
        setDoors(room.doors);
    }
        if (room.containers && room.containers.length > 0) saveContainers(room.containers);
    }, [room.id, setDoors, saveContainers]);



    /* ──────────────── Service Types (API data) ──────────────── */
    const serviceTypes = useServiceTypes();


    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [containerPanelHeight, setContainerPanelHeight] = useState(0);

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
    // Note: initialized after propertyId is determined below

    /* ──────────────── Sidebar state ──────────────── */
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<{ [key: number]: number | null }>({});

    /* ──────────────── ActionPanel position ──────────────── */
    const [actionPanelPos, setActionPanelPos] = useState<{ left: number; top: number } | null>(null);

    /* ──────────────── Save room ──────────────── */
    // Determine propertyId from either `selectedProperty` object or `selectedPropertyId` string in localStorage
    const _savedProperty = typeof window !== 'undefined' ? localStorage.getItem("selectedProperty") : null;
    const _savedPropertyId = typeof window !== 'undefined' ? localStorage.getItem('selectedPropertyId') : null;
    const propertyId = _savedProperty ? JSON.parse(_savedProperty).propertyId : (_savedPropertyId ? Number(_savedPropertyId) : null);

    const { data: comparisonData, loading: comparisonLoading, error: comparisonError } = useComparison(propertyId);

    const displayAddress = comparisonData?.address ?? selectedProperty?.address ?? null;
    const apartmentCount = comparisonData?.numberOfApartments ?? selectedProperty?.numberOfApartments ?? null;
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

    const formattedApartmentCount = apartmentCount && apartmentCount > 0
        ? apartmentCount.toLocaleString("sv-SE")
        : null;
    const hasComparisonPeers = Boolean(comparisonData) && comparisonGroupSize > 0;

    const propertyHighlights = [
        {
            key: "address",
            title: "Adress",
            value: displayAddress ?? "Ingen fastighet vald",
            Icon: MapPin,
            tone: displayAddress ? "text-gray-900" : "text-gray-400",
            helper: displayAddress ? null : "Välj en fastighet för att se detaljer",
        },
        {
            key: "apartments",
            title: "Lägenheter",
            value: formattedApartmentCount ? `${formattedApartmentCount} st` : "Saknas",
            Icon: Home,
            tone: formattedApartmentCount ? "text-gray-900" : "text-gray-400",
        },
        {
            key: "comparison",
            title: "Jämförelseunderlag",
            value: similarPropertiesLabel,
            Icon: Users,
            tone: hasComparisonPeers ? "text-gray-900" : "text-gray-500",
            helper: comparisonLoading
                ? "Data uppdateras"
                : hasComparisonPeers
                    ? " "
                    : "Jämförelsedata saknas för vald fastighet",
        },
    ];

    const { saveRoom, isSaving, error } = useSaveRoom();
    const { buildWasteRoomRequest } = useWasteRoomRequestBuilder(isContainerInsideRoom);

    const handleSaveRoom = async () => {
        const roomRequest = buildWasteRoomRequest(room, doors, containersInRoom, propertyId);
        const savedRoom = await saveRoom(roomRequest);
        room.id = savedRoom?.wasteRoomId;
    };

    /* ──────────────── Render ──────────────── */
    return (
        <div className="flex h-full w-full flex-col gap-4 p-3 sm:p-5">
            <div className="flex w-full flex-1 flex-col gap-4 lg:flex-row lg:gap-6">

                {/* ─────────────── Canvas ──────────────── */}
                  <div className="relative w-full  flex flex-col">
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
                        moveAllContainers={moveAllContainers}
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
                        onContainerPanelHeightChange={setContainerPanelHeight}
                        isContainerInsideRoom={isContainerInsideRoom}

                        undo={undo}
                        redo={redo}
                        saveRoom={handleSaveRoom}
                        isAdminMode={isAdminMode}
                    />

                    {/* ActionPanel for selected container or door */}
                    {(selectedContainerId !== null || selectedDoorId !== null) && (
                        <div
                            className="absolute z-50 lg:left-0.5 lg:top-0 hidden lg:flex w-full justify-center lg:justify-start"
                        >
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
                                stageWrapperRef={stageWrapperRef}
                                pos={actionPanelPos}
                                setPos={setActionPanelPos}
                            />
                        </div>
                    )}

                    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {propertyHighlights.map(({ key, Icon, title, value, tone, helper }) => (
                                <div key={key} className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-gray-50/60 p-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-nsr-teal shadow-sm">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{title}</p>
                                        <p className={`truncate text-sm font-medium leading-tight ${tone}`}>{value}</p>
                                        {helper ? (
                                            <p className="text-[11px] text-gray-400">{helper}</p>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4    ">
                        <WasteTypeComparisonPanel
                            comparisonData={comparisonData}
                            comparisonLoading={comparisonLoading}
                            comparisonError={comparisonError}
                            selectedProperty={selectedProperty}
                            containersInRoom={containersInRoom}
                        />
                    </div>
                </div>

                {/* ─────────────── Sidebar ──────────────── */}
                 <div className="w-full  lg:pl-6 flex flex-col">
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
        </div>
    );
}
