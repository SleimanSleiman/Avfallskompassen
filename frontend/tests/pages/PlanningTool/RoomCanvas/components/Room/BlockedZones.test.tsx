import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import BlockedZones from "../../../../../../src/pages/PlanningTool/RoomCanvas/components/Room/BlockedZones";
import { Group, Rect } from "react-konva";

vi.mock("react-konva", () => ({
    Group: (props: any) => <div data-testid="group">{props.children}</div>,
    Rect: () => <div data-testid="rect" />,
}));

describe("BlockedZones", () => {
    it("renders correct number of groups and rects", () => {
        const zones = [
            { x: 0, y: 0, width: 50, height: 50 },
            { x: 10, y: 20, width: 100, height: 100 },
        ];

        const { getAllByTestId } = render(<BlockedZones zones={zones} />);

        const groups = getAllByTestId("group");
        const rects = getAllByTestId("rect");

        expect(groups).toHaveLength(zones.length);
        expect(rects).toHaveLength(zones.length * 2);
    });
});
