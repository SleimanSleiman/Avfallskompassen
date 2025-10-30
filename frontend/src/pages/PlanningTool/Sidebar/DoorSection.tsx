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
                className="w-full flex items-center justify-between p-3 rounded border border-gray-200 bg-white text-nsr-teal hover:bg-gray-50 transition text-left"
                onClick={() => setIsPromptOpen(true)}
            >
                <span className="font-medium">Lägg till ny dörr</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
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
