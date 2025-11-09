import { useMemo, type ReactNode } from "react";
import InfoTooltip from "../components/InfoTooltip";
import type { PropertyComparison, WasteAmountComparison, CollectionFrequencyComparison } from "../../../lib/Comparison";
import type { Property } from "../../../lib/Property";
import type { ContainerInRoom } from "../Types";
import { Loader2, TrendingDown, TrendingUp, Minus, AlertCircle, CheckCircle } from "lucide-react";

type CostSectionProps = {
    comparisonData: PropertyComparison | null;
    comparisonLoading: boolean;
    comparisonError: string | null;
    selectedProperty: Property | null;
    containersInRoom: ContainerInRoom[];
};

type Trend = "better" | "equal" | "worse";

type BenchmarkDefinition = {
    key: string;
    label: string;
    benchmark: number;
    aliases: string[];
};

type DesignTypeStats = {
    key: string;
    displayName: string;
    totalAnnualVolume: number;
    totalNominalVolume: number;
    totalFrequency: number;
    containerCount: number;
    totalCost: number;
};

type DesignStats = {
    totalCost: number;
    totalNominalVolume: number;
    containerCount: number;
    typeMap: Map<string, DesignTypeStats>;
};

type CombinedRow = {
    key: string;
    displayName: string;
    propertyPerWeek: number | null;
    averagePerWeek: number | null;
    propertyAnnualVolume: number | null;
    containerCount: number | null;
    propertyFrequency: number | null;
    averageFrequency: number | null;
    frequencyDiff: number | null;
    frequencyTrend: Trend;
    totalCost: number | null;
    costPercentage: number | null;
    wasteDiff: number | null;
};

const WASTE_BENCHMARKS: BenchmarkDefinition[] = [
    { key: "restavfall", label: "Restavfall", benchmark: 30, aliases: ["rest"] },
    { key: "pappersforpackningar", label: "Pappersförpackningar", benchmark: 40, aliases: ["kartong", "pappersinsamling"] },
    { key: "plastforpackningar", label: "Plastförpackningar", benchmark: 25, aliases: ["plast", "plastinsamling"] },
];

const WEEK_PER_YEAR = 52;

const TREND_CONFIG: Record<Trend, { label: string; className: string; Icon: typeof TrendingUp }> = {
    better: {
        label: "Lägre än snittet",
        className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        Icon: TrendingDown,
    },
    equal: {
        label: "I nivå med snittet",
        className: "bg-blue-100 text-blue-700 border border-blue-200",
        Icon: Minus,
    },
    worse: {
        label: "Högre än snittet",
        className: "bg-amber-100 text-amber-700 border border-amber-200",
        Icon: TrendingUp,
    },
};

type SummaryTone = "positive" | "neutral" | "negative";

const SUMMARY_TONE_STYLES: Record<SummaryTone, { container: string; title: string; value: string }> = {
    positive: {
        container: "border-emerald-100 bg-gradient-to-br from-emerald-50 via-emerald-100/40 to-white",
        title: "text-emerald-700",
        value: "text-emerald-800",
    },
    neutral: {
        container: "border-gray-100 bg-gradient-to-br from-white via-gray-50/60 to-white",
        title: "text-gray-600",
        value: "text-gray-900",
    },
    negative: {
        container: "border-amber-100 bg-gradient-to-br from-amber-50 via-amber-100/40 to-white",
        title: "text-amber-700",
        value: "text-amber-800",
    },
};

const PANEL_SECTION_CLASS = "rounded-3xl border border-gray-100 bg-white/95 shadow-lg backdrop-blur-sm p-5";

function SummaryCard({
    title,
    value,
    description,
    tone = "neutral",
    badge,
}: {
    title: string;
    value: string;
    description?: ReactNode;
    tone?: SummaryTone;
    badge?: ReactNode;
}) {
    const styles = SUMMARY_TONE_STYLES[tone];

    return (
        <div className={`flex h-full flex-col gap-4 rounded-2xl border p-5 shadow-lg transition-colors duration-300 backdrop-blur-sm ${styles.container}`}>
            <div className="flex w-full flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${styles.title}`}>{title}</p>
                    <p className={`text-2xl font-bold leading-tight ${styles.value}`}>{value}</p>
                </div>
                {badge ? <div className="max-w-full">{badge}</div> : null}
            </div>
            {description ? (
                <div className="mt-auto space-y-1.5 text-xs leading-relaxed text-gray-600">
                    {description}
                </div>
            ) : null}
        </div>
    );
}

