/**
 * EnvironmentalBenchmarkPanel component
 * Displays per-apartment waste benchmarks with status badges and comparison to averages.
 */
import type { CombinedRow } from "../../utils/Types";
import SummaryStat from "../components/SummaryStat";
import BenchmarkBar from "./components/BenchmarkBar";
import { BENCHMARK_STATUS_STYLES, BENCHMARK_TITLE_STYLES } from "../../utils/Constants"
import { findRowForBenchmark } from "../../utils/Builders"
import { formatLitersPerWeek, normalizeWasteTypeKey } from "../../utils/Utils";
import '../css/benchmarkPanel.css'

type EnvironmentalBenchmarkPanelProps = {
    designStats: ReturnType<typeof buildDesignStats>;
    combinedRows: CombinedRow[];
    activeBenchmarks: BenchmarkDefinition[];
    designHasContainers: boolean;
};

export default function EnvironmentalBenchmarkPanel({
    designStats,
    combinedRows,
    activeBenchmarks,
    designHasContainers,
}: EnvironmentalBenchmarkPanelProps) {
    return (
        <section className="benchmark-section-wrapper">
            <h3 className="benchmark-panel-title">Riktmärken per lägenhet (liter/vecka)</h3>
            <p className="benchmark-panel-description">
                Grön markering betyder att ni ligger inom NSR:s rekommendation. Gränsvärdena utgår från den mängd respektive fraktion bör ligga på för att miljörummet ska klassas som resurseffektivt.
            </p>

            <div className="benchmark-grid">
                {/*No active benchmarks message*/}
                {activeBenchmarks.length === 0 && (
                    <div className="benchmark-empty">
                        Lägg till fraktioner i ritningen för att se riktmärken per lägenhet.
                    </div>
                )}

                {/*Render each benchmark*/}
                {activeBenchmarks.map((def) => {
                    const row = findRowForBenchmark(def, combinedRows);
                    const propertyValue = row?.propertyPerWeek ?? null;
                    const averageValue = row?.averagePerWeek ?? null;
                    const hasData = designHasContainers && propertyValue != null;
                    const withinTarget = hasData && propertyValue <= def.benchmark;

                    const status = !hasData ? "missing" : withinTarget ? "within" : "over";
                    const {
                        label: statusLabel,
                        className: statusClassName,
                        Icon: StatusIcon,
                        tone: statusTone,
                    } = BENCHMARK_STATUS_STYLES[status];

                    const normalizedKey = normalizeWasteTypeKey(def.key);
                    const titleClass = BENCHMARK_TITLE_STYLES[normalizedKey] ?? "text-gray-900";

                    return (
                        <SummaryStat
                            key={def.key}
                            title={<span className={titleClass}>{def.label}</span>}
                            value={hasData ? formatLitersPerWeek(propertyValue) : "—"}
                            tone={statusTone}
                            size="compact"
                            badge={
                                <span className={`benchmark-badge ${statusClassName}`}>
                                    <StatusIcon className="benchmark-icon" />
                                    {statusLabel}
                                </span>
                            }
                            description={
                                <div className="benchmark-description">
                                    {/*Average and benchmark values*/}
                                    <div className="benchmark-row">
                                        <span className="benchmark-row-label">Snitt i gruppen</span>
                                        <span className="benchmark-row-value">{formatLitersPerWeek(averageValue)}</span>
                                    </div>
                                    <div className="benchmark-row">
                                        <span className="benchmark-row-label">Riktmärke</span>
                                        <span className="benchmark-row-value">{def.benchmark} L</span>
                                    </div>

                                    {/*Benchmark bar and deviation if data exists*/}
                                    {hasData ? (
                                        <>
                                            <BenchmarkBar
                                                className="benchmark-bar-wrapper"
                                                value={propertyValue}
                                                benchmark={def.benchmark}
                                            />
                                            <div className="benchmark-row">
                                                <span className="benchmark-row-label">Avvikelse</span>
                                                <span className="benchmark-row-value">{row?.wasteDiff ?? "—"}</span>
                                            </div>
                                        </>
                                    ) : (
                                        //Message if no container data
                                        <p className="benchmark-row-label">
                                            Lägg till kärl i ritningen för att se riktmärket.
                                        </p>
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