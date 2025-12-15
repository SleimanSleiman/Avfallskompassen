import { useState } from "react";
import { MARGIN, SCALE, STAGE_WIDTH, STAGE_HEIGHT, MIN_WIDTH } from "../pages/PlanningTool/Constants";

interface RoomSizePromptProps {
  onConfirm: (name: string, length: number, width: number) => void;
  onCancel: () => void;
  initialName?: string;
  initialLength?: number;
  initialWidth?: number;
  existingNames?: string[];
}

export default function RoomSizePrompt({ 
  onConfirm, 
  onCancel, 
  initialName = "", 
  initialLength, 
  initialWidth,
  existingNames = []
}: RoomSizePromptProps) {
  const [name, setName] = useState(initialName);
  const [length, setLength] = useState(initialLength ? String(initialLength) : "");
  const [width, setWidth] = useState(initialWidth ? String(initialWidth) : "");
  const [error, setError] = useState<string | null>(null);

  // Display limits based on stage size and scale
  const maxLength = Number(((STAGE_HEIGHT - 2 * MARGIN) * SCALE).toFixed(2));
  const maxWidth = Number(((STAGE_WIDTH - 2 * MARGIN) * SCALE).toFixed(2));
  const minValue = Number((MIN_WIDTH * SCALE).toFixed(2));

  const handleConfirm = () => {
    // Use initial values if fields are empty
    const finalName = name.trim() === "" ? initialName : name.trim();
    const lengthNum = length === "" && initialLength ? initialLength : Number(length);
    const widthNum = width === "" && initialWidth ? initialWidth : Number(width);

    if (!finalName) {
        setError("Ange ett namn för rummet.");
        return;
    }

    // Check uniqueness (case insensitive), but allow if it's the same name (editing)
    if (existingNames.some(n => n.toLowerCase() === finalName.toLowerCase() && n.toLowerCase() !== initialName.toLowerCase())) {
        setError("Ett rum med detta namn finns redan.");
        return;
    }

    if (Number.isNaN(lengthNum) || Number.isNaN(widthNum)) {  
      setError("Ange giltiga numeriska värden för längd och bredd.");
      return;
    }

    if (!(lengthNum >= minValue) || !(widthNum >= minValue)) {
      setError(`Rummets längd och bredd måste vara minst ${minValue} meter.`);
      return;
    }
    if (lengthNum > maxLength) {
      setError(`Rummets längd får inte överstiga ${maxLength} meter.`);
      return;
    }
    if (widthNum > maxWidth) {
      setError(`Rummets bredd får inte överstiga ${maxWidth} meter.`);
      return;
    }

    setError(null);
    onConfirm(finalName, lengthNum, widthNum);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl border shadow-soft p-6 w-80">
        <h2 className="text-lg font-black mb-4">Ange namn, längd och bredd på miljörummet</h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Rummets namn"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-nsr-teal focus:border-nsr-teal"
          />
          <input
            type="number"
            placeholder="Längd (meter)"
            value={length}
            onChange={(e) => {
              setLength(e.target.value);
              setError(null);
            }}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-nsr-teal focus:border-nsr-teal"
          />
          <input
            type="number"
            placeholder="Bredd (meter)"
            value={width}
            onChange={(e) => {
              setWidth(e.target.value);
              setError(null);
            }}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-nsr-teal focus:border-nsr-teal"
          />
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={handleConfirm}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium bg-nsr-accent text-[#121212] hover:bg-nsr-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nsr-accent transition-colors"
          >
            Bekräfta
          </button>
        </div>
      </div>
    </div>
  );
}