import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import OtherObjectMeasurement from "../../../../../../../../src/pages/PlanningTool/RoomCanvas/components/OtherObjects/OtherObjectsMeasurementLayer/components/OtherObjectMeasurement";
import * as Utils from "../../../../../../../../src/pages/PlanningTool/RoomCanvas/components/OtherObjects/OtherObjectsMeasurementLayer/utils/OtherObjectMeasurementUtils";

// Mock react-konva
vi.mock("react-konva", () => {
    const React = require("react");
    return {
        Line: (props: any) => <div data-testid="line" {...props}></div>,
        Text: (props: any) => <div data-testid="text" {...props}></div>,
    };
});

describe("OtherObjectMeasurement", () => {
    const room = { x: 0, y: 0, width: 200, height: 200 };

    it("renders nothing if object has non-positive dimensions", () => {
        const object = { id: 1, x: 0, y: 0, width: 0, height: 10 };
        const { container } = render(<OtherObjectMeasurement object={object} room={room} />);
        expect(container.firstChild).toBeNull();
    });

    it("renders lines and texts from getLinesAndTexts", () => {
        const object = { id: 2, x: 0, y: 0, width: 20, height: 30 };

        const lines = [
            [0, 0, 10, 0],
            [0, 0, 0, 10]
        ];
        const texts = [<div key="text1" data-testid="text">Measurement</div>];

        vi.spyOn(Utils, "getLinesAndTexts").mockReturnValue({ lines, texts });

        const { getAllByTestId } = render(<OtherObjectMeasurement object={object} room={room} />);

        expect(getAllByTestId("line")).toHaveLength(lines.length);
        expect(getAllByTestId("text")).toHaveLength(texts.length);
    });
});
