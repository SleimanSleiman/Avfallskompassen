/**
 * CostSection component.
 * Displays the subscription costs of the room.
 */
import { motion, AnimatePresence } from "framer-motion";
import InfoTooltip from "../components/InfoTooltip";

/* ─────────────── Cost Props ─────────────── */
type CostSectionProps = {
};

export default function CostSection({  }: CostSectionProps) {

    /* ─────────────── Render ─────────────── */
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black text-nsr-teal">
                    Kostnader och jämförelse
                </h2>
                <InfoTooltip
                    text="Här visas en översikt över hanteringskostnaderna för de kärl som ligger i ritningen, samt en jämförelse med andra fastigheters miljörum."
                />
            </div>

            <p>Innehåll för kostnadssektionen kommer här.</p>
        </div>
    );
}
