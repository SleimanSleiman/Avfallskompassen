/**
 * ActionPanel component for managing bins and doors in the planning tool.
 * Displays the selected item and provides buttons to move, rotate, or remove it.
 */

import type { ContainerInRoom as Container, Door } from "./types";

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
            <div className="mb-2 text-sm font-semibold text-gray-700">{selectedName}</div>

            {/* Action buttons */}
            <div className="flex gap-4">

                {/* EmptyBtn button */}
                <button
                    className="flex-1 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                    onClick={() => {
                        // TODO: Implement move logic
                    }}
                >
                    EmptyBtn
                </button>

                {/* Rotate button */}
                <button
                    className="flex-1 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition"
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


                {/* Remove button */}
                <button
                    className="flex-1 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
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