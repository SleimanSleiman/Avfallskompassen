import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import RoomShape from "../../../../../../src/pages/PlanningTool/RoomCanvas/components/Room/RoomShape";
import type { Room } from "../../../../../../src/pages/PlanningTool/Types";

vi.mock("../../../../../../src/pages/PlanningTool/Constants", () => ({
    SCALE: 0.01,
    STAGE_WIDTH: 800,
    STAGE_HEIGHT: 600,
    MARGIN: 10,
    clamp: (val: number, min: number, max: number) =>
        Math.min(Math.max(val, min), max),
}));

vi.mock("react-konva", () => {
    const propsStore = new WeakMap<any, any>();

    return {
        Rect: (props: any) => {
            return (
                <div
                    data-testid="rect"
                    ref={(el) => {
                        if (el) propsStore.set(el, props);
                    }}
                    onMouseDown={props.onMouseDown}
                    onMouseUp={props.onMouseUp}
                    onClick={props.onClick}
                    onDragStart={props.onDragStart}
                    onDragEnd={props.onDragEnd}
                    style={{ display: "inline-block" }}
                />
            );
        },

        Text: (props: any) => <div data-testid={`text-${props.text}`} />,

        getKonvaProps: (el: any) => propsStore.get(el),
    };
});

describe("RoomShape (Vitest)", () => {
    const room: Room = {
        id: 1,
        x: 50,
        y: 60,
        width: 200,
        height: 150,
    };

    const handleSelectDoor = vi.fn();
    const handleSelectContainer = vi.fn();
    const handleSelectOtherObject = vi.fn();
    const setSelectedContainerInfo = vi.fn();
    const onMove = vi.fn();

    beforeEach(() => {
    vi.clearAllMocks();
    });

    it("renders rectangle and dimension text", () => {
        const { getByTestId } = render(
            <RoomShape
                room={room}
                handleSelectDoor={handleSelectDoor}
                handleSelectOtherObject={handleSelectOtherObject}
                handleSelectContainer={handleSelectContainer}
                setSelectedContainerInfo={setSelectedContainerInfo}
                onMove={onMove}
            />
        );

        expect(getByTestId("rect")).toBeTruthy();

        getByTestId("text-2.00 m");
        getByTestId("text-1.50 m");
    });

    it("deselects container/door on click", () => {
        const { getByTestId } = render(
            <RoomShape
                room={room}
                handleSelectDoor={handleSelectDoor}
                handleSelectOtherObject={handleSelectOtherObject}
                handleSelectContainer={handleSelectContainer}
                setSelectedContainerInfo={setSelectedContainerInfo}
                onMove={onMove}
            />
        );

        fireEvent.mouseDown(getByTestId("rect"));

        expect(handleSelectContainer).toHaveBeenCalledWith(null);
        expect(handleSelectDoor).toHaveBeenCalledWith(null);
        expect(setSelectedContainerInfo).toHaveBeenCalledWith(null);
    });

    it("calls onMove during onDragMove", async () => {
        const { getByTestId } = render(
            <RoomShape
                room={room}
                handleSelectDoor={handleSelectDoor}
                handleSelectOtherObject={handleSelectOtherObject}
                handleSelectContainer={handleSelectContainer}
                setSelectedContainerInfo={setSelectedContainerInfo}
                onMove={onMove}
            />
        );

        const rect = getByTestId("rect");

        const { getKonvaProps } = await import("react-konva");
        const props = getKonvaProps(rect);
        expect(props).toBeTruthy();
        expect(typeof props.onDragMove).toBe("function");

        props.onDragMove({
            target: {
                position: vi.fn().mockReturnValue({ x: 500, y: 500 }),
            },
        });

        expect(onMove).toHaveBeenCalled();
    });
});
