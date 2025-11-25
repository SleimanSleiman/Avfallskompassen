import { MapPin, Home, Users } from "lucide-react";
import WasteTypeSummaryPanel from './WasteTypeSummaryPanel/WasteTypeSummaryPanel';
import type { Property } from '../../../../lib/Property';
import type { ContainerDTO } from '../../../../lib/Container';
import type { PropertyComparison } from '../../../../lib/Comparison';

export default function PropertyOverviewPanel({
    propertyHighlights,
    comparisonData,
    comparisonLoading,
    comparisonError,
    selectedProperty,
    containersInRoom,
}: Props) {
    return (
        <>
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {propertyHighlights.map(({ key, Icon, title, value, tone, helper }) => (
                        <div key={key} className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-gray-50/60 p-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-nsr-teal shadow-sm">
                                <Icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{title}</p>
                                <p className={`truncate text-sm font-medium leading-tight ${tone}`}>{value}</p>
                                {helper ? (
                                    <p className="text-[11px] text-gray-400">{helper}</p>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                <WasteTypeSummaryPanel
                    comparisonData={comparisonData}
                    comparisonLoading={comparisonLoading}
                    comparisonError={comparisonError}
                    selectedProperty={selectedProperty}
                    containersInRoom={containersInRoom}
                />
            </div>
        </>
    )
}
