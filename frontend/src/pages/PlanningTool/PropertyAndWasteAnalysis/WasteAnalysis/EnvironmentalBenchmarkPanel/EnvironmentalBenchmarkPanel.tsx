import type { CombinedRow } from "../../utils/types";
import type { ContainerInRoom } from "../../../Types";
import SummaryStat from "../components/SummaryStat";
import BenchmarkBar from "./components/BenchmarkBar";
import { BENCHMARK_STATUS_STYLES, WASTE_BENCHMARKS } from "../../utils/constants"
import { findRowForBenchmark } from "../../utils/builders"
import { formatLitersPerWeek } from "../../utils/utils";
import '../css/benchmarkPanel.css'

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
        <section className="benchmark-section-wrapper">
            <h3 className="benchmark-panel-title">Riktmärken per lägenhet (liter/vecka)</h3>
            <p className="benchmark-panel-description">
                Grön markering betyder att ni ligger inom NSR:s rekommendation. Gränsvärdena utgår från den mängd respektive fraktion bör ligga på för att miljörummet ska klassas som resurseffektivt.
            </p>

            <div className="benchmark-grid">
                {activeBenchmarks.length === 0 && (
                    <div className="benchmark-empty">
                        Lägg till fraktioner i ritningen för att se riktmärken per lägenhet.
                    </div>
                )}

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

                    return (
                        <SummaryStat
                            key={def.key}
                            title={def.label}
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
                                    <div className="benchmark-row">
                                        <span className="benchmark-row-label">Snitt i gruppen</span>
                                        <span className="benchmark-row-value">{formatLitersPerWeek(averageValue)}</span>
                                    </div>
                                    <div className="benchmark-row">
                                        <span className="benchmark-row-label">Riktmärke</span>
                                        <span className="benchmark-row-value">{def.benchmark} L</span>
                                    </div>

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