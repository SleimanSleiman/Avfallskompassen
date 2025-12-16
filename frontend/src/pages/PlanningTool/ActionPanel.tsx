/**
 * ActionPanel component for managing bins and doors in the planning tool.
 * Displays the selected item and provides controls to view info, rotate, or remove it.
 */
import InfoTooltip from "./components/InfoTooltip";
import type { ContainerInRoom as Container, Door, OtherObjectInRoom } from "./Types";
import { RotateCcw, Trash2, Info, Vault } from "lucide-react";
import { useRef, useState, useEffect } from 'react';

/* ─────────────── ActionPanel Props ──────────────── */
type ActionPanelProps = {
    containers: Container[];
    doors: Door[];
    otherObjects: OtherObjectInRoom[];

    selectedContainerId: number | null;
    selectedDoorId: number | null;
    selectedOtherObjectId: number | null;

    handleRemoveContainer: (id: number) => void;
    handleRemoveDoor: (id: number) => void;
    handleRemoveOtherObject: (id: number) => void;

    handleRotateDoor: (id: number) => void;
    handleRotateContainer: (id: number) => void;
    handleRotateOtherObject: (id: number) => void;

    handleShowContainerInfo: (id: number) => void;

    handleAddLockILock: (containerId: number) => void;
    handleRemoveLockILock: (containerId: number) => void;

    stageWrapperRef?: React.RefObject<HTMLDivElement | null>;
    pos: { left: number; top: number } | null;
    setPos: React.Dispatch<React.SetStateAction<{ left: number; top: number } | null>>;
};

