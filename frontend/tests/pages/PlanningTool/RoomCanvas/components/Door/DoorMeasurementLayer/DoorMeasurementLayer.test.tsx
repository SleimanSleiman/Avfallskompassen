// DoorMeasurementLayer.test.tsx
import { render, screen, cleanup } from "@testing-library/react";
import DoorMeasurementLayer from
"../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Door/DoorMeasurementLayer/DoorMeasurementLayer";
import { vi, describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom";

// ─────────────── Mock DoorMeasurement ───────────────
vi.mock(
    "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Door/DoorMeasurementLayer/components/DoorMeasurement",
    () => ({
        default: ({ door }: any) => <div data-testid={`door-measurement-${door.id}`} />,
    })
);

afterEach(cleanup);

const room = { x: 0, y: 0, width: 500, height: 400 };

describe("DoorMeasurementLayer", () => {
    it("renders one DoorMeasurement per selected door", () => {
        const doors = [
            { id: 1, width: 90, x: 100, y: 0, wall: "top", rotation: 180 },
            { id: 2, width: 80, x: 400, y: 400, wall: "bottom", rotation: 0 },
        ];

        // Only door 1 is selected
        render(<DoorMeasurementLayer doors={doors} room={room} selectedDoorId={1} />);

        expect(screen.getByTestId("door-measurement-1")).toBeInTheDocument();
        expect(screen.queryByTestId("door-measurement-2")).not.toBeInTheDocument();
    });

    it("renders nothing when no doors are selected", () => {
        const doors = [
            { id: 1, width: 90, x: 100, y: 0, wall: "top", rotation: 180 },
            { id: 2, width: 80, x: 400, y: 400, wall: "bottom", rotation: 0 },
        ];
        render(<DoorMeasurementLayer doors={doors} room={room} selectedDoorId={null} />);
        const renderedDoors = document.querySelectorAll('[data-testid^="door-measurement-"]');
        expect(renderedDoors.length).toBe(0);
    });

    it("renders nothing when no doors are provided", () => {
        render(<DoorMeasurementLayer doors={[]} room={room} selectedDoorId={null} />);
        const renderedDoors = document.querySelectorAll('[data-testid^="door-measurement-"]');
        expect(renderedDoors.length).toBe(0);
    });
});
