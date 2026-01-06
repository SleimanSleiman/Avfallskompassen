/**
 * CostSummary component
 * Displays annual cost with comparison to group average, per apartment, and trend information.
 */
import SummaryStat from "../../components/SummaryStat";
import TrendBadge from "../../../components/TrendBadge";
import { formatCurrency } from "../../../utils/utils";
import { TREND_CONFIG } from "../../../utils/constants";
import '../../css/wasteComparison.css'
import type {Trend} from "../../../utils/types.ts";

type CostSummaryProps = {
    propertyCostValue: number | null;
    costAverage: number | null;
    costPerApartment: number | null;
    costGapSummary: string;
    costTrend: Trend;
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
            //Show trend badge indicating cost performance
            badge={<TrendBadge trend={costTrend} size="compact">{TREND_CONFIG[costTrend].label}</TrendBadge>}
            //Show cost details for average, per apartment, and deviation
            description={
                <div className="summary-grid">
                    {costAverage !== null && costAverage > 0 && (
                        <div className="summary-row">
                            <span>Snitt i gruppen</span>
                            <span className="summary-row-label">{formatCurrency(costAverage)}</span>
                        </div>
                    )}
                    <div className="summary-row">
                        <span>Per lägenhet</span>
                        <span className="summary-row-label">{formatCurrency(costPerApartment)}</span>
                    </div>
                    {costAverage !== null && costAverage > 0 && (
                        <div className="summary-row summary-row-pt">
                            <span>Avvikelse</span>
                            <span className="summary-row-label">{costGapSummary}</span>
                        </div>
                    )}
                </div>
            }
        />
    );
}
