import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor} from "@testing-library/react";
import { useContainers } from "../../../../src/pages/PlanningTool/hooks/UseContainers";
import { fetchContainersByMunicipalityAndService } from "../../../../src/lib/Container";

//Mock dependencies
vi.mock("../../../../src/lib/Container");
vi.mocked(fetchContainersByMunicipalityAndService).mockResolvedValue([
    { id: 1, width: 1000, depth: 800, name: "Small Bin" },
]);

const mockRoom = { id: 1, x: 0, y: 0, width: 500, height: 500 };

describe("useContainers", () => {

    //Add container
    it("adds a container to the room", () => {
        const setSelectedContainerId = vi.fn();
        const setSelectedDoorId = vi.fn();

        const { result } = renderHook(() =>
        useContainers(mockRoom, setSelectedContainerId, setSelectedDoorId)
        );

        act(() => {
            result.current.handleAddContainer({
                name: "Test Container",
                size: 15,
                width: 1000,
                depth: 800,
                height: 1200,
                imageFrontViewUrl: "/mock/front.png",
                imageTopViewUrl: "/mock/top.png",
                emptyingFrequencyPerYear: 12,
                cost: 250,
            });
        });

        const containers = result.current.containersInRoom;
        expect(containers.length).toBe(1);
        expect(setSelectedContainerId).toHaveBeenCalled();
    });

    //Remove container
    it("removes a container from the room", () => {
        const setSelectedContainerId = vi.fn();
        const setSelectedDoorId = vi.fn();

        const { result } = renderHook(() =>
        useContainers(mockRoom, setSelectedContainerId, setSelectedDoorId)
        );

        act(() => {
            result.current.handleAddContainer({
                name: "Test Container",
                size: 15,
                width: 1000,
                depth: 800,
                height: 1200,
                imageFrontViewUrl: "/mock/front.png",
                imageTopViewUrl: "/mock/top.png",
                emptyingFrequencyPerYear: 12,
                cost: 250,
            });
        });

        const containerId = result.current.containersInRoom[0].id;

        act(() => {
        result.current.handleRemoveContainer(containerId);
        });

        expect(result.current.containersInRoom.length).toBe(0);
        expect(setSelectedContainerId).toHaveBeenCalledWith(null);
    });

    //Drag container
    it("updates container position when dragged", () => {
        const setSelectedContainerId = vi.fn();
        const setSelectedDoorId = vi.fn();

        const { result } = renderHook(() =>
        useContainers(mockRoom, setSelectedContainerId, setSelectedDoorId)
        );

        act(() => {
        result.current.handleAddContainer({
            name: "Test Container",
            size: 15,
            width: 1000,
            depth: 800,
            height: 1200,
            imageFrontViewUrl: "/mock/front.png",
            imageTopViewUrl: "/mock/top.png",
            emptyingFrequencyPerYear: 12,
            cost: 250,
        });
    });

        const containerId = result.current.containersInRoom[0].id;

        act(() => {
        result.current.handleDragContainer(containerId, { x: 200, y: 150 });
        });

        const moved = result.current.containersInRoom.find(c => c.id === containerId);
        expect(moved?.x).toBe(200);
        expect(moved?.y).toBe(150);
    });

    //Select container
    it("selects a container and clears door selection", () => {
        const setSelectedContainerId = vi.fn();
        const setSelectedDoorId = vi.fn();

        const { result } = renderHook(() =>
        useContainers(mockRoom, setSelectedContainerId, setSelectedDoorId)
        );

        act(() => {
        result.current.handleSelectContainer(42);
        });

        expect(setSelectedContainerId).toHaveBeenCalledWith(42);
        expect(setSelectedDoorId).toHaveBeenCalledWith(null);
    });


    //Rotate container
    it("rotates the container by 90 degrees each time", () => {
        const setSelectedContainerId = vi.fn();
        const setSelectedDoorId = vi.fn();

        const { result } = renderHook(() =>
            useContainers(mockRoom, setSelectedContainerId, setSelectedDoorId)
        );

        act(() => {
            result.current.handleAddContainer({
            name: "Rotating Container",
            size: 10,
            width: 500,
            depth: 400,
            height: 600,
            imageFrontViewUrl: "/mock/front.png",
            imageTopViewUrl: "/mock/top.png",
            emptyingFrequencyPerYear: 10,
            cost: 100,
            });
        });

        const containerId = result.current.containersInRoom[0].id;

        // Rotate once
        act(() => {
            result.current.handleRotateContainer(containerId);
        });

        let rotated = result.current.containersInRoom.find(c => c.id === containerId);
        expect(rotated?.rotation).toBe(90);

        // Rotate four times total (should wrap around)
        act(() => {
            result.current.handleRotateContainer(containerId);
            result.current.handleRotateContainer(containerId);
            result.current.handleRotateContainer(containerId);
        });

        rotated = result.current.containersInRoom.find(c => c.id === containerId);
        expect(rotated?.rotation).toBe(0);
    });

    //Test to ensure overlapping containers are not added
    it("does not add overlapping container", () => {
        const { result } = renderHook(() =>
            useContainers(mockRoom, vi.fn(), vi.fn())
        );

        const mockContainer = {
            id: 1,
            name: "Overlap Test",
            width: 1000,
            depth: 800,
        };

        act(() => {
            result.current.handleAddContainer(mockContainer);
        });

        //Try to add another container at same position
        act(() => {
            result.current.handleAddContainer(mockContainer, {
                x: result.current.containersInRoom[0].x,
                y: result.current.containersInRoom[0].y,
            });
        });

        //Still only 1 container — second was invalid
        expect(result.current.containersInRoom.length).toBe(1);
    });

    //Test showing container info
    it("sets selected container info when handleShowContainerInfo is called", () => {
      const { result } = renderHook(() =>
        useContainers(mockRoom, vi.fn(), vi.fn())
      );

      act(() => {
        result.current.handleAddContainer({
          name: "Info Container",
          width: 1000,
          depth: 800,
          height: 1200,
          imageFrontViewUrl: "/mock/front.png",
          imageTopViewUrl: "/mock/top.png",
          emptyingFrequencyPerYear: 12,
          cost: 250,
        });
      });

      const id = result.current.containersInRoom[0].id;

      act(() => {
        result.current.handleShowContainerInfo(id);
      });

      expect(result.current.selectedContainerInfo?.name).toBe("Info Container");
    });

    //Test fetching available containers from API
    it("fetches available containers from API", async () => {
      const { result } = renderHook(() =>
        useContainers(mockRoom, vi.fn(), vi.fn())
      );

      await act(async () => {
        await result.current.fetchAvailableContainers(5);
      });

      expect(vi.mocked(fetchContainersByMunicipalityAndService)).toHaveBeenCalledWith(1, 5);
      expect(result.current.availableContainers.length).toBe(1);
      expect(result.current.isLoadingContainers).toBe(false);
    });

});