/**
 * Main component for the planning tool UI.
 * Manages state and logic for room layout, doors, containers, and service types.
 * Renders the RoomCanvas, Sidebar, and ActionPanel components.
 */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
 
//Lib
import { getProperty } from '../../lib/Property';
import type { Property } from '../../lib/Property';
import { currentUser } from '../../lib/Auth';

//Context
import { useUnsavedChanges } from '../../context/UnsavedChangesContext';

//Components
import RoomCanvas from './RoomCanvas/RoomCanvas';
import ActionPanel from './components/ActionPanel';
import PropertyOverviewPanel from './PropertyAndWasteAnalysis/PropertyOverview/PropertyOverviewPanel';
import WasteAnalysisPanels from './PropertyAndWasteAnalysis/WasteAnalysis/WasteAnalysisPanels'
import { Tooltip } from "../../components/Tooltip";
import Message from '../../components/ShowStatus';

//Hooks
import { useRoom } from './hooks/UseRoom';
import { useDoors } from './hooks/UseDoors';
import { useContainers } from './hooks/UseContainers';
import { useServiceTypes } from './hooks/UseServiceTypes';
import { useOtherObjects } from './hooks/UseOtherObjects';
import { useComparison } from './hooks/useComparison';
import { useLayoutHistory } from './hooks/UseLayoutHistory';
import { useSaveRoom, useWasteRoomRequestBuilder } from './hooks/UseSaveRoom';
import { usePropertyHighlights } from './hooks/usePropertyHighlights';

import { SCALE, ROOM_HORIZONTAL_OFFSET, ROOM_VERTICAL_OFFSET, STAGE_HEIGHT, STAGE_WIDTH } from './lib/Constants';
import PlanningToolPopup from './components/PlanningToolPopup';
import type { PreparedRoomState } from './components/PlanningToolPopup';

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

type PlanningToolProps = {
    isAdminMode?: boolean;
    property?: Property;
};

