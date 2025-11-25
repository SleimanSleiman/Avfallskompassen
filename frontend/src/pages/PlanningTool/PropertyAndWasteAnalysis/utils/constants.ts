import type { BenchmarkDefinition, CarbonSavingDefinition, Trend, SummaryTone, SummarySize, TrendBadgeSize, BenchmarkStatus } from "./types";
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle } from "lucide-react";
import '../css/constants.css'

export const WEEK_PER_YEAR = 52;

export const WASTE_BENCHMARKS: BenchmarkDefinition[] = [
    { key: "restavfall", label: "Restavfall", benchmark: 30, aliases: ["rest"] },
    { key: "pappersforpackningar", label: "Pappersförpackningar", benchmark: 30, aliases: ["kartong", "pappersinsamling"] },
    { key: "plastforpackningar", label: "Plastförpackningar", benchmark: 30, aliases: ["plast", "plastinsamling"] },
];

export const CO2_SAVING_DEFINITIONS: CarbonSavingDefinition[] = [
    { key: "pappersforpackningar", label: "Pappersförpackningar", kgPerLiter: 0.35, aliases: ["kartong", "pappersinsamling"] },
    { key: "plastforpackningar", label: "Plastförpackningar", kgPerLiter: 1.2, aliases: ["plast", "plastinsamling"] },
    { key: "metallforpackningar", label: "Metallförpackningar", kgPerLiter: 2.6, aliases: ["metall", "metallinsamling"] },
    { key: "glasforpackningar", label: "Glasförpackningar", kgPerLiter: 0.2, aliases: ["glas", "glasinsamling", "ofargatglas", "fargatglas"] },
    { key: "matavfall", label: "Matavfall", kgPerLiter: 0.45, aliases: ["organiskt", "bioavfall", "kok"] },
    { key: "tidningar", label: "Tidningar", kgPerLiter: 0.3, aliases: ["returpapper", "papper"] },
    { key: "restavfall", label: "Restavfall", kgPerLiter: 0.06, aliases: ["rest"] },
];

export const TREND_CONFIG: Record<Trend, { label: string; className: string; Icon: typeof TrendingUp }> = {
    better: { label: "Lägre än snittet", className: "trend-config-better", Icon: TrendingDown },
    equal: { label: "I nivå med snittet", className: "trend-config-equal", Icon: Minus },
    worse: { label: "Högre än snittet", className: "trend-config-worse", Icon: TrendingUp },
};

export const SUMMARY_TONE_STYLES: Record<SummaryTone, { title: string; value: string }> = {
    positive: { title: "summary-tone-positive-title", value: "summary-tone-positive-value" },
    neutral: { title: "summary-tone-neutral-title", value: "summary-tone-neutral-value" },
    negative: { title: "summary-tone-negative-title", value: "summary-tone-negative-value" },
};

export const SUMMARY_SIZE_STYLES: Record<SummarySize, { container: string; headerGap: string; title: string; value: string; description: string }> = {
    default: { container: "summary-size-default-container", headerGap: "summary-size-default-headerGap", title: "text-[11px]", value: "summary-size-default-value", description: "summary-size-default-description" },
    compact: { container: "summary-size-compact-container", headerGap: "summary-size-compact-headerGap", title: "summary-size-compact-title", value: "summary-size-compact-value", description: "summary-size-compact-description" },
};

export const BENCHMARK_STATUS_STYLES: Record<BenchmarkStatus, { label: string; className: string; Icon: typeof CheckCircle; tone: SummaryTone }> = {
    missing: { label: "Kärl saknas", className: "benchmark-status-missing", Icon: Minus, tone: "neutral" },
    within: { label: "Grön flagga", className: "benchmark-status-within", Icon: CheckCircle, tone: "positive" },
    over: { label: "Över riktmärket", className: "benchmark-status-over", Icon: AlertCircle, tone: "negative" },
};

export const TREND_BADGE_SIZE_STYLES: Record<TrendBadgeSize, { wrapper: string; icon: string }> = {
    default: { wrapper: "trend-badge-default-wrapper", icon: "trend-badge-default-icon" },
    compact: { wrapper: "trend-badge-compact-wrapper", icon: "trend-badge-compact-icon" },
};
