import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import OtherObjectsMeasurementLayer from "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/OtherObjects/OtherObjectsMeasurementLayer/OtherObjectsMeasurementLayer";
import OtherObjectMeasurement from "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/OtherObjects/OtherObjectsMeasurementLayer/components/OtherObjectMeasurement";

vi.mock(
    "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/OtherObjects/OtherObjectsMeasurementLayer/components/OtherObjectMeasurement",
    () => ({
        default: (props: any) => <div data-testid="measurement">{props.object.id}</div>,
    })
);

describe("OtherObjectsMeasurementLayer", () => {
    const room = { x: 0, y: 0, width: 200, height: 200 };
    const objects = [
        { id: 1, x: 0, y: 0, width: 10, height: 10 },
        { id: 2, x: 5, y: 5, width: 20, height: 20 },
    ];

    it("renders nothing if no object is selected", () => {
        const { queryByTestId } = render(
            <OtherObjectsMeasurementLayer otherObjects={objects} room={room} selectedOtherObjectId={null} />
        );
        expect(queryByTestId("measurement")).toBeNull();
    });

    it("renders only the selected object", () => {
        const { getByTestId, queryByText } = render(
            <OtherObjectsMeasurementLayer otherObjects={objects} room={room} selectedOtherObjectId={2} />
        );
        expect(getByTestId("measurement")).toHaveTextContent("2");
        expect(queryByText("1")).toBeNull();
    });
});
