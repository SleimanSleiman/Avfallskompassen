import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PropertyOverviewPanel from '../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/PropertyOverview/PropertyOverviewPanel';
import WasteTypeSummaryPanel from '../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/PropertyOverview/WasteTypeSummaryPanel/WasteTypeSummaryPanel';
import React from 'react';
import { MapPin, Home, Users } from 'lucide-react';

vi.mock('../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/PropertyOverview/WasteTypeSummaryPanel/WasteTypeSummaryPanel', () => ({
    default: ({ comparisonData }: any) => <div data-testid="summary-panel">{comparisonData?.numberOfApartments}</div>,
}));

describe('PropertyOverviewPanel', () => {
    const highlights = [
        { key: 'apartments', Icon: Home, title: 'Apartments', value: 10, tone: 'neutral', helper: 'Total apartments' },
        { key: 'rooms', Icon: MapPin, title: 'Rooms', value: 5, tone: 'positive' },
        { key: 'users', Icon: Users, title: 'Users', value: 20, tone: 'negative', helper: 'Active users' },
    ];

    const defaultProps = {
        propertyHighlights: highlights,
        comparisonData: { numberOfApartments: 10 } as any,
        comparisonLoading: false,
        comparisonError: null,
        selectedProperty: null,
        containersInRoom: [],
    };

    it('renders all property highlights', () => {
        render(<PropertyOverviewPanel {...defaultProps} />);
        highlights.forEach(h => {
            const card = screen.getByText(h.title).closest('.overview-card');
            expect(card).toBeDefined();
            expect(card).toHaveTextContent(h.value.toString());
            if (h.helper) {
                expect(card).toHaveTextContent(h.helper);
            }
        });
    });

    it('renders WasteTypeSummaryPanel with correct props', () => {
        render(<PropertyOverviewPanel {...defaultProps} />);
        expect(screen.getByTestId('summary-panel')).toHaveTextContent('10');
    });
});
