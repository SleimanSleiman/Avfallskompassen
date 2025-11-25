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

    const {
        safeApartments,
        designStats,
        combinedRows,
    } = useWasteComparison({
        comparisonData,
        selectedProperty,
        containersInRoom,
    });

    return (
        <div className="flex flex-col bg-white px-3 py-3 sm:p-4 transition-all duration-300 min-w-0 flex-1">

            <div className="mb-6 flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-black tracking-tight text-nsr-teal">
                        Kostnader och jämförelse
                    </h2>
                </div>
                <InfoTooltip text="Se hur ditt miljörum står sig mot liknande fastigheter i samma kommun." />
            </div>

            {/* Loading state */}
            {comparisonLoading && (
                <div className="flex flex-1 items-center justify-center text-gray-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Hämtar jämförelsedata...
                </div>
            )}

            {/* Error state */}
            {!comparisonLoading && comparisonError && (
                <div className="flex flex-col items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="h-4 w-4" />
                        Kunde inte ladda jämförelsen
                    </div>
                    <p>{comparisonError}</p>
                </div>
            )}

            {/* No comparison */}
            {!comparisonLoading && !comparisonError && !comparisonData && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    <p>
                        Öppna planeringsverktyget via en fastighet under <strong>Mina fastigheter</strong> för att se kostnader och jämförelser.
                    </p>
                </div>
            )}

            {/* Panels */}
            {!comparisonLoading && !comparisonError && comparisonData && (
                <>
                    {/* Section 1: Total Waste Comparison */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-4 mb-6">
                        <TotalWasteComparisonPanel
                            designStats={designStats}
                            combinedRows={combinedRows}
                            comparisonData={comparisonData}
                            safeApartments={safeApartments}
                            comparisonLoading={comparisonLoading}
                            comparisonError={comparisonError}
                        />
                    </section>

                    {/* Section 2: Environmental Benchmark */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-4">
                        <EnvironmentalBenchmarkPanel
                            designStats={designStats}
                            combinedRows={combinedRows}
                            safeApartments={safeApartments}
                        />
                    </section>
                </>
            )}
        </div>
    );
}
