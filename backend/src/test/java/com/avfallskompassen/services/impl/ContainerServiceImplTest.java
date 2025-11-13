package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.ContainerDTO;
import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.model.ContainerType;
import com.avfallskompassen.repository.ContainerPlanRepository;
import com.avfallskompassen.services.ContainerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ContainerServiceImpl class.
 */
@ExtendWith(MockitoExtension.class)
public class ContainerServiceImplTest {

    @Mock
    private ContainerPlanRepository repository;

    @InjectMocks
    private ContainerServiceImpl service;

    /**
     * Test getContainersByMunicipalityAndService method to ensure it returns a list of ContainerPlan
     * when valid municipalityId and serviceTypeId are provided.
     */
    @Test
    void testGetContainersByMunicipalityAndService_ReturnsList() {
        ContainerType type = new ContainerType();
        type.setName("200L Kärl");

        ContainerPlan plan = new ContainerPlan();
        plan.setContainerType(type);
        plan.setImageTopViewUrl(null);

        when(repository.findByMunicipalityService_Municipality_IdAndMunicipalityService_ServiceType_Id(1L,2L))
                .thenReturn(List.of(plan));

        List<ContainerDTO> result = service.getContainersByMunicipalityAndService(1L, 2L);

        assertEquals(1, result.size());
        verify(repository, times(1))
                .findByMunicipalityService_Municipality_IdAndMunicipalityService_ServiceType_Id(1L, 2L);
    }

    /**
     * Test getContainersByMunicipalityAndService method to ensure it returns an empty list
     * when no ContainerPlan is found for the given municipalityId and serviceTypeId.
     */
    @Test
    void testGetContainersByMunicipalityAndService_ReturnsEmptyListForNoResult() {
        when(repository.findByMunicipalityService_Municipality_IdAndMunicipalityService_ServiceType_Id(99L, 99L))
                .thenReturn(List.of());

        List<ContainerDTO> result = service.getContainersByMunicipalityAndService(99L, 99L);

        assertTrue(result.isEmpty());
    }

    /**
     * Test getContainersByMunicipalityAndService method to ensure it throws IllegalArgumentException
     * when null values are provided for municipalityId or serviceTypeId.
     */
    @Test
    void testGetContainersByMunicipalityAndService_ThrowsExceptionForNullIds() {
        assertThrows(IllegalArgumentException.class, () ->
                service.getContainersByMunicipalityAndService(null, 1L)
        );
    }
}
