/**
 * Utility functions
 * General helpers for formatting, trend calculation, and per-apartment computations.
 */
import type { Trend } from "./Types";
import { WEEK_PER_YEAR } from "./Constants"

//Normalize a string to a consistent key for waste type comparison
export function normalizeWasteTypeKey(value?: string) {
    if (!value) return "";
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

//Determine trend based on percentage and optional tolerance
export function getTrend(percentage?: number | null, tolerance = 5): Trend {
    if (percentage == null || Number.isNaN(percentage)) return "equal";
    if (percentage <= -Math.abs(tolerance)) return "better";
    if (percentage >= Math.abs(tolerance)) return "worse";
    return "equal";
}

//Calculate percentage difference between value and average
export function calculatePercentageDifference(value?: number | null, average?: number | null) {
    if (
        value == null || Number.isNaN(value) ||
        average == null || Number.isNaN(average) ||
        average === 0
    ) {
        return null;
    }
    return ((value - average) / average) * 100;
}

//Format number with optional Intl.NumberFormatOptions
export function formatNumber(value?: number | null, options: Intl.NumberFormatOptions = {}) {
    if (value == null || Number.isNaN(value)) return "—";
    return Number(value).toLocaleString("sv-SE", { maximumFractionDigits: 1, ...options });
}

//Format number with sign display (except zero)
export function formatNumberSigned(value?: number | null, options: Intl.NumberFormatOptions = {}) {
    if (value == null || Number.isNaN(value)) return "—";
    return Number(value).toLocaleString("sv-SE", { maximumFractionDigits: 1, signDisplay: "exceptZero", ...options });
}

//Format number as SEK currency
export function formatCurrency(value?: number | null) {
    if (value == null || Number.isNaN(value)) return "—";
    return Number(value).toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 });
}

//Format currency with sign display
export function formatCurrencySigned(value?: number | null) {
    if (value == null || Number.isNaN(value)) return "—";
    return Number(value).toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0, signDisplay: "exceptZero" });
}

//Format liters per apartment per week
export function formatLitersPerWeek(value?: number | null) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }
    return `${Math.round(value)} L / lägenhet · vecka`;
}

//Format volume in liters
export function formatVolume(value?: number | null) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }
    return `${formatNumber(value, { maximumFractionDigits: 0 })} L`;
}

//Format CO2 emissions in kg or tons
export function formatCo2(value?: number | null) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }

    const absolute = Math.abs(value);
    if (absolute >= 1000) {
        return `${Number(value / 1000).toLocaleString("sv-SE", { maximumFractionDigits: 1 })} ton CO₂e`;
    }

    return `${Number(value).toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kg CO₂e`;
}

//Format percentage
export function formatPercentage(value?: number | null) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }
    return `${Number(value).toLocaleString("sv-SE", { maximumFractionDigits: 1 })}%`;
}

//Format percentage with sign
export function formatPercentageSigned(value?: number | null) {
    if (value == null || Number.isNaN(value)) {
        return "—";
    }
    return `${Number(value).toLocaleString("sv-SE", {
        maximumFractionDigits: 1,
        signDisplay: "exceptZero",
    })}%`;
}

//Compute value per apartment per week, safe against zero apartments
export function computePerApartmentPerWeek(amount?: number | null, apartments?: number | null) {
    if (amount == null || Number.isNaN(amount)) {
        return null;
    }
    const safeApartments = apartments && apartments > 0 ? apartments : 1;
    return amount / WEEK_PER_YEAR / safeApartments;
}