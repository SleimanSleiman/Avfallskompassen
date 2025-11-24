import { render, screen, cleanup } from "@testing-library/react";
import DoorMeasurement from "../../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Door/DoorMeasurementLayer/components/DoorMeasurement";
import { describe, it, expect, afterEach } from "vitest";
import { Line, Text } from "react-konva";
import "@testing-library/jest-dom";

// Mock react-konva elements
vi.mock("react-konva", () => ({
    Line: (props: any) => (
        <div data-testid={props["data-testid"]} data-points={JSON.stringify(props.points)}>
            {JSON.stringify(props.points)}
        </div>
    ),
    Text: (props: any) => (
        <div data-testid={props["data-testid"]} data-text={props.text} data-rotation={props.rotation}>
            {props.text}
        </div>
    ),
}));


afterEach(cleanup);

describe("DoorMeasurement", () => {
    const room = { x: 0, y: 0, width: 500, height: 400 };

    it("renders lines and texts for a top wall door", () => {
        const door = { id: 1, width: 90, x: 100, y: 0, wall: "top", rotation: 180 };
        render(<DoorMeasurement door={door} room={room} />);

        const lines = screen.getAllByTestId(/^line-1-/);
        expect(lines.length).toBeGreaterThanOrEqual(2);

        const texts = screen.getAllByText(/m$/);
        expect(texts.length).toBeGreaterThanOrEqual(2);
    });

    it("renders correctly for left wall door with rotation -90", () => {
        const door = { id: 2, width: 70, x: 0, y: 100, wall: "left", rotation: 90 };
        render(<DoorMeasurement door={door} room={room} />);

        const lines = screen.getAllByTestId(/^line-2-/);
        expect(lines.length).toBeGreaterThanOrEqual(2);

        const textDivs = screen.getAllByText(/m$/);
        textDivs.forEach((t) => {
            expect(t.dataset.rotation).toBe("-90");
        });
    });

    it("renders nothing if lines/texts are empty", () => {
        const door = { id: 3, width: 0, x: 0, y: 0, wall: "top", rotation: 0 };
        render(<DoorMeasurement door={door} room={room} />);
        const lines = screen.queryAllByTestId(/^line-3-/);
        expect(lines.length).toBe(0);
    });
});
