import {
    formatCurrency,
    formatPercentage,
    formatNumber,
    formatVolume,
    formatLitersPerWeek,
} from "../../../utils/utils";
import TrendBadge from "../../../components/TrendBadge";

export default function WasteTable({ rows }) {
    return (
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
                    {rows.map((row) => (
                        <tr key={row.key} className="odd:bg-gray-50/40">
                            <td className="py-2 pr-4 text-sm font-medium text-gray-800">
                                {row.displayName}
                            </td>

                            <td className="py-2 pr-4 text-sm">
                                {row.totalCost != null ? (
                                    <div className="flex flex-col">
                                        <span className="text-base font-semibold text-gray-900">
                                            {formatCurrency(row.totalCost)}
                                        </span>
                                        {row.costPercentage != null && (
                                            <span className="text-sm text-gray-500">
                                                {formatPercentage(row.costPercentage)}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>

                            <td className="py-2 pr-4 text-sm font-medium text-gray-800">
                                {row.containerCount ?? "—"}
                            </td>

                            <td className="py-2 pr-4 text-sm">
                                {row.propertyFrequency != null ||
                                row.averageFrequency != null ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            {row.propertyFrequency != null && (
                                                <span className="text-sm text-gray-800">
                                                    {formatNumber(row.propertyFrequency, {
                                                        maximumFractionDigits: 1,
                                                    })}{" "}
                                                    ggr/år
                                                </span>
                                            )}
                                            {row.averageFrequency != null && (
                                                <span className="text-sm text-gray-500">
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
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>

                            <td className="py-2 pr-4 text-sm font-medium text-gray-800">
                                {formatVolume(row.propertyAnnualVolume)}
                            </td>

                            <td className="py-2 pr-4 text-sm font-medium text-gray-800">
                                {formatLitersPerWeek(row.propertyPerWeek)}
                            </td>

                            <td className="py-2 pr-4 text-sm font-medium text-gray-800">
                                {formatLitersPerWeek(row.averagePerWeek)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
