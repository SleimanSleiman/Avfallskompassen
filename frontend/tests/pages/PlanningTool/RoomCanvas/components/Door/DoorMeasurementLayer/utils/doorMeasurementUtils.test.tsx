import { describe, it, expect } from "vitest";
import { getLinesAndTexts } from "../../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Door/DoorMeasurementLayer/utils/doorMeasurementUtils";
import { Text } from "react-konva";

describe("getLinesAndTexts", () => {
    const room = { x: 0, y: 0, width: 500, height: 400 };

    it("returns correct lines and texts for a top wall door", () => {
        const door = { id: 1, width: 90, x: 100, y: 0, wall: "top", rotation: 180 };
        const { lines, texts } = getLinesAndTexts(door, room);

        expect(lines.length).toBe(2);
        lines.forEach((line) => expect(line[1]).toBe(line[3]));

        expect(texts.length).toBe(2);
        texts.forEach((t) => {
            expect((t as any).type).toBe(Text);
            expect((t as any).props.text).toMatch(/m$/);
        });
    });


    it("returns correct lines and texts for a bottom wall door", () => {
        const door = { id: 2, width: 80, x: 200, y: 400, wall: "bottom", rotation: 0 };
        const { lines, texts } = getLinesAndTexts(door, room);

        expect(lines.length).toBe(2);
        expect(lines[0][1]).toBe(lines[1][1]);
        expect(texts.length).toBe(2);
    });

    it("returns correct lines and texts for a left wall door", () => {
        const door = { id: 3, width: 70, x: 0, y: 100, wall: "left", rotation: 90 };
        const { lines, texts } = getLinesAndTexts(door, room);

        expect(lines.length).toBe(2);
        lines.forEach((line) => expect(line[0]).toBe(line[2]));
        expect(texts.length).toBe(2);
        texts.forEach((t) => expect((t as any).props.rotation).toBe(-90));
    });

    it("returns correct lines and texts for a right wall door", () => {
        const door = { id: 4, width: 60, x: 500, y: 200, wall: "right", rotation: 270 };
        const { lines, texts } = getLinesAndTexts(door, room);

        expect(lines.length).toBe(2);
        lines.forEach((line) => expect(line[0]).toBe(line[2]));
        expect(texts.length).toBe(2);
        texts.forEach((t) => expect((t as any).props.rotation).toBe(90));
    });
});
