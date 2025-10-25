package com.avfallskompassen.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class PropertyRequestTest {

    @Test
    void noArgAndSetters_workAsExpected() {
        PropertyRequest req = new PropertyRequest();

        req.setAddress("My Addr");
        req.setNumberOfApartments(6);
        req.setLockTypeId(12L);
        req.setAccessPathLength(2.5);
        req.setMunicipalityId(77L);
        req.setPropertyType("SMAHUS");

        assertEquals("My Addr", req.getAddress());
        assertEquals(Integer.valueOf(6), req.getNumberOfApartments());
        assertEquals(Long.valueOf(12L), req.getLockTypeId());
        assertEquals(Double.valueOf(2.5), req.getAccessPathLength());
        assertEquals(Long.valueOf(77L), req.getMunicipalityId());
        assertEquals("SMAHUS", req.getPropertyType());
    }

    @Test
    void constructor_setsFields_correctly() {
        PropertyRequest req = new PropertyRequest("A", 2, 5L, 1.0);

        assertEquals("A", req.getAddress());
        assertEquals(Integer.valueOf(2), req.getNumberOfApartments());
        assertEquals(Long.valueOf(5L), req.getLockTypeId());
        assertEquals(Double.valueOf(1.0), req.getAccessPathLength());
        assertNull(req.getMunicipalityId());
    }

    @Test
    void constructorWithMunicipality_setsMunicipalityId() {
        PropertyRequest req = new PropertyRequest("B", 3, 9L, 0.5, 44L);

        assertEquals(Long.valueOf(44L), req.getMunicipalityId());
    }
}