function normalizeWasteTypeKey(value?: string) {
    if (!value) return "";
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

function getTrend(percentage?: number | null, tolerance = 5): Trend {
    if (percentage == null || Number.isNaN(percentage)) {
        return "equal";
    }

    if (percentage <= -Math.abs(tolerance)) {
        return "better";
    }

    if (percentage >= Math.abs(tolerance)) {
        return "worse";
    }

    return "equal";
}

function formatCurrency(value?: number | null) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }
    return Number(value).toLocaleString("sv-SE", {
        style: "currency",
        currency: "SEK",
        maximumFractionDigits: 0,
    });
}

function formatCurrencySigned(value?: number | null) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }
    return Number(value).toLocaleString("sv-SE", {
        style: "currency",
        currency: "SEK",
        maximumFractionDigits: 0,
        signDisplay: "exceptZero",
    });
}

function formatNumber(value?: number | null, options: Intl.NumberFormatOptions = {}) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }
    return Number(value).toLocaleString("sv-SE", {
        maximumFractionDigits: 1,
        ...options,
    });
}

function formatNumberSigned(value?: number | null, options: Intl.NumberFormatOptions = {}) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }
    return Number(value).toLocaleString("sv-SE", {
        maximumFractionDigits: 1,
        signDisplay: "exceptZero",
        ...options,
    });
}

function formatPercentage(value?: number | null) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }
    return `${Number(value).toLocaleString("sv-SE", { maximumFractionDigits: 1 })}%`;
}

function formatPercentageSigned(value?: number | null) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }
    return `${Number(value).toLocaleString("sv-SE", {
        maximumFractionDigits: 1,
        signDisplay: "exceptZero",
    })}%`;
}

function calculatePercentageDifference(value?: number | null, average?: number | null) {
    if (
        value == null || Number.isNaN(value) ||
        average == null || Number.isNaN(average) ||
        average === 0
    ) {
        return null;
    }
    return ((value - average) / average) * 100;
}

function computePerApartmentPerWeek(amount?: number | null, apartments?: number | null) {
    if (amount == null || Number.isNaN(amount)) {
        return null;
    }
    const safeApartments = apartments && apartments > 0 ? apartments : 1;
    return amount / WEEK_PER_YEAR / safeApartments;
}

function formatLitersPerWeek(value?: number | null) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }
    return `${Math.round(value)} L / lägenhet · vecka`;
}

function formatVolume(value?: number | null) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }
    return `${formatNumber(value, { maximumFractionDigits: 0 })} L`;
}

function BenchmarkBar({ value, benchmark }: { value: number | null; benchmark: number }) {
    if (value == null) {
        return <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100" />;
    }

    const clamped = Math.max(0, value);
    const ratio = Math.min(clamped / benchmark, 1);
    const overflow = clamped > benchmark;

    return (
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
                className={`h-2 rounded-full transition-all duration-500 ${overflow ? "bg-gradient-to-r from-amber-400 to-amber-600" : "bg-gradient-to-r from-emerald-400 to-emerald-600"}`}
                style={{ width: `${Math.round(ratio * 100)}%` }}
            />
        </div>
    );
}

function TrendBadge({ trend, children }: { trend: Trend; children: React.ReactNode }) {
    const { className, Icon } = TREND_CONFIG[trend];
    return (
        <span className={`inline-flex flex-wrap items-center justify-center gap-1 whitespace-normal rounded-full px-2.5 py-1 text-center text-xs font-semibold shadow-sm ${className}`}>
            <Icon className="h-3.5 w-3.5" />
            {children}
        </span>
    );
}

