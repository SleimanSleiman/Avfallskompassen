package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.ContainerDTO;
import com.avfallskompassen.dto.PropertyContainerDTO;
import com.avfallskompassen.model.*;
import com.avfallskompassen.repository.ContainerPlanRepository;
import com.avfallskompassen.repository.ContainerPositionRepository;
import com.avfallskompassen.services.ContainerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
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

    @Mock
    private ContainerPositionRepository containerPositionRepository;

    /**
     * Test getContainersByMunicipalityAndService method to ensure it returns a list of ContainerPlan
     * when valid municipalityId and serviceTypeId are provided.
     */
    @Test
    void testGetContainersByMunicipalityAndService_ReturnsList() {
        ContainerType type = new ContainerType();
        type.setName("200L Kärl");

        ServiceType serviceType = new ServiceType();
        serviceType.setName("sevice");

        MunicipalityService municipalityService = new MunicipalityService();
        municipalityService.setServiceType(serviceType);

        ContainerPlan plan = new ContainerPlan();
        plan.setContainerType(type);
        plan.setImageTopViewUrl(null);
        plan.setMunicipalityService(municipalityService);

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

    @Test
    void testGetContainersByPropertyId_ReturnsCorrectlyMappedList() {

        ServiceType serviceType = new ServiceType();
        serviceType.setName("Matavfall");

        MunicipalityService municipalityService = new MunicipalityService();
        municipalityService.setServiceType(serviceType);

        ContainerType type = new ContainerType();
        type.setName("660L Kärl");
        type.setSize(660);

        ContainerPlan plan = new ContainerPlan();
        plan.setId(1L);
        plan.setContainerType(type);
        plan.setMunicipalityService(municipalityService);
        plan.setEmptyingFrequencyPerYear(52);
        plan.setCost(BigDecimal.valueOf(540));

        ContainerPosition pos1 = new ContainerPosition();
        pos1.setContainerPlan(plan);

        ContainerPosition pos2 = new ContainerPosition();
        pos2.setContainerPlan(plan);

        when(containerPositionRepository.findByPropertyId(10L))
                .thenReturn(List.of(pos1, pos2));

        List<PropertyContainerDTO> result = service.getContainersByPropertyId(10L);

        assertEquals(1, result.size(), "Should return 1 DTO when same plan is grouped");
        PropertyContainerDTO dto = result.get(0);

        assertEquals("Matavfall", dto.getFractionType());
        assertEquals("660L Kärl", dto.getContainerName());
        assertEquals(660, dto.getSize());
        assertEquals(2, dto.getQuantity());
        assertEquals(52, dto.getEmptyingFrequency());
        assertEquals(BigDecimal.valueOf(1080), dto.getCost());

        verify(containerPositionRepository, times(1)).findByPropertyId(10L);
    }

    @Test
    void testGetContainersByPropertyId_ReturnsEmptyListWhenNoPositions() {
        when(containerPositionRepository.findByPropertyId(55L))
                .thenReturn(List.of());

        List<PropertyContainerDTO> result = service.getContainersByPropertyId(55L);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
