/**
 * PropertyOverviewPanel component
 * Displays key property highlights and a waste type summary panel.
 */
import WasteTypeSummaryPanel from './WasteTypeSummaryPanel/WasteTypeSummaryPanel';
import './css/overviewPanel.css'
import type {ContainerInRoom} from "../../lib/Types.ts";
import type {Property} from "../../../../lib/Property.ts";
import type {PropertyComparison} from "../../../../lib/Comparison.ts";
import React from "react";

type IconProps = {
    className?: string;
}

type PropertyHighlight = {
    key: string;
    Icon: React.ComponentType<IconProps>;
    title: string;
    value: string;
    tone?: string;
    helper?: string;
}

type PropertyOverviewPanelProps =  {
    propertyHighlights: PropertyHighlight[];
    comparisonData: PropertyComparison | null;
    comparisonLoading: boolean;
    comparisonError: string | null;
    selectedProperty: Property | null;
    containersInRoom: ContainerInRoom[];
}

export default function PropertyOverviewPanel({
    propertyHighlights,
    comparisonData,
    comparisonLoading,
    comparisonError,
    selectedProperty,
    containersInRoom,
}: PropertyOverviewPanelProps) {
    return (
        <>
            <div id="property-panel" className="overview-wrapper">
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

            <div id="comparison-panel" className="overview-summary-wrapper">
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
