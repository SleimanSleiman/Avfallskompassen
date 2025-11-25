import SummaryStat from "../../components/SummaryStat";

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
                <div className="grid gap-1.5 text-[12px] leading-snug text-gray-500">
                    <div className="flex items-center justify-between gap-2">
                        <span>Per lägenhet</span>
                        <span className="font-semibold text-gray-900">{co2PerApartmentLabel}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <span>Per vecka</span>
                        <span className="font-semibold text-gray-900">{co2PerWeekLabel}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <span>Störst effekt</span>
                        <span className="font-semibold text-gray-900">{co2TopLabel}</span>
                    </div>
                </div>
            ) : (
                <div className="text-[12px] leading-snug text-gray-500">
                    Lägg till sorterade fraktioner för att uppskatta klimatvinsten.
                </div>
            )}
        />
    );
}
