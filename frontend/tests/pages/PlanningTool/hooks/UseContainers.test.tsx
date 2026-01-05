import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useContainers } from "../../../../src/pages/PlanningTool/hooks/UseContainers";
import { fetchContainersByMunicipalityAndService } from "../../../../src/lib/Container";

// ─────────────── Mock modules ───────────────
vi.mock("../../../../src/lib/Container", () => ({
    fetchContainersByMunicipalityAndService: vi.fn(),
}));


// ─────────────── Test data ───────────────
const room = { x: 0, y: 0, width: 500, height: 400 };
const containerDTO = { id: 1, width: 1000, depth: 800, name: "Test Container" };

describe("useContainers hook", () => {
    let setSelectedContainerId: ReturnType<typeof vi.fn>;
    let setSelectedDoorId: ReturnType<typeof vi.fn>;
    let setSelectedOtherObjectId: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        setSelectedContainerId = vi.fn();
        setSelectedDoorId = vi.fn();
        setSelectedOtherObjectId = vi.fn();
        vi.clearAllMocks();
    });

    it("should add a container in a valid position", () => {
        const { result } = renderHook(() =>
            useContainers(room, setSelectedContainerId, setSelectedDoorId, setSelectedOtherObjectId)
        );

        act(() => {
            result.current.handleAddContainer(containerDTO);
        });

        expect(result.current.containersInRoom.length).toBe(1);
        expect(setSelectedContainerId).toHaveBeenCalledWith(expect.any(Number));
    });

    it("should remove a container", () => {
        const saveMock = vi.fn();

        const { result } = renderHook(() =>
            useContainers(room, setSelectedContainerId, setSelectedDoorId, setSelectedOtherObjectId)
        );

        act(() => {
            result.current.handleRemoveContainer(123);
        });

        expect(result.current.containersInRoom).toEqual([]);
        expect(setSelectedContainerId).toHaveBeenCalledWith(null);
    });

    it("should rotate a container", () => {
        const { result } = renderHook(() =>
            useContainers(room, setSelectedContainerId, setSelectedDoorId, setSelectedOtherObjectId)
        );

        act(() => {
            result.current.handleAddContainer(containerDTO);
        });

        const id = result.current.containersInRoom[0].id;

        act(() => {
            result.current.handleRotateContainer(id);
        });

        expect(result.current.containersInRoom[0].rotation).toBe(90);
    });

    it("should handle container selection", () => {
        const { result } = renderHook(() =>
            useContainers(room, setSelectedContainerId, setSelectedDoorId, setSelectedOtherObjectId)
        );

        act(() => {
            result.current.handleSelectContainer(42);
        });

        expect(setSelectedContainerId).toHaveBeenCalledWith(42);
        expect(setSelectedDoorId).toHaveBeenCalledWith(null);
        expect(setSelectedOtherObjectId).toHaveBeenCalledWith(null);
    });

    it("should fetch available containers and set state", async () => {
        (fetchContainersByMunicipalityAndService as any).mockResolvedValue([
            { id: 10, width: 100, depth: 100, name: "Fetched Container" },
        ]);

        const { result } = renderHook(() =>
            useContainers(room, setSelectedContainerId, setSelectedDoorId, setSelectedOtherObjectId)
        );

        await act(async () => {
            await result.current.fetchAvailableContainers({ id: 1, name: "Service" });
        });

        expect(result.current.availableContainers.length).toBe(1);
        expect(result.current.availableContainers[0].name).toBe("Fetched Container");
        expect(result.current.isLoadingContainers).toBe(false);
    });

    it("should handle stage drop with valid data", () => {
        const { result } = renderHook(() =>
            useContainers(room, setSelectedContainerId, setSelectedDoorId, setSelectedOtherObjectId)
        );

        const stageRefMock = { querySelector: () => ({ getBoundingClientRect: () => ({ left: 0, top: 0, width: 500, height: 400 }) }) };
        result.current.stageWrapperRef.current = stageRefMock as any;

        const dataTransfer = {
            getData: vi.fn(() => JSON.stringify(containerDTO)),
            types: ["application/container"],
            dropEffect: "",
        };

        const event = { preventDefault: vi.fn(), clientX: 100, clientY: 100, dataTransfer };

        act(() => {
            result.current.handleStageDrop(event as any);
        });

        expect(result.current.containersInRoom.length).toBe(1);
    });

    it("should correctly report if container is inside the room", () => {
        const { result } = renderHook(() =>
            useContainers(room, setSelectedContainerId, setSelectedDoorId, setSelectedOtherObjectId)
        );

        const inside = result.current.isContainerInsideRoom({ x: 10, y: 10, width: 50, height: 50 }, room);
        const outside = result.current.isContainerInsideRoom({ x: -10, y: -10, width: 50, height: 50 }, room);

        expect(inside).toBe(true);
        expect(outside).toBe(false);
    });
});
