import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RoomShape from "../../../../src/pages/PlanningTool/RoomCanvas/RoomShape";
import type { ContainerDTO } from "../../../src/lib/Container";
import { SCALE } from "../../../../src/pages/PlanningTool/Constants";

// ─────────────── Mock react-konva ───────────────
vi.mock("react-konva", async () => {
    const actual = await vi.importActual("react");
    return {
        ...actual,
        Rect: (props: any) => <div data-testid="rect" {...props} />,
        Text: (props: any) => <div data-testid="text">{props.text}</div>,
    };
});


describe("RoomShape", () => {
    const mockRoom = { x: 0, y: 0, width: 500, height: 400 };
    const handleSelectDoor = vi.fn();
    const handleSelectContainer = vi.fn();
    const setSelectedContainerInfo = vi.fn();

    //Test rendering of room rectangle and dimension texts
    it("renders the room rectangle and dimension texts", () => {
        render(
            <RoomShape
                room={mockRoom}
                handleSelectDoor={handleSelectDoor}
                handleSelectContainer={handleSelectContainer}
                setSelectedContainerInfo={setSelectedContainerInfo}
            />
        );

        const rect = screen.getByTestId("rect");
        expect(rect).toBeDefined();
        const texts = screen.getAllByTestId("text");
        expect(texts.length).toBe(2);
        expect(texts[0].textContent).toBe((mockRoom.width * SCALE).toFixed(2) + " m");
        expect(texts[1].textContent).toBe((mockRoom.height * SCALE).toFixed(2) + " m");

    });

    //Test clearing selection when clicking on the room rectangle
    it("calls selection handlers when clicking on the room rectangle", () => {
        render(
            <RoomShape
                room={mockRoom}
                handleSelectDoor={handleSelectDoor}
                handleSelectContainer={handleSelectContainer}
                setSelectedContainerInfo={setSelectedContainerInfo}
            />
        );

        const rect = screen.getByTestId("rect");
        fireEvent.mouseDown(rect);
        expect(handleSelectContainer).toHaveBeenCalledWith(null);
        expect(handleSelectDoor).toHaveBeenCalledWith(null);
        expect(setSelectedContainerInfo).toHaveBeenCalledWith(null);
    });
});
