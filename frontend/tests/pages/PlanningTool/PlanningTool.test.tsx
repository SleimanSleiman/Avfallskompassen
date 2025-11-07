import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PlanningTool from "../../../src/pages/PlanningTool/PlanningTool";

// ─────────────── Mock hooks ───────────────
vi.mock("../../../src/pages/PlanningTool/hooks/UseRoom", () => ({
    useRoom: () => ({
        room: { id: 1, x: 0, y: 0, width: 500, height: 400 },
        corners: [
            { x: 0, y: 0 },
            { x: 500, y: 0 },
            { x: 500, y: 400 },
            { x: 0, y: 400 },
            ],
        handleDragCorner: vi.fn(),
        setRoom: vi.fn(),
    }),
}));

vi.mock("../../../src/pages/PlanningTool/hooks/UseDoors", () => ({
    useDoors: () => ({
        doors: [],
        handleAddDoor: vi.fn(),
        handleDragDoor: vi.fn(),
        handleRotateDoor: vi.fn(),
        handleRemoveDoor: vi.fn(),
        handleSelectDoor: vi.fn(),
        getDoorZones: () => [],
    }),
}));

vi.mock("../../../src/pages/PlanningTool/hooks/UseContainers", () => ({
    useContainers: () => ({
        containersInRoom: [],
        draggedContainer: null,
        setDraggedContainer: vi.fn(),
        availableContainers: [],
        isLoadingContainers: false,
        isStageDropActive: false,
        setIsStageDropActive: vi.fn(),
        stageWrapperRef: { current: null },
        handleAddContainer: vi.fn(),
        handleRemoveContainer: vi.fn(),
        handleDragContainer: vi.fn(),
        handleSelectContainer: vi.fn(),
        fetchAvailableContainers: vi.fn(),
        handleStageDrop: vi.fn(),
        handleStageDragOver: vi.fn(),
        handleStageDragLeave: vi.fn(),
        handleRotateContainer: vi.fn(),
        selectedContainerInfo: null,
        setSelectedContainerInfo: vi.fn(),
        handleShowContainerInfo: vi.fn(),
        getContainerZones: vi.fn(),
    }),
}));

vi.mock("../../../src/pages/PlanningTool/hooks/UseServiceTypes", () => ({
    useServiceTypes: () => [
        { id: 1, name: "Avfall" },
        { id: 2, name: "Återvinning" },
    ],
}));

// ─────────────── Mock components ───────────────
vi.mock("../../../src/pages/PlanningTool/RoomCanvas/RoomCanvas", () => ({
    default: () => <div data-testid="mock-room-canvas">RoomCanvas</div>,
}));

vi.mock("../../../src/pages/PlanningTool/Sidebar/Sidebar", () => ({
    default: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));

vi.mock("../../../src/pages/PlanningTool/ActionPanel", () => ({
    default: () => <div data-testid="mock-action-panel">ActionPanel</div>,
}));

describe("PlanningTool", () => {
    //Test rendering of main components
    it("renders RoomCanvas and Sidebar", () => {
        render(<PlanningTool />);
        expect(screen.getByTestId("mock-room-canvas")).toBeDefined();
        expect(screen.getByTestId("mock-sidebar")).toBeDefined();
    });

    //Test that ActionPanel is not rendered initially
    it("does not render ActionPanel initially", () => {
        render(<PlanningTool />);
        expect(screen.queryByTestId("mock-action-panel")).toBeNull();
    });
});
