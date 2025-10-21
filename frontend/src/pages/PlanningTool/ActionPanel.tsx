/**
 * ActionPanel component for managing bins and doors in the planning tool.
 * Displays the selected item and provides buttons to move, rotate, or remove it.
 */

import type { ContainerInRoom as Container, Door } from "../types";

/* ─────────────── ActionPanel Props ──────────────── */
type ActionPanelProps = {
    containers: Container[];
    doors: Door[];
    selectedContainerId: number | null;
    selectedDoorId: number | null;
    handleRemoveContainer: (id: number) => void;
    handleRemoveDoor: (id: number) => void;
};

export default function ActionPanel({
    containers,
    doors,
    selectedContainerId,
    selectedDoorId,
    handleRemoveContainer,
    handleRemoveDoor,
}: ActionPanelProps) {
    //Determine the name of the selected item
    const selectedName = (() => {
        if (selectedContainerId !== null) {
            const container = containers.find((c) => c.id === selectedContainerId);
            return container ? container.name : "Inget objekt valt";
        } else if (selectedDoorId !== null) {
            const door = doors.find((d) => d.id === selectedDoorId);
            return door ? door.name : "Inget objekt valt";
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

                {/* Move button */}
                <button
                    className="flex-1 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                    onClick={() => {
                        // TODO: Implement move logic
                    }}
                >
                    Flytta
                </button>

                {/* Rotate button */}
                <button
                    className="flex-1 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition"
                    onClick={() => {
                        // TODO: Implement rotate logic
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