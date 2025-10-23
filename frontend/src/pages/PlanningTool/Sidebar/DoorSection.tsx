/**
 * DoorSection component.
 * Allows users to add doors to the room layout.
 * Shows a collapsible list of door types when the button is clicked.
 */
import { motion, AnimatePresence } from "framer-motion";
import type { Door } from "../types";
import type { DoorTemplate } from "../types";

/* ─────────────── Door Props ─────────────── */
type DoorSectionProps = {
    /** Whether the door list is currently expanded */
    isAddDoorOpen: boolean;
    /** Toggles visibility of the door list */
    setIsAddDoorOpen: (v: boolean) => void;
    /** Callback to add a door of a specific type */
    handleAddDoor: (doorTypes: Omit<Door, "id" | "x" | "y" | "rotation">) => void;
};

/* ─────────────── Component ─────────────── */
export default function DoorSection({
    isAddDoorOpen,
    setIsAddDoorOpen,
    handleAddDoor,
}: DoorSectionProps) {

//Predefined door types
const doorTypes: DoorTemplate[] = [
    { id: 1, name: "Standarddörr", width: 24, height: 10 },
    { id: 2, name: "Dubbel dörr", width: 48, height: 10 },
];

    /* ─────────────── Render ─────────────── */
    return (
        <div>

        {/* Main toggle button to show/hide door list */}
        <button
            className="w-full p-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={() => setIsAddDoorOpen(!isAddDoorOpen)}
        >
            Lägg till ny dörr
        </button>

        {/* Animated collapsible door type list */}
        <AnimatePresence>
            {isAddDoorOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 pl-4 space-y-2"
                >
                    {doorTypes.map((doorType) => (
                        <button
                            key={doorType.id}
                            onClick={() => handleAddDoor(doorType)}
                            className="w-full text-left p-2 border rounded bg-white hover:bg-blue-50 transition"
                        >
                            {doorType.name}
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
