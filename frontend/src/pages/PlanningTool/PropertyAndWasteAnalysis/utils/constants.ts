import type { BenchmarkDefinition, CarbonSavingDefinition, Trend, SummaryTone, SummarySize, TrendBadgeSize, BenchmarkStatus } from "./types";
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle } from "lucide-react";

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
    better: { label: "Lägre än snittet", className: "bg-emerald-100 text-emerald-700 border border-emerald-200", Icon: TrendingDown },
    equal: { label: "I nivå med snittet", className: "bg-blue-100 text-blue-700 border border-blue-200", Icon: Minus },
    worse: { label: "Högre än snittet", className: "bg-amber-100 text-amber-700 border border-amber-200", Icon: TrendingUp },
};

export const PANEL_SECTION_CLASS = "rounded-3xl border border-gray-100 bg-white/95 shadow-lg backdrop-blur-sm p-5";

export const SUMMARY_TONE_STYLES: Record<SummaryTone, { title: string; value: string }> = {
    positive: { title: "text-emerald-700", value: "text-emerald-900" },
    neutral: { title: "text-gray-600", value: "text-gray-900" },
    negative: { title: "text-amber-700", value: "text-amber-900" },
};

export const SUMMARY_SIZE_STYLES: Record<SummarySize, { container: string; headerGap: string; title: string; value: string; description: string }> = {
    default: { container: "gap-2 p-3", headerGap: "gap-3", title: "text-[11px]", value: "text-xl", description: "text-[11px] leading-relaxed" },
    compact: { container: "gap-1.5 p-2", headerGap: "gap-2", title: "text-[13px]", value: "text-sm", description: "text-[13px] leading-snug" },
};

export const BENCHMARK_STATUS_STYLES: Record<BenchmarkStatus, { label: string; className: string; Icon: typeof CheckCircle; tone: SummaryTone }> = {
    missing: { label: "Kärl saknas", className: "border-gray-200 bg-gray-100 text-gray-500", Icon: Minus, tone: "neutral" },
    within: { label: "Grön flagga", className: "border-emerald-200 bg-emerald-100 text-emerald-700", Icon: CheckCircle, tone: "positive" },
    over: { label: "Över riktmärket", className: "border-amber-200 bg-amber-100 text-amber-700", Icon: AlertCircle, tone: "negative" },
};

export const TREND_BADGE_SIZE_STYLES: Record<TrendBadgeSize, { wrapper: string; icon: string }> = {
    default: { wrapper: "gap-1 px-2.5 py-1 text-xs", icon: "h-3.5 w-3.5" },
    compact: { wrapper: "gap-1 px-2 py-0.5 text-[12px]", icon: "h-3 w-3" },
};
