import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RoomCanvas from "../../../../src/pages/PlanningTool/RoomCanvas/RoomCanvas";
import type { Room, Door, ContainerInRoom } from "../../../../src/pages/PlanningTool/Types";
import type { ContainerDTO } from "../../../../src/lib/Container";

vi.mock("../../../../src/pages/PlanningTool/RoomCanvas/components/Toolbar/Toolbar", () => ({
    default: (props: any) => (
        <div data-testid="toolbar">
            <button onClick={props.toggleContainerPanel}>Toggle Panel</button>
            <button onClick={props.undo}>Undo</button>
            <button onClick={props.redo}>Redo</button>
            <button onClick={props.handleAddDoor}>Add Door</button>
        </div>
    ),
}));

vi.mock("../../../../src/pages/PlanningTool/RoomCanvas/components/Container/ContainerPanel", () => ({
    default: (props: any) => <div data-testid="container-panel">{props.isOpen ? "Open" : "Closed"}</div>,
}));

vi.mock("react-konva", async () => {
    const actual = await vi.importActual<typeof import("react-konva")>("react-konva");
    return {
        ...actual,
        Stage: (props: any) => <div data-testid="stage" {...props}>{props.children}</div>,
        Layer: (props: any) => <div data-testid="layer">{props.children}</div>,
    };
});

describe("RoomCanvas component", () => {
    const mockRoom: Room = { id: 1, name: "Room 1", x: 0, y: 0, width: 500, height: 400 };
    const mockCorners = [
        { x: 0, y: 0 },
        { x: 500, y: 0 },
        { x: 500, y: 400 },
        { x: 0, y: 400 },
    ];
    const mockDoors: Door[] = [{ id: 1, width: 80, wall: "top", rotation: 0, x: 100, y: 0 }];
    const mockContainers: ContainerInRoom[] = [];
    const mockContainerDTO: ContainerDTO = { id: 1, name: "Container 1", size: 190, cost: 100, width: 100, height: 200, depth: 100, emptyingFrequencyPerYear: 1, serviceTypeName: "Standard", imageFrontViewUrl: "/img.png" };

    const defaultProps = {
        room: mockRoom,
        corners: mockCorners,
        setRoom: vi.fn(),
        handleDragCorner: vi.fn(),
        isContainerInsideRoom: vi.fn().mockReturnValue(true),

        doors: mockDoors,
        selectedDoorId: null,
        handleSelectDoor: vi.fn(),
        handleDragDoor: vi.fn(),
        handleAddDoor: vi.fn(),
        doorZones: [],

        containers: mockContainers,
        selectedContainerId: null,
        handleSelectContainer: vi.fn(),
        handleDragContainer: vi.fn(),
        moveAllContainers: vi.fn(),
        setSelectedContainerInfo: vi.fn(),
        selectedContainerInfo: null,
        draggedContainer: null,
        getContainerZones: vi.fn().mockReturnValue([]),

        otherObjects: [],
        setOtherObjects: vi.fn(),
        handleAddOtherObject: vi.fn(),
        handleDragOtherObject: vi.fn(),
        getOtherObjectZones: vi.fn().mockReturnValue([]),
        handleSelectOtherObject: vi.fn(),
        selectedOtherObjectId: null,
        isObjectOutsideRoom: vi.fn().mockReturnValue(false),

        stageWrapperRef: React.createRef<HTMLDivElement>(),
        handleStageDrop: vi.fn(),
        handleStageDragOver: vi.fn(),
        handleStageDragLeave: vi.fn(),
        isStageDropActive: false,
        setIsStageDropActive: vi.fn(),

        serviceTypes: [],
        selectedType: null,
        setSelectedType: vi.fn(),
        availableContainers: [mockContainerDTO],
        selectedSize: {},
        setSelectedSize: vi.fn(),
        isLoadingContainers: false,
        fetchContainers: vi.fn(),
        handleAddContainer: vi.fn(),
        setDraggedContainer: vi.fn(),
    };

    it("renders the RoomCanvas component with toolbar, stage, and panel", () => {
        const { getByTestId } = render(<RoomCanvas {...defaultProps} />);
        expect(getByTestId("toolbar")).toBeTruthy();
        expect(getByTestId("stage")).toBeTruthy();
        expect(getByTestId("layer")).toBeTruthy();
        expect(getByTestId("container-panel")).toHaveTextContent("Closed");
    });

    it("toggles container panel when toolbar button is clicked", () => {
        const { getByTestId } = render(<RoomCanvas {...defaultProps} />);
        const toggleButton = getByTestId("toolbar").querySelector("button")!;
        fireEvent.click(toggleButton);
        expect(getByTestId("container-panel")).toBeTruthy();
    });

    it("calls undo, redo, and addDoor handlers", () => {
        const undo = vi.fn();
        const redo = vi.fn();
        const handleAddDoor = vi.fn();

        const { getByText } = render(
            <RoomCanvas {...defaultProps} undo={undo} redo={redo} saveRoom={vi.fn()} />
        );

        fireEvent.click(getByText("Undo"));
        fireEvent.click(getByText("Redo"));
        fireEvent.click(getByText("Add Door"));

        expect(undo).toHaveBeenCalledTimes(1);
        expect(redo).toHaveBeenCalledTimes(1);
        expect(defaultProps.handleAddDoor).toHaveBeenCalledTimes(1);
    });

    it("clears selection when clicking on empty stage area", () => {
        const handleSelectContainer = vi.fn();
        const handleSelectDoor = vi.fn();
        const setSelectedContainerInfo = vi.fn();

        const { getByTestId } = render(
            <RoomCanvas
                {...defaultProps}
                handleSelectContainer={handleSelectContainer}
                handleSelectDoor={handleSelectDoor}
                setSelectedContainerInfo={setSelectedContainerInfo}
            />
        );

        const stage = getByTestId("stage");

        fireEvent.mouseDown(stage, {
            target: {
                getStage: () => stage,
            },
        });

        expect(handleSelectContainer).toHaveBeenCalledWith(null);
        expect(handleSelectDoor).toHaveBeenCalledWith(null);
        expect(setSelectedContainerInfo).toHaveBeenCalledWith(null);
    });
});
