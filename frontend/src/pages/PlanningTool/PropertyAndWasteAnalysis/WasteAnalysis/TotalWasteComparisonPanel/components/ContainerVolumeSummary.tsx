import SummaryStat from "../../components/SummaryStat";
import TrendBadge from "../../../components/TrendBadge";

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
            description={(
                <div className="grid gap-1.5 text-[12px] leading-snug text-gray-500">
                    <div className="flex items-center justify-between gap-2">
                        <span>Snitt i gruppen</span>
                        <span className="font-semibold text-gray-900">{containerAverageVolume ?? "—"} L</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <span>Avvikelse</span>
                        <span className="font-semibold text-gray-900">{containerGapSummary}</span>
                    </div>
                </div>
            )}
        />
    );
}
