/**
 * useContainerComparison hook
 * Computes comparison data for total container volume and trend vs similar properties.
 */
import { calculatePercentageDifference, getTrend, formatNumber } from "../../../utils/utils";
import type { SummaryTone } from "../../../utils/types";
import type {buildDesignStats} from "../../../utils/builders.ts";
import type {PropertyComparison} from "../../../../../../lib/Comparison.ts";

export function useContainerComparison({
    designStats,
    comparisonData,
}: {
    designStats: ReturnType<typeof buildDesignStats>;
    comparisonData: PropertyComparison;
}) {
    //Check if design has containers
    const designHasContainers = designStats.containerCount > 0;

    //Get comparison data from backend
    const containerComparison = comparisonData.containerSizeComparison ?? null;

    //Average container volume across comparison group
    const containerAverageVolume = containerComparison?.averageVolume ?? null;

    //Property's total volume
    const propertyVolumeValue = designHasContainers
        ? designStats.totalNominalVolume
        : containerComparison?.propertyTotalVolume ?? null;

    //Percentage difference vs group average
    const containerDifference = calculatePercentageDifference(
        propertyVolumeValue,
        containerAverageVolume
    );

    //Trend (better/equal/worse) based on percentage difference
    const containerTrend = getTrend(containerDifference);

    //Human-readable label for the trend
    const containerLabel = !designHasContainers && containerDifference == null
        ? "Ingen kärldata"
        : containerDifference == null
        ? "I nivå med snittet"
        : containerDifference <= -5
        ? "Mindre totalt kärlvolym"
        : containerDifference >= 5
        ? "Större totalt kärlvolym"
        : "I nivå med snittet";

    //Absolute gap in volume (property vs average)
    const containerGapAbsolute =
        propertyVolumeValue != null && containerAverageVolume != null
            ? propertyVolumeValue - containerAverageVolume
            : null;

    //Tone for summary card
    const containerTone: SummaryTone = containerDifference == null
        ? "neutral"
        : containerDifference <= -5
        ? "positive"
        : containerDifference >= 5
        ? "negative"
        : "neutral";

    //Formatted summary for gap
    const containerGapSummary =
        containerDifference != null || containerGapAbsolute != null
            ? `${formatNumber(containerGapAbsolute, { maximumFractionDigits: 0 })} L`
            : !designHasContainers
            ? "Lägg till kärl för att få rekommendation"
            : "—";

    //Total volume label for display
    const totalVolumeLabel =
        propertyVolumeValue != null
            ? `${formatNumber(propertyVolumeValue, { maximumFractionDigits: 0 })} L`
            : "—";

    //Compute total frequency of all containers
    const totalFrequencyAll = designHasContainers
        ? Array.from(designStats.typeMap.values()).reduce((sum, type) => sum + type.totalFrequency, 0)
        : 0;

    //Average frequency across containers
    const averageFrequencyAll =
        designHasContainers && designStats.containerCount > 0
            ? totalFrequencyAll / designStats.containerCount
            : null;

    //Average frequency across comparison group
    const comparisonAverageFrequency = containerComparison?.averageCollectionFrequency ?? null;

    const frequencyDifference = calculatePercentageDifference(
        averageFrequencyAll,
        comparisonAverageFrequency
    );

    return {
        propertyVolumeValue,
        containerAverageVolume,
        containerDifference,
        containerTrend,
        containerLabel,
        containerGapSummary,
        containerTone,
        totalVolumeLabel,
        averageFrequencyAll,
        comparisonAverageFrequency,
        frequencyDifference,
    };
}
