import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import '@testing-library/jest-dom';
import ContainerDrag from "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Container/components/ContainerDrag";
import { clamp, isOverlapping } from "../../../../../../../src/pages/PlanningTool/Constants";

// Variables need to be in module scope for the mock
let capturedProps: any;

// Mock react-konva Group
vi.mock("react-konva", () => ({
    Group: (props: any) => {
        capturedProps = props;
        return typeof props.children === "function" ? props.children({}) : props.children;
    },
}));

// Mock clamp and isOverlapping
vi.mock("../../../../../../../src/pages/PlanningTool/Constants", () => ({
    clamp: (v: number, min: number, max: number) => Math.min(Math.max(v, min), max),
    isOverlapping: vi.fn(),
}));

describe("ContainerDrag component", () => {
    const container = { id: 1, x: 10, y: 20, width: 50, height: 60, rotation: 0 };
    const room = { x: 0, y: 0, width: 500, height: 400 };
    const doorZones: any[] = [];
    const otherObjectZones: any[] = [];
    const lastValidPos = { x: container.x, y: container.y };
    let setLastValidPos: any;
    let setIsOverZone: any;
    let setIsDraggingContainer: any;
    let handleDragContainer: any;
    let handleSelectContainer: any;
    const getContainerZones = vi.fn().mockReturnValue([]);

    beforeEach(() => {
        vi.clearAllMocks();
        (isOverlapping as any).mockReturnValue(false);
        setLastValidPos = vi.fn();
        setIsOverZone = vi.fn();
        setIsDraggingContainer = vi.fn();
        handleDragContainer = vi.fn();
        handleSelectContainer = vi.fn();
        capturedProps = {};
    });

    it("renders children", () => {
        const { getByText } = render(
            <ContainerDrag
                container={container}
                selected={false}
                room={room}
                doorZones={doorZones}
                otherObjectZones={otherObjectZones}
                getContainerZones={getContainerZones}
                setIsDraggingContainer={setIsDraggingContainer}
                handleDragContainer={handleDragContainer}
                handleSelectContainer={handleSelectContainer}
                lastValidPos={lastValidPos}
                setLastValidPos={setLastValidPos}
                isOverZone={false}
                setIsOverZone={setIsOverZone}
            >
                {() => <div>Child</div>}
            </ContainerDrag>
        );

        expect(getByText("Child")).toBeInTheDocument();
    });

    it("calls handleSelectContainer and setIsDraggingContainer on drag start", () => {
        render(
            <ContainerDrag
                container={container}
                selected={false}
                room={room}
                doorZones={doorZones}
                otherObjectZones={otherObjectZones}
                getContainerZones={getContainerZones}
                setIsDraggingContainer={setIsDraggingContainer}
                handleDragContainer={handleDragContainer}
                handleSelectContainer={handleSelectContainer}
                lastValidPos={lastValidPos}
                setLastValidPos={setLastValidPos}
                isOverZone={false}
                setIsOverZone={setIsOverZone}
            >
                {() => <div />}
            </ContainerDrag>
        );

        capturedProps.onClick();
        expect(handleSelectContainer).toHaveBeenCalledWith(container.id);

        capturedProps.onDragStart();
        expect(handleSelectContainer).toHaveBeenCalledWith(container.id);
        expect(setIsDraggingContainer).toHaveBeenCalledWith(true);
    });


    it("updates lastValidPos if not over a zone on drag end", () => {
        (isOverlapping as any).mockReturnValue(false);
        render(
            <ContainerDrag
                container={container}
                selected={false}
                room={room}
                doorZones={doorZones}
                otherObjectZones={otherObjectZones}
                getContainerZones={getContainerZones}
                setIsDraggingContainer={setIsDraggingContainer}
                handleDragContainer={handleDragContainer}
                handleSelectContainer={handleSelectContainer}
                lastValidPos={lastValidPos}
                setLastValidPos={setLastValidPos}
                isOverZone={false}
                setIsOverZone={setIsOverZone}
            >
                {() => <div />}
            </ContainerDrag>
        );

        const newPos = { x: 150, y: 160 };
        const mockTarget = {
            x: () => newPos.x + container.width / 2,
            y: () => newPos.y + container.height / 2,
            position: vi.fn(),
        };

        capturedProps.onDragEnd({ target: mockTarget });
        expect(setLastValidPos).toHaveBeenCalledWith(newPos);
        expect(handleDragContainer).toHaveBeenCalledWith(container.id, {
            x: newPos.x,
            y: newPos.y,
            rotation: container.rotation,
        });
        expect(setIsOverZone).toHaveBeenCalledWith(false);
        expect(setIsDraggingContainer).toHaveBeenCalledWith(false);
    });
});
