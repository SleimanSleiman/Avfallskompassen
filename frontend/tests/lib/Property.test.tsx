import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createProperty,
  updateProperty,
  getMyProperties,
  deleteProperty,
  getMunicipalities,
  getLockTypes,
} from "../../src/lib/Property";
import { api } from "../../src/lib/api";
import { currentUser } from "../../src/lib/Auth";

vi.mock("../../src/lib/api", () => ({
  api: vi.fn(),
}));

vi.mock("../../src/lib/auth", () => ({
  currentUser: vi.fn(),
}));

describe("Property API service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("createProperty sends POST request and normalizes response", async () => {
    vi.mocked(currentUser).mockReturnValue({ username: "TestUser" });
    vi.mocked(api).mockResolvedValue({
      id: 10,
      address: "Testvägen 1",
      numberOfApartments: 5,
      lockName: "Standard",
      accessPathLength: 3,
      municipalityId: 1,
      municipalityName: "Helsingborg",
    });

    const result = await createProperty({
      address: "Testvägen 1",
      numberOfApartments: 5,
      lockTypeId: 1,
      accessPathLength: 3,
      municipalityId: 1,
    });

    expect(api).toHaveBeenCalledWith("/api/properties", expect.objectContaining({
      method: "POST",
      body: {
        address: "Testvägen 1",
        numberOfApartments: 5,
        lockTypeId: 1,
        accessPathLength: 3,
        municipalityId: 1
      }
    }));

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        propertyId: 10,
        address: "Testvägen 1",
        municipalityName: "Helsingborg",
      })
    );
  });

  it("updateProperty sends PUT request", async () => {
    vi.mocked(api).mockResolvedValue({ success: true, message: "" });

    const result = await updateProperty(10, {
      address: "New address",
      numberOfApartments: 12,
      lockTypeId: 1,
      accessPathLength: 4,
      municipalityId: 1
    });

    expect(api).toHaveBeenCalledWith("/api/properties/10", expect.objectContaining({
      method: "PUT",
    }));
    expect(result.success).toBe(true);
  });

  it("getMyProperties calls correct URL", async () => {
    vi.mocked(api).mockResolvedValue([]);

    await getMyProperties();
    expect(api).toHaveBeenCalledWith("/api/properties/my-properties", expect.any(Object));
  });

  it("deleteProperty calls correct URL", async () => {
    vi.mocked(api).mockResolvedValue({ success: true });

    await deleteProperty(77);
    expect(api).toHaveBeenCalledWith("/api/properties/77", expect.any(Object));
  });

  it("getMunicipalities calls correct URL", async () => {
    vi.mocked(api).mockResolvedValue([]);
    await getMunicipalities();
    expect(api).toHaveBeenCalledWith("/api/municipalities", expect.any(Object));
  });

  it("getLockTypes calls correct URL", async () => {
    vi.mocked(api).mockResolvedValue([]);
    await getLockTypes();
    expect(api).toHaveBeenCalledWith("/api/properties/lock-type", expect.any(Object));
  });
});
