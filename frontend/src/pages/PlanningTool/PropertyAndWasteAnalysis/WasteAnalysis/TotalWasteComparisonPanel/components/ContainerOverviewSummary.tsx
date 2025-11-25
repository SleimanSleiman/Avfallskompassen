import SummaryStat from "../../components/SummaryStat";
import { formatNumber, formatPercentage } from "../../../utils/utils";
import type { CombinedRow } from "../../../utils/types";

type ContainerOverviewSummaryProps = {
    designHasContainers: boolean;
    containerCount: number;
    typeMapSize: number;
    averageFrequencyAll: number | null;
    dominantCostRow: CombinedRow | null;
};

export default function ContainerOverviewSummary({
    designHasContainers,
    containerCount,
    typeMapSize,
    averageFrequencyAll,
    dominantCostRow,
}: ContainerOverviewSummaryProps) {
    const containerStatsDescription = designHasContainers ? (
        <div className="grid gap-1.5 text-[12px] leading-snug text-gray-500">
            <div className="flex items-center justify-between gap-2">
                <span>Fraktioner</span>
                <span className="font-semibold text-gray-900">{typeMapSize}</span>
            </div>
            {averageFrequencyAll != null && (
                <div className="flex items-center justify-between gap-2">
                    <span>Genomsnittlig tömning</span>
                    <span className="font-semibold text-gray-900">{formatNumber(averageFrequencyAll, { maximumFractionDigits: 1 })} ggr/år</span>
                </div>
            )}
            {dominantCostRow && dominantCostRow.costPercentage != null && (
                <div className="flex items-center justify-between gap-2">
                    <span>Största kostnad</span>
                    <span className="font-semibold text-gray-900">{dominantCostRow.displayName} ({formatPercentage(dominantCostRow.costPercentage)})</span>
                </div>
            )}
        </div>
    ) : (
        <div className="text-[12px] leading-snug text-gray-500">
            Lägg till kärl i ritningen för att se hur kostnaderna fördelas mellan fraktioner.
        </div>
    );

    return (
        <SummaryStat
            title="Kärlöversikt"
            value={designHasContainers ? `${containerCount} kärl` : "Inga kärl"}
            tone={designHasContainers ? "neutral" : "negative"}
            size="compact"
            description={containerStatsDescription}
        />
    );
}
