import { describe, it, expect, vi } from "vitest";
import { getLinesAndTexts } from "../../../../../../../../src/pages/PlanningTool/RoomCanvas/components/OtherObjects/OtherObjectsMeasurementLayer/utils/otherObjectMeasurementUtils";
import { Text } from "react-konva";

vi.mock("react-konva", () => ({
    Text: (props: any) => <div data-testid="text" {...props}>{props.text}</div>,
}));

describe("getLinesAndTexts", () => {
    const room = { x: 0, y: 0, width: 100, height: 100 };

    it("returns lines and texts for object in room", () => {
        const object = { id: 1, x: 10, y: 20, width: 20, height: 20, rotation: 0 };

        const { lines, texts } = getLinesAndTexts(object, room);

        expect(Array.isArray(lines)).toBe(true);
        expect(lines.length).toBeGreaterThan(0);

        expect(Array.isArray(texts)).toBe(true);
        expect(texts.length).toBeGreaterThan(0);

        texts.forEach((t: any) => {
            expect(t.props).toHaveProperty("text");
            expect(t.props).toHaveProperty("x");
            expect(t.props).toHaveProperty("y");
        });
    });

    it("handles rotation 90 correctly", () => {
        const object = { id: 2, x: 10, y: 20, width: 20, height: 10, rotation: 90 };

        const { lines, texts } = getLinesAndTexts(object, room);

        expect(Array.isArray(lines)).toBe(true);
        expect(lines.length).toBeGreaterThan(0);

        expect(texts.length).toBe(2);
    });

    it("calculates distances correctly", () => {
        const SCALE = 1;
        const object = { id: 3, x: 0, y: 0, width: 10, height: 10, rotation: 0 };

        const { texts } = getLinesAndTexts(object, room);

        const topText = texts.find((t: any) => t.key.startsWith("top"));
        const leftText = texts.find((t: any) => t.key.startsWith("left"));

        expect(topText.props.text).toBe("0.00 m");
        expect(leftText.props.text).toBe("0.00 m");
    });
});
