import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import ContainersLayer from "../../../../../../src/pages/PlanningTool/RoomCanvas/components/Container/ContainersLayer";

// Mock ContainerItem
vi.mock(
    "../../../../../../src/pages/PlanningTool/RoomCanvas/components/Container/components/ContainerItem",
    () => ({
        default: ({ container, selected, handleSelectContainer, handleDragContainer }: any) => (
            <div
                data-testid={`container-${container.id}`}
                data-selected={selected ? "true" : "false"}
                onClick={() => handleSelectContainer(container.id)}
                onDrag={() =>
                    handleDragContainer(container.id, { x: container.x + 10, y: container.y + 10 })
                }
            />
        ),
    })
);

afterEach(() => vi.clearAllMocks());

describe("ContainersLayer component", () => {
    const room = { x: 0, y: 0, width: 500, height: 400 };
    const doorZones = [{ x: 0, y: 0, width: 50, height: 50 }];
    const containersInRoom = [
        { id: 1, x: 10, y: 20, width: 50, height: 50 },
        { id: 2, x: 100, y: 120, width: 60, height: 60 },
    ];
    const otherObjectZones = [];
    const handleDragContainer = vi.fn();
    const handleSelectContainer = vi.fn();
    const getContainerZones = vi.fn(() => []);
    const setIsDraggingContainer = vi.fn();
    const isContainerInsideRoom = vi.fn(() => true);

    it("renders all containers", () => {
        render(
            <ContainersLayer
                containersInRoom={containersInRoom}
                selectedContainerId={null}
                handleDragContainer={handleDragContainer}
                handleSelectContainer={handleSelectContainer}
                room={room}
                doorZones={doorZones}
                otherObjectZones={otherObjectZones}
                getContainerZones={getContainerZones}
                setIsDraggingContainer={setIsDraggingContainer}
                isContainerInsideRoom={isContainerInsideRoom}
            />
        );

        containersInRoom.forEach((container) => {
        const item = screen.getByTestId(`container-${container.id}`);
        expect(item).toBeInTheDocument();
        expect(item.dataset.selected).toBe("false");
        });
    });

    it("marks selected container correctly", () => {
        render(
            <ContainersLayer
                containersInRoom={containersInRoom}
                selectedContainerId={2}
                handleDragContainer={handleDragContainer}
                handleSelectContainer={handleSelectContainer}
                room={room}
                doorZones={doorZones}
                otherObjectZones={otherObjectZones}
                getContainerZones={getContainerZones}
                setIsDraggingContainer={setIsDraggingContainer}
                isContainerInsideRoom={isContainerInsideRoom}
            />
        );

        const selected = screen.getByTestId("container-2");
        const unselected = screen.getByTestId("container-1");

        expect(selected.dataset.selected).toBe("true");
        expect(unselected.dataset.selected).toBe("false");
    });

    it("calls handleSelectContainer on click", () => {
        render(
            <ContainersLayer
                containersInRoom={containersInRoom}
                selectedContainerId={null}
                handleDragContainer={handleDragContainer}
                handleSelectContainer={handleSelectContainer}
                room={room}
                doorZones={doorZones}
                otherObjectZones={otherObjectZones}
                getContainerZones={getContainerZones}
                setIsDraggingContainer={setIsDraggingContainer}
                isContainerInsideRoom={isContainerInsideRoom}
            />
        );

        const item = screen.getByTestId("container-1");
        fireEvent.click(item);

        expect(handleSelectContainer).toHaveBeenCalledWith(1);
    });

    it("calls handleDragContainer on drag", () => {
        render(
            <ContainersLayer
                containersInRoom={containersInRoom}
                selectedContainerId={null}
                handleDragContainer={handleDragContainer}
                handleSelectContainer={handleSelectContainer}
                room={room}
                doorZones={doorZones}
                otherObjectZones={otherObjectZones}
                getContainerZones={getContainerZones}
                setIsDraggingContainer={setIsDraggingContainer}
                isContainerInsideRoom={isContainerInsideRoom}
            />
        );

        const item = screen.getByTestId("container-1");
        fireEvent.drag(item);

        expect(handleDragContainer).toHaveBeenCalledWith(1, { x: 20, y: 30 }); // x+10, y+10 from mock
    });
});
