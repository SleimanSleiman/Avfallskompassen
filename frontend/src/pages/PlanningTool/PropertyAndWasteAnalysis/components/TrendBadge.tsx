/**
 * TrendBadge component
 * Displays a badge with a trend icon and label, supports different sizes.
 */
import React from "react";
import { TREND_CONFIG, TREND_BADGE_SIZE_STYLES } from "../utils/Constants";
import type { Trend, TrendBadgeSize } from "../utils/Types";
import '../css/components.css'

type TrendBadgeProps = {
    trend: Trend;
    children: React.ReactNode;
    size?: TrendBadgeSize;
};

export default function TrendBadge({ trend, children, size = "default" }: TrendBadgeProps) {
    const { className, Icon } = TREND_CONFIG[trend];
    const sizeStyles = TREND_BADGE_SIZE_STYLES[size];

    return (
        <span
            className={`trendbadge-style ${sizeStyles.wrapper} ${className}`}
        >
            <Icon className={sizeStyles.icon} />
            {children}
        </span>
    );
}
