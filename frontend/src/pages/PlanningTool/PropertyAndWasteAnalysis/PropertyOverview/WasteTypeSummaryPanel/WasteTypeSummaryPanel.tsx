import React, { useMemo } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import {
    buildDesignStats,
    buildCombinedRows,
    mapWasteComparisons,
    mapFrequencyComparisons
} from "../../utils/builders";
import {
    formatCurrency,
    formatPercentage,
    formatNumber,
    formatVolume,
    formatLitersPerWeek
} from "../../utils/utils";
import TrendBadge from "../../components/TrendBadge";
import { PANEL_SECTION_CLASS } from "../../utils/constants";
import { useWasteComparison } from "../../hooks/useWasteComparison";
import WasteTable from "./components/WasteTable";

type WasteTypeComparisonPanelProps = {
    comparisonData: PropertyComparison | null;
    comparisonLoading: boolean;
    comparisonError: string | null;
    selectedProperty: Property | null;
    containersInRoom: ContainerInRoom[];
};

export default function WasteTypeComparisonPanel({
    comparisonData,
    comparisonLoading,
    comparisonError,
    selectedProperty,
    containersInRoom,
}: WasteTypeComparisonPanelProps) {

    const {
      combinedRows,
    } = useWasteComparison({
      comparisonData,
      selectedProperty,
      containersInRoom,
    });

    const hasComparison = Boolean(comparisonData);
    const designHasContainers = containersInRoom.length > 0;


    return (
        <section className={`${PANEL_SECTION_CLASS} w-full`}>
            <div className="flex flex-col gap-1">
                <h2 className="text-base font-bold text-gray-900">Jämförelse per avfallstyp</h2>
                <p className="text-xs text-gray-500">
                    Visar kostnader, volym och hämtningsfrekvens jämfört med fastigheter med liknande förutsättningar.
                </p>
            </div>

            {comparisonLoading && (
                <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Hämtar jämförelsedata...
                </div>
            )}

            {!comparisonLoading && comparisonError && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="h-4 w-4" />
                        Kunde inte ladda jämförelsen
                    </div>
                    <p className="mt-2 text-xs leading-relaxed">{comparisonError}</p>
                </div>
            )}

            {!comparisonLoading && !comparisonError && !hasComparison && (
                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    <p>
                        Öppna planeringsverktyget via en fastighet under <strong>Mina fastigheter</strong> för att se jämförelser per avfallstyp.
                    </p>
                </div>
            )}

            {!comparisonLoading && !comparisonError && hasComparison && !designHasContainers && (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800">
                    <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="h-4 w-4" />
                        Lägg till kärl i ritningen
                    </div>
                    <p className="mt-2 text-xs leading-relaxed">
                        Placera kärl i miljörummet för att se hur kostnader och mängder fördelar sig mellan fraktioner.
                    </p>
                </div>
            )}

            {!comparisonLoading && !comparisonError && hasComparison && designHasContainers && combinedRows.length === 0 && (
                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    <p>Jämförelsedata saknas för de fraktioner som finns i ritningen.</p>
                </div>
            )}

            {!comparisonLoading &&
                !comparisonError &&
                hasComparison &&
                designHasContainers &&
                combinedRows.length > 0 && <WasteTable rows={combinedRows} />
            }
        </section>
    );
}
