import React from "react";
import { TREND_CONFIG, TREND_BADGE_SIZE_STYLES } from "../utils/constants";
import type { Trend, TrendBadgeSize } from "../utils/types";

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
            className={`inline-flex flex-wrap items-center justify-center whitespace-normal rounded-full text-center font-semibold shadow-sm ${sizeStyles.wrapper} ${className}`}
        >
            <Icon className={sizeStyles.icon} />
            {children}
        </span>
    );
}
