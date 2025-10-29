/**
 * DoorSection components
 * Manages the UI for adding a new door.
 */
import { useState } from "react";
import DoorWidthPrompt from "../../../components/DoorWidthPrompt";
import type { Door } from "../Types";

/* ─────────────── Props ──────────────── */
type DoorSectionProps = {
    handleAddDoor: (door: { width: number }) => void;
};

export default function DoorSection({ handleAddDoor }: DoorSectionProps) {
    //State to control if the width prompt is visible
    const [isPromptOpen, setIsPromptOpen] = useState(false);

    //Called when the user confirms a width in the promopt
    const handleConfirm = (width: number) => {
        const success = handleAddDoor({ width });
        if (success) {
            setIsPromptOpen(false);
        }
    };

    /* ──────────────── Render ──────────────── */
    return (
        <div>
            {/* Button to open the door width prompt*/}
            <button
                className="w-full p-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                onClick={() => setIsPromptOpen(true)}
            >
                Lägg till ny dörr
            </button>

            {/* Show the width prompt when state is true */}
            {isPromptOpen && (
                <DoorWidthPrompt
                    onConfirm={handleConfirm}
                    onCancel={() => setIsPromptOpen(false)}
                />
            )}
        </div>
    );
}
