/**
 * ContainerVolumeSummary component
 * Displays total container volume with comparison to the average and trend information.
 */
import SummaryStat from "../../components/SummaryStat";
import TrendBadge from "../../../components/TrendBadge";
import '../../css/wasteComparison.css'

type ContainerVolumeSummaryProps = {
    totalVolumeLabel: string;
    containerAverageVolume: number | null;
    containerGapSummary: string;
    containerTrend: string;
    containerLabel: string;
    containerTone: "neutral" | "positive" | "negative";
};

export default function ContainerVolumeSummary({
    totalVolumeLabel,
    containerAverageVolume,
    containerGapSummary,
    containerTrend,
    containerLabel,
    containerTone,
}: ContainerVolumeSummaryProps) {
    return (
        <SummaryStat
            title="Total kärlvolym"
            value={totalVolumeLabel}
            tone={containerTone}
            size="compact"
            //Show trend badge indicating performance relative to benchmark
            badge={<TrendBadge trend={containerTrend} size="compact">{containerLabel}</TrendBadge>}
            //Show average and deviation details
            description={
                <div className="summary-grid">
                    <div className="summary-row">
                        <span>Snitt i gruppen</span>
                        <span className="summary-row-label">{containerAverageVolume ?? "—"} L</span>
                    </div>
                    <div className="summary-row">
                        <span>Avvikelse</span>
                        <span className="summary-row-label">{containerGapSummary}</span>
                    </div>
                </div>
            }
        />
    );
}
