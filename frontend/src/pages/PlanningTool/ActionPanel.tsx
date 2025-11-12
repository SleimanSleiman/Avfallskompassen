/**
 * ActionPanel component for managing bins and doors in the planning tool.
 * Displays the selected item and provides buttons to move, rotate, or remove it.
 */

import InfoTooltip from "./components/InfoTooltip";
import type { ContainerInRoom as Container, Door } from "./Types";
import { RotateCcw, Trash2, Info } from "lucide-react";

/* ─────────────── ActionPanel Props ──────────────── */
type ActionPanelProps = {
    containers: Container[];
    doors: Door[];
    selectedContainerId: number | null;
    selectedDoorId: number | null;
    handleRemoveContainer: (id: number) => void;
    handleRemoveDoor: (id: number) => void;
    handleRotateDoor: (id: number, newRotation: number, newSwing: "inward" | "outward") => void;
    handleRotateContainer: (id: number) => void;
    handleShowContainerInfo: (id: number) => void;
};

export default function ActionPanel({
    containers,
    doors,
    selectedContainerId,
    selectedDoorId,
    handleRemoveContainer,
    handleRemoveDoor,
    handleRotateDoor,
    handleRotateContainer,
    handleShowContainerInfo,
}: ActionPanelProps) {

    //Display action panel if an object is selected
    const isVisible = selectedContainerId !== null || selectedDoorId !== null;
    if (!isVisible) return null;

    //Determine the name of the selected item
    const selectedName = (() => {
        if (selectedContainerId !== null) {
            const container = containers.find((c) => c.id === selectedContainerId);
            return container ? container.container.size + " L" : "-";
        } else if (selectedDoorId !== null) {
            const door = doors.find((d) => d.id === selectedDoorId);
            return door ? door.width * 100 + " cm" : "-";
        }
    })();

    //Determine button texts based on selection
    const rotateText =
        selectedDoorId !== null ? "Rotera dörr" : selectedContainerId !== null ? "Rotera kärl" : "Rotera";
    const removeText =
        selectedDoorId !== null ? "Ta bort dörr" : selectedContainerId !== null ? "Ta bort kärl" : "Ta bort";

    //Handle rotate action
    const handleRotate = () => {
        if (selectedDoorId !== null) {
            handleRotateDoor(selectedDoorId)
        } else if (selectedContainerId !== null) {
            handleRotateContainer(selectedContainerId);
        }
    }

    //Handle remove action
    const handleRemove = () => {
        if (selectedContainerId !== null) {
            handleRemoveContainer(selectedContainerId);
        } else if (selectedDoorId !== null) {
            handleRemoveDoor(selectedDoorId);
        }
    }

    /* ─────────────── Render ──────────────── */
    return (
        <div className="flex flex-col items-center gap-3 border border-gray-300 rounded-2xl bg-white shadow-sm px-3 py-2 w-fit max-w-full mx-auto">

            {/* Tooltip */}
            <div className="self-end">
                <InfoTooltip
                    text="Markera ett kärl eller en dörr i ritningen för att kunna rotera eller ta bort objektet.
                    För kärl kan du rotera 90° åt gången. Dörrar växlar mellan öppningsriktningar.
                    Du kan även se mer information om det valda kärlet."
                    panelWidthClass="w-72"
                />
            </div>

            {/* Selected item name */}
            {selectedName && (
                <div className="text-center font-semibold text-gray-800 text-base px-2 py-1 border-b border-gray-200 w-full">
                    {selectedName}
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-row lg:flex-col items-center justify-center gap-3 flex-wrap">

                {/* Information button - only for containers */}
                {selectedContainerId !== null && (
                    <button
                        onClick={() => handleShowContainerInfo(selectedContainerId)}
                        className="flex flex-col items-center justify-center text-gray-700 hover:text-blue-600 transition min-w-[80px] group"
                    >
                        <Info className="w-6 h-6" />
                        <span className="text-sm font-medium max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-6">
                            Information
                        </span>
                    </button>
                )}

                {/* Rotate button */}
                <button
                        onClick={handleRotate}
                        className="flex flex-col items-center justify-center text-gray-700 hover:text-blue-600 transition min-w-[80px] group"
                >
                    <RotateCcw className="w-6 h-6" />
                    <span className="text-sm font-small max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-6">
                        {rotateText}
                    </span>
                </button>

                {/* Remove button */}
                <button
                    onClick={handleRemove}
                    className="flex flex-col items-center justify-center text-red-600 hover:text-red-700 transition min-w-[80px] group"
                >
                    <Trash2 className="w-6 h-6" />
                    <span className="text-sm font-small max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-6">
                        {removeText}
                    </span>
                </button>
            </div>
        </div>
    );
}
