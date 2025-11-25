export type Trend = "better" | "equal" | "worse";
export type SummaryTone = "positive" | "neutral" | "negative";
export type SummarySize = "default" | "compact";
export type BenchmarkStatus = "missing" | "within" | "over";
export type TrendBadgeSize = "default" | "compact";

export type BenchmarkDefinition = {
    key: string;
    label: string;
    benchmark: number;
    aliases: string[];
};

export type CarbonSavingDefinition = {
    key: string;
    label: string;
    kgPerLiter: number;
    aliases: string[];
};

export type DesignTypeStats = {
    key: string;
    displayName: string;
    totalAnnualVolume: number;
    totalNominalVolume: number;
    totalFrequency: number;
    containerCount: number;
    totalCost: number;
};

export type DesignStats = {
    totalCost: number;
    totalNominalVolume: number;
    containerCount: number;
    typeMap: Map<string, DesignTypeStats>;
};

export type CombinedRow = {
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
