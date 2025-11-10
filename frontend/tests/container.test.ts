import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchContainersByMunicipalityAndService, type ContainerDTO } from "../src/lib/Container";

//Mocking fetch API
describe("fetchContainersByMunicipalityAndService", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    //Test for successful fetch
    it("should return a list of containers when fetch succeeds", async () => {
        const mockData: ContainerDTO[] = [
            {
                id: 1,
                name: "Container1",
                size: 100,
                width: 50,
                depth: 60,
                height: 70,
                imageFrontViewUrl: "/front1.png",
                imageTopViewUrl: "/top1.png",
                emptyingFrequencyPerYear: 12,
                cost: 200,
            },
            {
                id: 2,
                name: "Container2",
                size: 200,
                width: 80,
                depth: 90,
                height: 100,
                imageFrontViewUrl: "/front2.png",
                imageTopViewUrl: "/top2.png",
                emptyingFrequencyPerYear: 6,
                cost: 400,
            },
        ];

        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockData,
        }));

        const result = await fetchContainersByMunicipalityAndService(1, 2);

        expect(result).toEqual(
            mockData.map(container => ({
                ...container,
                serviceTypeId: 2,
            }))
        );
    });

    //Test for failed fetch
    it("should throw an error when fetch fails", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: false,
        }));

        await expect(fetchContainersByMunicipalityAndService(1, 2))
            .rejects
            .toThrow("Failed to fetch containers by municipality and service");
    });
});
