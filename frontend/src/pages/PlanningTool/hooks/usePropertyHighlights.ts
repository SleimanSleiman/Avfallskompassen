// hooks/usePropertyHighlights.ts
import { useMemo } from "react";
import { MapPin, Home, Users } from "lucide-react";
import type { Property } from '../../lib/Property';
import type { PropertyComparison } from '../../lib/Comparison';

export function usePropertyHighlights(
    comparisonData: PropertyComparison | null,
    comparisonLoading: boolean,
    selectedProperty: Property | null
) {
    return useMemo(() => {
        const displayAddress = comparisonData?.address ?? selectedProperty?.address ?? null;
        const apartmentCount = comparisonData?.numberOfApartments ?? selectedProperty?.numberOfApartments ?? null;
        const comparisonGroupSize = comparisonData?.costComparison?.comparisonGroupSize
            ?? comparisonData?.containerSizeComparison?.comparisonGroupSize
            ?? 0;

        const similarPropertiesLabel = comparisonLoading
            ? "Hämtar jämförelsedata..."
            : comparisonData
                ? comparisonGroupSize > 1
                    ? `${comparisonGroupSize} liknande fastigheter i jämförelsen`
                    : comparisonGroupSize === 1
                        ? "1 liknande fastighet i jämförelsen"
                        : "Inga matchande fastigheter i jämförelsen"
                : "Jämförelsedata saknas";

        const formattedApartmentCount = apartmentCount && apartmentCount > 0
            ? apartmentCount.toLocaleString("sv-SE")
            : null;
        const hasComparisonPeers = Boolean(comparisonData) && comparisonGroupSize > 0;

        const propertyHighlights = [
            {
                key: "address",
                title: "Adress",
                value: displayAddress ?? "Ingen fastighet vald",
                Icon: MapPin,
                tone: displayAddress ? "text-gray-900" : "text-gray-400",
                helper: displayAddress ? null : "Välj en fastighet för att se detaljer",
            },
            {
                key: "apartments",
                title: "Lägenheter",
                value: formattedApartmentCount ? `${formattedApartmentCount} st` : "Saknas",
                Icon: Home,
                tone: formattedApartmentCount ? "text-gray-900" : "text-gray-400",
            },
            {
                key: "comparison",
                title: "Jämförelseunderlag",
                value: similarPropertiesLabel,
                Icon: Users,
                tone: hasComparisonPeers ? "text-gray-900" : "text-gray-500",
                helper: comparisonLoading
                    ? "Data uppdateras"
                    : hasComparisonPeers
                        ? " "
                        : "Inga liknande fastigheter hittades för jämförelse",
            },
        ];

        return propertyHighlights;
    }, [comparisonData, comparisonLoading, selectedProperty]);
}
