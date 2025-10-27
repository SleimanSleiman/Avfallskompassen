import { render } from "@testing-library/react";
import DoorMeasurementLayer from "../../../../src/pages/PlanningTool/RoomCanvas/DoorMeasurementLayer";
import type { Door } from "../../../../src/types";

describe("DoorMeasurementLayer", () => {
    const room = { x: 0, y: 0, width: 500, height: 400 };
    const doors: Door[] = [
        { id: 1, width: 90, x: 100, y: 0, wall: "top", rotation: 180 },
        { id: 2, width: 80, x: 400, y: 400, wall: "bottom", rotation: 0 },
    ];

    it("renders without crashing", () => {
        const { container } = render(<DoorMeasurementLayer doors={doors} room={room} />);
        // Ensure the component renders without throwing errors
        expect(container).toBeTruthy();
    });
});
