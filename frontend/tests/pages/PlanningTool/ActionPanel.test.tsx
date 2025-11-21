import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ActionPanel from "../../../src/pages/PlanningTool/ActionPanel";
import { vi, describe, it, beforeEach, expect } from "vitest";

// ─────────────── Mock components ───────────────
vi.mock("../../../src/pages/PlanningTool/components/InfoTooltip", () => ({
    default: ({ text }: { text: string }) => <div data-testid="mock-tooltip">{text}</div>,
}));

// ─────────────── Default mocks ───────────────
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

// ─────────────── Helper function ───────────────
const renderActionPanel = (overrideProps: Partial<React.ComponentProps<typeof ActionPanel>> = {}) =>
    render(
        <ActionPanel
            containers={[mockContainer]}
            doors={[mockDoor]}
            selectedContainerId={null}
            selectedDoorId={null}
            pos={{ left: 0, top: 0 }}
            setPos={vi.fn()}
            stageWrapperRef={{ current: { getBoundingClientRect: () => ({ width: 800, height: 600 }) } }}
            {...mockHandlers}
            {...overrideProps}
        />
    );

describe("ActionPanel", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders correctly for a selected container", () => {
        renderActionPanel({ selectedContainerId: mockContainer.id });

        expect(screen.getByText("240 L")).toBeDefined();
        expect(screen.getByTestId("mock-tooltip")).toBeDefined();

        fireEvent.click(screen.getByText("Information"));
        expect(mockHandlers.handleShowContainerInfo).toHaveBeenCalledWith(mockContainer.id);

        fireEvent.click(screen.getByText("Rotera kärl"));
        expect(mockHandlers.handleRotateContainer).toHaveBeenCalledWith(mockContainer.id);

        fireEvent.click(screen.getByText("Ta bort kärl"));
        expect(mockHandlers.handleRemoveContainer).toHaveBeenCalledWith(mockContainer.id);
    });

    it("renders correctly for a selected door", () => {
        renderActionPanel({ selectedDoorId: mockDoor.id, selectedContainerId: null });

        expect(screen.getByText(`Dörr ${mockDoor.width * 100}cm`)).toBeDefined();

        fireEvent.click(screen.getByText("Rotera dörr"));
        expect(mockHandlers.handleRotateDoor).toHaveBeenCalledWith(mockDoor.id);

        fireEvent.click(screen.getByText("Ta bort dörr"));
        expect(mockHandlers.handleRemoveDoor).toHaveBeenCalledWith(mockDoor.id);

        expect(screen.queryByText("Information")).toBeNull();
    });

    it("does not render if nothing is selected", () => {
        const { container } = renderActionPanel({ selectedContainerId: null, selectedDoorId: null });
        expect(container.firstChild).toBeNull();
    });

    it("updates position when dragging the panel", () => {
        const setPos = vi.fn();
        renderActionPanel({ selectedContainerId: mockContainer.id, pos: { left: 100, top: 100 }, setPos });

        const panel = screen.getByText("240 L").closest("div")!;
        fireEvent.mouseDown(panel, { clientX: 120, clientY: 140 });
        fireEvent.mouseMove(window, { clientX: 150, clientY: 170 });
        fireEvent.mouseUp(window);

        expect(setPos).toHaveBeenCalled();
        const lastCall = setPos.mock.calls[setPos.mock.calls.length - 1][0];
        expect(lastCall.left).toBeGreaterThanOrEqual(0);
        expect(lastCall.top).toBeGreaterThanOrEqual(0);
    });

    it("sets initial position if pos is null", () => {
        const setPos = vi.fn();
        renderActionPanel({ selectedContainerId: mockContainer.id, pos: null, setPos });

        expect(setPos).toHaveBeenCalled();
        const callArg = setPos.mock.calls[0][0];
        expect(callArg.left).toBeGreaterThanOrEqual(0);
        expect(callArg.top).toBeGreaterThanOrEqual(0);
    });
});
