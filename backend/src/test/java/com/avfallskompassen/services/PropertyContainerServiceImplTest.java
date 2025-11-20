package com.avfallskompassen.services;

import com.avfallskompassen.dto.PropertyContainerDTO;
import com.avfallskompassen.model.*;
import com.avfallskompassen.repository.PropertyContainerRepository;
import com.avfallskompassen.services.impl.PropertyContainerServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PropertyContainerServiceImplTest {

    @Mock
    private PropertyContainerRepository propertyContainerRepository;

    @InjectMocks
    private PropertyContainerServiceImpl service;
    
    private PropertyContainer createContainer(
            Long id,
            String fractionName,
            String containerName,
            int size,
            int count,
            int emptyingFreq,
            BigDecimal cost
    ) {

        ServiceType serviceType = new ServiceType();
        serviceType.setName(fractionName);

        MunicipalityService municipalityService = new MunicipalityService();
        municipalityService.setServiceType(serviceType);

        ContainerType type = new ContainerType();
        type.setName(containerName);
        type.setSize(size);

        ContainerPlan plan = new ContainerPlan();
        plan.setCost(cost);
        plan.setEmptyingFrequencyPerYear(emptyingFreq);
        plan.setContainerType(type);
        plan.setMunicipalityService(municipalityService);

        PropertyContainer propertyContainer = new PropertyContainer();
        propertyContainer.setId(id);
        propertyContainer.setContainerCount(count);
        propertyContainer.setContainerPlan(plan);

        return propertyContainer;
    }

    @Test
    void getContainersByPropertyId_mapsAllFieldsCorrectly() {
        PropertyContainer propertyContainer1 = createContainer(
                1L, "Restavfall", "660L", 660, 2, 12, new BigDecimal("1200"));

        PropertyContainer propertyContainer2 = createContainer(
                2L, "Matavfall", "140L", 140, 1, 26, new BigDecimal("800"));

        when(propertyContainerRepository.findByPropertyId(5L))
                .thenReturn(List.of(propertyContainer1, propertyContainer2));

        List<PropertyContainerDTO> result = service.getContainersByPropertyId(5L);

        assertEquals(2, result.size());

        PropertyContainerDTO dto1 = result.get(0);
        assertEquals("Restavfall", dto1.getFractionType());
        assertEquals("660L", dto1.getContainerName());
        assertEquals(660, dto1.getSize());
        assertEquals(2, dto1.getQuantity());
        assertEquals(12, dto1.getEmptyingFrequency());
        assertEquals(new BigDecimal("1200"), dto1.getCost());

        PropertyContainerDTO dto2 = result.get(1);
        assertEquals("Matavfall", dto2.getFractionType());
        assertEquals("140L", dto2.getContainerName());
        assertEquals(140, dto2.getSize());
        assertEquals(1, dto2.getQuantity());
        assertEquals(26, dto2.getEmptyingFrequency());
        assertEquals(new BigDecimal("800"), dto2.getCost());

        verify(propertyContainerRepository).findByPropertyId(5L);
    }

    @Test
    void getContainersByPropertyId_noContainers_returnsEmptyList() {
        when(propertyContainerRepository.findByPropertyId(9L))
                .thenReturn(List.of());

        List<PropertyContainerDTO> result = service.getContainersByPropertyId(9L);

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(propertyContainerRepository).findByPropertyId(9L);
    }

    @Test
    void getContainersByPropertyId_nullPropertyId_returnsEmptyList() {
        when(propertyContainerRepository.findByPropertyId(null))
                .thenReturn(List.of());

        List<PropertyContainerDTO> result = service.getContainersByPropertyId(null);

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(propertyContainerRepository).findByPropertyId(null);
    }
}

