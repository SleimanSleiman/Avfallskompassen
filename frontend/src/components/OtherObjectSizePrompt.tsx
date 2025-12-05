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
    maxLength = 500,
    maxWidth = 500,
    minValue = 30,
}: OtherObjectSizePromptProps) {
    const [name, setName] = useState("");
    const [length, setLength] = useState("");
    const [width, setWidth] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = () => {
        const lengthNum = Number(length);
        const widthNum = Number(width);

        if (name.trim() === "") {
            setError("Ange ett namn för objektet.");
            return;
        }

        if (Number.isNaN(lengthNum) || Number.isNaN(widthNum)) {
            setError("Ange giltiga numeriska värden för djup och bredd.");
            return;
        }

        if (!(lengthNum >= minValue) || !(widthNum >= minValue)) {
            setError(`Objektets djup och bredd måste vara minst ${minValue} cm.`);
            return;
        }

        if (lengthNum > maxLength) {
            setError(`Objektets djup får inte överstiga ${maxLength} cm.`);
            return;
        }

        if (widthNum > maxWidth) {
            setError(`Objektets bredd får inte överstiga ${maxWidth} cm.`);
            return;
        }

        setError(null);
        onConfirm(name, lengthNum, widthNum);
    };

    return (
        <div className="prompt-overlay">
            <div className="prompt-box">
                <h2 className="prompt-heading">Här kan du lägga till övriga objekt som finns i rummet. Detta kan vara föremål som tar upp permanent
                 plats i miljörummet, t.ex. skåp, rör, brandsläckare etc.</h2>

                <input
                    type="text"
                    placeholder="T.ex. skåp, brandsläckare etc."
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setError(null);
                    }}
                    className="prompt-input"
                />
                <input
                    type="number"
                    placeholder="Bredd (cm)"
                    value={length}
                    onChange={(e) => {
                        setLength(e.target.value);
                        setError(null);
                    }}
                    className="prompt-input"
                />
                <input
                    type="number"
                    placeholder="Djup (cm)"
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
