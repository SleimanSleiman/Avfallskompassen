import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { PropertyComparison } from "../../../../src/lib/Comparison";
import type { Property } from "../../../../src/lib/Property";
import type { ContainerInRoom } from "../../../../src/pages/PlanningTool/Types";
import type { ComponentProps } from "react";
import CostSection from "../../../../src/pages/PlanningTool/Sidebar/CostSection";

vi.mock("../../../../src/pages/PlanningTool/components/InfoTooltip", () => ({
    default: (props: { text: string }) => <div data-testid="mock-tooltip">{props.text}</div>,
}));

const mockComparison: PropertyComparison = {
    propertyId: 1,
    address: "Testgatan 1",
    numberOfApartments: 10,
    propertyType: "Bostad",
    costComparison: {
        propertyCost: 10000,
        averageCost: 12000,
        minCost: 8000,
        maxCost: 15000,
        percentageDifference: -16.6,
        comparisonGroupSize: 5,
    },
    containerSizeComparison: {
        propertyTotalVolume: 5000,
        averageVolume: 4500,
        comparison: "higher",
        comparisonGroupSize: 5,
    },
    wasteAmountComparisons: [
        {
            propertyWasteAmount: 1000,
            averageWasteAmount: 900,
            minWasteAmount: 700,
            maxWasteAmount: 1100,
            percentageDifference: 11,
            comparisonGroupSize: 5,
            wasteType: "Restavfall",
        },
    ],
    frequencyComparisons: [
        {
            propertyFrequency: 12,
            averageFrequency: 10,
            percentageDifference: 20,
            comparisonGroupSize: 5,
            wasteType: "Restavfall",
        },
    ],
};

const mockContainers: ContainerInRoom[] = [
    {
        id: 1,
        container: {
            id: 10,
            name: "Kärl",
            size: 500,
            width: 1000,
            depth: 800,
            height: 1200,
            imageFrontViewUrl: "/front.png",
            imageTopViewUrl: "/top.png",
            emptyingFrequencyPerYear: 12,
            cost: 2500,
            serviceTypeId: 2,
            serviceTypeName: "Restavfall",
        },
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        rotation: 0,
    },
];

const mockProperty: Property = {
    id: 1,
    address: "Testgatan 1",
    numberOfApartments: 10,
    accessPathLength: 5,
    createdAt: "2024-01-01",
};

type CostSectionProps = ComponentProps<typeof CostSection>;

const defaultProps: CostSectionProps = {
    comparisonData: mockComparison,
    comparisonLoading: false,
    comparisonError: null,
    selectedProperty: mockProperty,
    containersInRoom: mockContainers,
};

const renderCostSection = (override?: Partial<CostSectionProps>) => {
    return render(<CostSection {...defaultProps} {...override} />);
};

describe("CostSection", () => {
    it("renders header and tooltip text", () => {
        renderCostSection();

        expect(screen.getByText("Kostnader och jämförelse")).toBeInTheDocument();
        expect(screen.getByTestId("mock-tooltip")).toHaveTextContent(
            "Se hur ditt miljörum står sig mot liknande fastigheter"
        );
    });

    it("shows loading state when comparison data is loading", () => {
        renderCostSection({ comparisonLoading: true });

        expect(screen.getByText("Hämtar jämförelsedata...")).toBeInTheDocument();
    });

    it("renders placeholder message when no comparison data is available", () => {
    renderCostSection({ comparisonData: null });

        expect(
            screen.getByText(/Öppna planeringsverktyget via en fastighet/i)
        ).toBeInTheDocument();
    });
});
