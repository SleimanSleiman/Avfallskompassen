import { useEffect } from "react";
import InfoTooltip from "../pages/PlanningTool/components/InfoTooltip";

interface PromptProps {
  title: string;
  children: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  tooltipText?: string;
}

export default function Prompt({
  title,
  children,
  onCancel,
  onConfirm,
  confirmLabel = "Bekräfta",
  cancelLabel = "Avbryt",
  tooltipText,
}: PromptProps) {

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                onConfirm();
            }

            if (e.key === "Escape") {
                e.preventDefault();
                onCancel();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onConfirm, onCancel]);

  return (
    <div className="prompt-overlay">
      <div className="prompt-box">
        {tooltipText && (
          <div className="prompt-tooltip">
            <InfoTooltip text={tooltipText} panelWidthClass="w-72" />
          </div>
        )}

        <h2 className="prompt-heading">{title}</h2>

        <div className="space-y-3">{children}</div>

        <div className="prompt-buttons">
          <button onClick={onCancel} className="prompt-button prompt-button-cancel">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="prompt-button prompt-button-confirm">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
