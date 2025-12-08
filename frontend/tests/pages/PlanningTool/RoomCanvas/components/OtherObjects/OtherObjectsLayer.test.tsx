import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import OtherObjectsLayer from "../../../../../../src/pages/PlanningTool/RoomCanvas/components/OtherObjects/OtherObjectsLayer";

vi.mock(
    "../../../../../../src/pages/PlanningTool/RoomCanvas/components/OtherObjects/components/OtherObjectsDrag",
    () => ({
        default: (props: any) => <div data-testid="drag">{props.children()}</div>,
    })
);

vi.mock("react-konva", () => ({
    Rect: (props: any) => {
        const { opacity = 1, ...rest } = props;
        return <div data-testid="rect" {...rest} opacity={opacity} />;
    },
}));

describe("OtherObjectsLayer", () => {
    let otherObjectsInRoom: any[];
    let room: any;
    let handleSelectOtherObject: any;
    let handleDragOtherObject: any;
    let setIsDraggingOtherObject: any;
    let getOtherObjectZones: any;
    let containerZones: any[];
    let doorZones: any[];

    beforeEach(() => {
        otherObjectsInRoom = [
            { id: 1, x: 0, y: 0, width: 20, height: 20, rotation: 0 },
            { id: 2, x: 50, y: 50, width: 30, height: 30, rotation: 0 },
        ];
        room = { x: 0, y: 0, width: 200, height: 200 };
        handleSelectOtherObject = vi.fn();
        handleDragOtherObject = vi.fn();
        setIsDraggingOtherObject = vi.fn();
        getOtherObjectZones = vi.fn(() => []);
        containerZones = [];
        doorZones = [];
    });

    it("renders all objects as Rects", () => {
        const isObjectOutsideRoom = vi.fn(() => false);

        const { getAllByTestId } = render(
            <OtherObjectsLayer
                otherObjectsInRoom={otherObjectsInRoom}
                handleSelectOtherObject={handleSelectOtherObject}
                room={room}
                getOtherObjectZones={getOtherObjectZones}
                containerZones={containerZones}
                doorZones={doorZones}
                selectedOtherObjectId={null}
                handleDragOtherObject={handleDragOtherObject}
                setIsDraggingOtherObject={setIsDraggingOtherObject}
                isObjectOutsideRoom={isObjectOutsideRoom}
            />
        );

        const rects = getAllByTestId("rect");
        expect(rects).toHaveLength(otherObjectsInRoom.length);
    });

    it("applies correct fill and stroke for selected object", () => {
        const isObjectOutsideRoom = vi.fn(() => false);

        const { getAllByTestId } = render(
            <OtherObjectsLayer
                otherObjectsInRoom={otherObjectsInRoom}
                handleSelectOtherObject={handleSelectOtherObject}
                room={room}
                getOtherObjectZones={getOtherObjectZones}
                containerZones={containerZones}
                doorZones={doorZones}
                selectedOtherObjectId={2}
                handleDragOtherObject={handleDragOtherObject}
                setIsDraggingOtherObject={setIsDraggingOtherObject}
                isObjectOutsideRoom={isObjectOutsideRoom}
            />
        );

        const rects = getAllByTestId("rect");
        expect(rects[0].getAttribute("fill")).toBe("#87CEFA");
        expect(rects[0].getAttribute("stroke")).toBe("#4682B4");
        expect(rects[1].getAttribute("fill")).toBe("#FFD700");
        expect(rects[1].getAttribute("stroke")).toBe("#FFA500");
    });
});
