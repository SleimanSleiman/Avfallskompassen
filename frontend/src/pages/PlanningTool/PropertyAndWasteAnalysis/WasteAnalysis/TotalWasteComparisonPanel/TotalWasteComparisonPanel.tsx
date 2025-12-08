/**
 * TotalWasteComparisonPanel component
 * Displays summaries for cost, container volume, container overview, and CO₂ for a property.
 */
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
    designHasContainers: boolean;
};

export default function TotalWasteComparisonPanel({
    designStats,
    combinedRows,
    comparisonData,
    safeApartments,
    designHasContainers,
}: TotalWasteComparisonPanelProps) {

    //Compute cost-related stats
    const costData = useCostComparison({ designStats, comparisonData, safeApartments, combinedRows });

    //Compute container volume/frequency stats
    const containerData = useContainerComparison({ designStats, comparisonData });

    //Compute CO₂-related stats
    const co2Data = useCo2Comparison({ designStats, combinedRows, safeApartments });

    return (
        <section className="total-waste-panel">
            {/*Render cost summary*/}
            <CostSummary {...costData} />

            {/*Render container volume summary*/}
            <ContainerVolumeSummary {...containerData} />

            {/*Render container overview summary*/}
            <ContainerOverviewSummary
                designHasContainers={designStats.containerCount > 0}
                containerCount={designStats.containerCount}
                typeMapSize={designStats.typeMap.size}
                averageFrequencyAll={containerData.averageFrequencyAll}
                comparisonAverageFrequency={containerData.comparisonAverageFrequency}
                frequencyDifference={containerData.frequencyDifference}
                dominantCostRow={costData.dominantCostRow}
            />

            {/*Render CO₂ summary*/}
            <Co2Summary {...co2Data} />
        </section>
    );
}
