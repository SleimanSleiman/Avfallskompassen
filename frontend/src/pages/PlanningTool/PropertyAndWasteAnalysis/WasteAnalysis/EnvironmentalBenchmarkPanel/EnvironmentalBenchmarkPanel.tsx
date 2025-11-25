import type { CombinedRow } from "../../utils/types";
import type { ContainerInRoom } from "../../../Types";
import SummaryStat from "../components/SummaryStat";
import BenchmarkBar from "./components/BenchmarkBar";
import { BENCHMARK_STATUS_STYLES, WASTE_BENCHMARKS } from "../../utils/constants"
import { findRowForBenchmark } from "../../utils/builders"
import { formatLitersPerWeek } from "../../utils/utils";

type EnvironmentalBenchmarkPanelProps = {
    designStats: ReturnType<typeof buildDesignStats>;
    combinedRows: CombinedRow[];
    safeApartments: number;
};

export default function EnvironmentalBenchmarkPanel({
    designStats,
    combinedRows,
}: EnvironmentalBenchmarkPanelProps) {
    const designHasContainers = designStats.containerCount > 0;

    const activeBenchmarks = designHasContainers
        ? WASTE_BENCHMARKS
        : [];

    return (
        <section className="lg:col-span-2">
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
                    const status = !hasData
                        ? "missing"
                        : withinTarget
                        ? "within"
                        : "over";

                    const { label: statusLabel, className: statusClassName, Icon: StatusIcon, tone: statusTone } = BENCHMARK_STATUS_STYLES[status];

                    return (
                        <SummaryStat
                            key={def.key}
                            title={def.label}
                            value={hasData ? formatLitersPerWeek(propertyValue) : "—"}
                            tone={statusTone}
                            size="compact"
                            badge={
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-semibold uppercase tracking-tight ${statusClassName}`}>
                                    <StatusIcon className="h-3 w-3" />
                                    {statusLabel}
                                </span>
                            }
                            description={
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
                                                <span className="text-[12px] font-semibold text-gray-900">{row?.wasteDiff ?? "—"}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-[12px] text-gray-500">Lägg till kärl i ritningen för att se riktmärket.</p>
                                    )}
                                </div>
                            }
                        />
                    );
                })}
            </div>
        </section>
    );
}