function buildDesignStats(containersInRoom: ContainerInRoom[]): DesignStats {
    const typeMap = new Map<string, DesignTypeStats>();
    let totalCost = 0;
    let totalNominalVolume = 0;
    let containerCount = 0;

    containersInRoom.forEach(({ container }) => {
        const serviceName = container.serviceTypeName ?? container.name ?? "Övrigt";
        const key = normalizeWasteTypeKey(serviceName);
        const annualVolume = (container.size ?? 0) * (container.emptyingFrequencyPerYear ?? 0);
        const nominalVolume = container.size ?? 0;
        const frequency = container.emptyingFrequencyPerYear ?? 0;
        const cost = Number(container.cost ?? 0) || 0;

        const current = typeMap.get(key) ?? {
            key,
            displayName: serviceName,
            totalAnnualVolume: 0,
            totalNominalVolume: 0,
            totalFrequency: 0,
            containerCount: 0,
            totalCost: 0,
        };

        current.totalAnnualVolume += annualVolume;
        current.totalNominalVolume += nominalVolume;
        current.totalFrequency += frequency;
        current.containerCount += 1;
        current.totalCost += cost;
        current.displayName = serviceName;

        typeMap.set(key, current);

        totalCost += cost;
        totalNominalVolume += nominalVolume;
        containerCount += 1;
    });

    return {
        totalCost,
        totalNominalVolume,
        containerCount,
        typeMap,
    };
}

function mapWasteComparisons(comparisonData: PropertyComparison | null) {
    const map = new Map<string, WasteAmountComparison>();
    comparisonData?.wasteAmountComparisons?.forEach(item => {
        map.set(normalizeWasteTypeKey(item.wasteType), item);
    });
    return map;
}

function mapFrequencyComparisons(comparisonData: PropertyComparison | null) {
    const map = new Map<string, CollectionFrequencyComparison>();
    comparisonData?.frequencyComparisons?.forEach(item => {
        map.set(normalizeWasteTypeKey(item.wasteType), item);
    });
    return map;
}

function findRowForBenchmark(def: BenchmarkDefinition, rows: CombinedRow[]) {
    const targets = [def.key, ...def.aliases].map(normalizeWasteTypeKey);
    return rows.find(row => targets.includes(normalizeWasteTypeKey(row.displayName))) ?? null;
}

