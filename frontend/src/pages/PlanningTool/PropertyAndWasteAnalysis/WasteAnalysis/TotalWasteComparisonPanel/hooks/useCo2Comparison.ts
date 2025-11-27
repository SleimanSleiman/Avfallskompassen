/**
 * useCo2Comparison hook
 * Computes annual CO₂ savings per property based on container volumes and CO2 factors.
 */
import { useMemo } from "react";
import { CO2_SAVING_DEFINITIONS, WEEK_PER_YEAR } from "../../../utils/constants";
import { normalizeWasteTypeKey, formatNumber, formatCo2 } from "../../../utils/utils";
import type { CombinedRow, SummaryTone } from "../../../utils/types";

export function useCo2Comparison({
    designStats,
    combinedRows,
    safeApartments,
}: {
    designStats: any;
    combinedRows: CombinedRow[];
    safeApartments: number;
}) {
    //Determine if the design has containers
    const designHasContainers = designStats.containerCount > 0;

    //Build map of waste type to CO2 factor
    const co2FactorMap = useMemo(() => {
        const map = new Map<string, number>();
        CO2_SAVING_DEFINITIONS.forEach((def) => {
            const targets = [def.key, ...def.aliases].map(normalizeWasteTypeKey);
            targets.forEach(target => map.set(target, def.kgPerLiter));
        });
        return map;
    }, []);

    //Compute total CO2 savings and identify top contributing row
    const {
        total: totalCo2Savings,
        topRow: topCo2Row,
        topValue: topCo2Value,
    } = useMemo(() => {
        if (!designHasContainers) {
            return { total: 0, topRow: null as CombinedRow | null, topValue: 0 };
        }

        let total = 0;
        let topRow: CombinedRow | null = null;
        let topValue = 0;

        combinedRows.forEach((row) => {
            const liters = row.propertyAnnualVolume ?? null;
            if (liters == null || liters <= 0) {
                return;
            }

            const factor = co2FactorMap.get(normalizeWasteTypeKey(row.displayName)) ?? 0;
            if (factor <= 0) {
                return;
            }

            const saving = liters * factor;
            total += saving;

            if (saving > topValue) {
                topValue = saving;
                topRow = row;
            }
        });

        return { total, topRow, topValue };
    }, [designHasContainers, combinedRows, co2FactorMap]);

    //Determine if CO2 data is available
    const co2HasData = totalCo2Savings > 0;

    //Format CO2 card value for display
    const co2CardValue = co2HasData ? formatCo2(totalCo2Savings) : "—";

    //Determine summary tone
    const co2Tone: SummaryTone = !designHasContainers
        ? "negative"
        : co2HasData
        ? "positive"
        : "neutral";

    //Compute per apartment and per week values
    const co2PerApartment = co2HasData ? totalCo2Savings / safeApartments : null;
    const co2PerWeek = co2HasData ? totalCo2Savings / WEEK_PER_YEAR : null;

    //Format labels
    const co2PerApartmentLabel = co2PerApartment != null
        ? `${formatNumber(co2PerApartment, { maximumFractionDigits: 1 })} kg CO₂e`
        : "—";

    const co2PerWeekLabel = co2PerWeek != null
        ? `${formatNumber(co2PerWeek, { maximumFractionDigits: 1 })} kg CO₂e`
        : "—";

    const co2TopLabel = co2HasData && topCo2Row
        ? `${topCo2Row.displayName} (${formatNumber(topCo2Value, { maximumFractionDigits: 0 })} kg)`
        : "—";

    return {
        totalCo2Savings,
        topCo2Row,
        topCo2Value,
        co2HasData,
        co2CardValue,
        co2PerApartmentLabel,
        co2PerWeekLabel,
        co2TopLabel,
        co2Tone,
    };
}
