import { render, screen } from "@testing-library/react";
import RoomCanvas from "../../../../src/pages/PlanningTool/RoomCanvas/RoomCanvas";
import { vi, describe, it, afterEach } from "vitest";
import "@testing-library/jest-dom";

// ─────────────── Mock react-konva ───────────────
vi.mock("react-konva", () => ({
    Stage: ({ children }: any) => <div>{children}</div>,
    Layer: ({ children }: any) => <div>{children}</div>,
    Group: ({ children, "data-testid": dataTestId, ...props }: any) => (
        <div data-testid={dataTestId || "group"} {...props}>{children}</div>
    ),
    Line: (props: any) => <div data-testid="line" {...props} />,
    Rect: (props: any) => <div data-testid="rect" {...props} />,
    Circle: (props: any) => <div data-testid="circle" {...props} />,  // <-- här
    Image: (props: any) => <div data-testid="image" {...props} />,
    Text: (props: any) => <div data-testid="text" {...props} />,
}));

// ─────────────── Mock ContainersLayer ───────────────
vi.mock("../../../../src/pages/PlanningTool/RoomCanvas/ContainersLayer", () => ({
    __esModule: true,
    default: ({ setIsDraggingContainer }: any) => {
        setIsDraggingContainer(true);
        return <div data-testid="mock-containers-layer" />;
    },
}));

afterEach(() => vi.restoreAllMocks());

// ─────────────── Room and door zones dimensions ───────────────
const room = { x: 0, y: 0, width: 500, height: 400 };
const doorZones = [{ x: 100, y: 50, width: 120, height: 40 }];

describe("RoomCanvas", () => {
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
});
