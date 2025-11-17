import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWasteRoomsByPropertyId } from "../../src/lib/WasteRoom";
import { get } from "../../src/lib/api";
import type { WasteRoom } from "../../src/lib/WasteRoom";

vi.mock("../../src/lib/api", () => ({
  get: vi.fn(),
}));

describe("getWasteRoomsByPropertyId", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("calls the correct API endpoint", async () => {
    const mockData: WasteRoom[] = [
      {
        id: 1,
        length: 5,
        width: 4,
        x: 0,
        y: 0,
        createdAt: "2025-01-01",
        property: {
          id: 10,
          address: "Testgatan 1",
          numberOfApartments: 12,
          accessPathLength: 3,
          createdAt: "2025-01-01"
        }
      }
    ];

    vi.mocked(get).mockResolvedValue(mockData);

    const result = await getWasteRoomsByPropertyId(10);

    expect(get).toHaveBeenCalledWith("/api/properties/10/wasterooms");
    expect(result).toEqual(mockData);
  });

  it("throws if the API call rejects", async () => {
    vi.mocked(get).mockRejectedValue(new Error("Network error"));

    await expect(getWasteRoomsByPropertyId(10)).rejects.toThrow("Network error");
  });
});
