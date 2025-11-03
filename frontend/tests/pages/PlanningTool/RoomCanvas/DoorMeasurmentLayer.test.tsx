import { render, screen, cleanup } from "@testing-library/react";
import DoorMeasurementLayer from "../../../../src/pages/PlanningTool/RoomCanvas/DoorMeasurementLayer";
import { vi, describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom";

// ─────────────── Mock react-konva ───────────────
vi.mock("react-konva", () => ({
    Line: (props: any) => {
        const { "data-testid": testId, points } = props;
        return (
            <div
                data-testid={testId ?? "line"}
                data-points={JSON.stringify(points)}
            />
        );
    },
    Text: (props: any) => {
        const { text, rotation } = props;
        //Generate a testId based on provided props
        const testId =
            props["data-testid"] ??
            props.key ??
            text?.replace(/\s+/g, "-") ??
            "text";

        return (
            <div
                data-testid={testId}
                data-text={text}
                data-rotation={rotation}
            >
                {text}
            </div>
        );
    },
}));

// ─────────────── Room dimensions ───────────────
const room = { x: 0, y: 0, width: 500, height: 400 };
const SCALE = 1;
afterEach(cleanup);

describe("DoorMeasurementLayer", () => {
    //Test that top wall measurements render correctly
    it("renders top wall measurements", () => {
        const doors = [{ id: 1, width: 90, x: 100, y: 0, wall: "top", rotation: 180 }];
        render(<DoorMeasurementLayer doors={doors} room={room} />);

        const line = screen.getByTestId("line1-1");
        expect(line).toBeInTheDocument();
        expect(line.dataset.points).toBeDefined();

        const texts = screen.getAllByText(/m$/);
        expect(texts.length).toBeGreaterThanOrEqual(2);
        texts.forEach((t) => expect(t.dataset.text).toContain("m"));
    });

    //Test that bottom wall measurements render correctly
    it("renders bottom wall measurements", () => {
        const doors = [{ id: 2, width: 80, x: 400, y: 400, wall: "bottom", rotation: 0 }];
        render(<DoorMeasurementLayer doors={doors} room={room} />);

        const line = screen.getByTestId("line1-2");
        expect(line).toBeInTheDocument();

        const texts = screen.getAllByText(/m$/);
        expect(texts.length).toBeGreaterThanOrEqual(2);
        texts.forEach((t) => expect(t.dataset.text).toContain("m"));
    });

    //Test that left wall measurements render correctly with rotation -90
    it("renders left wall measurements (rotation -90)", () => {
        const doors = [{ id: 3, width: 70, x: 0, y: 100, wall: "left", rotation: 90 }];
        render(<DoorMeasurementLayer doors={doors} room={room} />);

        const line = screen.getByTestId("line1-3");
        expect(line).toBeInTheDocument();

        const rotatedTexts = screen.getAllByText(/m$/);
        rotatedTexts.forEach((t) => {
            expect(Number(t.dataset.rotation)).toBe(-90);
        });
    });

    //Test that right wall measurements render correctly with rotation 90
    it("renders right wall measurements (rotation 90)", () => {
        const doors = [{ id: 4, width: 60, x: 500, y: 200, wall: "right", rotation: 270 }];
        render(<DoorMeasurementLayer doors={doors} room={room} />);

        const line = screen.getByTestId("line1-4");
        expect(line).toBeInTheDocument();

        const rotatedTexts = screen.getAllByText(/m$/);
        rotatedTexts.forEach((t) => {
            expect(Number(t.dataset.rotation)).toBe(90);
        });
    });

    //Test that component handles no doors gracefully
    it("renders safely when no doors provided", () => {
        render(<DoorMeasurementLayer doors={[]} room={room} />);
        expect(screen.queryByTestId(/line1-/)).toBeNull();
    });
});
