import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import RoomShape from "../../../../src/pages/PlanningTool/RoomCanvas/RoomShape";
import { SCALE, STAGE_WIDTH, STAGE_HEIGHT, MARGIN } from "../../../../src/pages/PlanningTool/Constants";

const rectPropsStore: Record<string, any> = {};

vi.mock("react-konva", async () => {
    const actual = await vi.importActual("react");
    return {
        ...actual,
        Rect: (props: any) => {
            rectPropsStore["rect"] = props;
            return <div data-testid="rect" {...props} />;
        },
        Text: (props: any) => <div data-testid="text">{props.text}</div>,
    };
});

describe("RoomShape", () => {
    const mockRoom = { x: 0, y: 0, width: 500, height: 400 };
    let handleSelectDoor: ReturnType<typeof vi.fn>;
    let handleSelectContainer: ReturnType<typeof vi.fn>;
    let setSelectedContainerInfo: ReturnType<typeof vi.fn>;
    let onMove: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        handleSelectDoor = vi.fn();
        handleSelectContainer = vi.fn();
        setSelectedContainerInfo = vi.fn();
        onMove = vi.fn();
    });

    it("renders the room rectangle and dimension texts", () => {
        render(
            <RoomShape
                room={mockRoom}
                handleSelectDoor={handleSelectDoor}
                handleSelectContainer={handleSelectContainer}
                setSelectedContainerInfo={setSelectedContainerInfo}
                onMove={onMove}
            />
        );

        const rect = screen.getByTestId("rect");
        expect(rect).toBeDefined();

        const texts = screen.getAllByTestId("text");
        expect(texts.length).toBe(2);
        expect(texts[0].textContent).toBe((mockRoom.width * SCALE).toFixed(2) + " m");
        expect(texts[1].textContent).toBe((mockRoom.height * SCALE).toFixed(2) + " m");
    });

    it("calls selection handlers when clicking on the room rectangle", () => {
        render(
            <RoomShape
                room={mockRoom}
                handleSelectDoor={handleSelectDoor}
                handleSelectContainer={handleSelectContainer}
                setSelectedContainerInfo={setSelectedContainerInfo}
                onMove={onMove}
            />
        );

        const rect = screen.getByTestId("rect");
        fireEvent.mouseDown(rect);

        expect(handleSelectContainer).toHaveBeenCalledWith(null);
        expect(handleSelectDoor).toHaveBeenCalledWith(null);
        expect(setSelectedContainerInfo).toHaveBeenCalledWith(null);
    });

    it("calls onMove with clamped coordinates on drag", () => {
        render(
            <RoomShape
                room={mockRoom}
                handleSelectDoor={handleSelectDoor}
                handleSelectContainer={handleSelectContainer}
                setSelectedContainerInfo={setSelectedContainerInfo}
                onMove={onMove}
            />
        );

        const props = rectPropsStore["rect"];
        expect(props).toBeDefined();

        const targetMock = {
            _pos: { x: 600, y: 500 },
            position: function (pos?: { x: number; y: number }) {
                if (pos) this._pos = pos;
                return this._pos;
            },
        };

        props.onDragMove({ target: targetMock });

        expect(onMove).toHaveBeenCalled();

        const calledX = onMove.mock.calls[0][0];
        const calledY = onMove.mock.calls[0][1];

        expect(calledX).toBeGreaterThanOrEqual(MARGIN);
        expect(calledX).toBeLessThanOrEqual(STAGE_WIDTH - mockRoom.width - MARGIN);
        expect(calledY).toBeGreaterThanOrEqual(MARGIN);
        expect(calledY).toBeLessThanOrEqual(STAGE_HEIGHT - mockRoom.height - MARGIN);
    });

});
