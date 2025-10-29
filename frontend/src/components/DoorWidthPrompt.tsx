/**
 * Pop-up window allowing the user to enter the width of a door.
 */
import { useState } from "react";

/* ─────────────── Props ──────────────── */
interface DoorWidthPromptProps {
    onConfirm: (width: number) => void;
    onCancel: () => void;
}

export default function DoorWidthPrompt({
        onConfirm,
        onCancel
}: DoorWidthPromptProps) {

    //Standard width for a door is set as 90cm
    const [width, setWidth] = useState("1.20");

    //Function that runs when the user clicks the "Confirm" button
    const handleConfirm = () => {
        const widthNum = Number(width);

        if (widthNum < 0.5) {
            alert("Dörrens bredd måste vara minst 0.5 meter.");
            return;
        }

        if (widthNum > 2) {
            alert("Dörrens bredd får inte överstiga 2 meter.");
            return;
        }

        onConfirm(widthNum);
    };

    /* ──────────────── Render ──────────────── */
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                <h2 className="text-lg font-semibold mb-4">Ange dörrens bredd (i meter)</h2>

                <input
                    type="number"
                    step="0.01"
                    min={0.5}
                    max={3}
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-300"
                />

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="rounded bg-gray-200 text-gray-800 px-3 py-1 hover:bg-gray-300"
                    >
                        Avbryt
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="rounded bg-green-500 text-white px-3 py-1 hover:bg-green-600"
                    >
                        Bekräfta
                    </button>
                </div>
            </div>
        </div>
    );
}
