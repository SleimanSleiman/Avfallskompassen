import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WasteTable from '../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/PropertyOverview/WasteTypeSummaryPanel/components/WasteTable';
import TrendBadge from '../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/components/TrendBadge';
import * as utils from '../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/utils';
import React from 'react';

vi.mock('../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/utils', () => ({
    formatCurrency: vi.fn((val) => `$${val}`),
    formatPercentage: vi.fn((val) => `${val * 100}%`),
    formatNumber: vi.fn((val) => val.toString()),
    formatVolume: vi.fn((val) => `${val} m³`),
    formatLitersPerWeek: vi.fn((val) => `${val} L/vecka`),
}));

vi.mock('../../../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/components/TrendBadge', () => ({
    default: ({ children }: any) => <span data-testid="trend-badge">{children}</span>,
}));

describe('WasteTable', () => {
    const rows = [
        {
            key: 'plastic',
            displayName: 'Plastic',
            totalCost: 123,
            costPercentage: 0.2,
            containerCount: 5,
            propertyFrequency: 10,
            averageFrequency: 8,
            frequencyDiff: 0.1,
            frequencyTrend: 'UP',
            propertyAnnualVolume: 50,
            propertyPerWeek: 2,
            averagePerWeek: 1.5,
        },
        {
            key: 'metal',
            displayName: 'Metal',
            totalCost: null,
            costPercentage: null,
            containerCount: null,
            propertyFrequency: null,
            averageFrequency: null,
            frequencyDiff: null,
            frequencyTrend: null,
            propertyAnnualVolume: 30,
            propertyPerWeek: 1,
            averagePerWeek: 0.8,
        },
    ];

    it('renders table headers correctly', () => {
        render(<WasteTable rows={rows} />);
        expect(screen.getByText('Avfallstyp')).toBeDefined();
        expect(screen.getByText('Kostnad (andel)')).toBeDefined();
        expect(screen.getByText('Antal kärl')).toBeDefined();
    });

    it('renders formatted cost and percentage', () => {
        render(<WasteTable rows={rows} />);
        expect(screen.getByText('$123')).toBeDefined();
        expect(screen.getByText('20%')).toBeDefined();
    });

    it('renders placeholders for missing values', () => {
        render(<WasteTable rows={rows} />);
        const emptyCells = screen.getAllByText('—');
        expect(emptyCells.length).toBeGreaterThanOrEqual(3);
    });

    it('renders TrendBadge for frequencyDiff', () => {
        render(<WasteTable rows={rows} />);
        expect(screen.getByTestId('trend-badge')).toHaveTextContent('10%');
    });

    it('renders formatted volumes and liters per week', () => {
        render(<WasteTable rows={rows} />);
        expect(screen.getByText('50 m³')).toBeDefined();
        expect(screen.getByText('2 L/vecka')).toBeDefined();
        expect(screen.getByText('1.5 L/vecka')).toBeDefined();
    });
});
