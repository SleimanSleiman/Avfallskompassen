import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import RoomShape from "../../../../src/pages/PlanningTool/RoomCanvas/RoomShape";
import { SCALE, STAGE_WIDTH, STAGE_HEIGHT, MARGIN } from "../../../../src/pages/PlanningTool/Constants";

const rectPropsStore: Record<string, any> = {};

// ─────────────── Mock react-konva ───────────────
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

// ─────────────── Default mocks ───────────────
const defaultRoom = { x: 0, y: 0, width: 500, height: 400 };
const defaultHandlers = {
    handleSelectDoor: vi.fn(),
    handleSelectContainer: vi.fn(),
    setSelectedContainerInfo: vi.fn(),
    onMove: vi.fn(),
};

// ─────────────── Helper function ───────────────
const renderRoomShape = (overrideProps: Partial<React.ComponentProps<typeof RoomShape>> = {}) =>
    render(
        <RoomShape
            room={defaultRoom}
            handleSelectDoor={defaultHandlers.handleSelectDoor}
            handleSelectContainer={defaultHandlers.handleSelectContainer}
            setSelectedContainerInfo={defaultHandlers.setSelectedContainerInfo}
            onMove={defaultHandlers.onMove}
            {...overrideProps}
        />
    );

describe("RoomShape", () => {
    let handleSelectDoor: ReturnType<typeof vi.fn>;
    let handleSelectContainer: ReturnType<typeof vi.fn>;
    let setSelectedContainerInfo: ReturnType<typeof vi.fn>;
    let onMove: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        handleSelectDoor = vi.fn();
        handleSelectContainer = vi.fn();
        setSelectedContainerInfo = vi.fn();
        onMove = vi.fn();
        vi.clearAllMocks();
    });

    it("renders the room rectangle and dimension texts", () => {
        renderRoomShape();

        const rect = screen.getByTestId("rect");
        expect(rect).toBeDefined();

        const texts = screen.getAllByTestId("text");
        expect(texts.length).toBe(2);
        expect(texts[0].textContent).toBe((defaultRoom.width * SCALE).toFixed(2) + " m");
        expect(texts[1].textContent).toBe((defaultRoom.height * SCALE).toFixed(2) + " m");
    });

    it("calls selection handlers when clicking on the room rectangle", () => {
        renderRoomShape({
            handleSelectDoor,
            handleSelectContainer,
            setSelectedContainerInfo,
        });

        const rect = screen.getByTestId("rect");
        fireEvent.mouseDown(rect);

        expect(handleSelectContainer).toHaveBeenCalledWith(null);
        expect(handleSelectDoor).toHaveBeenCalledWith(null);
        expect(setSelectedContainerInfo).toHaveBeenCalledWith(null);
    });

    it("calls onMove with clamped coordinates on drag", () => {
        renderRoomShape({ onMove });

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
        expect(calledX).toBeLessThanOrEqual(STAGE_WIDTH - defaultRoom.width - MARGIN);
        expect(calledY).toBeGreaterThanOrEqual(MARGIN);
        expect(calledY).toBeLessThanOrEqual(STAGE_HEIGHT - defaultRoom.height - MARGIN);
    });
});
