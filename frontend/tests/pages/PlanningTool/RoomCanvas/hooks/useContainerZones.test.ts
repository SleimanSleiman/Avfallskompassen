import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import useContainerZones from "../../../../../src/pages/PlanningTool/RoomCanvas/hooks/useContainerZones";

describe("useContainerZones hook", () => {
    let getContainerZonesMock: ReturnType<typeof vi.fn>;
    let getOtherObjectZonesMock: ReturnType<typeof vi.fn>;
    const doorZonesMock = [{ id: "door1" }, { id: "door2" }];

    beforeEach(() => {
        getContainerZonesMock = vi.fn();
        getOtherObjectZonesMock = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("returns doorZones + all container and other object zones when not dragging anything", () => {
        const containerZones = [{ id: "c1" }];
        const otherObjectZones = [{ id: "o1" }];
        getContainerZonesMock.mockReturnValue(containerZones);
        getOtherObjectZonesMock.mockReturnValue(otherObjectZones);

        const { result } = renderHook(() =>
            useContainerZones({
                isDraggingContainer: false,
                isDraggingOtherObject: false,
                selectedContainerId: null,
                selectedOtherObjectId: null,
                draggedContainer: null,
                getContainerZones: getContainerZonesMock,
                getOtherObjectZones: getOtherObjectZonesMock,
                doorZones: doorZonesMock,
            })
        );

        expect(result.current).toEqual([...doorZonesMock, ...otherObjectZones, ...containerZones]);
        expect(getContainerZonesMock).toHaveBeenCalled();
        expect(getOtherObjectZonesMock).toHaveBeenCalled();
    });

    it("removes the zone of the selected container when dragging an existing container", () => {
        const containerZones = [{ id: "c1" }];
        const otherObjectZones = [{ id: "o1" }];
        getContainerZonesMock.mockReturnValue(containerZones);
        getOtherObjectZonesMock.mockReturnValue(otherObjectZones);

        const { result } = renderHook(() =>
            useContainerZones({
                isDraggingContainer: true,
                isDraggingOtherObject: false,
                selectedContainerId: 1,
                selectedOtherObjectId: null,
                draggedContainer: null,
                getContainerZones: getContainerZonesMock,
                getOtherObjectZones: getOtherObjectZonesMock,
                doorZones: doorZonesMock,
            })
        );

        expect(getContainerZonesMock).toHaveBeenCalledWith(1);
        expect(result.current).toEqual([...doorZonesMock, ...otherObjectZones, ...containerZones]);
    });

    it("returns all zones except the dragged container when dragging a new container", () => {
        const containerZones = [{ id: "c1" }];
        const otherObjectZones = [{ id: "o1" }];
        getContainerZonesMock.mockReturnValue(containerZones);
        getOtherObjectZonesMock.mockReturnValue(otherObjectZones);

        const { result } = renderHook(() =>
            useContainerZones({
                isDraggingContainer: true,
                isDraggingOtherObject: false,
                selectedContainerId: null,
                selectedOtherObjectId: null,
                draggedContainer: { id: "new" },
                getContainerZones: getContainerZonesMock,
                getOtherObjectZones: getOtherObjectZonesMock,
                doorZones: doorZonesMock,
            })
        );

        expect(getContainerZonesMock).toHaveBeenCalledWith();
        expect(result.current).toEqual([...doorZonesMock, ...otherObjectZones, ...containerZones]);
    });

    it("removes the zone of the selected other object when dragging it", () => {
        const containerZones = [{ id: "c1" }];
        const otherObjectZones = [{ id: "o1" }];
        getContainerZonesMock.mockReturnValue(containerZones);
        getOtherObjectZonesMock.mockReturnValue(otherObjectZones);

        const { result } = renderHook(() =>
            useContainerZones({
                isDraggingContainer: false,
                isDraggingOtherObject: true,
                selectedContainerId: null,
                selectedOtherObjectId: 42,
                draggedContainer: null,
                getContainerZones: getContainerZonesMock,
                getOtherObjectZones: getOtherObjectZonesMock,
                doorZones: doorZonesMock,
            })
        );

        expect(getOtherObjectZonesMock).toHaveBeenCalledWith(42);
        expect(result.current).toEqual([...doorZonesMock, ...otherObjectZones, ...containerZones]);
    });

    it("filters out falsy values from combined zones", () => {
        const containerZones = [{ id: "c1" }, null, undefined];
        const otherObjectZones = [null, { id: "o1" }];
        getContainerZonesMock.mockReturnValue(containerZones);
        getOtherObjectZonesMock.mockReturnValue(otherObjectZones);

        const { result } = renderHook(() =>
            useContainerZones({
                isDraggingContainer: false,
                isDraggingOtherObject: false,
                selectedContainerId: null,
                selectedOtherObjectId: null,
                draggedContainer: null,
                getContainerZones: getContainerZonesMock,
                getOtherObjectZones: getOtherObjectZonesMock,
                doorZones: [...doorZonesMock, null],
            })
        );

        expect(result.current).toEqual([
            ...doorZonesMock,
            { id: "o1" },
            { id: "c1" },
        ]);
    });
});
