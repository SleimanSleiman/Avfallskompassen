import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WasteTypeComparisonPanel from '../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/PropertyOverview/WasteTypeSummaryPanel/WasteTypeSummaryPanel';
import * as useWasteComparisonHook from '../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/hooks/useWasteComparison';
import WasteTable from '../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/PropertyOverview/WasteTypeSummaryPanel/components/WasteTable';
import React from 'react';

vi.mock('../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/PropertyOverview/WasteTypeSummaryPanel/components/WasteTable', () => ({
    default: ({ rows }: any) => <div data-testid="waste-table">{rows.length}</div>,
}));

describe('WasteTypeSummaryPanel', () => {
    const defaultProps = {
        comparisonData: { numberOfApartments: 10 } as any,
        comparisonLoading: false,
        comparisonError: null,
        selectedProperty: null,
        containersInRoom: [],
    };

    it('renders loading state', () => {
        render(<WasteTypeComparisonPanel {...defaultProps} comparisonLoading />);
        expect(screen.getByText('Hämtar jämförelsedata...')).toBeDefined();
    });

    it('renders error state', () => {
        render(<WasteTypeComparisonPanel {...defaultProps} comparisonError="Error!" />);
        expect(screen.getByText('Kunde inte ladda jämförelsen')).toBeDefined();
        expect(screen.getByText('Error!')).toBeDefined();
    });

    it('renders empty state when no comparison data', () => {
        render(<WasteTypeComparisonPanel {...defaultProps} comparisonData={null} />);
        expect(screen.getByText(/Öppna planeringsverktyget/)).toBeDefined();
    });

    it('renders warning when no containers in design', () => {
        vi.spyOn(useWasteComparisonHook, 'useWasteComparison').mockReturnValue({
            combinedRows: [],
            designHasContainers: false,
        });
        render(<WasteTypeComparisonPanel {...defaultProps} />);
        expect(screen.getByText(/Lägg till kärl i ritningen/)).toBeDefined();
    });

    it('renders empty message when comparison rows are empty', () => {
        vi.spyOn(useWasteComparisonHook, 'useWasteComparison').mockReturnValue({
            combinedRows: [],
            designHasContainers: true,
        });
        render(<WasteTypeComparisonPanel {...defaultProps} />);
        expect(screen.getByText(/Jämförelsedata saknas/)).toBeDefined();
    });

    it('renders WasteTable when data exists', () => {
        vi.spyOn(useWasteComparisonHook, 'useWasteComparison').mockReturnValue({
            combinedRows: [{ key: 'plastic' }],
            designHasContainers: true,
        });
        render(<WasteTypeComparisonPanel {...defaultProps} />);
        expect(screen.getByTestId('waste-table')).toBeDefined();
        expect(screen.getByTestId('waste-table')).toHaveTextContent('1');
    });
});
