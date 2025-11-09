/**
 * Sidebar component for the Planning Tool page.
 * Contains sections for doors, containers, and cost estimation.
 * Handles state and actions related to these sections.
 */
import CostSection from "./CostSection";
import type { PropertyComparison } from "../../../lib/Comparison";
import type { Property } from "../../../lib/Property";
import type { ContainerInRoom } from "../Types";

/* ─────────────── Sidebar Props ─────────────── */
type SidebarProps = {
    //Comparison data
    comparisonData: PropertyComparison | null;
    comparisonLoading: boolean;
    comparisonError: string | null;
    selectedProperty: Property | null;
    containersInRoom: ContainerInRoom[];
};

export default function Sidebar({
    comparisonData,
    comparisonLoading,
    comparisonError,
    selectedProperty,
    containersInRoom,
}: SidebarProps ) {

    /* ─────────────── Render ─────────────── */
    return (
        <div className="pl-0 lg:pl-0 flex flex-col min-w-0">
            <div className="flex flex-col gap-4">

                {/* ---------- Lower box: Costs ---------- */}
                <div className="flex flex-col border rounded-2xl bg-white px-3 py-3 sm:p-4 transition-all duration-300 min-w-0">
                    <CostSection
                        comparisonData={comparisonData}
                        comparisonLoading={comparisonLoading}
                        comparisonError={comparisonError}
                        selectedProperty={selectedProperty}
                        containersInRoom={containersInRoom}
                    />
                </div>
            </div>
        </div>
    );
}
