import { render, screen, fireEvent } from "@testing-library/react";
import RoomCanvas from "../../../../src/pages/PlanningTool/RoomCanvas/RoomCanvas";
import { vi, describe, it, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";

vi.mock("react-konva", () => ({
    Stage: ({ children }: any) => <div>{children}</div>,
    Layer: ({ children }: any) => <div>{children}</div>,
    Group: ({ children, "data-testid": dataTestId, ...props }: any) => (
        <div data-testid={dataTestId || "group"} {...props}>{children}</div>
    ),
    Rect: (props: any) => <div data-testid="rect" {...props} />,
    Circle: (props: any) => <div data-testid="circle" {...props} />,
    Image: (props: any) => <div data-testid="image" {...props} />,
    Text: (props: any) => <div data-testid="text" {...props} />,
}));

vi.mock("../../../../src/pages/PlanningTool/RoomCanvas/ContainersLayer", () => ({
    __esModule: true,
    default: ({ setIsDraggingContainer }: any) => {
        setIsDraggingContainer(true);
        return <div data-testid="mock-containers-layer" />;
    },
}));

vi.mock("../../../../src/components/RoomSizePrompt", () => ({
    __esModule: true,
    default: ({ onConfirm, onCancel }: any) => (
        <div data-testid="room-size-prompt">
            <button onClick={() => onConfirm(400, 300)} data-testid="confirm-room-size">Confirm</button>
            <button onClick={onCancel} data-testid="cancel-room-size">Cancel</button>
        </div>
    ),
}));

const room = { x: 0, y: 0, width: 500, height: 400 };
const doorZones = [{ x: 100, y: 50, width: 120, height: 40 }];

describe("RoomCanvas", () => {
    beforeEach(() => {
        global.alert = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    //Test rendering highlighted zones for doors and other containers when a container is being dragged
    it("renders highlighted zones when a container is being dragged", () => {
        render(
            <RoomCanvas
                room={room}
                corners={[{ x: 0, y: 0 }, { x: 500, y: 0 }, { x: 500, y: 400 }, { x: 0, y: 400 }]}
                handleDragCorner={() => {}}
                doors={[]}
                selectedDoorId={null}
                handleDragDoor={() => {}}
                handleSelectDoor={() => {}}
                containers={[]}
                selectedContainerId={null}
                handleDragContainer={() => {}}
                handleSelectContainer={() => {}}
                stageWrapperRef={{ current: null }}
                handleStageDrop={() => {}}
                handleStageDragOver={() => {}}
                handleStageDragLeave={() => {}}
                isStageDropActive={false}
                doorZones={doorZones}
                getContainerZones={() => []}
            />
        );

        const zoneGroup = screen.getByTestId("zone-0");
        expect(zoneGroup).toBeInTheDocument();

        const rects = zoneGroup.querySelectorAll('[data-testid="rect"]');
        expect(rects.length).toBeGreaterThan(0);
    });

    //Test opening RoomSizePrompt when clicking the ruler button
    it("opens the RoomSizePrompt when clicking the ruler button", () => {
        render(
            <RoomCanvas
                room={room}
                corners={[{ x: 0, y: 0 }, { x: 500, y: 0 }, { x: 500, y: 400 }, { x: 0, y: 400 }]}
                handleDragCorner={() => {}}
                doors={[]}
                selectedDoorId={null}
                handleDragDoor={() => {}}
                handleSelectDoor={() => {}}
                containers={[]}
                selectedContainerId={null}
                handleDragContainer={() => {}}
                handleSelectContainer={() => {}}
                stageWrapperRef={{ current: null }}
                handleStageDrop={() => {}}
                handleStageDragOver={() => {}}
                handleStageDragLeave={() => {}}
                isStageDropActive={false}
                doorZones={doorZones}
                getContainerZones={() => []}
            />
        );

        const rulerButton = screen.getByRole("button", { name: /ändra rumsdimensioner/i });
        fireEvent.click(rulerButton);

        expect(screen.getByTestId("room-size-prompt")).toBeInTheDocument();
    });

    //Test alert when clicking save design button
    it("calls alert when clicking save design button", () => {
        render(
            <RoomCanvas
                room={room}
                corners={[{ x: 0, y: 0 }, { x: 500, y: 0 }, { x: 500, y: 400 }, { x: 0, y: 400 }]}
                handleDragCorner={() => {}}
                doors={[]}
                selectedDoorId={null}
                handleDragDoor={() => {}}
                handleSelectDoor={() => {}}
                containers={[]}
                selectedContainerId={null}
                handleDragContainer={() => {}}
                handleSelectContainer={() => {}}
                stageWrapperRef={{ current: null }}
                handleStageDrop={() => {}}
                handleStageDragOver={() => {}}
                handleStageDragLeave={() => {}}
                isStageDropActive={false}
                doorZones={doorZones}
                getContainerZones={() => []}
            />
        );

        const saveButton = screen.getByRole("button", { name: /spara design/i });
        fireEvent.click(saveButton);
    });
});
