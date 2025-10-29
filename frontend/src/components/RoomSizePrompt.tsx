import { useState } from "react";

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

  const handleConfirm = () => {
  const lengthNum = Number(length);
  const widthNum = Number(width);

  if (!(lengthNum >= 2.5) || !(widthNum >= 2.5)) {
    alert('Rummets längd och bredd måste vara större än 2.5 meter.');
    return;
  }
  if (lengthNum > 10) {
    alert('Runnets längd får inte överstiga 32 meter.');
    return;
  }
  if (widthNum > 13) {
    alert('Rummets bredd får inte överstiga 27 meter.');
    return;
  }

  onConfirm(lengthNum, widthNum);
};

  return (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-80">
      <h2 className="text-lg font-semibold mb-4"> Ange längden och bredden på miljörummet</h2>

      <div className="space-y-3">
        <input
          type="number"
          placeholder="Längd"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
        <input
          type="number"
          placeholder="Bredd"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
      </div>

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