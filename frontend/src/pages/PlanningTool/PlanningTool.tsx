/**
 * Main component for the planning tool UI.
 * Manages state and logic for room layout, doors, containers, and service types.
 * Renders the RoomCanvas, Sidebar, and ActionPanel components.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

//Lib
import type { Property } from '../../lib/Property';
import type { ContainerDTO } from '../../lib/Container';

import { useComparison } from './hooks/useComparison';
import { useLayoutHistory } from './hooks/UseLayoutHistory';
import { useSaveRoom, useWasteRoomRequestBuilder } from './hooks/UseSaveRoom';
import { usePropertyHighlights } from './hooks/usePropertyHighlights';

//Components
import RoomCanvas from './RoomCanvas/RoomCanvas';
import ActionPanel from './ActionPanel';
import PropertyOverviewPanel from './PropertyAndWasteAnalysis/PropertyOverview/PropertyOverviewPanel';
import WasteAnalysisPanels from './PropertyAndWasteAnalysis/WasteAnalysis/WasteAnalysisPanels'
import { Tooltip } from "../../components/Tooltip";

//Hooks
import { useRoom } from './hooks/UseRoom';
import { useDoors } from './hooks/UseDoors';
import { useContainers } from './hooks/UseContainers';
import { useServiceTypes } from './hooks/UseServiceTypes';
import { SCALE, ROOM_HORIZONTAL_OFFSET, ROOM_VERTICAL_OFFSET, STAGE_HEIGHT, STAGE_WIDTH } from './Constants';
import PlanningToolPopup from './components/PlanningToolPopup';
import type { PreparedRoomState } from './components/PlanningToolPopup';

const DEFAULT_ROOM_METERS = 5;

type PlanningToolProps = {
    isAdminMode?: boolean;
};

export default function PlanningTool({ isAdminMode = false }: PlanningToolProps) {
    const navigate = useNavigate();

    const defaultRoomState = useMemo(() => {
        const widthPx = DEFAULT_ROOM_METERS / SCALE;
        const heightPx = DEFAULT_ROOM_METERS / SCALE;
        return {
            widthMeters: DEFAULT_ROOM_METERS,
            heightMeters: DEFAULT_ROOM_METERS,
            widthPx,
            heightPx,
            x: (STAGE_WIDTH - widthPx) / 2 + ROOM_HORIZONTAL_OFFSET,
            y: (STAGE_HEIGHT - heightPx) / 2 + ROOM_VERTICAL_OFFSET,
        };
    }, []);

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

   useEffect(() => {
        if (typeof window === 'undefined') {
            console.log('PlanningTool - Skipping sync (no window)');
            return;
        }

        // Don't sync if we don't have a room ID (means we're still initializing)
        if (!room.id) {
            console.log('PlanningTool - Skipping sync (no room.id)', { room });
            return;
        }

        try {
            const stored = localStorage.getItem('trashRoomData');
            if (!stored) {
                console.log('PlanningTool - Skipping sync (no stored data)');
                return;
            }

            const parsed = JSON.parse(stored);
            const updated = {
                ...parsed,
                containers: containersInRoom,
                doors: doors,
                width: room.height * SCALE, // Convert back to meters
                length: room.width * SCALE,  // Convert back to meters
            };

            console.log('PlanningTool - Syncing state to localStorage:', {
                roomId: room.id,
                containerCount: containersInRoom.length,
                doorCount: doors.length,
                roomDimensions: { width: updated.width, length: updated.length },
                containers: containersInRoom
            });

            localStorage.setItem('trashRoomData', JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to sync state to localStorage', error);
        }
    }, [containersInRoom, doors, room.width, room.height, room.id]);


    /* ──────────────── Service Types (API data) ──────────────── */
    const serviceTypes = useServiceTypes();


    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [hasCheckedStoredProperty, setHasCheckedStoredProperty] = useState(false);
    const [showPropertyPicker, setShowPropertyPicker] = useState(false);
    const clearPlanningStorage = useCallback(() => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('enviormentRoomData');
        localStorage.removeItem('trashRoomData');
        localStorage.removeItem('selectedProperty');
        localStorage.removeItem('selectedPropertyId');
    }, []);

    useEffect(() => {
        if (isAdminMode) return;
        if (!hasCheckedStoredProperty) return;

        if (selectedProperty) {
            setShowPropertyPicker(false);
            return;
        }

        clearPlanningStorage();
        setShowPropertyPicker(true);
    }, [isAdminMode, selectedProperty, hasCheckedStoredProperty, clearPlanningStorage]);
    const [containerPanelHeight, setContainerPanelHeight] = useState(0);

    useEffect(() => {
        if (typeof window === 'undefined') {
            setHasCheckedStoredProperty(true);
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
        } finally {
            setHasCheckedStoredProperty(true);
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

    const handlePopupSelection = useCallback((prepared: PreparedRoomState) => {
        const { property, propertyId: preparedId, storagePayload, roomState } = prepared;
        localStorage.setItem('enviormentRoomData', JSON.stringify(storagePayload));
        localStorage.removeItem('trashRoomData');
        localStorage.setItem('selectedPropertyId', String(preparedId));
        localStorage.setItem('selectedProperty', JSON.stringify({ propertyId: preparedId }));
        setSelectedProperty(property);
        setRoom(roomState);
        setShowPropertyPicker(false);
    }, [setRoom]);

    const goToProperties = useCallback(() => {
        setShowPropertyPicker(false);
        navigate('/properties');
    }, [navigate]);

    const { data: comparisonData, loading: comparisonLoading, error: comparisonError } = useComparison(propertyId);
    const propertyHighlights = usePropertyHighlights(comparisonData, comparisonLoading, selectedProperty);

    const { saveRoom } = useSaveRoom();
    const { buildWasteRoomRequest } = useWasteRoomRequestBuilder(isContainerInsideRoom);

    const handleSaveRoom = async (thumbnailBase64: string | null) => {
        if (!propertyId) {
            console.error("No propertyId, cannot save room.");
            return;
        }

        const thumbnail = thumbnailBase64 || "";
        const roomRequest = buildWasteRoomRequest(room, doors, containersInRoom, propertyId, thumbnail);

        const savedRoom = await saveRoom(roomRequest);
        room.id = savedRoom?.wasteRoomId;
    };

    /* ──────────────── Render ──────────────── */
    return (
        <>
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
                            className="absolute z-50 left-0.5 top-0 flex w-full justify-center lg:justify-start">
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

                    <PropertyOverviewPanel
                        propertyHighlights={propertyHighlights}
                        comparisonData={comparisonData}
                        comparisonLoading={comparisonLoading}
                        comparisonError={comparisonError}
                        selectedProperty={selectedProperty}
                        containersInRoom={containersInRoom}
                    />
                </div>

                <div className="w-full lg:pl-6 flex flex-col">
                    <WasteAnalysisPanels
                        comparisonData={comparisonData}
                        comparisonLoading={comparisonLoading}
                        comparisonError={comparisonError}
                        selectedProperty={selectedProperty}
                        containersInRoom={containersInRoom}
                    />
                </div>
            </div>
        </div>

        {!isAdminMode && showPropertyPicker && (
            <PlanningToolPopup
                defaultRoomState={defaultRoomState}
                onSelect={handlePopupSelection}
                onManageProperties={goToProperties}
            />
        )}
        </>
    );
}
