/**
 * WasteTypeComparisonPanel component
 * Displays waste type comparison table and handles loading, errors, and empty states.
 */
import { AlertCircle } from "lucide-react";
import { useWasteComparison } from "../../hooks/useWasteComparison";
import WasteTable from "./components/WasteTable";
import '../css/summaryPanel.css'
import LoadingBar from "../../../../../components/LoadingBar";
import type {PropertyComparison} from "../../../../../lib/Comparison.ts";
import type {Property} from "../../../../../lib/Property.ts";
import type {ContainerInRoom} from "../../../lib/Types.ts";

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

    //Compute comparison rows using custom hook
    const {
      combinedRows,
      designHasContainers,
    } = useWasteComparison({
      comparisonData,
      selectedProperty,
      containersInRoom,
    });

    //Determine if comparison data is available
    const hasComparison = Boolean(comparisonData);

return (
        <section className="summary-section">
            <div className="summary-header">
                <h2 className="summary-title">Jämförelse per avfallstyp</h2>
                <p className="summary-subtitle">
                    Visar kostnader, volym och hämtningsfrekvens jämfört med fastigheter med liknande förutsättningar.
                </p>
            </div>

            {/*Loading state*/}
            {comparisonLoading && (
                <div className="summary-loading">
                    <LoadingBar message="Hämtar jämförelsedata..." />
                </div>
            )}

            {/*Error state*/}
            {!comparisonLoading && comparisonError && (
                <div className="summary-error">
                    <div className="summary-error-header">
                        <AlertCircle className="summary-error-icon" />
                        Kunde inte ladda jämförelsen
                    </div>
                    <p className="summary-error-text">{comparisonError}</p>
                </div>
            )}

            {/*No comparison data available*/}
            {!comparisonLoading && !comparisonError && !hasComparison && (
                <div className="summary-empty">
                    <p>
                        Öppna planeringsverktyget via en fastighet under <strong>Mina fastigheter</strong> för att se jämförelser per avfallstyp.
                    </p>
                </div>
            )}

            {/*No containers in design*/}
            {!comparisonLoading && !comparisonError && hasComparison && !designHasContainers && (
                <div className="summary-warning">
                    <div className="summary-warning-header">
                        <AlertCircle className="summary-warning-icon" />
                        Lägg till kärl i ritningen
                    </div>
                    <p className="summary-warning-text">
                        Placera kärl i miljörummet för att se hur kostnader och mängder fördelar sig mellan fraktioner.
                    </p>
                </div>
            )}

            {/*Comparison data exists but no matching rows*/}
            {!comparisonLoading && !comparisonError && hasComparison && designHasContainers && combinedRows.length === 0 && (
                <div className="summary-empty">
                    <p>Jämförelsedata saknas för de fraktioner som finns i ritningen.</p>
                </div>
            )}

            {/*Render waste table when data is available*/}
            {!comparisonLoading &&
                !comparisonError &&
                hasComparison &&
                designHasContainers &&
                combinedRows.length > 0 && (
                    <WasteTable rows={combinedRows} />
            )}
        </section>
    );
}