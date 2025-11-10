import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import ContainerSection from '../../../../src/pages/PlanningTool/Sidebar/ContainerSection';

describe('ContainerSection', () => {
    const mockSetIsAddContainersOpen = vi.fn();
    const mockSetSelectedType = vi.fn();
    const mockSetSelectedSize = vi.fn();
    const mockFetchContainers = vi.fn().mockResolvedValue(undefined);
    const mockHandleAddContainer = vi.fn();
    const mockSetDraggedContainer = vi.fn();
    const mockSetIsStageDropActive = vi.fn();

    const baseProps = {
        isAddContainersOpen: true,
        setIsAddContainersOpen: mockSetIsAddContainersOpen,
        serviceTypes: [{ id: 1, name: 'Matavfall' }],
        selectedType: null,
        setSelectedType: mockSetSelectedType,
        containers: [],
        selectedSize: {},
        setSelectedSize: mockSetSelectedSize,
        isLoadingContainers: false,
        fetchContainers: mockFetchContainers,
        handleAddContainer: mockHandleAddContainer,
        setDraggedContainer: mockSetDraggedContainer,
        setIsStageDropActive: mockSetIsStageDropActive,
    };

    //Test rendering of service types
    it('renders service types', () => {
        render(<ContainerSection {...baseProps} />);
        expect(screen.getByText('Matavfall')).toBeInTheDocument();
    });

    //Test clicking a service type
    it('calls fetchContainers when clicking a service type', async () => {
        render(<ContainerSection {...baseProps} />);
        fireEvent.click(screen.getByText('Matavfall'));

        await waitFor(() => {
            expect(mockSetSelectedType).toHaveBeenCalledWith('Matavfall');
            expect(mockFetchContainers).toHaveBeenCalledWith(1);
        });
    });

    //Test loading state
    it('shows loading overlay when isLoadingContainers is true', () => {
        render(<ContainerSection {...baseProps} isLoadingContainers selectedType="Matavfall" />);
        expect(screen.getByRole('status', { hidden: true })).toBeTruthy();
    });

    //Test adding a container
    it('calls handleAddContainer when "Lägg till i rummet" is clicked', () => {
        const mockContainer = {
            id: 1,
            name: 'Container A',
            size: 120,
            width: 100,
            depth: 100,
            height: 100,
            imageFrontViewUrl: '/front.png',
            imageTopViewUrl: '/top.png',
            emptyingFrequencyPerYear: 12,
            cost: 200,
        };

        render(
            <ContainerSection
                {...baseProps}
                selectedType="Matavfall"
                selectedSize={{ 1: 120 }}
                containers={[mockContainer]}
            />
        );

        fireEvent.click(screen.getByText('Lägg till i rummet'));
        expect(mockHandleAddContainer).toHaveBeenCalledWith(mockContainer);
    });
});
