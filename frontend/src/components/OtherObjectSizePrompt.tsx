/**
 * Pop-up window allowing the user to enter the name, length, and width of an object.
 */
import "./css/prompts.css";
import { useState } from "react";

interface OtherObjectSizePromptProps {
    onConfirm: (name: string, length: number, width: number) => void;
    onCancel: () => void;
    maxLength?: number;
    maxWidth?: number;
    minValue?: number;
}

export default function OtherObjectSizePrompt({
    onConfirm,
    onCancel,
    maxLength = 10000,
    maxWidth = 10000,
    minValue = 500,
}: OtherObjectSizePromptProps) {
    const [name, setName] = useState("");
    const [length, setLength] = useState("");
    const [width, setWidth] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = () => {
        const lengthNum = Number(length);
        const widthNum = Number(width);

        if (Number.isNaN(lengthNum) || Number.isNaN(widthNum)) {
            setError("Ange giltiga numeriska värden för längd och bredd.");
            return;
        }

        if (!(lengthNum >= minValue) || !(widthNum >= minValue)) {
            setError(`Objektets längd och bredd måste vara minst ${minValue} mm.`);
            return;
        }

        if (lengthNum > maxLength) {
            setError(`Objektets längd får inte överstiga ${maxLength} mm.`);
            return;
        }

        if (widthNum > maxWidth) {
            setError(`Objektets bredd får inte överstiga ${maxWidth} mm.`);
            return;
        }

        setError(null);
        onConfirm(name, lengthNum, widthNum);
    };

    return (
        <div className="prompt-overlay">
            <div className="prompt-box">
                <h2 className="prompt-heading">Ange namn, längd och bredd på objektet</h2>

                <input
                    type="text"
                    placeholder="Objektets namn"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setError(null);
                    }}
                    className="prompt-input"
                />
                <input
                    type="number"
                    placeholder="Längd (mm)"
                    value={length}
                    onChange={(e) => {
                        setLength(e.target.value);
                        setError(null);
                    }}
                    className="prompt-input"
                />
                <input
                    type="number"
                    placeholder="Bredd (mm)"
                    value={width}
                    onChange={(e) => {
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

                <div className="prompt-buttons">
                    <button onClick={onCancel} className="prompt-button prompt-button-cancel">
                        Avbryt
                    </button>
                    <button onClick={handleConfirm} className="prompt-button prompt-button-confirm">
                        Bekräfta
                    </button>
                </div>
            </div>
        </div>
    );
}
