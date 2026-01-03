package com.avfallskompassen.services;

import com.avfallskompassen.dto.CollectionFeeDTO;
import com.avfallskompassen.model.CollectionFee;
import com.avfallskompassen.model.Municipality;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.repository.CollectionFeeRepository;
import com.avfallskompassen.services.impl.CollectionFeeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

public class CollectionFeeServiceImplTest {

    @Mock
    private CollectionFeeRepository collectionFeeRepository;

    @Mock
    private PropertyService propertyService;

    @InjectMocks
    private CollectionFeeServiceImpl collectionFeeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindCollectionFeeByPropertyId_distanceUnder5() {

        Municipality municipality = new Municipality();
        municipality.setId(1L);

        Property property = new Property();
        property.setMunicipality(municipality);
        property.setAccessPathLength(4.0);

        CollectionFee collectionFee = new CollectionFee();
        collectionFee.setId(1L);
        collectionFee.setCost(BigDecimal.valueOf(100));

        when(propertyService.findById(10L)).thenReturn(Optional.of(property));
        when(collectionFeeRepository.findById(1L)).thenReturn(Optional.of(collectionFee));

        CollectionFeeDTO dto = collectionFeeService.findCollectionFeeByPropertyId(10L);

        assertEquals(BigDecimal.ZERO, dto.getCost());
        assertEquals(1L, dto.getId());
    }

    @Test
    void testFindCollectionFeeByPropertyId_distanceOver5() {
        Municipality municipality = new Municipality();
        municipality.setId(1L);

        Property property = new Property();
        property.setMunicipality(municipality);
        property.setAccessPathLength(25.0);

        CollectionFee collectionFee = new CollectionFee();
        collectionFee.setId(1L);
        collectionFee.setCost(BigDecimal.valueOf(100));

        when(propertyService.findById(10L)).thenReturn(Optional.of(property));
        when(collectionFeeRepository.findById(1L)).thenReturn(Optional.of(collectionFee));

        CollectionFeeDTO dto = collectionFeeService.findCollectionFeeByPropertyId(10L);

        assertEquals(BigDecimal.valueOf(200), dto.getCost());
        assertEquals(1L, dto.getId());
    }

    @Test
    void testFindCollectionFeeByPropertyId_propertyNotFound() {
        when(propertyService.findById(10L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(IllegalArgumentException.class,() ->
            collectionFeeService.findCollectionFeeByPropertyId(10L)
        );

        assertEquals("Property not found", exception.getMessage());
    }

    @Test
    void testFindCollectionFeeByPropertyId_collectionFeeNotFound() {
        Municipality municipality = new Municipality();
        municipality.setId(1L);

        Property property = new Property();
        property.setMunicipality(municipality);
        property.setAccessPathLength(10.0);

        when(propertyService.findById(10L)).thenReturn(Optional.of(property));
        when(collectionFeeRepository.findById(1L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                collectionFeeService.findCollectionFeeByPropertyId(10L)
        );

        assertEquals("Collection fee not found", exception.getMessage());
    }
}
