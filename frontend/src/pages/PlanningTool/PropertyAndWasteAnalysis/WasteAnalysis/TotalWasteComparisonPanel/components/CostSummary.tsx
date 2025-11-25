import SummaryStat from "../../components/SummaryStat";
import TrendBadge from "../../../components/TrendBadge";
import { formatCurrency } from "../../../utils/utils";
import { TREND_CONFIG } from "../../../utils/constants";

type CostSummaryProps = {
    propertyCostValue: number | null;
    costAverage: number | null;
    costPerApartment: number | null;
    costGapSummary: string;
    costTrend: string;
    costTone: "neutral" | "positive" | "negative";
};

export default function CostSummary({
    propertyCostValue,
    costAverage,
    costPerApartment,
    costGapSummary,
    costTrend,
    costTone,
}: CostSummaryProps) {
    return (
        <SummaryStat
            title="Årlig kostnad"
            value={formatCurrency(propertyCostValue)}
            tone={costTone}
            size="compact"
            badge={<TrendBadge trend={costTrend} size="compact">{TREND_CONFIG[costTrend].label}</TrendBadge>}
            description={(
                <div className="grid gap-1.5 text-[12px] leading-snug text-gray-500">
                    <div className="flex items-center justify-between gap-2">
                        <span>Snitt i gruppen</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(costAverage)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <span>Per lägenhet</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(costPerApartment)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span>Avvikelse</span>
                        <span className="font-semibold text-gray-900">{costGapSummary}</span>
                    </div>
                </div>
            )}
        />
    );
}
