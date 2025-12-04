import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import OtherObjectDrag from "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/OtherObjects/components/OtherObjectsDrag";

// Mock react-konva
vi.mock("react-konva", () => {
    const React = require("react");
    return { Group: (props: any) => <div {...props}>{props.children}</div> };
});

describe("OtherObjectDrag test", () => {
    const object = { id: 1, x: 0, y: 0, width: 10, height: 10, rotation: 0 };
    const room = { x: 0, y: 0, width: 100, height: 100 };
    const noop = () => {};

    it("renders children", () => {
        const { getByText } = render(
            <OtherObjectDrag
                object={object}
                selected={false}
                room={room}
                doorZones={[]}
                containerZones={[]}
                getOtherObjectZones={() => []}
                handleSelectOtherObject={noop}
                handleDragOtherObject={noop}
                setIsDraggingOtherObject={noop}
            >
                {({ isOverZone }) => <span>{isOverZone ? "over" : "not over"}</span>}
            </OtherObjectDrag>
            );
        expect(getByText("not over")).toBeDefined();
    });
});
