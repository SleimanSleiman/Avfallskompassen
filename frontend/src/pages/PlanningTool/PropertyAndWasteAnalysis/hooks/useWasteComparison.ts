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
    const apartments =
        comparisonData?.numberOfApartments ??
        selectedProperty?.numberOfApartments ??
        0;

    const safeApartments = apartments > 0 ? apartments : 1;

    const designStats = useMemo(
        () => buildDesignStats(containersInRoom),
        [containersInRoom]
    );

    const wasteComparisonMap = useMemo(
        () => mapWasteComparisons(comparisonData),
        [comparisonData]
    );

    const frequencyComparisonMap = useMemo(
        () => mapFrequencyComparisons(comparisonData),
        [comparisonData]
    );

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
