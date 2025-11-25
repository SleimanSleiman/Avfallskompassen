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
            badge={<TrendBadge trend={containerTrend} size="compact">{containerLabel}</TrendBadge>}
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
