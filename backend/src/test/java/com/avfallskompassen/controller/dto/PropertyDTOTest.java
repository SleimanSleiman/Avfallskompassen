package com.avfallskompassen.controller.dto;

import com.avfallskompassen.dto.PropertyDTO;
import com.avfallskompassen.model.LockType;
import com.avfallskompassen.model.Municipality;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.PropertyType;
import com.avfallskompassen.model.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

public class PropertyDTOTest {

    @Test
    void constructor_mapsAllFieldsFromProperty() {
        LockType lockType = new LockType();
        lockType.setId(7);
        lockType.setName("MainLock");
        lockType.setCost(new BigDecimal("15.00"));

        Municipality municipality = new Municipality();
        municipality.setId(33L);
        municipality.setName("TestCity");

        User creator = new User("u", "p");

        Property p = new Property("Some address", 4, lockType, PropertyType.SMAHUS, 3.0, creator);
        p.setId(99L);
        p.setMunicipality(municipality);

        PropertyDTO dto = new PropertyDTO(p);

        assertEquals(99L, dto.getId());
        assertEquals("Some address", dto.getAddress());
        assertEquals(Integer.valueOf(4), dto.getNumberOfApartments());
        assertNotNull(dto.getLockTypeDto());
        assertEquals("MainLock", dto.getLockName());
        assertEquals(3.0, dto.getAccessPathLength());
        assertEquals(Long.valueOf(33L), dto.getMunicipalityId());
        assertEquals("TestCity", dto.getMunicipalityName());
        // propertyType mapped via getDisplayName(); accept non-null string for the enum
        assertNotNull(dto.getPropertyType());
    }

    @Test
    void constructor_handlesNullNestedObjects() {
        Property p = new Property();
        p.setId(1L);
        p.setAddress("Addr");
        p.setNumberOfApartments(1);
        p.setAccessPathLength(0.0);
        // leave lockType, municipality and propertyType null

        PropertyDTO dto = new PropertyDTO(p);

        assertEquals(1L, dto.getId());
        assertEquals("Addr", dto.getAddress());
        assertNull(dto.getLockTypeDto());
        assertNull(dto.getMunicipalityId());
        assertNull(dto.getMunicipalityName());
        assertNull(dto.getPropertyType());
    }
}