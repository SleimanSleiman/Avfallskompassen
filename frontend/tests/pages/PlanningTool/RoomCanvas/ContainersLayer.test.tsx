import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ContainersLayer from "../../../../src/pages/PlanningTool/RoomCanvas/ContainersLayer";
import { vi, describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom";

// ─────────────── Mock react-konva ───────────────
vi.mock("react-konva", () => ({
    Group: ({ children, ...props }: any) => {
        return <div data-testid={props["data-testid"] ?? "group"} {...props}>{children}</div>;
    },
    Rect: (props: any) => <div data-testid="rect" {...props} />,
    Image: (props: any) => <div data-testid="image" {...props} />,
    Text: (props: any) => <div data-testid="text" {...props} />,
}));

afterEach(cleanup);

// ─────────────── Room, door and containers dimensions ───────────────
const room = { x: 0, y: 0, width: 500, height: 400 };
const doors = [{ id: 1, width: 100, x: 100, y: 0, wall: "top", rotation: 0 }];
const containers = [
    { id: 1, x: 50, y: 50, width: 40, height: 40, rotation: 0 },
    { id: 2, x: 200, y: 100, width: 60, height: 60, rotation: 90 },
];

//Mock door zones and overlapping function
const doorZones = [{ x: 100, y: 0, width: 100, height: 100 }];
const isOverlapping = vi.fn(() => false);

describe("ContainersLayer", () => {
    //Test that all containers render correctly
    it("renders all containers", () => {
        render(
            <ContainersLayer
                containersInRoom={containers}
                selectedContainerId={null}
                handleDragContainer={() => {}}
                handleSelectContainer={() => {}}
                room={room}
                doors={doors}
                doorZones={doorZones}
                isOverlapping={isOverlapping}
                setIsDraggingContainer={() => {}}
            />
        );

        containers.forEach((c) => {
            const group = screen.getByTestId(c.id.toString());
            expect(group).toBeInTheDocument();
        });
    });

    //Test that selected container is marked correctly
    it("marks selected container correctly", () => {
        render(
            <ContainersLayer
                containersInRoom={containers}
                selectedContainerId={2}
                handleDragContainer={() => {}}
                handleSelectContainer={() => {}}
                room={room}
                doors={doors}
                doorZones={doorZones}
                isOverlapping={isOverlapping}
                setIsDraggingContainer={() => {}}
            />
        );

        const selectedGroup = screen.getByTestId("2");
        const rect = selectedGroup.querySelector('[data-testid="rect"]');
        expect(rect).toHaveAttribute("fill", "#7fd97f");
    });

    //Test that clicking a container calls the select handler
    it("calls handleSelectContainer when container clicked", () => {
        const mockSelect = vi.fn();

        render(
            <ContainersLayer
                containersInRoom={containers}
                selectedContainerId={null}
                handleDragContainer={() => {}}
                handleSelectContainer={mockSelect}
                room={room}
                doors={doors}
                doorZones={doorZones}
                isOverlapping={isOverlapping}
                setIsDraggingContainer={() => {}}
            />
        );

        const group1 = screen.getByTestId("1");
        fireEvent.click(group1);
        expect(mockSelect).toHaveBeenCalledWith(1);
    });

    //Test that dragging a container calls the drag handler with correct adjusted position
    it("calls handleDragContainer on drag end", () => {
        const mockDrag = vi.fn();

        render(
            <ContainersLayer
                containersInRoom={containers}
                selectedContainerId={null}
                handleDragContainer={mockDrag}
                handleSelectContainer={() => {}}
                room={room}
                doors={doors}
                doorZones={doorZones}
                isOverlapping={isOverlapping}
                setIsDraggingContainer={() => {}}
            />
        );

        const group1 = screen.getByTestId("1");

        Object.defineProperty(group1, "x", { value: () => 100 });
        Object.defineProperty(group1, "y", { value: () => 100 });

        fireEvent.dragEnd(group1, { target: group1 });

        expect(mockDrag).toHaveBeenCalledWith(1, {
            x: 100 - containers[0].width / 2,
            y: 100 - containers[0].height / 2
        });
    });

    //Test that dragging a container outside room boundaries is handled
    it("does not allow container to go outside room boundaries", () => {
        const mockDrag = vi.fn();

        render(
            <ContainersLayer
                containersInRoom={containers}
                selectedContainerId={null}
                handleDragContainer={mockDrag}
                handleSelectContainer={() => {}}
                room={room}
                doors={doors}
                doorZones={doorZones}
                isOverlapping={isOverlapping}
                setIsDraggingContainer={() => {}}
            />
        );

        const group1 = screen.getByTestId("1");

        const mockEvent = { target: { x: () => -100, y: () => -100 } };
        fireEvent.dragEnd(group1, mockEvent);

        expect(mockDrag).toHaveBeenCalled();
    });
});
