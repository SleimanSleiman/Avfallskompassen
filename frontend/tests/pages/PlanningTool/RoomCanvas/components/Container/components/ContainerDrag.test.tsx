import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import ContainerDrag from "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Container/components/ContainerDrag";
import { clamp, isOverlapping } from "../../../../../../../src/pages/PlanningTool/lib/Constants";

let capturedProps: any;

vi.mock("react-konva", () => ({
    Group: (props: any) => {
        // Capture ONLY the outer draggable Group
        if (props.draggable) {
            capturedProps = props;
        }

        return typeof props.children === "function"
            ? props.children({})
            : props.children;
    },
}));

// ---- Constants mock ----
vi.mock("../../../../../../../src/pages/PlanningTool/lib/Constants", () => ({
    clamp: (v: number, min: number, max: number) =>
        Math.min(Math.max(v, min), max),
    isOverlapping: vi.fn(),
}));

describe("ContainerDrag component", () => {
    const container = {
        id: 1,
        x: 10,
        y: 20,
        width: 50,
        height: 60,
        rotation: 0,
    };

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
                room={room}
                doorZones={doorZones}
                otherObjectZones={otherObjectZones}
                getContainerZones={getContainerZones}
                setIsDraggingContainer={setIsDraggingContainer}
                handleDragContainer={handleDragContainer}
                handleSelectContainer={handleSelectContainer}
                lastValidPos={lastValidPos}
                setLastValidPos={setLastValidPos}
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
                room={room}
                doorZones={doorZones}
                otherObjectZones={otherObjectZones}
                getContainerZones={getContainerZones}
                setIsDraggingContainer={setIsDraggingContainer}
                handleDragContainer={handleDragContainer}
                handleSelectContainer={handleSelectContainer}
                lastValidPos={lastValidPos}
                setLastValidPos={setLastValidPos}
                setIsOverZone={setIsOverZone}
            >
                {() => <div />}
            </ContainerDrag>
        );

        capturedProps.onClick();
        expect(handleSelectContainer).toHaveBeenCalledWith(container.id);

        // Mock event with target.getStage()
        const mockEvent = {
            target: {
                getStage: () => ({
                    container: () => ({ style: { cursor: "" } })
                })
            }
        };

        capturedProps.onDragStart(mockEvent as any);
        expect(handleSelectContainer).toHaveBeenCalledWith(container.id);
        expect(setIsDraggingContainer).toHaveBeenCalledWith(true);
    });

    it("updates lastValidPos if not over a zone on drag end", () => {
        (isOverlapping as any).mockReturnValue(false);

        render(
            <ContainerDrag
                container={container}
                room={room}
                doorZones={doorZones}
                otherObjectZones={otherObjectZones}
                getContainerZones={getContainerZones}
                setIsDraggingContainer={setIsDraggingContainer}
                handleDragContainer={handleDragContainer}
                handleSelectContainer={handleSelectContainer}
                lastValidPos={lastValidPos}
                setLastValidPos={setLastValidPos}
                setIsOverZone={setIsOverZone}
            >
                {() => <div />}
            </ContainerDrag>
        );

        // Desired TOP-LEFT position
        const desiredPos = { x: 150, y: 160 };

        // Konva node reports CENTER position
        const mockTarget = {
            x: () => desiredPos.x + container.width / 2,
            y: () => desiredPos.y + container.height / 2,
            position: vi.fn(),
            getStage: () => ({
                container: () => ({ style: { cursor: "" } })
            })
        };

        const expectedPos = {
            x: desiredPos.x + container.width / 2,
            y: desiredPos.y + container.height / 2,
            rotation: 0,
        };

        capturedProps.onDragEnd({ target: mockTarget });

        expect(setLastValidPos).toHaveBeenCalledWith(expectedPos);
        expect(handleDragContainer).toHaveBeenCalledWith(
            container.id,
            expectedPos
        );
        expect(setIsOverZone).toHaveBeenCalledWith(false);
        expect(setIsDraggingContainer).toHaveBeenCalledWith(false);
    });

   it("snaps back to last valid position if overlapping a zone on drag end", () => {
       (isOverlapping as any).mockImplementation(() => true);

       getContainerZones.mockReturnValue([{ x: 0, y: 0, width: 1, height: 1 }]);
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

       const mockTarget = {
           x: () => 200,
           y: () => 220,
           position: vi.fn(),
           getStage: () => ({
               container: () => ({ style: { cursor: "" } })
           })
       };

       capturedProps.onDragEnd({ target: mockTarget } as any);

       expect(mockTarget.position).toHaveBeenCalledWith({
            x: lastValidPos.x,
            y: lastValidPos.y,
        });
   });
});
