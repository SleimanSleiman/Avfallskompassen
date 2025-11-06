/**
 * ActionPanel component for managing bins and doors in the planning tool.
 * Displays the selected item and provides buttons to move, rotate, remove,
 * and now also Undo/Redo container actions.
 */

import { useEffect } from "react";
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
  handleRotateDoor: (
    id: number,
    newRotation: number,
    newSwing: "inward" | "outward"
  ) => void;
  handleRotateContainer: (id: number) => void;
  undo: () => void; // 🆕 Added Undo
  redo: () => void; // 🆕 Added Redo
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
  undo,
  redo,
}: ActionPanelProps) {
  /* ─────────────── Determine selected item name ─────────────── */
  const selectedName = (() => {
    if (selectedContainerId !== null) {
      const container = containers.find((c) => c.id === selectedContainerId);
      return container ? container.container.name : "Inget objekt valt";
    } else if (selectedDoorId !== null) {
      const door = doors.find((d) => d.id === selectedDoorId);
      return door ? "Dörr " + door.width * 100 + "cm" : "Inget objekt valt";
    }
    return "Inget objekt valt";
  })();

  /* ─────────────── Keyboard shortcuts (Ctrl+Z / Ctrl+Y) ─────────────── */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlOrCmd && event.key === "z") {
        event.preventDefault();
        undo();
      }
      if (ctrlOrCmd && (event.key === "y" || (event.shiftKey && event.key === "z"))) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  /* ─────────────── Render ─────────────── */
  return (
    <div className="mt-4 w-full max-w-md border border-gray-400 rounded p-3 bg-gray-50">
      {/* Header + tooltip */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-gray-700">{selectedName}</div>
        <InfoTooltip
          text="Markera ett kärl eller en dörr i ritningen för att kunna rotera, ta bort eller ångra/göra om objektet. För kärl kan du rotera 90° åt gången. Dörrar växlar mellan öppningsriktningar."
          panelWidthClass="w-80"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Undo / Redo */}
        <button
          className="btn-secondary-sm flex-1"
          onClick={undo}
          title="Ångra (Ctrl+Z)"
        >
          ⟲ Ångra
        </button>
        <button
          className="btn-secondary-sm flex-1"
          onClick={redo}
          title="Gör om (Ctrl+Y)"
        >
          ⟳ Gör om
        </button>

        {/* Rotate */}
        <button
          className="btn-secondary-sm flex-1"
          onClick={() => {
            if (selectedDoorId !== null) {
              const door = doors.find((d) => d.id === selectedDoorId);
              if (!door) return;

              const newRotation = (door.rotation + 180) % 360;
              const newSwing =
                door.swingDirection === "inward" ? "outward" : "inward";

              handleRotateDoor(door.id, newRotation, newSwing);
            } else if (selectedContainerId !== null) {
              handleRotateContainer(selectedContainerId);
              console.log("ID " + selectedContainerId);
            }
          }}
        >
          Rotera
        </button>

        {/* Remove */}
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
