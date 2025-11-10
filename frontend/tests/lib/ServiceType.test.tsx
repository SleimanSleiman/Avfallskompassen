import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchServiceTypes } from '../../src/lib/ServiceType';

describe('fetchServiceTypes', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    //Test successful data fetch
    it('should return service types when response is ok', async () => {
        const mockData = [{ id: 1, name: 'Waste Collection' }];

        (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        const result = await fetchServiceTypes();

        expect(result).toEqual(mockData);
        expect(fetch).toHaveBeenCalledWith('/api/serviceTypes/all');
    });

    //Test error handling for failed fetch
    it('should throw an error if response is not ok', async () => {
        (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: false,
        });

        await expect(fetchServiceTypes()).rejects.toThrow('Failed to fetch service types');
    });
});
