import { MapPin, Home, Users } from "lucide-react";
import WasteTypeSummaryPanel from './WasteTypeSummaryPanel/WasteTypeSummaryPanel';
import type { Property } from '../../../../lib/Property';
import type { ContainerDTO } from '../../../../lib/Container';
import type { PropertyComparison } from '../../../../lib/Comparison';
import './css/overviewPanel.css'

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
            <div className="overview-wrapper">
                <div className="overview-grid">
                    {propertyHighlights.map(({ key, Icon, title, value, tone, helper }) => (
                        <div key={key} className="overview-card">
                            <span className="overview-icon-wrapper">
                                <Icon className="overview-icon" />
                            </span>
                            <div className="overview-text">
                                <p className="overview-title">{title}</p>
                                <p className={`overview-value ${tone}`}>{value}</p>
                                {helper ? (
                                    <p className="overview-helper">{helper}</p>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="overview-summary-wrapper">
                <WasteTypeSummaryPanel
                    comparisonData={comparisonData}
                    comparisonLoading={comparisonLoading}
                    comparisonError={comparisonError}
                    selectedProperty={selectedProperty}
                    containersInRoom={containersInRoom}
                />
            </div>
        </>
    );
}
