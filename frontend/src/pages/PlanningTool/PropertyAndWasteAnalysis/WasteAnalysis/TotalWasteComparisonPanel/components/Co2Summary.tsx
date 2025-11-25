import SummaryStat from "../../components/SummaryStat";
import '../../css/wasteComparison.css'

type Co2SummaryProps = {
    co2CardValue: string;
    co2Tone: "neutral" | "positive" | "negative";
    co2HasData: boolean;
    co2PerApartmentLabel: string;
    co2PerWeekLabel: string;
    co2TopLabel: string;
};

export default function Co2Summary({
    co2CardValue,
    co2Tone,
    co2HasData,
    co2PerApartmentLabel,
    co2PerWeekLabel,
    co2TopLabel,
}: Co2SummaryProps) {
    return (
        <SummaryStat
            title="Årlig CO₂-besparing"
            value={co2CardValue}
            tone={co2Tone}
            size="compact"
            description={co2HasData ? (
                <div className="summary-grid">
                    <div className="summary-row">
                        <span>Per lägenhet</span>
                        <span className="summary-row-label">{co2PerApartmentLabel}</span>
                    </div>
                    <div className="summary-row">
                        <span>Per vecka</span>
                        <span className="summary-row-label">{co2PerWeekLabel}</span>
                    </div>
                    <div className="summary-row">
                        <span>Störst effekt</span>
                        <span className="summary-row-label">{co2TopLabel}</span>
                    </div>
                </div>
            ) : (
                <div className="summary-empty">
                    Lägg till sorterade fraktioner för att uppskatta klimatvinsten.
                </div>
            )}
        />
    );
}