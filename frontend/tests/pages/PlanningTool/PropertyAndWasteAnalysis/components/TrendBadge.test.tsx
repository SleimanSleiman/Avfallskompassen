import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrendBadge from '../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/components/TrendBadge';
import { TREND_CONFIG, TREND_BADGE_SIZE_STYLES } from '../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/constants';
import type { TrendBadgeSize } from '../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/types';
import React from 'react';

vi.mock('../../../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/utils/constants', async () => {
    const MockIcon = ({ className }: { className?: string }) => (
        <span data-testid="mock-icon" className={className} />
    );

    return {
        TREND_CONFIG: {
            UP: { className: 'up-trend', Icon: MockIcon },
            DOWN: { className: 'down-trend', Icon: MockIcon },
            FLAT: { className: 'flat-trend', Icon: MockIcon },
        },
        TREND_BADGE_SIZE_STYLES: {
            small: { wrapper: 'small-wrapper', icon: 'small-icon' },
            default: { wrapper: 'default-wrapper', icon: 'default-icon' },
            large: { wrapper: 'large-wrapper', icon: 'large-icon' },
        },
    };
});

describe('TrendBadge', () => {
    const trends = Object.keys(TREND_CONFIG) as Array<keyof typeof TREND_CONFIG>;
    const sizes: TrendBadgeSize[] = ['small', 'default', 'large'];

    it('renders children correctly', () => {
        render(<TrendBadge trend={trends[0]}>Test Label</TrendBadge>);
        expect(screen.getByText('Test Label')).toBeDefined();
    });

    it('applies correct trend class and renders icon', () => {
        trends.forEach((trend) => {
        const { container, unmount } = render(
            <TrendBadge trend={trend}>Label</TrendBadge>
        );
        const span = container.querySelector('span');
            expect(span).toHaveClass('trendbadge-style');
            expect(span).toHaveClass(TREND_CONFIG[trend].className);
            expect(screen.getByTestId('mock-icon')).toBeDefined();
            unmount();
        });
    });

    it('applies correct size styles', () => {
        sizes.forEach((size) => {
            const { container, unmount } = render(
                <TrendBadge trend={trends[0]} size={size}>Label</TrendBadge>
            );
            const span = container.querySelector('span');
            expect(span).toHaveClass(TREND_BADGE_SIZE_STYLES[size].wrapper);
            expect(screen.getByTestId('mock-icon')).toHaveClass(
                TREND_BADGE_SIZE_STYLES[size].icon
            );
            unmount();
        });
    });

    it('defaults to "default" size when size prop is not provided', () => {
        const { container } = render(
            <TrendBadge trend={trends[0]}>Label</TrendBadge>
        );
        const span = container.querySelector('span');
        expect(span).toHaveClass(TREND_BADGE_SIZE_STYLES.default.wrapper);
    });
});
