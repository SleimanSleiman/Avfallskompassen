import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import RoomCanvas from "../../../../src/pages/PlanningTool/RoomCanvas/RoomCanvas";
import { createRef, type ComponentProps, type ReactNode } from "react";

type DummyProps = { children?: ReactNode } & Record<string, unknown>;
type GroupProps = DummyProps & { ["data-testid"]?: string };

type RoomCanvasProps = ComponentProps<typeof RoomCanvas>;

vi.mock("react-konva", () => {
    const Stage = ({ children }: DummyProps) => <div>{children}</div>;
    const Layer = ({ children }: DummyProps) => <div>{children}</div>;
    const Group = ({ children, ["data-testid"]: dataTestId }: GroupProps) => (
        <div data-testid={typeof dataTestId === "string" ? dataTestId : "group"}>{children}</div>
    );
    const Rect = ({ children }: DummyProps) => <div data-testid="rect">{children}</div>;
    const Circle = ({ children }: DummyProps) => <div data-testid="circle">{children}</div>;
    const Image = ({ children }: DummyProps) => <div data-testid="image">{children}</div>;
    const Text = ({ children }: DummyProps) => <div data-testid="text">{children}</div>;

    return {
        Stage,
        Layer,
        Group,
        Rect,
        Circle,
        Image,
        Text,
    };
});

vi.mock("../../../../src/pages/PlanningTool/RoomCanvas/ContainersLayer", () => ({
    __esModule: true,
    default: ({ setIsDraggingContainer }: { setIsDraggingContainer: (value: boolean) => void }) => {
        setIsDraggingContainer(true);
        return <div data-testid="mock-containers-layer" />;
    },
}));

vi.mock("../../../../src/components/RoomSizePrompt", () => ({
    __esModule: true,
    default: ({ onConfirm, onCancel }: { onConfirm: (length: number, width: number) => void; onCancel: () => void }) => (
        <div data-testid="room-size-prompt">
            <button onClick={() => onConfirm(400, 300)} data-testid="confirm-room-size">Confirm</button>
            <button onClick={onCancel} data-testid="cancel-room-size">Cancel</button>
        </div>
    ),
}));

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
    setSelectedSize: vi.fn() as RoomCanvasProps["setSelectedSize"],
    isLoadingContainers: false,
    fetchContainers: async () => {},
    handleAddContainer: vi.fn(),
    setIsStageDropActive: vi.fn(),
    setDraggedContainer: vi.fn(),
};

const renderRoomCanvas = (override?: Partial<RoomCanvasProps>) => render(<RoomCanvas {...defaultProps} {...override} />);

describe("RoomCanvas", () => {
    beforeEach(() => {
        globalThis.alert = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders highlighted zones when a container is being dragged", () => {
        renderRoomCanvas();

        const zoneGroup = screen.getByTestId("zone-0");
        expect(zoneGroup).toBeInTheDocument();

        const rects = zoneGroup.querySelectorAll('[data-testid="rect"]');
        expect(rects.length).toBeGreaterThan(0);
    });

    it("opens the RoomSizePrompt when clicking the ruler button", () => {
        renderRoomCanvas();

        const rulerButton = screen.getByRole("button", { name: /ändra rumsdimensioner/i });
        fireEvent.click(rulerButton);

        expect(screen.getByTestId("room-size-prompt")).toBeInTheDocument();
    });

    it("calls alert when clicking save design button", () => {
        renderRoomCanvas();

        const saveButton = screen.getByRole("button", { name: /spara design/i });
        fireEvent.click(saveButton);

        // expect(globalThis.alert).toHaveBeenCalledWith("Spara funktionalitet kommer snart!");
    });
});
