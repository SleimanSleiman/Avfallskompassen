import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import useContainerZones from "../../../../../src/pages/PlanningTool/RoomCanvas/hooks/useContainerZones";

describe("useContainerZones hook", () => {
    const doorZonesMock = [{ id: "door1" }, { id: "door2" }];
    const getContainerZonesMock = vi.fn();

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("returns only doorZones when not dragging any container", () => {
        const { result } = renderHook(() =>
            useContainerZones({
                isDraggingContainer: false,
                selectedContainerId: null,
                draggedContainer: null,
                getContainerZones: getContainerZonesMock,
                doorZones: doorZonesMock,
            })
        );

        expect(result.current).toEqual(doorZonesMock);
        expect(getContainerZonesMock).not.toHaveBeenCalled();
    });

    it("returns doorZones + zones for selected container when dragging existing container", () => {
        const containerZones = [{ id: "container1" }];
        getContainerZonesMock.mockReturnValue(containerZones);

        const { result } = renderHook(() =>
            useContainerZones({
                isDraggingContainer: true,
                selectedContainerId: 1,
                draggedContainer: null,
                getContainerZones: getContainerZonesMock,
                doorZones: doorZonesMock,
            })
        );

        expect(result.current).toEqual([...doorZonesMock, ...containerZones]);
        expect(getContainerZonesMock).toHaveBeenCalledWith(1);
    });

    it("returns doorZones + zones for dragged container when dragging new container", () => {
        const draggedZones = [{ id: "dragged" }];
        getContainerZonesMock.mockReturnValue(draggedZones);

        const { result } = renderHook(() =>
            useContainerZones({
                isDraggingContainer: true,
                selectedContainerId: null,
                draggedContainer: { id: "newContainer" },
                getContainerZones: getContainerZonesMock,
                doorZones: doorZonesMock,
            })
        );

        expect(result.current).toEqual([...doorZonesMock, ...draggedZones]);
        expect(getContainerZonesMock).toHaveBeenCalledWith();
    });

    it("returns only doorZones if draggedContainer is null and not dragging existing container", () => {
        const { result } = renderHook(() =>
            useContainerZones({
                isDraggingContainer: true,
                selectedContainerId: null,
                draggedContainer: null,
                getContainerZones: getContainerZonesMock,
                doorZones: doorZonesMock,
            })
        );

        expect(result.current).toEqual(doorZonesMock);
        expect(getContainerZonesMock).not.toHaveBeenCalled();
    });

    it("filters out falsy values from combined zones", () => {
        const containerZones = [{ id: "container1" }, null, undefined];
        getContainerZonesMock.mockReturnValue(containerZones);

        const { result } = renderHook(() =>
            useContainerZones({
                isDraggingContainer: true,
                selectedContainerId: 1,
                draggedContainer: null,
                getContainerZones: getContainerZonesMock,
                doorZones: [...doorZonesMock, null],
            })
        );

        expect(result.current).toEqual([...doorZonesMock, { id: "container1" }]);
    });
});
