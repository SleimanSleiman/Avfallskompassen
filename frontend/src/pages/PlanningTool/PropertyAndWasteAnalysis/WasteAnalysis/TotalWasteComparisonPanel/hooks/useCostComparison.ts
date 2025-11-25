/**
 * useCostComparison hook
 * Computes cost-related metrics and trend for a property vs comparison group.
 */
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
    //Check if design has containers
    const designHasContainers = designStats.containerCount > 0;

    //Get cost comparison from backend
    const costComparison = comparisonData.costComparison ?? null;

    //Average cost in the comparison group
    const costAverage = costComparison?.averageCost ?? null;

    //Property's total cost
    const propertyCostValue = designHasContainers
        ? designStats.totalCost
        : costComparison?.propertyCost ?? null;

    //Percentage difference vs average
    const costDifference = calculatePercentageDifference(
        propertyCostValue,
        costAverage
    );

    //Trend based on difference
    const costTrend = getTrend(costDifference);

    //Cost per apartment
    const costPerApartment =
        propertyCostValue != null
        ? propertyCostValue / safeApartments
        : null;

    //Absolute difference vs average
    const costGapAbsolute =
        propertyCostValue != null && costAverage != null
        ? propertyCostValue - costAverage
        : null;

    //Tone for summary card
    const costTone: SummaryTone = costGapAbsolute == null
        ? "neutral"
        : costGapAbsolute <= 0
            ? "positive"
            : "negative";

    //Formatted summary showing signed difference and currency
    const costGapSummary =
        costDifference != null || costGapAbsolute != null
        ? `${formatPercentageSigned(costDifference)} (${formatCurrencySigned(
            costGapAbsolute
        )})`
        : "—";

    //Find the row with the largest cost percentage
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
