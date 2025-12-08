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
import { currentUser } from '../../lib/Auth';


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
import { useOtherObjects } from './hooks/UseOtherObjects';
import { useComparison } from './hooks/useComparison';
import { useLayoutHistory } from './hooks/UseLayoutHistory';
import { useSaveRoom, useWasteRoomRequestBuilder } from './hooks/UseSaveRoom';
import { usePropertyHighlights } from './hooks/usePropertyHighlights';

import { SCALE } from './Constants';

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

type PlanningToolProps = {
    isAdminMode?: boolean;
};

export default function PlanningTool({ isAdminMode = false }: PlanningToolProps) {

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
    } = useDoors(room, setSelectedDoorId, setSelectedContainerId, setSelectedOtherObjectId);

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
        isObjectOutsideRoom,
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
    } = useContainers(room, setSelectedContainerId, setSelectedDoorId, setSelectedOtherObjectId, getDoorZones(), getOtherObjectZones());

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
        if (room.otherObjects && room.otherObjects.length > 0) setOtherObjects(room.otherObjects);
    }, [room.id, setDoors, saveContainers, setOtherObjects]);

    /* ──────────────── Sync state to localStorage on changes ──────────────── */
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
    const propertyHighlights = usePropertyHighlights(comparisonData, comparisonLoading, selectedProperty);

    const { saveRoom } = useSaveRoom();
    const { buildWasteRoomRequest } = useWasteRoomRequestBuilder(isContainerInsideRoom);

    const handleSaveRoom = async (thumbnailBase64: string | "null") => {
        if (!propertyId) {
            console.error("No propertyId, cannot save room.");
            return;
        }

        const roomRequest = buildWasteRoomRequest(room, doors, containersInRoom, otherObjects, propertyId, thumbnailBase64);

        const savedRoom = await saveRoom(roomRequest);
        room.id = savedRoom?.wasteRoomId;
    };

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
        <div className="flex h-full w-full flex-col gap-4 p-3 sm:p-5">

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
                        isObjectOutsideRoom={isObjectOutsideRoom}

                        undo={undo}
                        redo={redo}
                        saveRoom={handleSaveRoom}
                        isAdminMode={isAdminMode}
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
    );
}
