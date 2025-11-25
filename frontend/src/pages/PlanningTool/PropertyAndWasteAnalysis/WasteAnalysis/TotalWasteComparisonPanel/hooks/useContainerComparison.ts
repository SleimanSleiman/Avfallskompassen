import { calculatePercentageDifference, getTrend, formatNumber, normalizeWasteTypeKey } from "../../../utils/utils";
import type { SummaryTone } from "../../../utils/types";

export function useContainerComparison({
    designStats,
    comparisonData,
}: {
    designStats: any;
    comparisonData: any;
}) {
    const designHasContainers = designStats.containerCount > 0;

    const containerComparison = comparisonData.containerSizeComparison ?? null;

    const containerAverageVolume = containerComparison?.averageVolume ?? null;

    const propertyVolumeValue = designHasContainers
        ? designStats.totalNominalVolume
        : containerComparison?.propertyTotalVolume ?? null;

    const containerDifference = calculatePercentageDifference(
        propertyVolumeValue,
        containerAverageVolume
    );

    const containerTrend = getTrend(containerDifference);

    const containerLabel = !designHasContainers && containerDifference == null
        ? "Ingen kärldata"
        : containerDifference == null
        ? "I nivå med snittet"
        : containerDifference <= -5
        ? "Mindre totalt kärlvolym"
        : containerDifference >= 5
        ? "Större totalt kärlvolym"
        : "I nivå med snittet";

    const containerGapAbsolute =
        propertyVolumeValue != null && containerAverageVolume != null
            ? propertyVolumeValue - containerAverageVolume
            : null;

    const containerTone: SummaryTone = containerDifference == null
        ? "neutral"
        : containerDifference <= -5
        ? "positive"
        : containerDifference >= 5
        ? "negative"
        : "neutral";


    const containerGapSummary =
        containerDifference != null || containerGapAbsolute != null
            ? `${formatNumber(containerGapAbsolute, { maximumFractionDigits: 0 })} L`
            : !designHasContainers
            ? "Lägg till kärl för att få rekommendation"
            : "—";

    const totalVolumeLabel =
        propertyVolumeValue != null
            ? `${formatNumber(propertyVolumeValue, { maximumFractionDigits: 0 })} L`
            : "—";

    const totalFrequencyAll = designHasContainers
        ? Array.from(designStats.typeMap.values()).reduce((sum, type) => sum + type.totalFrequency, 0)
        : 0;;

    const averageFrequencyAll =
        designHasContainers && designStats.containerCount > 0
            ? totalFrequencyAll / designStats.containerCount
            : null;

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
    };
}
