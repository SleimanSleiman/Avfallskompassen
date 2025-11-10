import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useState } from "react";
import { useContainers } from "../../../../src/pages/PlanningTool/hooks/UseContainers";
import { fetchContainersByMunicipalityAndService } from "../../../../src/lib/Container";

// ─────────────── Mock modules ───────────────
vi.mock("../../../../src/lib/Container");
vi.mocked(fetchContainersByMunicipalityAndService).mockResolvedValue([
    { id: 1, name: "Small Bin", width: 1000, depth: 800, height: 1200, cost: 200 },
]);

const mockRoom = { id: 1, x: 0, y: 0, width: 500, height: 500 };

describe("useContainers", () => {
    let setContainersInRoom: any;
    let containersInRoom: any[];
    let setSelectedContainerId: any;
    let setSelectedDoorId: any;
    
    beforeEach(() => {
        containersInRoom = [];
        setContainersInRoom = vi.fn((updater) => {
            if (typeof updater === "function") {
                containersInRoom = updater(containersInRoom);
            } else {
                containersInRoom = updater;
            }
        });
        setSelectedContainerId = vi.fn();
        setSelectedDoorId = vi.fn();
    });
    
    //Test adding a container to the room
    it("adds a container to the room", () => {
        const { result } = renderHook(() =>
            useContainers(mockRoom, containersInRoom, setContainersInRoom, setSelectedContainerId, setSelectedDoorId)
        );
        
        act(() => {
            result.current.handleAddContainer({
                id: 1,
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
        
        expect(containersInRoom.length).toBe(1);
        expect(setSelectedContainerId).toHaveBeenCalled();
    });
    
    //Test removing a container from the room
    it("removes a container from the room", () => {
        const { result } = renderHook(() =>
            useContainers(mockRoom, containersInRoom, setContainersInRoom, setSelectedContainerId, setSelectedDoorId)
        );
        
        act(() => {
            result.current.handleAddContainer({
                id: 1,
                name: "Container",
                size: 10,
                width: 1000,
                depth: 800,
                height: 1200,
                imageFrontViewUrl: "",
                imageTopViewUrl: "",
                emptyingFrequencyPerYear: 10,
                cost: 100,
            });
        });
    
        const id = containersInRoom[0].id;
    
        act(() => {
            result.current.handleRemoveContainer(id);
        });
        
        expect(containersInRoom.length).toBe(0);
        expect(setSelectedContainerId).toHaveBeenCalledWith(null);
    });
    
    //Test dragging a container to a new position
    it("updates container position when dragged", () => {
        const { result } = renderHook(() =>
            useContainers(mockRoom, containersInRoom, setContainersInRoom, setSelectedContainerId, setSelectedDoorId)
        );
        
        act(() => {
            result.current.handleAddContainer({
                id: 1,
                name: "Movable Container",
                width: 1000,
                depth: 800,
                height: 1200,
                imageFrontViewUrl: "",
                imageTopViewUrl: "",
                emptyingFrequencyPerYear: 10,
                cost: 200,
            });
        });
        
        const id = containersInRoom[0].id;
        
        act(() => {
            result.current.handleDragContainer(id, { x: 200, y: 150 });
        });
        
        const moved = containersInRoom.find((c) => c.id === id);
        expect(moved?.x).toBe(200);
        expect(moved?.y).toBe(150);
    });
    
    //Test rotating a container
    it("rotates container 90° each time and wraps around after 360°", () => {
        const { result } = renderHook(() =>
            useContainers(mockRoom, containersInRoom, setContainersInRoom, setSelectedContainerId, setSelectedDoorId)
        );
        
        act(() => {
            result.current.handleAddContainer({
                id: 1,
                name: "Rotating Container",
                width: 1000,
                depth: 800,
                height: 1200,
                imageFrontViewUrl: "",
                imageTopViewUrl: "",
                emptyingFrequencyPerYear: 10,
                cost: 200,
            });
        });
        
        const id = containersInRoom[0].id;
        
        act(() => {
            result.current.handleRotateContainer(id);
        });
        expect(containersInRoom[0].rotation).toBe(90);
        
        act(() => {
            result.current.handleRotateContainer(id);
            result.current.handleRotateContainer(id);
            result.current.handleRotateContainer(id);
        });
        expect(containersInRoom[0].rotation).toBe(0);
    });
    
    //Test fetching available containers from API
    it("fetches available containers from API", async () => {
        const { result } = renderHook(() =>
            useContainers(mockRoom, containersInRoom, setContainersInRoom, setSelectedContainerId, setSelectedDoorId)
        );
        
        await act(async () => {
            await result.current.fetchAvailableContainers(5);
        });
        
        expect(fetchContainersByMunicipalityAndService).toHaveBeenCalledWith(1, 5);
        expect(result.current.availableContainers.length).toBe(1);
        expect(result.current.isLoadingContainers).toBe(false);
    });
    
    //Test showing container info
    it("sets selected container info when handleShowContainerInfo is called", async () => {
        const { result } = renderHook(() => {
            const [containersInRoom, setContainersInRoom] = useState<any[]>([]);
            return useContainers(
                { id: 1, x: 0, y: 0, width: 500, height: 500 },
                containersInRoom,
                setContainersInRoom,
                vi.fn(),
                vi.fn()
                );
        });
        
        const mockContainer: ContainerDTO = {
            id: 10,
            name: "Info Container",
            width: 1000,
            depth: 800,
            height: 1200,
            imageFrontViewUrl: "/mock/front.png",
            imageTopViewUrl: "/mock/top.png",
            emptyingFrequencyPerYear: 12,
            cost: 250,
            size: 370,
        };
        
        act(() => {
            result.current.handleAddContainer(mockContainer);
        });
        
        await waitFor(() => {
            expect(result.current.containersInRoom.length).toBe(1);
        });
        
        const addedId = result.current.containersInRoom[0].id;
        
        act(() => {
            result.current.handleShowContainerInfo(addedId);
        });
        
        await waitFor(() => {
            expect(result.current.selectedContainerInfo?.name).toBe("Info Container");
        });
    });
});
