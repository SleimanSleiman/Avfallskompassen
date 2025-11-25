import SummaryStat from "../../components/SummaryStat";
import { formatNumber, formatPercentage } from "../../../utils/utils";
import type { CombinedRow } from "../../../utils/types";
import '../../css/wasteComparison.css'

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
    const description = designHasContainers ? (
        <div className="summary-grid">
            <div className="summary-row">
                <span>Fraktioner</span>
                <span className="summary-row-label">{typeMapSize}</span>
            </div>
            {averageFrequencyAll != null && (
                <div className="summary-row">
                    <span>Genomsnittlig tömning</span>
                    <span className="summary-row-label">{formatNumber(averageFrequencyAll, { maximumFractionDigits: 1 })} ggr/år</span>
                </div>
            )}
            {dominantCostRow && dominantCostRow.costPercentage != null && (
                <div className="summary-row">
                    <span>Största kostnad</span>
                    <span className="summary-row-label">{dominantCostRow.displayName} ({formatPercentage(dominantCostRow.costPercentage)})</span>
                </div>
            )}
        </div>
    ) : (
        <div className="summary-empty">
            Lägg till kärl i ritningen för att se hur kostnaderna fördelas mellan fraktioner.
        </div>
    );

    return (
        <SummaryStat
            title="Kärlöversikt"
            value={designHasContainers ? `${containerCount} kärl` : "Inga kärl"}
            tone={designHasContainers ? "neutral" : "negative"}
            size="compact"
            description={description}
        />
    );
}