export default function PlanningTool({ isAdminMode = false, property }: PlanningToolProps) {
    const navigate = useNavigate();
    const { setHasUnsavedChanges } = useUnsavedChanges();

    const defaultRoomState = useMemo(() => {
        const DEFAULT_ROOM_METERS = 5;

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

    /* ──────────────── Messages ──────────────── */
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [loadedProperty, setLoadedProperty] = useState<Property | null>(null);

    

   // Selected IDs
   const [selectedContainerId, setSelectedContainerId] = useState<number | null>(null);
   const [selectedDoorId, setSelectedDoorId] = useState<number | null>(null);
   const [selectedOtherObjectId, setSelectedOtherObjectId] = useState<number | null>(null);

    /* ──────────────── Room state & logic ──────────────── */
    const {
        room,
        corners,
        handleDragCorner,
        setRoom
    } = useRoom();

    useEffect(() => {
        if (room?.propertyId) {
            getProperty(room.propertyId).then(setLoadedProperty).catch(console.error);
        }
    }, [room?.propertyId]);
    
    /* ──────────────── Door state & logic ──────────────── */
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
        restoreDoorState,
        isDoorDragging,
        setIsDoorDragging,
    } = useDoors(room, setSelectedDoorId, setSelectedContainerId,setSelectedOtherObjectId, setError, setMsg);

    /* ──────────────── Other Objects state & logic ──────────────── */
    const {
        otherObjects,
        setOtherObjects,
        handleAddOtherObject,
        handleDragOtherObject,
        getOtherObjectZones,
        handleSelectOtherObject,
        handleRotateOtherObject,
        handleRemoveOtherObject,
        isObjectInsideRoom,
        moveAllObjects,
    } = useOtherObjects(room, setSelectedOtherObjectId, setSelectedContainerId, setSelectedDoorId, getDoorZones(), () => getContainerZones());

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
        getWallInsetForContainer,
        getSnappedRotationForContainer,
    } = useContainers(room, setSelectedContainerId, setSelectedDoorId, setSelectedOtherObjectId, getDoorZones(), getOtherObjectZones(),setError,setMsg, isDoorDragging);

    // Track the saved state for comparison
    // ...existing code...

    // Track the saved state for comparison
    const [savedRoomState, setSavedRoomState] = useState<{ room: any; doors: any; containers: any; otherObjects: any } | null>(null);
    const [hasInitializedFromStorage, setHasInitializedFromStorage] = useState(false);

    /* ──────────────── Sync the doors and containers when changes are made to the room ──────────────── */
    useEffect(() => {
        // Only sync once on initial load from storage
        if (hasInitializedFromStorage) return;
        
        if (room.id && room.doors && room.doors.length > 0) {

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
        if (room.id && room.containers && room.containers.length > 0) saveContainers(room.containers);
        if (room.id && room.otherObjects && room.otherObjects.length > 0) setOtherObjects(room.otherObjects);
        
        // Initialize savedRoomState on first load
        if (!savedRoomState && room.id) {
            setSavedRoomState({
                room: JSON.parse(JSON.stringify(room)),
                doors: JSON.parse(JSON.stringify(room.doors || [])),
                containers: JSON.parse(JSON.stringify(room.containers || [])),
                otherObjects: JSON.parse(JSON.stringify(room.otherObjects || [])),
            });
            setHasInitializedFromStorage(true);
        }
    }, [hasInitializedFromStorage, room.id, setDoors, saveContainers, setOtherObjects, savedRoomState]);

    /* ──────────────── Sync state to localStorage on changes ──────────────── */
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        // Don't sync if we don't have a room ID (means we're still initializing)
        if (!room.id) {
            return;
        }

        try {
            const stored = localStorage.getItem('trashRoomData');
            if (!stored) {
                return;
            }

            const parsed = JSON.parse(stored);
            const updated = {
                ...parsed,
                containers: containersInRoom,
                doors: doors,
                otherObjects: otherObjects,
                width: room.height * SCALE, // Convert back to meters
                length: room.width * SCALE,  // Convert back to meters
            };

            localStorage.setItem('trashRoomData', JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to sync state to localStorage', error);
        }
    }, [containersInRoom, doors, otherObjects, room.width, room.height, room.id]);


    /* ──────────────── Service Types (API data) ──────────────── */
    const serviceTypes = useServiceTypes();


    const [selectedProperty, setSelectedProperty] = useState<Property | null>(
        isAdminMode && property ? property : null
    );
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
      if (isAdminMode && property?.id) {
        localStorage.setItem('selectedPropertyId', String(property.id));
        localStorage.setItem('selectedProperty', JSON.stringify({ propertyId: property.id }));
        setSelectedProperty(property);
      }
    }, [isAdminMode, property]);

    useEffect(() => {
        if (isAdminMode) return;
        if (!hasCheckedStoredProperty) return;

        // Check if we have a property object OR a valid propertyId from navigation
        // (ex., when coming from AllWasteroomPage via "Redigera" button)
        const storedPropertyId = typeof window !== 'undefined' ? localStorage.getItem('selectedPropertyId') : null;
        const hasValidPropertyId = storedPropertyId && storedPropertyId !== 'null' && storedPropertyId !== 'undefined';

        if (selectedProperty || hasValidPropertyId) {
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
            // Check both storage keys (matching UseRoom.ts pattern)
            // enviormentRoomData is set by popup selection, trashRoomData is legacy
            const stored = localStorage.getItem('enviormentRoomData') ?? localStorage.getItem('trashRoomData');
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
    const { buildWasteRoomRequest } = useWasteRoomRequestBuilder(isContainerInsideRoom, isObjectInsideRoom);

    const handleSaveRoom = async (thumbnailBase64: string | null) => {
        if (!propertyId) {
            console.error("No propertyId, cannot save room.");
            return;
        }

        const thumbnail = thumbnailBase64 || "";
        const roomRequest = buildWasteRoomRequest(room, doors, containersInRoom, otherObjects, propertyId, thumbnail);

        const savedRoom = await saveRoom(roomRequest);
        
        // Only update room ID if it's new (create operation)
        if (!room.id && savedRoom?.wasteRoomId) {
            const updatedRoom = { ...room, id: savedRoom.wasteRoomId };
            setRoom(updatedRoom);
            
            // Update saved state after successful save
            setSavedRoomState({
                room: JSON.parse(JSON.stringify(updatedRoom)),
                doors: JSON.parse(JSON.stringify(doors)),
                containers: JSON.parse(JSON.stringify(containersInRoom)),
                otherObjects: JSON.parse(JSON.stringify(otherObjects)),
            });
        } else {
            // For updates, just update savedRoomState without modifying room
            setSavedRoomState({
                room: JSON.parse(JSON.stringify(room)),
                doors: JSON.parse(JSON.stringify(doors)),
                containers: JSON.parse(JSON.stringify(containersInRoom)),
                otherObjects: JSON.parse(JSON.stringify(otherObjects)),
            });
        }
    };

    // Track unsaved changes
    const hasUnsavedChanges = useCallback(() => {
        if (!savedRoomState) {
            // If we haven't saved before, check if anything was changed
            return room.id !== undefined || doors.length > 0 || containersInRoom.length > 0 || otherObjects.length > 0;
        }
        
        // Compare current state with saved state
        const roomChanged = JSON.stringify(room) !== JSON.stringify(savedRoomState.room);
        const doorsChanged = JSON.stringify(doors) !== JSON.stringify(savedRoomState.doors);
        const containersChanged = JSON.stringify(containersInRoom) !== JSON.stringify(savedRoomState.containers);
        const objectsChanged = JSON.stringify(otherObjects) !== JSON.stringify(savedRoomState.otherObjects);
        
        return roomChanged || doorsChanged || containersChanged || objectsChanged;
    }, [room, doors, containersInRoom, otherObjects, savedRoomState]);
const hasUnsavedChangesRef = useRef(false);

    //Open ConfirmModal for unsaved changes during logout or navigation in site
    useEffect(() => {
      hasUnsavedChangesRef.current = hasUnsavedChanges();
      setHasUnsavedChanges(hasUnsavedChangesRef);
    }, [room, doors, containersInRoom, otherObjects, savedRoomState]);

    //Opens browser prompt for unsaved changes during exit or reload of page
    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (!hasUnsavedChangesRef.current) return;
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);


    // Handle close without saving
    const handleCloseRoom = useCallback(() => {
        clearPlanningStorage();
        setHasUnsavedChanges(false);
        const propertyId = typeof window !== 'undefined' ? localStorage.getItem('selectedPropertyId') : null;
        if (propertyId) {
            navigate(`/properties/${propertyId}/rooms`);
        } else {
            navigate('/properties');
        }
    }, [navigate, clearPlanningStorage, setHasUnsavedChanges]);

    const [shouldShowTour, setShouldShowTour] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem("hasSeenPlanningToolManual");

        // If null or "false" then show tour
        if (hasSeen === null || hasSeen === "false") {
            setShouldShowTour(true);
        }
    }, []);

    // Auto-start tour once state is ready
    useEffect(() => {
        if (shouldShowTour) {
            startTour();
        }
    }, [shouldShowTour]);

    function startTour() {
        const tour = driver({
            showProgress: true,
            overlayOpacity: 0.55,
            allowClose: true,
            nextBtnText: "Nästa",
            prevBtnText: "Föregående",
            doneBtnText: "Klart",

            onDestroyed: async () => {
                try {
                    const user = currentUser();
                    if (!user?.username) return;

                    // Save locally immediately
                    localStorage.setItem("hasSeenPlanningToolManual", "true");

                    await fetch(`/api/user/${user.username}/mark-manual-seen`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${user.token}`,
                            "Content-Type": "application/json"
                        }
                    });
                    setShouldShowTour(false);

                } catch (err) {
                    console.error("Could not update manual state", err);
                }
            },
     
            steps: [
                {
                    element: "#toolbar-panel",
                    popover: {
                        title: "Verktygsfält",
                        description: "Här kan du ändra rummet storlek, lägga dörrar, kärl och spara miljörummet.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#canvas-stage",
                    popover: {
                        title: "Arbetsyta",
                        description: "Här bygger du miljörummet genom att dra och släppa objekt.",
                        side: "right",
                        align: "center"
                    }
                },
                {
                    element: "#wasteAnalysis-panel",
                    popover: {
                        title: "Kostnader och jämförelse",
                        description: "Här hittar du kostnader, volymer och jämförelser.",
                        side: "left",
                        align: "center"
                    }
                },
                {
                    element: "#property-panel",
                    popover: {
                        title: "Fastighetsinformation",
                        description: "Visar adress, antal lägenheter och jämförelsedata.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: "#comparison-panel",
                    popover: {
                        title: "Jämförelse per avfallstyp",
                        description: "Här visas årskostnader och årvolymer.",
                        side: "top",
                        align: "start"
                    }
                }
            ]
        });

        tour.drive();
    }

    /* ──────────────── Render ──────────────── */
    return (
        <>
        <div className="flex h-full w-full flex-col gap-4 p-3 sm:p-5">

            {/* Feedback messages */}
            <div className="stage-content-wrapper">
                {msg && <Message message={msg} type="success" />}
                {error && <Message message={error} type="error" />}
            </div>

            <button
                onClick={startTour}
                className="self-end mb-2 px-3 py-1 bg-nsr-teal text-white rounded-lg shadow"
                >
                Visa manual
            </button>
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
                        restoreDoorState={restoreDoorState}
                        isDraggingDoor={isDoorDragging}
                        setIsDraggingDoor={setIsDoorDragging}

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

                        otherObjects={otherObjects}
                        setOtherObjects={setOtherObjects}
                        handleAddOtherObject={handleAddOtherObject}
                        handleDragOtherObject={handleDragOtherObject}
                        getOtherObjectZones={getOtherObjectZones}
                        handleSelectOtherObject={handleSelectOtherObject}
                        selectedOtherObjectId={selectedOtherObjectId}
                        isObjectInsideRoom={isObjectInsideRoom}
                        moveAllObjects={moveAllObjects}

                        undo={undo}
                        redo={redo}
                        saveRoom={handleSaveRoom}
                        isAdminMode={isAdminMode}
                        hasUnsavedChanges={hasUnsavedChanges}
                        onClose={handleCloseRoom}
                        existingNames={loadedProperty?.wasteRooms?.map(r => r.name || "") || []}

                        getWallInsetForContainer={getWallInsetForContainer}
                        getSnappedRotationForContainer={getSnappedRotationForContainer}
                    />

                    {/* ActionPanel for selected container or door */}
                    {(selectedContainerId !== null || selectedDoorId !== null || selectedOtherObjectId != null) && (
                        <div
                            className="absolute z-50 left-0.5 top-0 flex w-full justify-center lg:justify-start">
                            <ActionPanel
                                containers={containersInRoom}
                                doors={doors}
                                otherObjects={otherObjects}
                                selectedContainerId={selectedContainerId}
                                selectedDoorId={selectedDoorId}
                                selectedOtherObjectId={selectedOtherObjectId}
                                handleRemoveContainer={handleRemoveContainer}
                                handleRemoveDoor={handleRemoveDoor}
                                handleRemoveOtherObject={handleRemoveOtherObject}
                                handleRotateDoor={handleRotateDoor}
                                handleRotateContainer={handleRotateContainer}
                                handleRotateOtherObject={handleRotateOtherObject}
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

                <div id="wasteAnalysis-panel" className="w-full lg:pl-6 flex flex-col">
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
