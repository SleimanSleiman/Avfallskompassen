import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchContainersByMunicipalityAndService } from '../../src/lib/Container';

describe('fetchContainersByMunicipalityAndService', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    //Test successful data fetch
    it('should return container data on success', async () => {
        const mockData = [{
            id: 1,
            name: 'Container A',
            size: 120,
            width: 100,
            depth: 100,
            height: 100,
            imageFrontViewUrl: '',
            imageTopViewUrl: '',
            emptyingFrequencyPerYear: 12,
            cost: 200,
        },];

        (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        const result = await fetchContainersByMunicipalityAndService(1, 2);

        expect(result).toEqual(mockData);
        expect(fetch).toHaveBeenCalledWith('/api/containers/municipality/1/service/2');
    });

    //Test error handling for failed fetch
    it('should throw an error when response is not ok', async () => {
        (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: false,
        });

        await expect(fetchContainersByMunicipalityAndService(1, 2)).rejects.toThrow(
            'Failed to fetch containers by municipality and service'
        );
    });
});