export default function CostSection({
    comparisonData,
    comparisonLoading,
    comparisonError,
    selectedProperty,
    containersInRoom,
}: CostSectionProps) {
    const apartments = comparisonData?.numberOfApartments ?? selectedProperty?.numberOfApartments ?? 0;
    const safeApartments = apartments > 0 ? apartments : 1;

    const designStats = useMemo(() => buildDesignStats(containersInRoom), [containersInRoom]);
    const designHasContainers = designStats.containerCount > 0;

    const wasteComparisonMap = useMemo(() => mapWasteComparisons(comparisonData), [comparisonData]);
    const frequencyComparisonMap = useMemo(() => mapFrequencyComparisons(comparisonData), [comparisonData]);

    const combinedRows = useMemo<CombinedRow[]>(() => {
        const keys = new Set<string>();
        designStats.typeMap.forEach((_, key) => keys.add(key));
        wasteComparisonMap.forEach((_, key) => keys.add(key));
        frequencyComparisonMap.forEach((_, key) => keys.add(key));

        return Array.from(keys).map((key) => {
            const design = designStats.typeMap.get(key) ?? null;
            const waste = wasteComparisonMap.get(key) ?? null;
            const frequency = frequencyComparisonMap.get(key) ?? null;

            const displayName = design?.displayName ?? waste?.wasteType ?? frequency?.wasteType ?? "Okänd avfallstyp";
            const propertyAnnualVolume = design?.totalAnnualVolume ?? waste?.propertyWasteAmount ?? null;
            const averageAnnualVolume = waste?.averageWasteAmount ?? null;
            const propertyPerWeek = computePerApartmentPerWeek(propertyAnnualVolume, safeApartments);
            const averagePerWeek = computePerApartmentPerWeek(averageAnnualVolume, safeApartments);
            const wasteDiff = calculatePercentageDifference(propertyAnnualVolume, averageAnnualVolume);

            const propertyFrequency = design
                ? design.totalFrequency / (design.containerCount || 1)
                : frequency?.propertyFrequency ?? null;
            const averageFrequency = frequency?.averageFrequency ?? null;
            const frequencyDiff = calculatePercentageDifference(propertyFrequency, averageFrequency);
            const frequencyTrend = getTrend(frequencyDiff);

            const containerCount = design?.containerCount ?? null;
            const totalCostPerType = design?.totalCost ?? null;
            const costPercentage = totalCostPerType != null && designStats.totalCost > 0
                ? (totalCostPerType / designStats.totalCost) * 100
                : null;

            return {
                key,
                displayName,
                propertyPerWeek,
                averagePerWeek,
                propertyAnnualVolume,
                containerCount,
                wasteDiff,
                propertyFrequency,
                averageFrequency,
                frequencyDiff,
                frequencyTrend,
                totalCost: totalCostPerType,
                costPercentage,
            } satisfies CombinedRow;
        }).sort((a, b) => a.displayName.localeCompare(b.displayName, "sv"));
    }, [designStats, wasteComparisonMap, frequencyComparisonMap, safeApartments]);

    const costComparison = comparisonData?.costComparison ?? null;
    const costAverage = costComparison?.averageCost ?? null;
    const propertyCostValue = designHasContainers ? designStats.totalCost : costComparison?.propertyCost ?? null;
    const costDifference = calculatePercentageDifference(propertyCostValue, costAverage);
    const costTrend = getTrend(costDifference);
    const costPerApartment = propertyCostValue != null ? propertyCostValue / safeApartments : null;

    const containerComparison = comparisonData?.containerSizeComparison ?? null;
    const containerAverageVolume = containerComparison?.averageVolume ?? null;
    const propertyVolumeValue = designHasContainers ? designStats.totalNominalVolume : containerComparison?.propertyTotalVolume ?? null;
    const containerDifference = calculatePercentageDifference(propertyVolumeValue, containerAverageVolume);
    const containerTrend = getTrend(containerDifference);
    const containerLabel = (() => {
        if (!designHasContainers && containerDifference == null) {
            return "Ingen kärldata";
        }
        if (containerDifference == null) return "I nivå med snittet";
        if (containerDifference <= -5) return "Mindre totalt kärlvolym";
        if (containerDifference >= 5) return "Större totalt kärlvolym";
        return "I nivå med snittet";
    })();

    const hasComparison = Boolean(comparisonData);

    const costGapAbsolute = propertyCostValue != null && costAverage != null
        ? propertyCostValue - costAverage
        : null;
    const costTone: SummaryTone = costGapAbsolute == null
        ? "neutral"
        : costGapAbsolute <= 0
            ? "positive"
            : "negative";
    const costGapSummary = costDifference != null || costGapAbsolute != null
        ? `${formatPercentageSigned(costDifference)} (${formatCurrencySigned(costGapAbsolute)})`
        : "—";

    const containerGapAbsolute = propertyVolumeValue != null && containerAverageVolume != null
        ? propertyVolumeValue - containerAverageVolume
        : null;
    const containerTone: SummaryTone = containerDifference == null
        ? "neutral"
        : containerDifference <= -5
            ? "positive"
            : containerDifference >= 5
                ? "negative"
                : "neutral";
    const containerGapSummary = containerDifference != null || containerGapAbsolute != null
        ? `${formatPercentageSigned(containerDifference)} (${containerGapAbsolute != null ? `${formatNumberSigned(containerGapAbsolute, { maximumFractionDigits: 0 })} L` : "—"})`
        : (!designHasContainers ? "Lägg till kärl för att få rekommendation" : "—");
    const totalVolumeLabel = propertyVolumeValue != null
        ? `${formatNumber(propertyVolumeValue, { maximumFractionDigits: 0 })} L`
        : "—";

    const totalFrequencyAll = designHasContainers
        ? Array.from(designStats.typeMap.values()).reduce((sum, type) => sum + type.totalFrequency, 0)
        : 0;
    const averageFrequencyAll = designHasContainers && designStats.containerCount > 0
        ? totalFrequencyAll / designStats.containerCount
        : null;

    const dominantCostRow = combinedRows.reduce<CombinedRow | null>((current, row) => {
        if (row.costPercentage == null) {
            return current;
        }
        if (!current || (current.costPercentage ?? 0) < row.costPercentage) {
            return row;
        }
        return current;
    }, null);

    const containerStatsDescription = designHasContainers ? (
        <div className="space-y-1">
            <div className="flex justify-between">
                <span>Fraktioner</span>
                <span>{designStats.typeMap.size}</span>
            </div>
            {averageFrequencyAll != null && (
                <div className="flex justify-between">
                    <span>Genomsnittlig tömning</span>
                    <span>{formatNumber(averageFrequencyAll, { maximumFractionDigits: 1 })} ggr/år</span>
                </div>
            )}
            {dominantCostRow && dominantCostRow.costPercentage != null && (
                <div className="flex justify-between">
                    <span>Största kostnad</span>
                    <span>{dominantCostRow.displayName} ({formatPercentage(dominantCostRow.costPercentage)})</span>
                </div>
            )}
        </div>
    ) : (
        <div className="space-y-1">
            <p>Lägg till kärl i ritningen för att se hur kostnaderna fördelas mellan fraktioner.</p>
        </div>
    );

    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-black tracking-tight text-nsr-teal">Kostnader och jämförelse</h2>
                    <p className="text-xs text-gray-500">Överblick över kostnader, kärlvolym och riktmärken för ditt miljörum.</p>
                </div>
                <InfoTooltip text="Se hur ditt miljörum står sig mot liknande fastigheter i samma kommun." />
            </div>

            {comparisonLoading && (
                <div className="flex flex-1 items-center justify-center text-gray-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Hämtar jämförelsedata...
                </div>
            )}

            {!comparisonLoading && comparisonError && (
                <div className="flex flex-col items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="h-4 w-4" />
                        Kunde inte ladda jämförelsen
                    </div>
                    <p>{comparisonError}</p>
                </div>
            )}

            {!comparisonLoading && !comparisonError && !hasComparison && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    <p>
                        Öppna planeringsverktyget via en fastighet under <strong>Mina fastigheter</strong> för att se kostnader och jämförelser.
                    </p>
                </div>
            )}

            {!comparisonLoading && !comparisonError && hasComparison && (
                <div className="grid gap-6 lg:grid-cols-2">
                    {!designHasContainers && (
                        <section className={`${PANEL_SECTION_CLASS} border-amber-200/70 bg-amber-50/60 text-sm text-amber-800 lg:col-span-2`}>
                            <div className="flex items-center gap-2 font-semibold">
                                <AlertCircle className="h-4 w-4" />
                                Placera kärl för att aktivera ritningens kostnader
                            </div>
                            <p className="mt-2 text-xs leading-relaxed">
                                Just nu visas kostnadsuppskattningen baserat på nuvarande abonnemang. Lägg till kärl i ritningen för att se hur de påverkar kostnader och riktmärken i realtid.
                            </p>
                        </section>
                    )}

                    <section className={`${PANEL_SECTION_CLASS} lg:col-span-2`}>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
                            <SummaryCard
                            title="Årlig kostnad"
                            value={formatCurrency(propertyCostValue)}
                            tone={costTone}
                            badge={<TrendBadge trend={costTrend}>{TREND_CONFIG[costTrend].label}</TrendBadge>}
                            description={(
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Snitt i gruppen</span>
                                        <span>{formatCurrency(costAverage)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Per lägenhet</span>
                                        <span>{formatCurrency(costPerApartment)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Avvikelse</span>
                                        <span>{costGapSummary}</span>
                                    </div>
                                </div>
                            )}
                            />

                            <SummaryCard
                            title="Total kärlvolym"
                            value={totalVolumeLabel}
                            tone={containerTone}
                            badge={<TrendBadge trend={containerTrend}>{containerLabel}</TrendBadge>}
                            description={(
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Snitt i gruppen</span>
                                        <span>{containerAverageVolume != null ? `${formatNumber(containerAverageVolume, { maximumFractionDigits: 0 })} L` : "—"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Avvikelse</span>
                                        <span>{containerGapSummary}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Jämförelseunderlag</span>
                                        <span>{containerComparison?.comparisonGroupSize ?? 0}</span>
                                    </div>
                                </div>
                            )}
                            />

                            <SummaryCard
                            title="Kärlöversikt"
                            value={designHasContainers ? `${designStats.containerCount} kärl` : "Inga kärl"}
                            tone={designHasContainers ? "neutral" : "negative"}
                            description={containerStatsDescription}
                            />
                        </div>
                    </section>

                    <section className={`${PANEL_SECTION_CLASS} lg:col-span-2`}>
                        <h3 className="text-sm font-semibold text-gray-800">Riktmärken per lägenhet (liter/vecka)</h3>
                        <p className="mt-1 text-xs text-gray-500">
                            Grön markering betyder att ni ligger inom NSR:s rekommendation. Gränsvärdena utgår från den mängd respektive fraktion bör ligga på för att miljörummet ska klassas som resurseffektivt.
                        </p>

                        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {WASTE_BENCHMARKS.map((def) => {
                                const row = findRowForBenchmark(def, combinedRows);
                                const propertyValue = row?.propertyPerWeek ?? null;
                                const averageValue = row?.averagePerWeek ?? null;
                                const hasData = designHasContainers && propertyValue != null;
                                const withinTarget = hasData && propertyValue <= def.benchmark;

                                return (
                                    <div key={def.key} className="rounded-2xl border border-gray-100/60 bg-gradient-to-br from-gray-50 via-white to-gray-50/50 p-4 shadow-inner flex flex-col gap-2">
                                        <div className="flex flex-col gap-1 text-sm">
                                            <span className="font-semibold text-gray-800">{def.label}</span>
                                            <span className={`inline-flex items-center gap-1 text-xs ${!hasData ? "text-gray-400" : withinTarget ? "text-emerald-600" : "text-amber-600"}`}>
                                                <CheckCircle className={`h-3.5 w-3.5 ${!hasData ? "text-gray-300" : withinTarget ? "text-emerald-500" : "text-amber-500"}`} />
                                                {!hasData ? "Kärl saknas" : withinTarget ? "Grön flagga" : "Över riktmärket"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span>{hasData ? formatLitersPerWeek(propertyValue) : "—"}</span>
                                            <span>Riktmärke {def.benchmark} L</span>
                                        </div>
                                        <BenchmarkBar value={hasData ? propertyValue : null} benchmark={def.benchmark} />
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Snitt: {formatLitersPerWeek(averageValue)}</span>
                                            <span>Avvikelse: {hasData ? formatPercentage(row?.wasteDiff ?? null) : "—"}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {combinedRows.length > 0 && (
                        <section className={`${PANEL_SECTION_CLASS} lg:col-span-2`}>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm font-semibold text-gray-800">Jämförelse per avfallstyp</h3>
                                <p className="text-xs text-gray-500">
                                    Visar mängd och hämtningsfrekvens jämfört med fastigheter med liknande förutsättningar.
                                </p>
                            </div>

                            <div className="mt-3 overflow-x-auto">
                                <table className="min-w-full text-left text-xs text-gray-600">
                                    <thead className="text-[11px] uppercase tracking-wide text-gray-500 bg-gray-50/70">
                                        <tr>
                                            <th className="py-2 pr-4">Avfallstyp</th>
                                            <th className="py-2 pr-4">Kostnad (andel)</th>
                                            <th className="py-2 pr-4">Antal kärl</th>
                                            <th className="py-2 pr-4">Hämtningsfrekvens</th>
                                            <th className="py-2 pr-4">Årsvolym</th>
                                            <th className="py-2 pr-4">Lgh/vecka</th>
                                            <th className="py-2 pr-4">Snitt (lgh/vecka)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {combinedRows.map((row) => (
                                            <tr key={row.key} className="odd:bg-gray-50/40">
                                                <td className="py-2 pr-4 text-gray-800">{row.displayName}</td>
                                                <td className="py-2 pr-4">
                                                    {row.totalCost != null ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-900">{formatCurrency(row.totalCost)}</span>
                                                            {row.costPercentage != null && (
                                                                <span className="text-gray-500">{formatPercentage(row.costPercentage)}</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="py-2 pr-4">{row.containerCount != null ? row.containerCount : "—"}</td>
                                                <td className="py-2 pr-4">
                                                    {row.propertyFrequency != null || row.averageFrequency != null ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex flex-col">
                                                                {row.propertyFrequency != null && (
                                                                    <span className="text-gray-800">
                                                                        {formatNumber(row.propertyFrequency, { maximumFractionDigits: 1 })} ggr/år
                                                                    </span>
                                                                )}
                                                                {row.averageFrequency != null && (
                                                                    <span className="text-gray-500">
                                                                        Snitt {formatNumber(row.averageFrequency, { maximumFractionDigits: 1 })} ggr/år
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {row.frequencyDiff != null && (
                                                                <TrendBadge trend={row.frequencyTrend}>
                                                                    {formatPercentage(row.frequencyDiff)}
                                                                </TrendBadge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="py-2 pr-4">{formatVolume(row.propertyAnnualVolume)}</td>
                                                <td className="py-2 pr-4">{formatLitersPerWeek(row.propertyPerWeek)}</td>
                                                <td className="py-2 pr-4">{formatLitersPerWeek(row.averagePerWeek)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                </div>
            )}
        </div>
    );
}
