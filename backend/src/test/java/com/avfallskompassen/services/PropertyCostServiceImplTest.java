package com.avfallskompassen.services;

import com.avfallskompassen.dto.CollectionFeeDTO;
import com.avfallskompassen.dto.GeneralPropertyCostDTO;
import com.avfallskompassen.dto.LockTypeDto;
import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.model.ContainerPosition;
import com.avfallskompassen.model.LockType;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.WasteRoom;
import com.avfallskompassen.repository.WasteRoomRepository;
import com.avfallskompassen.services.impl.PropertyCostServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PropertyCostServiceImplTest {

    @Mock
    private PropertyService propertyService;

    @Mock
    private WasteRoomRepository wasteRoomRepository;

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

        LockType lockType = new LockType();
        lockType.setId(1);
        lockType.setName("Standardlås");
        lockType.setCost(BigDecimal.valueOf(200));
        property.setLockType(lockType);

        when(propertyService.findById(propertyId)).thenReturn(Optional.of(property));

        var collectionFeeDTO = new CollectionFeeDTO();
        collectionFeeDTO.setCost(BigDecimal.valueOf(1000));
        when(collectionFeeService.findCollectionFeeByPropertyId(propertyId)).thenReturn(collectionFeeDTO);

        LockTypeDto lockTypeDto = new LockTypeDto();
        lockTypeDto.setId(1L);
        lockTypeDto.setName("Standardlås");
        lockTypeDto.setCost(BigDecimal.valueOf(200));
        when(lockTypeService.findLockTypeById(propertyId)).thenReturn(lockTypeDto);

        ContainerPlan plan = new ContainerPlan();
        plan.setCost(BigDecimal.valueOf(150));

        WasteRoom wasteRoom = new WasteRoom();
        wasteRoom.setProperty(property);
        wasteRoom.setIsActive(true);
        wasteRoom.setContainers(new ArrayList<>());

        ContainerPosition pos1 = new ContainerPosition();
        pos1.setContainerPlan(plan);
        pos1.setWasteRoom(wasteRoom);
      
        
        for (int i = 0; i < 2; i++) {
             ContainerPosition p = new ContainerPosition();
             p.setContainerPlan(plan);
             p.setWasteRoom(wasteRoom);
             wasteRoom.getContainers().add(p);
        }
        for (int i = 0; i < 3; i++) {
             ContainerPosition p = new ContainerPosition();
             p.setContainerPlan(plan);
             p.setWasteRoom(wasteRoom);
             wasteRoom.getContainers().add(p);
        }

        when(wasteRoomRepository.findByPropertyId(propertyId)).thenReturn(List.of(wasteRoom));

        GeneralPropertyCostDTO result = propertyCostService.calculateAnnualCost(propertyId);

        BigDecimal expectedResult = BigDecimal.valueOf(1000)
                .add(BigDecimal.valueOf(200))
                .add(BigDecimal.valueOf(150* (2+3)));
        BigDecimal expectedResultPerApartment = expectedResult.divide(BigDecimal.valueOf(10), 2, BigDecimal.ROUND_HALF_UP);

        assertEquals("Testgatan 123", result.getAddress());
        assertEquals(expectedResult, result.getTotalCost());
        assertEquals(expectedResultPerApartment, result.getCostPerApartment());

        verify(propertyService).findById(propertyId);
        verify(wasteRoomRepository).findByPropertyId(propertyId);
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

        LockType lockType1 = new LockType();
        lockType1.setId(1);
        lockType1.setName("Standardlås");
        lockType1.setCost(BigDecimal.valueOf(200));
        property1.setLockType(lockType1);

        Property property2 = new Property();
        property2.setId(2L);
        property2.setAddress("Lundväg 2");
        property2.setNumberOfApartments(10);

        LockType lockType2 = new LockType();
        lockType2.setId(1);
        lockType2.setName("Standardlås");
        lockType2.setCost(BigDecimal.valueOf(200));
        property2.setLockType(lockType2);

        when(propertyService.getPropertiesByUser(username))
                .thenReturn(List.of(property1, property2));

        when(propertyService.findById(1L)).thenReturn(Optional.of(property1));
        when(propertyService.findById(2L)).thenReturn(Optional.of(property2));
        
        when(collectionFeeService.findCollectionFeeByPropertyId(anyLong()))
                .thenAnswer(invocation -> {
                    Long id = invocation.getArgument(0);
                    return new CollectionFeeDTO(id, BigDecimal.valueOf(1000 + id));
                });

        LockTypeDto lockTypeDto = new LockTypeDto();
        lockTypeDto.setId(1L);
        lockTypeDto.setCost(BigDecimal.valueOf(200));
        lockTypeDto.setName("Standardlås");
        when(lockTypeService.findLockTypeById(anyLong())).thenReturn(lockTypeDto);

        ContainerPlan plan = new ContainerPlan();
        plan.setCost(BigDecimal.valueOf(100));

        // Create WasteRooms instead of PropertyContainers
        WasteRoom wr1 = new WasteRoom();
        wr1.setProperty(property1);
        wr1.setIsActive(true);
        wr1.setContainers(new ArrayList<>());
        for (int i = 0; i < 2; i++) {
            ContainerPosition p = new ContainerPosition();
            p.setContainerPlan(plan);
            p.setWasteRoom(wr1);
            wr1.getContainers().add(p);
        }

        WasteRoom wr2 = new WasteRoom();
        wr2.setProperty(property2);
        wr2.setIsActive(true);
        wr2.setContainers(new ArrayList<>());
        for (int i = 0; i < 2; i++) {
            ContainerPosition p = new ContainerPosition();
            p.setContainerPlan(plan);
            p.setWasteRoom(wr2);
            wr2.getContainers().add(p);
        }

        when(wasteRoomRepository.findByPropertyId(eq(1L))).thenReturn(List.of(wr1));
        when(wasteRoomRepository.findByPropertyId(eq(2L))).thenReturn(List.of(wr2));

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
        verify(wasteRoomRepository, times(2)).findByPropertyId(anyLong());
    }

    @Test
    void calculateAllCostsForUser_ShouldThrowIfNoPropertiesFound() {
        String username = "emptyUser";
        when(propertyService.getPropertiesByUser(username)).thenReturn(List.of());

        assertThrows(EntityNotFoundException.class, () -> propertyCostService.calculateAllCostsForUser(username));
    }
}
