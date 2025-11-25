/**
 * useWasteComparison hook
 * Computes waste and frequency comparison stats for a property and its containers.
 */
import { useMemo } from "react";
import { buildDesignStats, mapWasteComparisons, mapFrequencyComparisons, buildCombinedRows } from "../utils/builders";
import { normalizeWasteTypeKey } from "../utils/utils";
import { WASTE_BENCHMARKS } from "../utils/constants";
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
    const designHasContainers = designStats.containerCount > 0;

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

    //Filter to only rows that exist in the design
    const designKeys = useMemo(() => new Set(
        containersInRoom.map(({ container }) =>
            normalizeWasteTypeKey(container.serviceTypeName ?? container.name ?? "Övrigt")
        )
    ), [containersInRoom]);

    const filteredRows = useMemo(
        () => combinedRows.filter(row => designKeys.has(normalizeWasteTypeKey(row.displayName))),
        [combinedRows, designKeys]
    );

    //Compute active benchmarks based on design
    const activeBenchmarks: BenchmarkDefinition[] = useMemo(() => {
        if (!designHasContainers) return [];

        const claimed = new Set<string>();
        const results: BenchmarkDefinition[] = [];

        //Add predefined benchmarks that exist in the design
        WASTE_BENCHMARKS.forEach(def => {
            const targets = [def.key, ...def.aliases].map(normalizeWasteTypeKey);
            if (targets.some(target => designKeys.has(target))) {
                results.push(def);
                targets.forEach(target => claimed.add(target));
            }
        });

        //Add any remaining container types that don't have predefined benchmarks
        Array.from(designStats.typeMap.values()).forEach(entry => {
            const normalizedKey = entry.key || normalizeWasteTypeKey(entry.displayName);
            if (!claimed.has(normalizedKey)) {
                results.push({
                    key: normalizedKey,
                    label: entry.displayName,
                    benchmark: 30,
                    aliases: [],
                });
                claimed.add(normalizedKey);
            }
        });

        return results;
    }, [designStats, designKeys, designHasContainers]);

    return {
        safeApartments,
        designStats,
        combinedRows: filteredRows,
        activeBenchmarks,
        designHasContainers,
    };
}
