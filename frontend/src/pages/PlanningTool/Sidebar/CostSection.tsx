/**
 * CostSection component.
 * Displays the subscription costs of the room.
 */
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────── Cost Props ─────────────── */
type CostSectionProps = {
  showCosts: boolean;
  setShowCosts: (v: boolean) => void;
};

export default function CostSection({ showCosts, setShowCosts }: CostSectionProps) {

    /* ─────────────── Render ─────────────── */
    return (
        <div>
            {/* Toggle button */}
            <button
                className="w-full p-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                onClick={() => setShowCosts(!showCosts)}
            >
                Se abonnemangskostnader
            </button>

            {/* Content */}
            {/* TODO: Replace with actual cost details */}
            <AnimatePresence>
                {showCosts && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-2 border rounded bg-gray-50"
                    >
                        <p>Abonnemangskostnader kommer visas här.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}