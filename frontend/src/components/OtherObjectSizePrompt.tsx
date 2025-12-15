/**
* Pop-up window allowing the user to enter the name, length, and width of an object.
*/
import { useState } from "react";
import Prompt from "./Prompt";

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
    <Prompt
      title="Ange namn och mått till föremålet"
      onCancel={onCancel}
      onConfirm={handleConfirm}
      tooltipText="Här kan du lägga till andra föremål som tar upp plats i rummet och påverkar tillgänglig yta.
        Detta kan vara t.ex. ett skåp eller en brandsläckare. Föremålet kommer
        representeras som en enkel rektangel i ritningen."
    >
      <input className="prompt-input" placeholder="T.ex. skåp" value={name} onChange={e => setName(e.target.value)} />
      <input className="prompt-input" type="number" placeholder="Bredd (cm)" value={length} onChange={e => setLength(e.target.value)} />
      <input className="prompt-input" type="number" placeholder="Djup (cm)" value={width} onChange={e => setWidth(e.target.value)} />

      {error && (
        <div className="prompt-error">
          <p className="prompt-error-text">{error}</p>
        </div>
      )}
    </Prompt>
  );
}