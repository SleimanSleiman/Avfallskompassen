/**
 * DoorSection components
 * Manages the UI for adding a new door.
 */
import { useState } from "react";
import DoorWidthPrompt from "../../../components/DoorWidthPrompt";
import InfoTooltip from "../components/InfoTooltip";

/* ─────────────── Props ──────────────── */
type DoorSectionProps = {
    handleAddDoor: (door: { width: number }) => boolean;
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
        <div className="relative">
            {/* Button to open the door width prompt*/}
            <button
                className="w-full flex items-center justify-between p-3 pr-12 rounded border border-gray-200 bg-white text-nsr-teal hover:bg-gray-50 transition text-left"
                onClick={() => setIsPromptOpen(true)}
            >
                <span className="font-medium">Lägg till ny dörr</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            <InfoTooltip
                className="absolute right-3 top-1/2 -translate-y-1/2"
                text="Välj bredden på dörren i meter. Dörren placeras på ritningen så att du kan flytta den och justera öppningsriktning efter behov."
            />

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
