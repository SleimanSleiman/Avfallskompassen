import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useServiceTypes } from '../../../../src/pages/PlanningTool/hooks/UseServiceTypes';
import { fetchServiceTypes } from '../../../../src/lib/ServiceType';

vi.mock('../../../../src/lib/ServiceType', () => ({
    fetchServiceTypes: vi.fn(),
}));

describe('useServiceTypes', () => {
    //Test successful data fetch
    it('should fetch and return service types', async () => {
        const mockData = [{ id: 1, name: 'Recycling' }];
        (fetchServiceTypes as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockData);

        const { result } = renderHook(() => useServiceTypes());

        await waitFor(() => {
            expect(result.current).toEqual(mockData);
        });

        expect(fetchServiceTypes).toHaveBeenCalledTimes(1);
    });

    //Test error handling for failed fetch
    it('should handle fetch errors gracefully', async () => {
        (fetchServiceTypes as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
            new Error('API error')
        );

        const { result } = renderHook(() => useServiceTypes());

        await waitFor(() => {
            expect(result.current).toEqual([]);
        });
    });
});
