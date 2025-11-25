import { useMemo } from "react";
import type { PropertyComparison } from "../../../../../lib/Comparison";
import type { CombinedRow } from "../../utils/types";
import { useCostComparison } from "./hooks/useCostComparison";
import { useContainerComparison } from "./hooks/useContainerComparison";
import { useCo2Comparison } from "./hooks/useCo2Comparison";
import Co2Summary from "./components/Co2Summary";
import CostSummary from "./components/CostSummary";
import ContainerVolumeSummary from "./components/ContainerVolumeSummary";
import ContainerOverviewSummary from "./components/ContainerOverviewSummary";
import '../css/wasteComparison.css'

type TotalWasteComparisonPanelProps = {
    designStats: ReturnType<typeof buildDesignStats>;
    combinedRows: CombinedRow[];
    comparisonData: PropertyComparison;
    safeApartments: number;
};

export default function TotalWasteComparisonPanel({
    designStats,
    combinedRows,
    comparisonData,
    safeApartments,
}: TotalWasteComparisonPanelProps) {

    const costData = useCostComparison({ designStats, comparisonData, safeApartments, combinedRows });
    const containerData = useContainerComparison({ designStats, comparisonData });
    const co2Data = useCo2Comparison({ designStats, combinedRows, safeApartments });

    const designHasContainers = designStats.containerCount > 0;

    return (
        <section className="total-waste-panel">
            <CostSummary {...costData} />
            <ContainerVolumeSummary {...containerData} />
            <ContainerOverviewSummary
                designHasContainers={designStats.containerCount > 0}
                containerCount={designStats.containerCount}
                typeMapSize={designStats.typeMap.size}
                averageFrequencyAll={containerData.averageFrequencyAll}
                dominantCostRow={costData.dominantCostRow}
            />
            <Co2Summary {...co2Data} />
        </section>
    );
}
