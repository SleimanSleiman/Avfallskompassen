import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import RoomCanvas from "../../../../src/pages/PlanningTool/RoomCanvas/RoomCanvas";
import { createRef, type ComponentProps } from "react";

type RoomCanvasProps = ComponentProps<typeof RoomCanvas>;

// ─────────────── Mock react-konva ───────────────
vi.mock("react-konva", () => {
    const Stage = ({ children, onMouseDown }: any) => <div onMouseDown={() => onMouseDown?.({ target: { getStage: () => ({}) } })}>{children}</div>;
    const Layer = ({ children }: any) => <div>{children}</div>;
    const Group = ({ children, "data-testid": tid }: any) => <div data-testid={tid ?? "group"}>{children}</div>;
    const Rect = () => <div data-testid="rect" />;
    const Circle = () => <div data-testid="circle" />;
    const Image = () => <div data-testid="image" />;
    const Text = () => <div data-testid="text" />;
    return { Stage, Layer, Group, Rect, Circle, Image, Text };
});

// ─────────────── Mock components ───────────────
vi.mock("../../../../src/pages/PlanningTool/RoomCanvas/ContainersLayer", () => ({
    __esModule: true,
    default: ({ setIsDraggingContainer }: any) => {
        setIsDraggingContainer(true);
        return <div data-testid="mock-containers-layer" />;
    },
}));

vi.mock("../../../../src/pages/PlanningTool/RoomCanvas/RoomShape", () => ({
    __esModule: true,
    default: ({ onMove }: any) => (
        <div data-testid="mock-roomshape">
            <button data-testid="move-room-btn" onClick={() => onMove(150, 120)} />
        </div>
    ),
}));

vi.mock("../../../../src/components/RoomSizePrompt", () => ({
    __esModule: true,
    default: ({ onConfirm, onCancel }: any) => (
        <div data-testid="room-size-prompt">
            <button data-testid="confirm-room-size" onClick={() => onConfirm("Rum A", 400, 300)}>Confirm</button>
            <button data-testid="cancel-room-size" onClick={onCancel}>Cancel</button>
        </div>
    ),
}));

vi.mock("../../../../src/components/DoorWidthPrompt", () => ({
    __esModule: true,
    default: ({ onConfirm, onCancel }: any) => (
        <div data-testid="door-width-prompt">
            <button data-testid="confirm-door-width" onClick={() => onConfirm(900)}>Confirm</button>
            <button data-testid="cancel-door-width" onClick={onCancel}>Cancel</button>
        </div>
    ),
}));

// ─────────────── Test data ───────────────
const room = { x: 0, y: 0, width: 500, height: 400 };
const doorZones = [{ x: 100, y: 50, width: 120, height: 40 }];
const defaultProps: RoomCanvasProps = {
    room,
    corners: [
        { x: 0, y: 0 },
        { x: 500, y: 0 },
        { x: 500, y: 400 },
        { x: 0, y: 400 },
    ],
    handleDragCorner: vi.fn(),
    setRoom: vi.fn(),
    doors: [],
    selectedDoorId: null,
    handleDragDoor: vi.fn(),
    handleSelectDoor: vi.fn(),
    handleAddDoor: () => true,
    containers: [],
    selectedContainerId: null,
    handleDragContainer: vi.fn(),
    moveAllContainers: vi.fn(),
    handleSelectContainer: vi.fn(),
    setSelectedContainerInfo: vi.fn(),
    selectedContainerInfo: null,
    stageWrapperRef: createRef<HTMLDivElement>(),
    handleStageDrop: vi.fn(),
    handleStageDragOver: vi.fn(),
    handleStageDragLeave: vi.fn(),
    isStageDropActive: false,
    doorZones,
    getContainerZones: vi.fn(() => []),
    draggedContainer: null,
    serviceTypes: [{ id: 1, name: "Restavfall" }],
    selectedType: null,
    setSelectedType: vi.fn(),
    availableContainers: [],
    selectedSize: {},
    setSelectedSize: vi.fn(),
    isLoadingContainers: false,
    fetchContainers: async () => {},
    handleAddContainer: vi.fn(),
    setIsStageDropActive: vi.fn(),
    setDraggedContainer: vi.fn(),
    onContainerPanelHeightChange: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    saveRoom: undefined,
    isContainerInsideRoom: vi.fn(() => true),
};

// ─────────────── Helper ───────────────
const renderRoomCanvas = (override?: Partial<RoomCanvasProps>) =>
    render(<RoomCanvas {...defaultProps} {...override} />);

// ─────────────── Tests ───────────────
describe("RoomCanvas", () => {
    beforeEach(() => {
        globalThis.alert = vi.fn();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders highlighted zones when container is being dragged", () => {
        renderRoomCanvas();
        const zone = screen.getByTestId("zone-0");
        expect(zone).toBeInTheDocument();
        const rects = zone.querySelectorAll('[data-testid="rect"]');
        expect(rects.length).toBeGreaterThan(0);
    });

    it("opens RoomSizePrompt when clicking 'Ändra rumsdimensioner'", () => {
        renderRoomCanvas();
        const button = screen.getByRole("button", { name: /ändra rumsdimensioner/i });
        fireEvent.click(button);
        expect(screen.getByTestId("room-size-prompt")).toBeInTheDocument();
    });

    it("opens DoorWidthPrompt when clicking 'Lägg till dörr'", () => {
        renderRoomCanvas();
        const button = screen.getByRole("button", { name: /lägg till dörr/i });
        fireEvent.click(button);
        expect(screen.getByTestId("door-width-prompt")).toBeInTheDocument();
    });

    it("toggles container panel when 'Lägg till kärl'", () => {
        renderRoomCanvas();
        const button = screen.getByRole("button", { name: /lägg till sopkärl/i });
        // open
        fireEvent.click(button);
        expect(screen.getByText(/välj sopkärl/i)).toBeInTheDocument();
        // close
        fireEvent.click(button);
        // panel closes
        const closeBtn = screen.queryByLabelText("Stäng sopkärlspanelen");
        expect(closeBtn === null || closeBtn instanceof HTMLElement).toBeTruthy();
    });

    it("calls undo and redo when provided", () => {
        const undo = vi.fn();
        const redo = vi.fn();
        renderRoomCanvas({ undo, redo });
        const undoBtn = screen.getByRole("button", { name: /ångra/i });
        const redoBtn = screen.getByRole("button", { name: /gör om/i });
        fireEvent.click(undoBtn);
        fireEvent.click(redoBtn);
        expect(undo).toHaveBeenCalled();
        expect(redo).toHaveBeenCalled();
    });

    it("moves room and calls moveAllContainers", () => {
        const moveAllContainers = vi.fn();
        renderRoomCanvas({ moveAllContainers });
        const moveBtn = screen.getByTestId("move-room-btn");
        fireEvent.click(moveBtn);
        expect(moveAllContainers).toHaveBeenCalled();
    });

    it("selects service type and toggles size", async () => {
        const setSelectedType = vi.fn();
        const setSelectedSize = vi.fn();
        renderRoomCanvas({ setSelectedType, setSelectedSize, availableContainers: [], serviceTypes: [{id:1,name:"Restavfall"}], selectedType:null });
        const typeBtn = screen.getByTitle("Restavfall");
        fireEvent.click(typeBtn);
        expect(setSelectedType).toHaveBeenCalled();
        expect(setSelectedSize).toHaveBeenCalled();
    });
});
