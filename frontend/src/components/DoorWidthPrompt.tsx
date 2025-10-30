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

    //Standard width for a door is set as 120cm
    const [width, setWidth] = useState("1.20");
    const [error, setError] = useState<string | null>(null);

    //Function that runs when the user clicks the "Confirm" button
    const handleConfirm = () => {
        const widthNum = Number(width);

        if (widthNum < 0.5) {
            setError("Dörrens bredd måste vara minst 0.5 meter.");
            return;
        }

        if (widthNum > 2) {
            setError("Dörrens bredd får inte överstiga 2 meter.");
            return;
        }

        setError(null);
        onConfirm(widthNum);
    };

    /* ──────────────── Render ──────────────── */
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-2xl border shadow-soft p-6 w-80">
                <h2 className="text-lg font-black mb-4">Ange dörrens bredd</h2>

                <input
                    type="number"
                    step="0.01"
                    min={0.5}
                    max={3}
                    placeholder="Bredd (meter)"
                    value={width}
                    onChange={(e) => {
                        setWidth(e.target.value);
                        setError(null); // Clear error when user starts typing
                    }}
                    className="w-full border border-gray-300 rounded-xl2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-nsr-teal focus:border-nsr-teal"
                />

                {error && (
                    <div className="mt-3 p-3 rounded-xl2 bg-red-50 border border-red-200">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="inline-flex items-center justify-center rounded-xl2 px-4 py-2 font-medium bg-red-500 text-white shadow-soft hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                        Avbryt
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="inline-flex items-center justify-center rounded-xl2 px-4 py-2 font-medium bg-nsr-accent text-white shadow-soft hover:bg-nsr-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nsr-accent transition-colors"
                    >
                        Bekräfta
                    </button>
                </div>
            </div>
        </div>
    );
}
