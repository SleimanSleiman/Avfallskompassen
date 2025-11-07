import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../../../../src/pages/PlanningTool/Sidebar/Sidebar";
import { describe, it, vi } from "vitest";
import '@testing-library/jest-dom';

//Mock props
const mockProps = {
    isAddContainersOpen: false,
    setIsAddContainersOpen: vi.fn(),
    selectedContainerInfo: null,
    setSelectedContainerInfo: vi.fn(),
    serviceTypes: [{ id: 1, name: "Type A" }],
    selectedType: null,
    setSelectedType: vi.fn(),
    containers: [],
    selectedSize: {},
    setSelectedSize: vi.fn(),
    isLoadingContainers: false,
    fetchContainers: vi.fn(),
    handleAddContainer: vi.fn(),
    setIsStageDropActive: vi.fn(),
    setDraggedContainer: vi.fn(),
    handleAddDoor: vi.fn(),
};

describe("Sidebar", () => {
    //Test rendering main menu when no container is selected
    it("renders main menu when no container is selected", () => {
        render(<Sidebar {...mockProps} />);
        expect(screen.getByText("Verktyg")).toBeInTheDocument();
    });

    //Test rendering container details when a container is selected
    it("renders container details when a container is selected", () => {
        render(<Sidebar {...mockProps} selectedContainerInfo={{
            name: "Test Container", width: 1000, depth: 800, height: 1200, imageFrontViewUrl: "/front.png",
            emptyingFrequencyPerYear: 12, cost: 250, size: 190
        }} />);
        expect(screen.getByText("Tillbaka")).toBeInTheDocument();
        expect(screen.getByText("Test Container")).toBeInTheDocument();
    });

    //Test back button functionality
    it("calls setSelectedContainerInfo(null) when back button is clicked", () => {
        render(<Sidebar {...mockProps} selectedContainerInfo={{
            name: "Test Container", width: 1000, depth: 800, height: 1200, imageFrontViewUrl: "/front.png",
            emptyingFrequencyPerYear: 12, cost: 250, size: 190
        }} />);
        fireEvent.click(screen.getByText("Tillbaka"));
        expect(mockProps.setSelectedContainerInfo).toHaveBeenCalledWith(null);
    });
});
