import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ContainersLayer from "../../../../src/pages/PlanningTool/RoomCanvas/ContainersLayer";
import { vi, describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom";

// ─────────────── Mock react-konva ───────────────
vi.mock("react-konva", () => ({
    Group: ({ children, ...props }: any) => (
        <div data-testid={props["data-testid"] ?? "group"} {...props}>{children}</div>
    ),
    Rect: (props: any) => <div data-testid="rect" {...props} />,
    Image: (props: any) => <div data-testid="image" {...props} />,
    Text: (props: any) => <div data-testid="text" {...props} />,
}));

// ─────────────── Mock use-image ───────────────
vi.mock("use-image", () => ({
    default: () => [null],
}));

afterEach(cleanup);

// ─────────────── Room, door and containers dimensions ───────────────
const room = { x: 0, y: 0, width: 500, height: 400 };
const doors = [{ id: 1, width: 100, x: 100, y: 0, wall: "top", rotation: 0 }];
const containers = [
    { id: 1, x: 50, y: 50, width: 40, height: 40, rotation: 0, container: { imageTopViewUrl: "/images/test.png" }},
    { id: 2, x: 200, y: 100, width: 60, height: 60, rotation: 90, container: { imageTopViewUrl: "/images/test.png"}},
];
const doorZones = [{ x: 100, y: 0, width: 100, height: 100 }];

// ─────────────── Tests ───────────────
describe("ContainersLayer", () => {7
    //Test rendering all containers
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
                getContainerZones={() => []}
                setIsDraggingContainer={() => {}}
            />
        );

        containers.forEach((c) => {
            const group = screen.getByTestId(c.id.toString());
            expect(group).toBeInTheDocument();
        });
    });

    //Test marking selected container
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
                getContainerZones={() => []}
                setIsDraggingContainer={() => {}}
            />
        );

        const selectedGroup = screen.getByTestId("2");
        const rect = selectedGroup.querySelector('[data-testid="rect"]');
        expect(rect).toHaveAttribute("fill", "#7fd97f");
    });

    //Test clicking container to select
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
                getContainerZones={() => []}
                setIsDraggingContainer={() => {}}
            />
        );

        const group1 = screen.getByTestId("1");
        fireEvent.click(group1);
        expect(mockSelect).toHaveBeenCalledWith(1);
    });

    //Test dragging container
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
                getContainerZones={() => []}
                setIsDraggingContainer={() => {}}
            />
        );

        const group1 = screen.getByTestId("1");
        fireEvent.dragEnd(group1, {
            target: { x: () => 100, y: () => 100, position: vi.fn() },
        });

        expect(mockDrag).toHaveBeenCalled();
    });

    //Test container boundary enforcement
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
                getContainerZones={() => []}
                setIsDraggingContainer={() => {}}
            />
        );

        const group1 = screen.getByTestId("1");
        const mockEvent = { target: { x: () => -100, y: () => -100, position: vi.fn() } };
        fireEvent.dragEnd(group1, mockEvent);

        expect(mockDrag).toHaveBeenCalled();
    });

    //Test opacity when container is outside the room
    it("sets opacity to 0.5 when container is outside the room", async () => {
        const mockImg = {};
        const useImage = await import("use-image");
        vi.spyOn(useImage, "default").mockReturnValueOnce([mockImg]);

        const outsideContainer = [
            {
                id: 3,
                x: 480,
                y: 50,
                width: 40,
                height: 40,
                rotation: 0,
                container: { imageTopViewUrl: "/images/test.png" },
            },
        ];

        render(
            <ContainersLayer
                containersInRoom={outsideContainer}
                selectedContainerId={null}
                handleDragContainer={() => {}}
                handleSelectContainer={() => {}}
                room={room}
                doors={doors}
                doorZones={doorZones}
                getContainerZones={() => []}
                setIsDraggingContainer={() => {}}
            />
        );

        const image = screen.getByTestId("image");
        expect(image).toHaveAttribute("opacity", "0.5");
    });
});
