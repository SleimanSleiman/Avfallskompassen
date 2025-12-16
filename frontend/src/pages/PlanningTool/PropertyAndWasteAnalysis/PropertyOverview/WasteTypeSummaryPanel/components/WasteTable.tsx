/**
 * WasteTable component
 * Renders a table of waste type comparison data, including cost, container count, frequency, and volume.
 */
import {
    formatCurrency,
    formatPercentage,
    formatNumber,
    formatVolume,
    formatLitersPerWeek,
} from "../../../utils/Utils";
import TrendBadge from "../../../components/TrendBadge";
import '../../css/table.css'

export default function WasteTable({ rows }) {
    return (
        <div className="table-wrapper">
            <table className="table">
                <thead className="table-head">
                    <tr>
                        <th className="table-th">Avfallstyp</th>
                        <th className="table-th">Kostnad (andel)</th>
                        <th className="table-th">Antal kärl</th>
                        <th className="table-th">Hämtningsfrekvens</th>
                        <th className="table-th">Årsvolym</th>
                        <th className="table-th">Lgh/vecka</th>
                        <th className="table-th">Snitt (lgh/vecka)</th>
                    </tr>
                </thead>

                <tbody className="table-body">
                    {rows.map((row) => (
                        <tr key={row.key} className="table-row">
                            <td className="table-cell-strong">
                                {row.displayName}
                            </td>

                            {/*Cost and percentage*/}
                            <td className="table-cell">
                                {row.totalCost != null ? (
                                    <div className="table-cell-col">
                                        <span className="table-cost">
                                            {formatCurrency(row.totalCost)}
                                        </span>

                                        {row.costPercentage != null && (
                                            <span className="table-cost-sub">
                                                {formatPercentage(row.costPercentage)}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="table-empty">—</span>
                                )}
                            </td>

                            {/*Container count*/}
                            <td className="table-cell-strong">
                                {row.containerCount ?? "—"}
                            </td>

                            {/*Frequency with trend badge*/}
                            <td className="table-cell">
                                {row.propertyFrequency != null ||
                                row.averageFrequency != null ? (
                                    <div className="table-frequency">
                                        <div className="table-frequency-col">
                                            {row.propertyFrequency != null && (
                                                <span className="table-frequency-primary">
                                                    {formatNumber(row.propertyFrequency, {
                                                        maximumFractionDigits: 1,
                                                    })}{" "}
                                                    ggr/år
                                                </span>
                                            )}

                                            {row.averageFrequency != null && (
                                                <span className="table-frequency-secondary">
                                                    Snitt{" "}
                                                    {formatNumber(row.averageFrequency, {
                                                        maximumFractionDigits: 1,
                                                    })}{" "}
                                                    ggr/år
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
                                    <span className="table-empty">—</span>
                                )}
                            </td>

                            {/*Annual volume*/}
                            <td className="table-cell-strong">
                                {formatVolume(row.propertyAnnualVolume)}
                            </td>

                            {/*Volume per apartment per week*/}
                            <td className="table-cell-strong">
                                {formatLitersPerWeek(row.propertyPerWeek)}
                            </td>

                            {/*Average volume per apartment per week*/}
                            <td className="table-cell-strong">
                                {formatLitersPerWeek(row.averagePerWeek)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
