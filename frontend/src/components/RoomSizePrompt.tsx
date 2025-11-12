import { useState } from "react";
import { MARGIN, SCALE, STAGE_WIDTH, STAGE_HEIGHT, MIN_WIDTH } from "../pages/PlanningTool/Constants";

interface RoomSizePromptProps {
  onConfirm: (length: number, width: number) => void;
  onCancel: () => void;
}

export default function RoomSizePrompt({
  onConfirm,
  onCancel,
}: RoomSizePromptProps) {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [error, setError] = useState<string | null>(null);

  const maxLength = Number(((STAGE_HEIGHT - 2 * MARGIN) * SCALE).toFixed(2));
  const maxWidth = Number(((STAGE_WIDTH - 2 * MARGIN) * SCALE).toFixed(2));
  const minValue = Number((MIN_WIDTH * SCALE).toFixed(2));

  const handleConfirm = () => {
    const lengthNum = Number(length);
    const widthNum = Number(width);

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
    onConfirm(lengthNum, widthNum);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl border shadow-soft p-6 w-80">
        <h2 className="text-lg font-black mb-3">Ange längden och bredden på miljörummet</h2>
        <p className="text-sm text-gray-600 mb-4">
          Maxmått: Längd {maxLength.toLocaleString("sv-SE")} m · Bredd {maxWidth.toLocaleString("sv-SE")} m
        </p>

        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            <span>Längd (m)</span>
            <input
              type="number"
              value={length}
              onChange={(event) => {
                setLength(event.target.value);
                setError(null);
              }}
              className="w-full border border-gray-300 rounded-xl2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-nsr-teal focus:border-nsr-teal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            <span>Bredd (m)</span>
            <input
              type="number"
              value={width}
              onChange={(event) => {
                setWidth(event.target.value);
                setError(null);
              }}
              className="w-full border border-gray-300 rounded-xl2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-nsr-teal focus:border-nsr-teal"
            />
          </label>
        </div>

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
            className="inline-flex items-center justify-center rounded-xl2 px-4 py-2 font-medium bg-nsr-accent text-[#121212] shadow-soft hover:bg-nsr-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nsr-accent transition-colors"
          >
            Bekräfta
          </button>
        </div>
      </div>
    </div>
  );
}