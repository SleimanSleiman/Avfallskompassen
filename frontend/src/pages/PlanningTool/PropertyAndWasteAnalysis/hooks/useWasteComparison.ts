/**
 * useWasteComparison hook
 * Computes waste and frequency comparison stats for a property and its containers.
 */
import { useMemo } from "react";
import { buildDesignStats, mapWasteComparisons, mapFrequencyComparisons, buildCombinedRows } from "../utils/builders";
import type { PropertyComparison } from "../../../../lib/Comparison";
import type { Property } from "../../../../lib/Property";
import type { ContainerInRoom } from "../../Types";

export function useWasteComparison({
    comparisonData,
    selectedProperty,
    containersInRoom,
}: {
    comparisonData: PropertyComparison | null;
    selectedProperty: Property | null;
    containersInRoom: ContainerInRoom[];
}) {

    //Determine number of apartments, fallback to 0 if missing
    const apartments =
        comparisonData?.numberOfApartments ??
        selectedProperty?.numberOfApartments ??
        0;

    //Ensure at least 1 apartment to avoid division by zero
    const safeApartments = apartments > 0 ? apartments : 1;

    //Compute aggregated stats of containers in the room
    const designStats = useMemo(
        () => buildDesignStats(containersInRoom),
        [containersInRoom]
    );

    //Map waste amount comparisons by normalized waste type
    const wasteComparisonMap = useMemo(
        () => mapWasteComparisons(comparisonData),
        [comparisonData]
    );

    //Map collection frequency comparisons by normalized waste type
    const frequencyComparisonMap = useMemo(
        () => mapFrequencyComparisons(comparisonData),
        [comparisonData]
    );

    //Build combined rows for table rendering
    const combinedRows = useMemo(
        () =>
            buildCombinedRows({
                designStats,
                wasteComparisonMap,
                frequencyComparisonMap,
                safeApartments,
            }),
        [designStats, wasteComparisonMap, frequencyComparisonMap, safeApartments]
    );

    return {
        safeApartments,
        designStats,
        combinedRows,
    };
}