export default function ActionPanel({
    containers,
    doors,
    otherObjects,

    selectedContainerId,
    selectedDoorId,
    selectedOtherObjectId,

    handleRemoveContainer,
    handleRemoveDoor,
    handleRemoveOtherObject,

    handleRotateDoor,
    handleRotateContainer,
    handleRotateOtherObject,

    handleShowContainerInfo,

    handleAddLockILock,
    handleRemoveLockILock,

    stageWrapperRef,
    pos,
    setPos,
}: ActionPanelProps) {

    //Display action panel if an object is selected
    const isVisible = selectedContainerId !== null || selectedDoorId !== null || selectedOtherObjectId !== null;
    if (!isVisible ) return null;

    const defaultPos = { left: 100, top: 200 };
    const actualPos = pos ?? defaultPos;

    //States for actionpanel positioning
    const panelRef = useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    // Helper function to shorten container names
    const getShortContainerName = (name: string) => {
        const mapping: Record<string, string> = {
            "Pappersförpackningar": "Papper",
            "Metallförpackningar": "Metall",
            "Restavfall": "Rest",
            "Matavfall": "Mat",
            // add more replacements if needed
        };
        return mapping[name] ?? name; // default to original name if no mapping exists
    };

    //Determine the name of the selected item
    const selectedName = (() => {
        if (selectedContainerId !== null) {
        const container = containers.find((c) => c.id === selectedContainerId);
        if (!container) return "Inget objekt valt";

        return (
            <div className="flex flex-col">
                <span>{container.container.size} L</span>
                <span className="text-xs text-gray-500">
                    {getShortContainerName(container.container.name)}
                </span>
            </div>
        );
        } else if (selectedDoorId !== null) {
            const door = doors.find((d) => d.id === selectedDoorId);
            return door ? "Dörr " + door.width * 100 + "cm" : "Inget objekt valt";
        } else if (selectedOtherObjectId !== null) {
            const otherObject = otherObjects.find((o) => o.id === selectedOtherObjectId);
            return otherObject ? otherObject.name : "Inget objekt valt";
        }
        return "Inget objekt valt";
    })();

    // Determine the selected container object
    const selectedContainer = selectedContainerId !== null
        ? containers.find(c => c.id === selectedContainerId)
        : null;

    const hasLockILock = !!selectedContainer?.lockILock;

    // Define which sizes are compatible for lock-i-lock
    const compatibleSizes = [190, 240, 243, 370];
    const canAddLockILock = selectedContainer
        ? compatibleSizes.includes(selectedContainer.container.size)
        : false;

    //Determine button texts based on selection
    const rotateText =
        selectedDoorId !== null ? "Rotera dörr" :
        selectedContainerId !== null ? "Rotera kärl" :
        selectedOtherObjectId !== null ? "Rotera objekt" :
        "Rotera";

    const removeText =
        selectedDoorId !== null ? "Ta bort dörr" :
        selectedContainerId !== null ? "Ta bort kärl" :
        selectedOtherObjectId !== null ? "Ta bort objekt" :
        "Ta bort";


    //Handle rotate action
    const handleRotate = () => {
        if (selectedDoorId !== null) {
            const door = doors.find((d) => d.id === selectedDoorId);
            if (!door) return;
            handleRotateDoor(door.id);
        } else if (selectedContainerId !== null) {
            handleRotateContainer(selectedContainerId);
        } else if (selectedOtherObjectId !== null) {
            handleRotateOtherObject(selectedOtherObjectId);
        }
    }

    //Handle remove action
    const handleRemove = () => {
        if (selectedContainerId !== null) {
            handleRemoveContainer(selectedContainerId);
        } else if (selectedDoorId !== null) {
            handleRemoveDoor(selectedDoorId);
        } else if (selectedOtherObjectId !== null) {
            handleRemoveOtherObject(selectedOtherObjectId);
        }
    }

    //Starts dragging the ActionPanel component
    const onMouseDown = (e: React.MouseEvent) => {
       if (!panelRef.current) return;
       if ((e.target as HTMLElement).closest("button")) return; //doesn't drag if the user clicks a button

       setOffset({ x: e.clientX - (pos?.left ?? 0), y: e.clientY - (pos?.top ?? 0) });
       setDragging(true);
   };

    //Updates the components position during drag
    const onMouseMove = (e: MouseEvent) => {
        if (!dragging || !pos) return;
        const newPos = {
            left: Math.max(0, e.clientX - offset.x),
            top: Math.max(0, e.clientY - offset.y),
        };
        setPos(newPos);
    };

    //Ends drag
    const onMouseUp = () => {
        setDragging(false);
    };

    //Keeps the drag even when the mouse leaves the panel
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!dragging || !pos) return;
            const newPos = {
                left: Math.max(0, e.clientX - offset.x),
                top: Math.max(0, e.clientY - offset.y),
            };
            setPos(newPos);
        };
        const onMouseUp = () => setDragging(false);

        if (dragging) {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [dragging, offset, pos, setPos]);

    //Sets the panel's initial position
    useEffect(() => {
        if (!pos) {
            const panelEl = panelRef.current;
            const stageEl = stageWrapperRef?.current;
            if (!panelEl || !stageEl) return;

            const panelRect = panelEl.getBoundingClientRect();
            const stageRect = stageEl.getBoundingClientRect();
            const margin = 10;

            setPos({
                left: stageRect.width - panelRect.width - margin,
                top: margin + 200,
            });
        }
    }, [stageWrapperRef, pos, setPos]);

    /* ─────────────── Render ──────────────── */
    return (
        <div
            ref={panelRef}
            onMouseDown={onMouseDown}
            className="absolute z-50 cursor-grab active:cursor-grabbing select-none"
            style={{
                left: actualPos.left,
                top: actualPos.top,
            }}
        >
            <div className="flex flex-col items-center gap-2 border border-gray-300 rounded-xl bg-white shadow-sm px-2 py-2 w-20 text-sm">
                {/* Tooltip */}
                <div className="self-end">
                    <InfoTooltip
                        text="Markera ett objekt i ritningen för att kunna rotera eller ta bort det.
                        För kärl och övriga objekt kan du rotera 90° åt gången. Dörrar växlar mellan öppningsriktningar.
                        Du kan även se mer information om det valda kärlet."
                        panelWidthClass="w-72"
                    />
                </div>

                {/* Selected item name */}
                {selectedName && (
                    <div className="text-center font-semibold text-gray-800 text-sm px-2 py-1 border-b border-gray-200 w-full">
                        {selectedName}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-row lg:flex-col items-center justify-center gap-2.5 flex-wrap">

                    {/* Information button - only for containers */}
                    {selectedContainerId !== null && (
                        <button
                            onClick={() => handleShowContainerInfo(selectedContainerId)}
                            className="flex flex-col items-center justify-center text-gray-700 hover:text-blue-600 transition min-w-[64px] group"
                        >
                            <Info className="w-5 h-5" />
                            <span className="text-xs font-medium max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-20">
                                Information
                            </span>
                        </button>
                    )}
                    {/* Rotate button */}
                    <button
                            onClick={handleRotate}
                            className="flex flex-col items-center justify-center text-gray-700 hover:text-blue-600 transition min-w-[64px] group"
                    >
                        <RotateCcw className="w-5 h-5" />
                        <span className="text-xs font-medium max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-20">
                            {rotateText}
                        </span>
                    </button>

                    {/* Remove button */}
                    <button
                        onClick={handleRemove}
                        className="flex flex-col items-center justify-center text-red-600 hover:text-red-700 transition min-w-[64px] group"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span className="text-xs font-medium max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-20">
                            {removeText}
                        </span>
                    </button>
                    {canAddLockILock && (
                      <button
                        onClick={() => {hasLockILock ? handleRemoveLockILock(selectedContainerId) : handleAddLockILock(selectedContainerId!)}}
                        className={`flex flex-col items-center justify-center transition min-w-[64px] group ${
                          hasLockILock
                            ? "text-red-600 hover:text-red-800"
                            : "text-green-700 hover:text-green-900"
                        }`}
                      >
                        <Vault className="w-5 h-5" />
                        <span className="text-xs font-medium max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-20">
                          {hasLockILock ? "Ta bort lock-i-lock" : "Lägg till lock-i-lock"}
                        </span>
                      </button>
                    )}
                </div>
            </div>
        </div>
    );
}
