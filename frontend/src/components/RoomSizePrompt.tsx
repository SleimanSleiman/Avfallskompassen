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
  if (lengthNum > 32) {
    alert('Runnets längd får inte överstiga 32 meter.');
    return;
  }
  if (widthNum > 27) {
    alert('Rummets bredd får inte överstiga 27 meter.');
    return;
  }

  onConfirm(lengthNum, widthNum);
};

  return (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white rounded-2xl border shadow-soft p-6 w-80">
      <h2 className="text-lg font-black mb-4">Ange längden och bredden på miljörummet</h2>

      <div className="space-y-3">
        <input
          type="number"
          placeholder="Längd (meter)"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          className="w-full border border-gray-300 rounded-xl2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-nsr-teal focus:border-nsr-teal"
        />
        <input
          type="number"
          placeholder="Bredd (meter)"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          className="w-full border border-gray-300 rounded-xl2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-nsr-teal focus:border-nsr-teal"
        />
      </div>

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