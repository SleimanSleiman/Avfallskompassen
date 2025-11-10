import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ComponentProps } from "react";
import type { PropertyComparison } from "../../../../src/lib/Comparison";
import type { Property } from "../../../../src/lib/Property";
import type { ContainerInRoom } from "../../../../src/pages/PlanningTool/Types";
import Sidebar from "../../../../src/pages/PlanningTool/Sidebar/Sidebar";
import type CostSectionDefault from "../../../../src/pages/PlanningTool/Sidebar/CostSection";

const costSectionSpy = vi.fn();

type CostSectionProps = ComponentProps<typeof CostSectionDefault>;

vi.mock("../../../../src/pages/PlanningTool/Sidebar/CostSection", () => ({
    __esModule: true,
    default: (props: CostSectionProps) => {
        costSectionSpy(props);
        return <div data-testid="cost-section" />;
    },
}));

const comparisonData: PropertyComparison = {
    propertyId: 1,
    address: "Testgatan 1",
    numberOfApartments: 10,
    propertyType: "Bostad",
    costComparison: {
        propertyCost: 10000,
        averageCost: 11000,
        minCost: 8000,
        maxCost: 14000,
        percentageDifference: -9,
        comparisonGroupSize: 5,
    },
    containerSizeComparison: {
        propertyTotalVolume: 4000,
        averageVolume: 4500,
        comparison: "lower",
        comparisonGroupSize: 5,
    },
    wasteAmountComparisons: [],
    frequencyComparisons: [],
};

const selectedProperty: Property = {
    id: 1,
    address: "Testgatan 1",
    numberOfApartments: 10,
    accessPathLength: 5,
    createdAt: "2024-01-01",
};

const containersInRoom: ContainerInRoom[] = [];

describe("Sidebar", () => {
    beforeEach(() => {
        costSectionSpy.mockClear();
    });

    it("renders the CostSection component", () => {
        render(
            <Sidebar
                comparisonData={comparisonData}
                comparisonLoading={false}
                comparisonError={null}
                selectedProperty={selectedProperty}
                containersInRoom={containersInRoom}
            />
        );

        expect(screen.getByTestId("cost-section")).toBeInTheDocument();
    });

    it("forwards props to CostSection", () => {
        render(
            <Sidebar
                comparisonData={comparisonData}
                comparisonLoading
                comparisonError="error"
                selectedProperty={selectedProperty}
                containersInRoom={containersInRoom}
            />
        );

        expect(costSectionSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                comparisonData,
                comparisonLoading: true,
                comparisonError: "error",
                selectedProperty,
                containersInRoom,
            })
        );
    });
});
