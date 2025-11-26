import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useSaveRoom } from "../../../../src/pages/PlanningTool/hooks/UseSaveRoom";
import * as WasteRoomRequest from "../../../../src/lib/WasteRoomRequest";

/* ──────────────────────────────────────── Test save room hook ──────────────────────────────────────── */
describe("useSaveRoom", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls createWasteRoom when wasteRoomId is null", async () => {
    const mockCreate = vi.spyOn(WasteRoomRequest, "createWasteRoom").mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useSaveRoom());

    await act(async () => {
      const saved = await result.current.saveRoom({ wasteRoomId: null, x:0, y:0, width: 100, length: 100, doors: [], 
        containers: [], propertyId: 1, name: "Room" });
      expect(saved).toEqual({ id: 1 });
    });

    expect(mockCreate).toHaveBeenCalled();
    expect(result.current.isSaving).toBe(false);
  });

  it("calls updateWasteRoom when wasteRoomId exists", async () => {
    const mockUpdate = vi.spyOn(WasteRoomRequest, "updateWasteRoom").mockResolvedValue({ id: 5 });
    const { result } = renderHook(() => useSaveRoom());

    await act(async () => {
      const saved = await result.current.saveRoom({ wasteRoomId: 5, x:0, y:0, width: 100, 
        length: 100, doors: [], containers: [], propertyId: 1, name: "Room" });
      expect(saved).toEqual({ id: 5 });
    });

    expect(mockUpdate).toHaveBeenCalled();
    expect(result.current.isSaving).toBe(false);
  });

  it("sets isSaving true during saving and false after", async () => {
    vi.useFakeTimers();

    vi.spyOn(WasteRoomRequest, "createWasteRoom").mockResolvedValue(
      new Promise(resolve => setTimeout(() => resolve({ id: 1 }), 10))
    );

    const { result } = renderHook(() => useSaveRoom());

    act(() => {
      result.current.saveRoom({
        wasteRoomId: null,
        x: 0,
        y: 0,
        width: 100,
        length: 100,
        doors: [],
        containers: [],
        propertyId: 1,
        name: "Room",
      });
    });

    await act(async () => {});
    expect(result.current.isSaving).toBe(true);

    await act(async () => {
      vi.runAllTimers();
    });

    expect(result.current.isSaving).toBe(false);
  });
});

/* ─────────────────────────────── Test request builder ─────────────────────────────── */
import { useWasteRoomRequestBuilder } from "../../../../src/pages/PlanningTool/hooks/UseSaveRoom";
import { SCALE } from "../../../../src/pages/PlanningTool/Constants";

describe("useWasteRoomRequestBuilder", () => {

  it("builds a correct request and filters containers", () => {
    const isContainerInsideRoom = vi.fn();
    isContainerInsideRoom.mockImplementation((rect, room) => rect.x !== 999); 

    const { buildWasteRoomRequest } = useWasteRoomRequestBuilder(isContainerInsideRoom);

    const room = {
      id: 10,
      x: 5,
      y: 6,
      width: 4,
      height: 3,
      name: "Room A"
    };

    const doors = [
      { x: 1, y: 2, width: 90, rotation: 45, wall: "north", swingDirection: "in" }
    ];

    const containers = [
      { x: 10, y: 20, width: 2, height: 2, rotation: 90,
        container: { id: 111 } },
        
      { x: 999, y: 20, width: 5, height: 5, rotation: 0,
        container: { id: 222 } }
    ];

    const request = buildWasteRoomRequest(room, doors, containers, 123);

    expect(request).toEqual({
      wasteRoomId: 10,
      x: 5,
      y: 6,
      width: 4 * SCALE,
      length: 3 * SCALE,
      doors: [
        {
          x: 1,
          y: 2,
          width: 90,
          angle: 45,
          wall: "north",
          swingDirection: "in"
        }
      ],
      containers: [
        {
          id: 111,
          x: 10,
          y: 20,
          angle: 90
        }
      ],
      propertyId: 123,
      name: "Room A"
    });

    expect(isContainerInsideRoom).toHaveBeenCalledTimes(2);
  });
});