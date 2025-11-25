import SummaryStat from "../../components/SummaryStat";
import TrendBadge from "../../../components/TrendBadge";
import { formatCurrency } from "../../../utils/utils";
import { TREND_CONFIG } from "../../../utils/constants";
import '../../css/wasteComparison.css'

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
            description={
                <div className="summary-grid">
                    <div className="summary-row">
                        <span>Snitt i gruppen</span>
                        <span className="summary-row-label">{formatCurrency(costAverage)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Per lägenhet</span>
                        <span className="summary-row-label">{formatCurrency(costPerApartment)}</span>
                    </div>
                    <div className="summary-row summary-row-pt">
                        <span>Avvikelse</span>
                        <span className="summary-row-label">{costGapSummary}</span>
                    </div>
                </div>
            }
        />
    );
}
