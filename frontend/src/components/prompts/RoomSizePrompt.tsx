import { useState } from "react";
import { MARGIN, SCALE, STAGE_WIDTH, STAGE_HEIGHT, MIN_WIDTH } from "../../pages/PlanningTool/lib/Constants";
import "../css/prompts.css";
import Prompt from "../Prompt";

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
    existingNames = [],
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
      return
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
    <Prompt
      title="Ange namn, längd och bredd på miljörummet"
      onCancel={onCancel}
      onConfirm={handleConfirm}
    >
      <input className="prompt-input" placeholder="Rummets namn" value={name} onChange={e => setName(e.target.value)} />
      <input className="prompt-input" type="number" placeholder="Längd (meter)" value={length} onChange={e => setLength(e.target.value)} />
      <input className="prompt-input" type="number" placeholder="Bredd (meter)" value={width} onChange={e => setWidth(e.target.value)} />

      {error && (
        <div className="prompt-error">
          <p className="prompt-error-text">{error}</p>
        </div>
      )}
    </Prompt>
  );
}
