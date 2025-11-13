import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ActionPanel from "../../../src/pages/PlanningTool/ActionPanel";

// ─────────────── Mock components ───────────────
vi.mock("../../../src/pages/PlanningTool/components/InfoTooltip", () => ({
    default: ({ text }: { text: string }) => <div data-testid="mock-tooltip">{text}</div>,
}));

describe("ActionPanel", () => {
    const mockContainer = {
        id: 1,
        container: {
            id: 1,
            name: "240 L",
            size: 240,
            width: 600,
            depth: 800,
            height: 1100,
            imageFrontViewUrl: "/front.png",
            imageTopViewUrl: "/top.png",
            emptyingFrequencyPerYear: 0,
            cost: 0,
        },
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
    };
    const mockDoor = {
        id: 2,
        width: 0.9,
        x: 0,
        y: 0,
        rotation: 0,
        wall: "bottom" as const,
        swingDirection: "inward" as const,
    };

    const mockHandlers = {
        handleRemoveContainer: vi.fn(),
        handleRemoveDoor: vi.fn(),
        handleRotateDoor: vi.fn(),
        handleRotateContainer: vi.fn(),
        handleShowContainerInfo: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    //Test rendering for selected container
    it("renders correctly for a selected container", () => {
        render(
            <ActionPanel
                containers={[mockContainer]}
                doors={[]}
                selectedContainerId={mockContainer.id}
                selectedDoorId={null}
                {...mockHandlers}
            />
        );

        expect(screen.getByText("240 L")).toBeDefined();
        expect(screen.getByTestId("mock-tooltip")).toBeDefined();
        fireEvent.click(screen.getByText("Information"));
        expect(mockHandlers.handleShowContainerInfo).toHaveBeenCalledWith(mockContainer.id);
        fireEvent.click(screen.getByText("Rotera kärl"));
        expect(mockHandlers.handleRotateContainer).toHaveBeenCalledWith(mockContainer.id);
        fireEvent.click(screen.getByText("Ta bort kärl"));
        expect(mockHandlers.handleRemoveContainer).toHaveBeenCalledWith(mockContainer.id);
    });

    //Test rendering for selected door
    it("renders correctly for a selected door", () => {
        render(
            <ActionPanel
                containers={[]}
                doors={[mockDoor]}
                selectedContainerId={null}
                selectedDoorId={mockDoor.id}
                {...mockHandlers}
            />
        );

        expect(screen.getByText(`Dörr ${mockDoor.width * 100}cm`)).toBeDefined();
        fireEvent.click(screen.getByText("Rotera dörr"));
        expect(mockHandlers.handleRotateDoor).toHaveBeenCalledWith(mockDoor.id, 180, "outward");
        fireEvent.click(screen.getByText("Ta bort dörr"));
        expect(mockHandlers.handleRemoveDoor).toHaveBeenCalledWith(mockDoor.id);
        expect(screen.queryByText("Information")).toBeNull();
    });

    //Test that ActionPanel does not render when nothing is selected
    it("does not render if nothing is selected", () => {
        const { container } = render(
            <ActionPanel
                containers={[]}
                doors={[]}
                selectedContainerId={null}
                selectedDoorId={null}
                {...mockHandlers}
            />
        );
        expect(container.firstChild).toBeNull();
    });
});
