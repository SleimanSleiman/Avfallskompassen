package com.avfallskompassen.services;

import com.avfallskompassen.dto.CollectionFeeDTO;
import com.avfallskompassen.dto.GeneralPropertyCostDTO;
import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.model.LockType;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.PropertyContainer;
import com.avfallskompassen.repository.PropertyContainerRepository;
import com.avfallskompassen.services.impl.PropertyCostServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PropertyCostServiceImplTest {

    @Mock
    private PropertyService propertyService;

    @Mock
    private PropertyContainerRepository propertyContainerRepository;

    @Mock
    private LockTypeService lockTypeService;

    @Mock
    private CollectionFeeService collectionFeeService;

    @InjectMocks
    private PropertyCostServiceImpl propertyCostService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void calculateAnnualCost_ShouldReturnCorrectTotals() {
        Long propertyId = 1L;

        Property property = new Property();
        property.setId(propertyId);
        property.setAddress("Testgatan 123");
        property.setNumberOfApartments(10);

        when(propertyService.findById(propertyId)).thenReturn(Optional.of(property));

        var collectionFeeDTO = new CollectionFeeDTO();
        collectionFeeDTO.setCost(BigDecimal.valueOf(1000));
        when(collectionFeeService.findCollectionFeeByPropertyId(propertyId)).thenReturn(collectionFeeDTO);

        LockType lockType = new LockType();
        lockType.setCost(BigDecimal.valueOf(200));
        when(lockTypeService.findLockTypeById(propertyId)).thenReturn(lockType);

        ContainerPlan plan = new ContainerPlan();
        plan.setCost(BigDecimal.valueOf(150));

        PropertyContainer propertyContainer1 = new PropertyContainer();
        propertyContainer1.setContainerPlan(plan);
        propertyContainer1.setContainerCount(2);

        PropertyContainer propertyContainer2 = new PropertyContainer();
        propertyContainer2.setContainerPlan(plan);
        propertyContainer2.setContainerCount(3);

        when(propertyContainerRepository.findByProperty(propertyId)).thenReturn(List.of(propertyContainer1, propertyContainer2));

        GeneralPropertyCostDTO result = propertyCostService.calculateAnnualCost(propertyId);

        BigDecimal expectedResult = BigDecimal.valueOf(1000)
                .add(BigDecimal.valueOf(200))
                .add(BigDecimal.valueOf(150* (2+3)));
        BigDecimal expectedResultPerApartment = expectedResult.divide(BigDecimal.valueOf(10), 2, BigDecimal.ROUND_HALF_UP);

        assertEquals("Testgatan 123", result.getAddress());
        assertEquals(expectedResult, result.getTotalCost());
        assertEquals(expectedResultPerApartment, result.getCostPerApartment());

        verify(propertyService).findById(propertyId);
        verify(propertyContainerRepository).findByProperty(propertyId);
    }

    @Test
    void calculateAnnualCost_ShouldThrowIfPropertyNotFound() {
        Long propertyId = 999L;
        when(propertyService.findById(propertyId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> propertyCostService.calculateAnnualCost(propertyId));
    }

    @Test
    void calculateAllCostsForUser_ShouldReturnListOfDTOs() {
        String username = "testUser";
        
        Property property1 = new Property();
        property1.setId(1L);
        property1.setAddress("Lundväg 1");
        property1.setNumberOfApartments(5);

        Property property2 = new Property();
        property2.setId(2L);
        property2.setAddress("Lundväg 2");
        property2.setNumberOfApartments(10);

        when(propertyService.getPropertiesByUser(username))
                .thenReturn(List.of(property1, property2));

        when(propertyService.findById(1L)).thenReturn(Optional.of(property1));
        when(propertyService.findById(2L)).thenReturn(Optional.of(property2));
        
        when(collectionFeeService.findCollectionFeeByPropertyId(anyLong()))
                .thenAnswer(invocation -> {
                    Long id = invocation.getArgument(0);
                    return new CollectionFeeDTO(id, BigDecimal.valueOf(1000 + id));
                });

        LockType lockType = new LockType();
        lockType.setCost(BigDecimal.valueOf(200));
        when(lockTypeService.findLockTypeById(anyLong())).thenReturn(lockType);

        ContainerPlan plan = new ContainerPlan();
        plan.setCost(BigDecimal.valueOf(100));

        PropertyContainer propertyContainer = new PropertyContainer();
        propertyContainer.setContainerPlan(plan);
        propertyContainer.setContainerCount(2);
        when(propertyContainerRepository.findByProperty(anyLong())).thenReturn(List.of(propertyContainer));

        List<GeneralPropertyCostDTO> result = propertyCostService.calculateAllCostsForUser(username);
        
        assertEquals(2, result.size());
        
        GeneralPropertyCostDTO first = result.get(0);
        assertEquals("Lundväg 1", first.getAddress());
        assertNotNull(first.getTotalCost());
        assertTrue(first.getTotalCost().compareTo(BigDecimal.ZERO) > 0);
        
        GeneralPropertyCostDTO second = result.get(1);
        assertEquals("Lundväg 2", second.getAddress());
        assertTrue(second.getTotalCost().compareTo(first.getTotalCost()) > 0);
        
        verify(propertyService).getPropertiesByUser(username);
        verify(collectionFeeService, times(2)).findCollectionFeeByPropertyId(anyLong());
        verify(lockTypeService, times(2)).findLockTypeById(anyLong());
        verify(propertyContainerRepository, times(2)).findByProperty(anyLong());
    }

    @Test
    void calculateAllCostsForUser_ShouldThrowIfNoPropertiesFound() {
        String username = "emptyUser";
        when(propertyService.getPropertiesByUser(username)).thenReturn(List.of());

        assertThrows(EntityNotFoundException.class, () -> propertyCostService.calculateAllCostsForUser(username));
    }
}
