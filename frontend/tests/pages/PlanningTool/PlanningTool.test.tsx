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

vi.mock("../../../src/pages/PlanningTool/hooks/UseOtherObjects", () => ({
    useOtherObjects: () => ({
        otherObjects: [],
        setOtherObjects: vi.fn(),
        handleAddOtherObject: vi.fn(),
        handleDragOtherObject: vi.fn(),
        getOtherObjectZones: vi.fn().mockReturnValue([]),
        handleSelectOtherObject: vi.fn(),
        handleRotateOtherObject: vi.fn(),
        handleRemoveOtherObject: vi.fn(),
        isObjectOutsideRoom: vi.fn().mockReturnValue(false),
    }),
}));

vi.mock("../../../src/pages/PlanningTool/hooks/UseServiceTypes", () => ({
    useServiceTypes: () => [
        { id: 1, name: "Avfall" },
        { id: 2, name: "Återvinning" },
    ],
}));

vi.mock("../../../src/pages/PlanningTool/hooks/usePropertyHighlights", () => ({
    usePropertyHighlights: () => [],
}));

vi.mock("../../../src/pages/PlanningTool/hooks/UseSaveRoom", () => ({
    useSaveRoom: () => ({ saveRoom: vi.fn(), isSaving: false, error: null }),
    useWasteRoomRequestBuilder: () => ({ buildWasteRoomRequest: vi.fn() }),
}));

// ─────────────── Mock components ───────────────
vi.mock("../../../src/pages/PlanningTool/RoomCanvas/RoomCanvas", () => ({
    default: () => <div data-testid="mock-room-canvas">RoomCanvas</div>,
}));

vi.mock("../../../src/pages/PlanningTool/ActionPanel", () => ({
    default: ({ selectedContainerId, selectedDoorId }: any) =>
        selectedContainerId !== null || selectedDoorId !== null
            ? <div data-testid="mock-action-panel">ActionPanel</div>
            : null,
}));

vi.mock("../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/WasteAnalysis/WasteAnalysisPanels", () => ({
    default: () => <div data-testid="mock-waste-panels">WasteAnalysisPanels</div>,
}));

vi.mock("../../../src/pages/PlanningTool/PropertyAndWasteAnalysis/PropertyOverview/PropertyOverviewPanel", () => ({
    default: () => <div data-testid="mock-overview-panel">PropertyOverviewPanel</div>,
}));

describe("PlanningTool", () => {
    beforeEach(() => {
        const localStorageMock = (() => {
            let store: Record<string, string> = {};
            return {
                getItem: vi.fn((key: string) => store[key] || null),
                setItem: vi.fn((key: string, value: string) => {
                    store[key] = value.toString();
                }),
                removeItem: vi.fn((key: string) => {
                    delete store[key];
                }),
                clear: vi.fn(() => {
                    store = {};
                }),
            };
        })();

        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
            writable: true,
        });

        window.localStorage.clear();
    });

    //Test rendering of main components
    it("renders RoomCanvas, WasteAnalysisPanels, and PropertyOverviewPanel", () => {
        render(<PlanningTool />);
        expect(screen.getByTestId("mock-room-canvas")).toBeDefined();
        expect(screen.getByTestId("mock-waste-panels")).toBeDefined();
        expect(screen.getByTestId("mock-overview-panel")).toBeDefined();
    });

    //Test that ActionPanel is not rendered initially
    it("does not render ActionPanel initially", () => {
        render(<PlanningTool />);
        expect(screen.queryByTestId("mock-action-panel")).toBeNull();
    });
});
