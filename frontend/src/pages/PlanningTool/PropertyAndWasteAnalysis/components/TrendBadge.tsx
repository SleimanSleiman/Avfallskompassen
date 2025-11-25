import React from "react";
import { TREND_CONFIG, TREND_BADGE_SIZE_STYLES } from "../utils/constants";
import type { Trend, TrendBadgeSize } from "../utils/types";
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
