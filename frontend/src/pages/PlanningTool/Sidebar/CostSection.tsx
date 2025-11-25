import { useMemo, type ReactNode } from "react";
import InfoTooltip from "../components/InfoTooltip";
import type { PropertyComparison, WasteAmountComparison, CollectionFrequencyComparison } from "../../../lib/Comparison";
import type { Property } from "../../../lib/Property";
import type { ContainerInRoom } from "../Types";
import { TrendingDown, TrendingUp, Minus, AlertCircle, CheckCircle } from "lucide-react";
import LoadingBar from "../../../components/LoadingBar";

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
    { key: "pappersforpackningar", label: "Pappersförpackningar", benchmark: 30, aliases: ["kartong", "pappersinsamling"] },
    { key: "plastforpackningar", label: "Plastförpackningar", benchmark: 30, aliases: ["plast", "plastinsamling"] },
];

type CarbonSavingDefinition = {
    key: string;
    label: string;
    kgPerLiter: number;
    aliases: string[];
};

const CO2_SAVING_DEFINITIONS: CarbonSavingDefinition[] = [
    { key: "pappersforpackningar", label: "Pappersförpackningar", kgPerLiter: 0.35, aliases: ["kartong", "pappersinsamling"] },
    { key: "plastforpackningar", label: "Plastförpackningar", kgPerLiter: 1.2, aliases: ["plast", "plastinsamling"] },
    { key: "metallforpackningar", label: "Metallförpackningar", kgPerLiter: 2.6, aliases: ["metall", "metallinsamling"] },
    { key: "glasforpackningar", label: "Glasförpackningar", kgPerLiter: 0.2, aliases: ["glas", "glasinsamling", "ofargatglas", "fargatglas"] },
    { key: "matavfall", label: "Matavfall", kgPerLiter: 0.45, aliases: ["organiskt", "bioavfall", "kok"] },
    { key: "tidningar", label: "Tidningar", kgPerLiter: 0.3, aliases: ["returpapper", "papper"] },
    { key: "restavfall", label: "Restavfall", kgPerLiter: 0.06, aliases: ["rest"] },
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

const SUMMARY_TONE_STYLES: Record<SummaryTone, {
    title: string;
    value: string;
}> = {
    positive: {
        title: "text-emerald-700",
        value: "text-emerald-900",
    },
    neutral: {
        title: "text-gray-600",
        value: "text-gray-900",
    },
    negative: {
        title: "text-amber-700",
        value: "text-amber-900",
    },
};

const PANEL_SECTION_CLASS = "rounded-3xl border border-gray-100 bg-white/95 shadow-lg backdrop-blur-sm p-5";

type SummarySize = "default" | "compact";

const SUMMARY_SIZE_STYLES: Record<SummarySize, {
    container: string;
    headerGap: string;
    title: string;
    value: string;
    description: string;
}> = {
    default: {
        container: "gap-2 p-3",
        headerGap: "gap-3",
        title: "text-[11px]",
        value: "text-xl",
        description: "text-[11px] leading-relaxed",
    },
    compact: {
        container: "gap-1.5 p-2",
        headerGap: "gap-2",
        title: "text-[13px]",
        value: "text-sm",
        description: "text-[13px] leading-snug",
    },
};

type BenchmarkStatus = "missing" | "within" | "over";

const BENCHMARK_STATUS_STYLES: Record<BenchmarkStatus, {
    label: string;
    className: string;
    Icon: typeof CheckCircle;
    tone: SummaryTone;
}> = {
    missing: {
        label: "Kärl saknas",
        className: "border-gray-200 bg-gray-100 text-gray-500",
        Icon: Minus,
        tone: "neutral",
    },
    within: {
        label: "Grön flagga",
        className: "border-emerald-200 bg-emerald-100 text-emerald-700",
        Icon: CheckCircle,
        tone: "positive",
    },
    over: {
        label: "Över riktmärket",
        className: "border-amber-200 bg-amber-100 text-amber-700",
        Icon: AlertCircle,
        tone: "negative",
    },
};

type TrendBadgeSize = "default" | "compact";

const TREND_BADGE_SIZE_STYLES: Record<TrendBadgeSize, {
    wrapper: string;
    icon: string;
}> = {
    default: {
        wrapper: "gap-1 px-2.5 py-1 text-xs",
        icon: "h-3.5 w-3.5",
    },
    compact: {
        wrapper: "gap-1 px-2 py-0.5 text-[12px]",
        icon: "h-3 w-3",
    },
};

function SummaryStat({
    title,
    value,
    description,
    tone = "neutral",
    badge,
    size = "default",
}: {
    title: string;
    value: string;
    description?: ReactNode;
    tone?: SummaryTone;
    badge?: ReactNode;
    size?: SummarySize;
}) {
    const styles = SUMMARY_TONE_STYLES[tone];
    const sizeStyles = SUMMARY_SIZE_STYLES[size];

    return (
        <div className={`flex h-full flex-col rounded-lg border border-gray-200/70 bg-white/80 shadow-sm ${sizeStyles.container}`}>
            <div className={`flex w-full flex-wrap items-start justify-between ${sizeStyles.headerGap}`}>
                <div className="min-w-0 space-y-1">
                    <p className={`${sizeStyles.title} font-semibold uppercase tracking-tight ${styles.title}`}>{title}</p>
                    <p className={`${sizeStyles.value} font-semibold leading-tight ${styles.value}`}>{value}</p>
                </div>
                {badge ? <div className="max-w-full flex-shrink-0">{badge}</div> : null}
            </div>
            <div className={`flex-1 text-gray-600 space-y-1 ${sizeStyles.description}`}>
                {description ?? <span className="invisible">—</span>}
            </div>
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

function formatCo2(value?: number | null) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }

    const absolute = Math.abs(value);
    if (absolute >= 1000) {
        return `${Number(value / 1000).toLocaleString("sv-SE", { maximumFractionDigits: 1 })} ton CO₂e`;
    }

    return `${Number(value).toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kg CO₂e`;
}

function BenchmarkBar({ value, benchmark, className = "mt-2" }: { value: number | null; benchmark: number; className?: string }) {
    const containerClass = `h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`;

    if (value == null) {
        return <div className={containerClass} />;
    }

    const clamped = Math.max(0, value);
    const ratio = Math.min(clamped / benchmark, 1);
    const overflow = clamped > benchmark;

    return (
        <div className={containerClass}>
            <div
                className={`h-2 rounded-full transition-all duration-500 ${overflow ? "bg-gradient-to-r from-amber-400 to-amber-600" : "bg-gradient-to-r from-emerald-400 to-emerald-600"}`}
                style={{ width: `${Math.round(ratio * 100)}%` }}
            />
        </div>
    );
}

function TrendBadge({ trend, children, size = "default" }: { trend: Trend; children: React.ReactNode; size?: TrendBadgeSize }) {
    const { className, Icon } = TREND_CONFIG[trend];
    const sizeStyles = TREND_BADGE_SIZE_STYLES[size];
    return (
        <span className={`inline-flex flex-wrap items-center justify-center whitespace-normal rounded-full text-center font-semibold shadow-sm ${sizeStyles.wrapper} ${className}`}>
            <Icon className={sizeStyles.icon} />
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

function buildCombinedRows({
    designStats,
    wasteComparisonMap,
    frequencyComparisonMap,
    safeApartments,
}: {
    designStats: DesignStats;
    wasteComparisonMap: Map<string, WasteAmountComparison>;
    frequencyComparisonMap: Map<string, CollectionFrequencyComparison>;
    safeApartments: number;
}): CombinedRow[] {
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

    const combinedRows = useMemo<CombinedRow[]>(() => buildCombinedRows({
        designStats,
        wasteComparisonMap,
        frequencyComparisonMap,
        safeApartments,
    }), [designStats, wasteComparisonMap, frequencyComparisonMap, safeApartments]);

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

    const co2FactorMap = useMemo(() => {
        const map = new Map<string, number>();
        CO2_SAVING_DEFINITIONS.forEach((def) => {
            const targets = [def.key, ...def.aliases].map(normalizeWasteTypeKey);
            targets.forEach(target => map.set(target, def.kgPerLiter));
        });
        return map;
    }, []);

    const {
        total: totalCo2Savings,
        topRow: topCo2Row,
        topValue: topCo2Value,
    } = useMemo(() => {
        if (!designHasContainers) {
            return { total: 0, topRow: null as CombinedRow | null, topValue: 0 };
        }

        let total = 0;
        let topRow: CombinedRow | null = null;
        let topValue = 0;

        combinedRows.forEach((row) => {
            const liters = row.propertyAnnualVolume ?? null;
            if (liters == null || liters <= 0) {
                return;
            }

            const factor = co2FactorMap.get(normalizeWasteTypeKey(row.displayName)) ?? 0;
            if (factor <= 0) {
                return;
            }

            const saving = liters * factor;
            total += saving;

            if (saving > topValue) {
                topValue = saving;
                topRow = row;
            }
        });

        return { total, topRow, topValue };
    }, [designHasContainers, combinedRows, co2FactorMap]);

    const co2HasData = totalCo2Savings > 0;
    const co2CardValue = co2HasData ? formatCo2(totalCo2Savings) : "—";
    const co2Tone: SummaryTone = !designHasContainers
        ? "negative"
        : co2HasData
            ? "positive"
            : "neutral";
    const co2PerApartment = co2HasData ? totalCo2Savings / safeApartments : null;
    const co2PerWeek = co2HasData ? totalCo2Savings / WEEK_PER_YEAR : null;
    const co2PerApartmentLabel = co2PerApartment != null
        ? `${formatNumber(co2PerApartment, { maximumFractionDigits: 1 })} kg CO₂e`
        : "—";
    const co2PerWeekLabel = co2PerWeek != null
        ? `${formatNumber(co2PerWeek, { maximumFractionDigits: 1 })} kg CO₂e`
        : "—";
    const co2TopLabel = co2HasData && topCo2Row
        ? `${topCo2Row.displayName} (${formatNumber(topCo2Value, { maximumFractionDigits: 0 })} kg)`
        : "—";

    const dominantCostRow = combinedRows.reduce<CombinedRow | null>((current, row) => {
        if (row.costPercentage == null) {
            return current;
        }
        if (!current || (current.costPercentage ?? 0) < row.costPercentage) {
            return row;
        }
        return current;
    }, null);

    const activeBenchmarks = useMemo(() => {
        if (!designHasContainers) {
            return [] as BenchmarkDefinition[];
        }

        const designEntries = Array.from(designStats.typeMap.values());
        const designKeys = new Set(Array.from(designStats.typeMap.keys()));
        const claimed = new Set<string>();
        const results: BenchmarkDefinition[] = [];

        WASTE_BENCHMARKS.forEach((def) => {
            const targets = [def.key, ...def.aliases].map(normalizeWasteTypeKey);
            if (targets.some(target => designKeys.has(target))) {
                results.push(def);
                targets.forEach(target => claimed.add(target));
            }
        });

        designEntries.forEach((entry) => {
            const normalizedKey = entry.key || normalizeWasteTypeKey(entry.displayName) || `typ-${entry.displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            if (!claimed.has(normalizedKey)) {
                results.push({
                    key: normalizedKey,
                    label: entry.displayName,
                    benchmark: 30,
                    aliases: [],
                });
                claimed.add(normalizedKey);
            }
        });

        return results;
    }, [designHasContainers, designStats]);

    const containerStatsDescription = designHasContainers ? (
        <div className="grid gap-1.5 text-[12px] leading-snug text-gray-500">
            <div className="flex items-center justify-between gap-2">
                <span>Fraktioner</span>
                <span className="font-semibold text-gray-900">{designStats.typeMap.size}</span>
            </div>
            {averageFrequencyAll != null && (
                <div className="flex items-center justify-between gap-2">
                    <span>Genomsnittlig tömning</span>
                    <span className="font-semibold text-gray-900">{formatNumber(averageFrequencyAll, { maximumFractionDigits: 1 })} ggr/år</span>
                </div>
            )}
            {dominantCostRow && dominantCostRow.costPercentage != null && (
                <div className="flex items-center justify-between gap-2">
                    <span>Största kostnad</span>
                    <span className="font-semibold text-gray-900">{dominantCostRow.displayName} ({formatPercentage(dominantCostRow.costPercentage)})</span>
                </div>
            )}
        </div>
    ) : (
        <div className="text-[12px] leading-snug text-gray-500">
            Lägg till kärl i ritningen för att se hur kostnaderna fördelas mellan fraktioner.
        </div>
    );

    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-black tracking-tight text-nsr-teal">Kostnader och jämförelse</h2>
                </div>
                <InfoTooltip text="Se hur ditt miljörum står sig mot liknande fastigheter i samma kommun." />
            </div>

            {comparisonLoading && (
                <div className="py-4">
                    <LoadingBar message="Hämtar jämförelsedata..." />
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
                        <div className="grid auto-rows-fr gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                            <SummaryStat
                            title="Årlig kostnad"
                            value={formatCurrency(propertyCostValue)}
                            tone={costTone}
                            size="compact"
                            badge={<TrendBadge trend={costTrend} size="compact">{TREND_CONFIG[costTrend].label}</TrendBadge>}
                            description={(
                                <div className="grid gap-1.5 text-[12px] leading-snug text-gray-500">
                                    <div className="flex items-center justify-between gap-2">
                                        <span>Snitt i gruppen</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(costAverage)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span>Per lägenhet</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(costPerApartment)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 pt-0.5">
                                        <span>Avvikelse</span>
                                        <span className="font-semibold text-gray-900">{costGapSummary}</span>
                                    </div>
                                </div>
                            )}
                            />

                            <SummaryStat
                            title="Total kärlvolym"
                            value={totalVolumeLabel}
                            tone={containerTone}
                            size="compact"
                            badge={<TrendBadge trend={containerTrend} size="compact">{containerLabel}</TrendBadge>}
                            description={(
                                <div className="grid gap-1.5 text-[12px] leading-snug text-gray-500">
                                    <div className="flex items-center justify-between gap-2">
                                        <span>Snitt i gruppen</span>
                                        <span className="font-semibold text-gray-900">{containerAverageVolume != null ? `${formatNumber(containerAverageVolume, { maximumFractionDigits: 0 })} L` : "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span>Avvikelse</span>
                                        <span className="font-semibold text-gray-900">{containerGapSummary}</span>
                                    </div>
                                </div>
                            )}
                            />

                            <SummaryStat
                            title="Kärlöversikt"
                            value={designHasContainers ? `${designStats.containerCount} kärl` : "Inga kärl"}
                            tone={designHasContainers ? "neutral" : "negative"}
                            size="compact"
                            description={containerStatsDescription}
                            />

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
                        </div>
                    </section>

                    <section className={`${PANEL_SECTION_CLASS} lg:col-span-2`}>
                        <h3 className="text-sm font-semibold text-gray-800">Riktmärken per lägenhet (liter/vecka)</h3>
                        <p className="mt-1 text-xs text-gray-500">
                            Grön markering betyder att ni ligger inom NSR:s rekommendation. Gränsvärdena utgår från den mängd respektive fraktion bör ligga på för att miljörummet ska klassas som resurseffektivt.
                        </p>

                        <div className="mt-3 grid auto-rows-fr gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
                            {activeBenchmarks.length === 0 && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 text-xs text-gray-500">
                                    Lägg till fraktioner i ritningen för att se riktmärken per lägenhet.
                                </div>
                            )}
                            {activeBenchmarks.map((def) => {
                                const row = findRowForBenchmark(def, combinedRows);
                                const propertyValue = row?.propertyPerWeek ?? null;
                                const averageValue = row?.averagePerWeek ?? null;
                                const hasData = designHasContainers && propertyValue != null;
                                const withinTarget = hasData && propertyValue <= def.benchmark;
                                const status: BenchmarkStatus = !hasData
                                    ? "missing"
                                    : withinTarget
                                        ? "within"
                                        : "over";
                                const {
                                    label: statusLabel,
                                    className: statusClassName,
                                    Icon: StatusIcon,
                                    tone: statusTone,
                                } = BENCHMARK_STATUS_STYLES[status];

                                return (
                                    <SummaryStat
                                        key={def.key}
                                        title={def.label}
                                        value={hasData ? formatLitersPerWeek(propertyValue) : "—"}
                                        tone={statusTone}
                                        size="compact"
                                        badge={(
                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-semibold uppercase tracking-tight ${statusClassName}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {statusLabel}
                                            </span>
                                        )}
                                        description={(
                                            <div className="flex h-full flex-col justify-end gap-1.5 text-[12px]">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-gray-500">Snitt i gruppen</span>
                                                    <span className="text-[12px] font-semibold text-gray-900">{formatLitersPerWeek(averageValue)}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-gray-500">Riktmärke</span>
                                                    <span className="text-[12px] font-semibold text-gray-900">{def.benchmark} L</span>
                                                </div>
                                                {hasData ? (
                                                    <>
                                                        <BenchmarkBar className="mt-1" value={propertyValue} benchmark={def.benchmark} />
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="text-gray-500">Avvikelse</span>
                                                            <span className="text-[12px] font-semibold text-gray-900">{formatPercentage(row?.wasteDiff ?? null)}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="text-[12px] text-gray-500">Lägg till kärl i ritningen för att se riktmärket.</p>
                                                )}
                                            </div>
                                        )}
                                    />
                                );
                            })}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

type WasteTypeComparisonPanelProps = {
    comparisonData: PropertyComparison | null;
    comparisonLoading: boolean;
    comparisonError: string | null;
    selectedProperty: Property | null;
    containersInRoom: ContainerInRoom[];
};

export function WasteTypeComparisonPanel({
    comparisonData,
    comparisonLoading,
    comparisonError,
    selectedProperty,
    containersInRoom,
}: WasteTypeComparisonPanelProps) {
    const apartments = comparisonData?.numberOfApartments ?? selectedProperty?.numberOfApartments ?? 0;
    const safeApartments = apartments > 0 ? apartments : 1;

    const designStats = useMemo(() => buildDesignStats(containersInRoom), [containersInRoom]);
    const designHasContainers = designStats.containerCount > 0;

    const wasteComparisonMap = useMemo(() => mapWasteComparisons(comparisonData), [comparisonData]);
    const frequencyComparisonMap = useMemo(() => mapFrequencyComparisons(comparisonData), [comparisonData]);

    const combinedRows = useMemo(() => buildCombinedRows({
        designStats,
        wasteComparisonMap,
        frequencyComparisonMap,
        safeApartments,
    }), [designStats, wasteComparisonMap, frequencyComparisonMap, safeApartments]);

    const hasComparison = Boolean(comparisonData);

    return (
        <section className={`${PANEL_SECTION_CLASS} w-full`}>
            <div className="flex flex-col gap-1">
                <h2 className="text-base font-bold text-gray-900">Jämförelse per avfallstyp</h2>
                <p className="text-xs text-gray-500">
                    Visar kostnader, volym och hämtningsfrekvens jämfört med fastigheter med liknande förutsättningar.
                </p>
            </div>

            {comparisonLoading && (
                <div className="mt-6">
                    <LoadingBar message="Hämtar jämförelsedata..." />
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

            {!comparisonLoading && !comparisonError && hasComparison && designHasContainers && combinedRows.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50/80 text-sm uppercase tracking-wide text-gray-500">
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
                                    <td className="py-2 pr-4 text-sm font-medium text-gray-800">{row.displayName}</td>
                                    <td className="py-2 pr-4 text-sm">
                                        {row.totalCost != null ? (
                                            <div className="flex flex-col">
                                                <span className="text-base font-semibold text-gray-900">{formatCurrency(row.totalCost)}</span>
                                                {row.costPercentage != null && (
                                                    <span className="text-sm text-gray-500">{formatPercentage(row.costPercentage)}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="py-2 pr-4 text-sm font-medium text-gray-800">{row.containerCount != null ? row.containerCount : "—"}</td>
                                    <td className="py-2 pr-4 text-sm">
                                        {row.propertyFrequency != null || row.averageFrequency != null ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col">
                                                    {row.propertyFrequency != null && (
                                                        <span className="text-sm text-gray-800">
                                                            {formatNumber(row.propertyFrequency, { maximumFractionDigits: 1 })} ggr/år
                                                        </span>
                                                    )}
                                                    {row.averageFrequency != null && (
                                                        <span className="text-sm text-gray-500">
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
                                    <td className="py-2 pr-4 text-sm font-medium text-gray-800">{formatVolume(row.propertyAnnualVolume)}</td>
                                    <td className="py-2 pr-4 text-sm font-medium text-gray-800">{formatLitersPerWeek(row.propertyPerWeek)}</td>
                                    <td className="py-2 pr-4 text-sm font-medium text-gray-800">{formatLitersPerWeek(row.averagePerWeek)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
