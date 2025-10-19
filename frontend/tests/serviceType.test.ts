import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchServiceTypes } from "../src/lib/serviceType";

//Mocking fetch API
describe("fetchServiceTypes", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    //Test for successful fetch
    it("returns service types when fetch is successful", async () => {
        const mockData = [
            { id: 1, name: "Trädgårdsavfall" },
            { id: 2, name: "Elektronik" },
        ];

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockData),
            } as Response)
        );

        const result = await fetchServiceTypes();
        expect(result).toEqual(mockData);
    });

    //Test for failed fetch
    it("throws an error when fetch fails", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
            } as Response)
        );

        await expect(fetchServiceTypes()).rejects.toThrow(
            "Failed to fetch service types"
        );
    });
});
