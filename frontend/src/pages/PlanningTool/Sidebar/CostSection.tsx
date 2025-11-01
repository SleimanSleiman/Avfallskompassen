/**
 * CostSection component.
 * Displays the subscription costs of the room.
 */
import { motion, AnimatePresence } from "framer-motion";
import InfoTooltip from "../components/InfoTooltip";

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
            <div className="relative">
                <button
                    className="w-full flex items-center justify-between p-3 pr-12 rounded border border-gray-200 bg-white text-nsr-teal hover:bg-gray-50 transition text-left"
                    onClick={() => setShowCosts(!showCosts)}
                >
                    <span className="font-medium">Se abonnemangskostnader</span>
                    <svg 
                        className={`w-5 h-5 transition-transform ${showCosts ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <InfoTooltip
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    panelWidthClass="w-64"
                    text="Visa en översikt över abonnemangs- och hanteringskostnaderna för de kärl som ligger i ritningen."
                />
            </div>

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