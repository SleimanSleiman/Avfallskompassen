package com.avfallskompassen.dto;

import com.avfallskompassen.dto.response.PropertyResponse;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class PropertyResponseTest {

    @Test
    void noArgConstructor_andSettersGetters_work() {
        PropertyResponse resp = new PropertyResponse();

        resp.setSuccess(false);
        resp.setMessage("Fail");
        resp.setPropertyId(5L);
        resp.setAddress("Some address");
        resp.setNumberOfApartments(2);
        resp.setLockName("L1");
        resp.setLockPrice(new BigDecimal("99.99"));
        resp.setAccessPathLength(1.5);
        resp.setMunicipalityId(11L);
        resp.setMunicipalityName("Town");
        LocalDateTime now = LocalDateTime.now();
        resp.setCreatedAt(now);

        assertFalse(resp.isSuccess());
        assertEquals("Fail", resp.getMessage());
        assertEquals(5L, resp.getPropertyId());
        assertEquals("Some address", resp.getAddress());
        assertEquals(Integer.valueOf(2), resp.getNumberOfApartments());
        assertEquals("L1", resp.getLockName());
        assertEquals(new BigDecimal("99.99"), resp.getLockPrice());
        assertEquals(Double.valueOf(1.5), resp.getAccessPathLength());
        assertEquals(Long.valueOf(11L), resp.getMunicipalityId());
        assertEquals("Town", resp.getMunicipalityName());
        assertEquals(now, resp.getCreatedAt());
    }

    @Test
    void successMessageConstructor_setsSuccessAndMessageOnly() {
        PropertyResponse resp = new PropertyResponse(true, "Created");

        assertTrue(resp.isSuccess());
        assertEquals("Created", resp.getMessage());
        assertNull(resp.getPropertyId());
        assertNull(resp.getAddress());
    }

    @Test
    void fullConstructor_mapsAllProvidedFields() {
        LocalDateTime createdAt = LocalDateTime.now();
        PropertyResponse resp = new PropertyResponse(
                true,
                "ok",
                42L,
                "Addr X",
                10,
                "MasterLock",
                3.14,
                createdAt
        );

        assertTrue(resp.isSuccess());
        assertEquals("ok", resp.getMessage());
        assertEquals(Long.valueOf(42L), resp.getPropertyId());
        assertEquals("Addr X", resp.getAddress());
        assertEquals(Integer.valueOf(10), resp.getNumberOfApartments());
        assertEquals("MasterLock", resp.getLockName());
        assertEquals(Double.valueOf(3.14), resp.getAccessPathLength());
        assertEquals(createdAt, resp.getCreatedAt());
    }
}