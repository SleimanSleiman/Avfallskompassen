/**
 * ActionPanel component for managing bins and doors in the planning tool.
 * Displays the selected item and provides buttons to move, rotate, or remove it.
 */

import InfoTooltip from "./components/InfoTooltip";
import type { ContainerInRoom as Container, Door } from "./Types";

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
}: ActionPanelProps) {
    //Determine the name of the selected item
    const selectedName = (() => {
        if (selectedContainerId !== null) {
            const container = containers.find((c) => c.id === selectedContainerId);
            return container ? container.container.name : "Inget objekt valt";
        } else if (selectedDoorId !== null) {
            const door = doors.find((d) => d.id === selectedDoorId);
            return door ? "Dörr " + door.width*100 + "cm" : "Inget objekt valt";
        }

        return "Inget objekt valt";
    })();

    /* ─────────────── Render ──────────────── */
    return (
        <div className="mt-4 w-full max-w-md border border-gray-400 rounded p-3 bg-gray-50">

            {/* Display selected item name */}
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-gray-700">{selectedName}</div>
                <InfoTooltip
                    text="Markera ett kärl eller en dörr i ritningen för att kunna rotera eller ta bort objektet. För kärl kan du rotera 90° åt gången. Dörrar växlar mellan öppningsriktningar."
                    panelWidthClass="w-72"
                />
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">

                {/* EmptyBtn button */}
                <button
                    className="btn-secondary-sm flex-1"
                    onClick={() => {
                        // TODO: Implement move logic
                    }}
                >
                    EmptyBtn
                </button>

                {/* Rotate button (secondary small style) */}
                <button
                    className="btn-secondary-sm flex-1"
                    onClick={() => {
                        if (selectedDoorId !== null) {
                            const door = doors.find(d => d.id === selectedDoorId);
                            if (!door) return;

                            const newRotation = (door.rotation + 180) % 360;
                            const newSwing = door.swingDirection === "inward" ? "outward" : "inward";

                            handleRotateDoor(door.id, newRotation, newSwing);
                        }
                        else if (selectedContainerId !== null) {
                            handleRotateContainer(selectedContainerId);
                            console.log("ID " + selectedContainerId)
                        }
                    }}
                >
                  Rotera
                </button>

                {/* Remove button (red soft style, same size/radius) */}
                <button
                    className="inline-flex items-center justify-center rounded-xl2 px-3 py-1 text-sm font-medium border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 flex-1"
                    onClick={() => {
                        if (selectedContainerId !== null) {
                            handleRemoveContainer(selectedContainerId);
                        } else if (selectedDoorId !== null) {
                            handleRemoveDoor(selectedDoorId);
                        }
                    }}
                >
                    Ta bort
                </button>
            </div>
        </div>
    );
}