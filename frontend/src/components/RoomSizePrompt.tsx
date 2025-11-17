import { useState } from "react";

interface RoomSizePromptProps {
  onConfirm: (name: string, length: number, width: number) => void;
  onCancel: () => void;
}

export default function RoomSizePrompt({
  onConfirm,
  onCancel,
}: RoomSizePromptProps) {
  const [name, setName] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
  const lengthNum = Number(length);
  const widthNum = Number(width);

  if (!(lengthNum >= 2.5) || !(widthNum >= 2.5)) {
    setError('Rummets längd och bredd måste vara minst 2.5 meter.');
    return;
  }
  if (lengthNum > 9) {
    setError('Rummets längd får inte överstiga 9 meter.');
    return;
  }
  if (widthNum > 12) {
    setError('Rummets bredd får inte överstiga 12 meter.');
    return;
  }

  setError(null);
  onConfirm(name, lengthNum, widthNum);
};

  return (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white rounded-2xl border shadow-soft p-6 w-80">
      <h2 className="text-lg font-black mb-4">Ange namnet, längden och bredden på miljörummet</h2>

      <div className="space-y-3">
        <input
            type="text"
            placeholder="Rummets namn"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            className="w-full border border-gray-300 rounded-xl2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-nsr-teal focus:border-nsr-teal"
          />
        <input
          type="number"
          placeholder="Längd (meter)"
          value={length}
          onChange={(e) => {
            setLength(e.target.value);
            setError(null); 
          }}
          className="w-full border border-gray-300 rounded-xl2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-nsr-teal focus:border-nsr-teal"
        />
        <input
          type="number"
          placeholder="Bredd (meter)"
          value={width}
          onChange={(e) => {
            setWidth(e.target.value);
            setError(null); 
          }}
          className="w-full border border-gray-300 rounded-xl2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-nsr-teal focus:border-nsr-teal"
        />
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