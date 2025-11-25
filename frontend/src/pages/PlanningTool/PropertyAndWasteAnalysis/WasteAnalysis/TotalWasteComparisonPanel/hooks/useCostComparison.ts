import { calculatePercentageDifference, getTrend, formatCurrencySigned, formatPercentageSigned } from "../../../utils/utils";
import type { PropertyComparison } from "../../../../../../lib/Comparison";
import type { SummaryTone, CombinedRow } from "../../../utils/types";

export function useCostComparison({
    designStats,
    comparisonData,
    safeApartments,
    combinedRows,
}: {
    designStats: any;
    comparisonData: PropertyComparison;
    safeApartments: number;
    combinedRows: CombinedRow[];
}) {
    const designHasContainers = designStats.containerCount > 0;

    const costComparison = comparisonData.costComparison ?? null;

    const costAverage = costComparison?.averageCost ?? null;

    const propertyCostValue = designHasContainers
        ? designStats.totalCost
        : costComparison?.propertyCost ?? null;

    const costDifference = calculatePercentageDifference(
        propertyCostValue,
        costAverage
    );

    const costTrend = getTrend(costDifference);

    const costPerApartment =
        propertyCostValue != null
        ? propertyCostValue / safeApartments
        : null;

    const costGapAbsolute =
        propertyCostValue != null && costAverage != null
        ? propertyCostValue - costAverage
        : null;

    const costTone: SummaryTone = costGapAbsolute == null
        ? "neutral"
        : costGapAbsolute <= 0
            ? "positive"
            : "negative";

    const costGapSummary =
        costDifference != null || costGapAbsolute != null
        ? `${formatPercentageSigned(costDifference)} (${formatCurrencySigned(
            costGapAbsolute
        )})`
        : "—";

    const dominantCostRow = combinedRows.reduce<CombinedRow | null>((current, row) => {
        if (row.costPercentage == null) {
          return current;
        }
        if (!current || (current.costPercentage ?? 0) < row.costPercentage) {
          return row;
        }
        return current;
    }, null);

    return {
        propertyCostValue,
        costAverage,
        costDifference,
        costTrend,
        costTone,
        costGapSummary,
        costPerApartment,
        dominantCostRow,
    };
}
