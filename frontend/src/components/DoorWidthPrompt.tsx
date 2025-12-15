/**
 * Pop-up window allowing the user to enter the width of a door.
 */
import { useState } from "react";
import "./css/prompts.css";
import Prompt from "./Prompt";

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
      <Prompt
        title="Ange dörrens bredd"
        onCancel={onCancel}
        onConfirm={handleConfirm}
      >
        <input
          type="number"
          step="0.01"
          min={0.5}
          max={3}
          value={width}
          onChange={e => {
            setWidth(e.target.value);
            setError(null);
          }}
          className="prompt-input"
        />

        {error && (
          <div className="prompt-error">
            <p className="prompt-error-text">{error}</p>
          </div>
        )}
      </Prompt>
    );
}
