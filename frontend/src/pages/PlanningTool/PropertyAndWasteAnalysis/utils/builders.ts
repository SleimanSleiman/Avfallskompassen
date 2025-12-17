/**
 * Builders module
 * Functions to process container and comparison data into stats and table rows.
 */
import type { DesignStats, DesignTypeStats, CombinedRow, BenchmarkDefinition } from "./types";
import type { ContainerInRoom } from "../../Types";
import { normalizeWasteTypeKey, calculatePercentageDifference, computePerApartmentPerWeek, getTrend } from "./utils";
import { getContainerCost } from "../../Constants";

//Build design stats from containers in the room
export function buildDesignStats(containersInRoom: ContainerInRoom[]): DesignStats {
    const typeMap = new Map<string, DesignTypeStats>();
    let totalCost = 0;
    let totalNominalVolume = 0;
    let containerCount = 0;

    //Aggregate data for each container
    containersInRoom.forEach((c) => {
        const { container } = c;
        const serviceName = container.serviceTypeName ?? container.name ?? "Övrigt";
        const key = normalizeWasteTypeKey(serviceName);
        const annualVolume = (container.size ?? 0) * (container.emptyingFrequencyPerYear ?? 0);
        const nominalVolume = container.size ?? 0;
        const frequency = container.emptyingFrequencyPerYear ?? 0;
        const cost = getContainerCost(c);

        //Get existing stats for this type or initialize
        const current = typeMap.get(key) ?? {
            key,
            displayName: serviceName,
            totalAnnualVolume: 0,
            totalNominalVolume: 0,
            totalFrequency: 0,
            containerCount: 0,
            totalCost: 0,
        };

        //Update aggregated stats
        current.totalAnnualVolume += annualVolume;
        current.totalNominalVolume += nominalVolume;
        current.totalFrequency += frequency;
        current.containerCount += 1;
        current.totalCost += cost;
        current.displayName = serviceName;

        typeMap.set(key, current);

        totalCost += cost;
        totalNominalVolume += nominalVolume;
        containerCount += 1;
    });

    return { totalCost, totalNominalVolume, containerCount, typeMap };
}

//Map waste comparison data by normalized waste type key
export function mapWasteComparisons(comparisonData: PropertyComparison | null) {
    const map = new Map<string, WasteAmountComparison>();
    //Add each waste comparison to the map
    comparisonData?.wasteAmountComparisons?.forEach(item => {
        map.set(normalizeWasteTypeKey(item.wasteType), item);
    });
    return map;
}

//Map collection frequency data by normalized waste type key
export function mapFrequencyComparisons(comparisonData: PropertyComparison | null) {
    const map = new Map<string, CollectionFrequencyComparison>();
    //Add each frequency comparison to the map
    comparisonData?.frequencyComparisons?.forEach(item => {
        map.set(normalizeWasteTypeKey(item.wasteType), item);
    });
    return map;
}

//Find a combined row for a given benchmark definition
export function findRowForBenchmark(def: BenchmarkDefinition, rows: CombinedRow[]) {
    const targets = [def.key, ...def.aliases].map(normalizeWasteTypeKey);
    //Return first matching row or null
    return rows.find(row => targets.includes(normalizeWasteTypeKey(row.displayName))) ?? null;
}

//Build combined rows for rendering tables
export function buildCombinedRows({
    designStats,
    wasteComparisonMap,
    frequencyComparisonMap,
    safeApartments,
}: {
    designStats: DesignStats;
    wasteComparisonMap: Map<string, WasteAmountComparison>;
    frequencyComparisonMap: Map<string, CollectionFrequencyComparison>;
    safeApartments: number;
}): CombinedRow[] {
    const keys = new Set<string>();
    //Collect all unique keys from design, waste, and frequency
    designStats.typeMap.forEach((_, key) => keys.add(key));
    wasteComparisonMap.forEach((_, key) => keys.add(key));
    frequencyComparisonMap.forEach((_, key) => keys.add(key));

    return Array.from(keys).map((key) => {
        //Retrieve stats from design, waste, and frequency maps
        const design = designStats.typeMap.get(key) ?? null;
        const waste = wasteComparisonMap.get(key) ?? null;
        const frequency = frequencyComparisonMap.get(key) ?? null;

        //Determine display name and volumes
        const displayName = design?.displayName ?? waste?.wasteType ?? frequency?.wasteType ?? "Okänd avfallstyp";
        const propertyAnnualVolume = design?.totalAnnualVolume ?? waste?.propertyWasteAmount ?? null;
        const averageAnnualVolume = waste?.averageWasteAmount ?? null;
        const propertyPerWeek = computePerApartmentPerWeek(propertyAnnualVolume, safeApartments);
        const averagePerWeek = computePerApartmentPerWeek(averageAnnualVolume, safeApartments);
        const wasteDiff = calculatePercentageDifference(propertyAnnualVolume, averageAnnualVolume);

        //Compute frequency values and trends
        const propertyFrequency = design
            ? design.totalFrequency / (design.containerCount || 1)
            : frequency?.propertyFrequency ?? null;
        const averageFrequency = frequency?.averageFrequency ?? null;
        const frequencyDiff = calculatePercentageDifference(propertyFrequency, averageFrequency);
        const frequencyTrend = getTrend(frequencyDiff);

        //Compute container count and cost percentages
        const containerCount = design?.containerCount ?? null;
        const totalCostPerType = design?.totalCost ?? null;
        const costPercentage = totalCostPerType != null && designStats.totalCost > 0
            ? (totalCostPerType / designStats.totalCost) * 100
            : null;

        //Return row object
        return {
            key,
            displayName,
            propertyPerWeek,
            averagePerWeek,
            propertyAnnualVolume,
            containerCount,
            wasteDiff,
            propertyFrequency,
            averageFrequency,
            frequencyDiff,
            frequencyTrend,
            totalCost: totalCostPerType,
            costPercentage,
        } satisfies CombinedRow;
    }).sort((a, b) => a.displayName.localeCompare(b.displayName, "sv"));
}
