import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchContainersByMunicipalityAndService } from '../../src/lib/Container';
import * as api from '../../src/lib/api';

describe('fetchContainersByMunicipalityAndService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return container data on success', async () => {
        const mockData = [
            {
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
            },
        ];

        const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce(mockData);

        const result = await fetchContainersByMunicipalityAndService(1, 2);

        expect(result).toEqual(mockData);
        expect(getSpy).toHaveBeenCalledWith(
            '/api/containers/municipality/1/service/2'
        );
    });

    it('should throw an error when the API call fails', async () => {
        const getSpy = vi.spyOn(api, 'get').mockRejectedValueOnce(
            new Error('Network error')
        );

        await expect(
            fetchContainersByMunicipalityAndService(1, 2)
        ).rejects.toThrow('Network error');

        expect(getSpy).toHaveBeenCalledWith(
            '/api/containers/municipality/1/service/2'
        );
    });
});
