/**
 * Type definitions
 * Defines trends, summaries, benchmarks, container stats, and table rows.
 */

 //Trend values for comparisons
export type Trend = "better" | "none"| "equal" | "worse";

//Summary tone for display (positive, neutral, negative)
export type SummaryTone = "positive" | "neutral" | "negative";

//Summary display sizes
export type SummarySize = "default" | "compact";

//Status of a benchmark
export type BenchmarkStatus = "missing" | "within" | "over";

//Size variants for trend badges
export type TrendBadgeSize = "default" | "compact";

//Definition of a waste benchmark
export type BenchmarkDefinition = {
    key: string;
    label: string;
    benchmark: number;
    aliases: string[];
};

//Definition for CO2 saving per waste type
export type CarbonSavingDefinition = {
    key: string;
    label: string;
    kgPerLiter: number;
    aliases: string[];
};

//Aggregated stats for a specific waste type
export type DesignTypeStats = {
    key: string;
    displayName: string;
    totalAnnualVolume: number;
    totalNominalVolume: number;
    totalFrequency: number;
    containerCount: number;
    totalCost: number;
};

//Overall design stats for all containers in a room
export type DesignStats = {
    totalCost: number;
    totalNominalVolume: number;
    containerCount: number;
    typeMap: Map<string, DesignTypeStats>;
};

//Combined row for rendering table data with comparisons
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
