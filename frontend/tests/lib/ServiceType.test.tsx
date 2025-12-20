import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchServiceTypes } from '../../src/lib/ServiceType';
import * as api from '../../src/lib/Api';
import * as Auth from '../../src/lib/Auth';

describe('fetchServiceTypes', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return service types when the API call succeeds', async () => {
        const mockData = [{ id: 1, name: 'Waste Collection' }];

        vi.spyOn(Auth, 'currentUser').mockReturnValue({
            username: 'testuser',
            token: 'abc1234567890',
        });

        const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce(mockData);

        const result = await fetchServiceTypes();

        expect(result).toEqual(mockData);
        expect(getSpy).toHaveBeenCalledWith('/api/serviceTypes/all');
    });

    it('should throw an error when the API call fails', async () => {
        vi.spyOn(Auth, 'currentUser').mockReturnValue(null);

        const getSpy = vi
            .spyOn(api, 'get')
            .mockRejectedValueOnce(new Error('Failed to fetch service types'));

        await expect(fetchServiceTypes()).rejects.toThrow(
            'Failed to fetch service types'
        );

        expect(getSpy).toHaveBeenCalledWith('/api/serviceTypes/all');
    });
});
