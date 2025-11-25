/**
 * WasteAnalysisPanels component
 * Displays total waste comparison and environmental benchmark panels with proper loading and error handling.
 */
import { useMemo } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import TotalWasteComparisonPanel from "./TotalWasteComparisonPanel/TotalWasteComparisonPanel";
import EnvironmentalBenchmarkPanel from "./EnvironmentalBenchmarkPanel/EnvironmentalBenchmarkPanel";
import InfoTooltip from "../../components/InfoTooltip";
import type { PropertyComparison } from "../../../../lib/Comparison";
import type { Property } from "../../../../lib/Property";
import type { ContainerInRoom } from "../../Types";
import { buildDesignStats, mapWasteComparisons, mapFrequencyComparisons, buildCombinedRows } from "../utils/builders";
import { useWasteComparison } from "../hooks/useWasteComparison";
import './css/analysisPanels.css'

type WasteAnalysisPanelsProps = {
    comparisonData: PropertyComparison | null;
    comparisonLoading: boolean;
    comparisonError: string | null;
    selectedProperty: Property | null;
    containersInRoom: ContainerInRoom[];
};

export default function WasteAnalysisPanels({
    comparisonData,
    comparisonLoading,
    comparisonError,
    selectedProperty,
    containersInRoom,
}: WasteAnalysisPanelsProps) {

    //Compute design stats and comparison rows using custom hook
    const {
        safeApartments,
        designStats,
        combinedRows,
        activeBenchmarks,
        designHasContainers,
    } = useWasteComparison({
        comparisonData,
        selectedProperty,
        containersInRoom,
    });

    return (
        <div className="analysis-root">

            <div className="analysis-header">
                <div className="analysis-header-left">
                    <h2 className="analysis-title">
                        Kostnader och jämförelse
                    </h2>
                </div>
                <InfoTooltip text="Se hur ditt miljörum står sig mot liknande fastigheter i samma kommun." />
            </div>

            {/*Loading state*/}
            {comparisonLoading && (
                <div className="analysis-loading">
                    <Loader2 className="loading-icon" />
                    Hämtar jämförelsedata...
                </div>
            )}

            {/* Error state */}
            {!comparisonLoading && comparisonError && (
                <div className="analysis-error">
                    <div className="analysis-error-header">
                        <AlertCircle className="error-icon" />
                        Kunde inte ladda jämförelsen
                    </div>
                    <p>{comparisonError}</p>
                </div>
            )}

            {/* No comparison data */}
            {!comparisonLoading && !comparisonError && !comparisonData && (
                <div className="analysis-no-comparison">
                    <p>
                        Öppna planeringsverktyget via en fastighet under <strong>Mina fastigheter</strong> för att se kostnader och jämförelser.
                    </p>
                </div>
            )}

            {/*Panels for total comparison and environmental benchmark*/}
            {!comparisonLoading && !comparisonError && comparisonData && (
                <>
                    <section className="analysis-section">
                        <TotalWasteComparisonPanel
                            designStats={designStats}
                            combinedRows={combinedRows}
                            comparisonData={comparisonData}
                            safeApartments={safeApartments}
                            comparisonLoading={comparisonLoading}
                            comparisonError={comparisonError}
                            designHasContainers={designHasContainers}
                        />
                    </section>

                    <section className="analysis-section">
                        <EnvironmentalBenchmarkPanel
                            designStats={designStats}
                            combinedRows={combinedRows}
                            activeBenchmarks={activeBenchmarks}
                            designHasContainers={designHasContainers}
                        />
                    </section>
                </>
            )}
        </div>
    );
}
