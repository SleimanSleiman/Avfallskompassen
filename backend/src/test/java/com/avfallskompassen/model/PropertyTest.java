package com.avfallskompassen.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class PropertyTest {

    @Test
    void noArgsConstructor_setsCreatedAndUpdatedTimestamps() {
        Property p = new Property();

        assertNotNull(p.getCreatedAt(), "createdAt should be set in no-arg constructor");
        assertNotNull(p.getUpdatedAt(), "updatedAt should be set in no-arg constructor");

        assertEquals(p.getCreatedAt(), p.getUpdatedAt(), "createdAt and updatedAt should be equal on construction");
        assertFalse(p.getCreatedAt().isAfter(LocalDateTime.now()), "createdAt should not be in the future");
    }

    @Test
    void constructor_withDefaults_setsFieldsAndDefaultPropertyType() {
        LockType lockType = new LockType();
        lockType.setId(1);
        lockType.setName("MainLock");
        lockType.setCost(new BigDecimal("12.50"));

        User creator = new User("alice", "secret");

        Property p = new Property("Test Address", 10, lockType, 7.25, creator);

        assertEquals("Test Address", p.getAddress());
        assertEquals(Integer.valueOf(10), p.getNumberOfApartments());
        assertSame(lockType, p.getLockType());
        assertEquals(Double.valueOf(7.25), p.getAccessPathLength());
        assertSame(creator, p.getCreatedBy());
        assertEquals(PropertyType.FLERBOSTADSHUS, p.getPropertyType());
    }

    @Test
    void constructor_withPropertyType_setsGivenPropertyType() {
        LockType lockType = new LockType();
        User creator = new User("bob", "pw");

        Property p = new Property("Addr 2", 3, lockType, PropertyType.SMAHUS, 1.0, creator);

        assertEquals(PropertyType.SMAHUS, p.getPropertyType());
        assertEquals("Addr 2", p.getAddress());
    }

    @Test
    void settersAndGetters_workForAllFields() {
        Property p = new Property();

        p.setId(123L);
        p.setAddress("Somewhere");
        p.setNumberOfApartments(5);

        LockType lt = new LockType();
        lt.setName("LT");
        p.setLockType(lt);

        Municipality m = new Municipality();
        m.setName("MyTown");
        p.setMunicipality(m);

        p.setPropertyType(PropertyType.VERKSAMHET);
        p.setAccessPathLength(2.5);

        User u = new User("carol", "pw");
        p.setCreatedBy(u);

        LocalDateTime now = LocalDateTime.now();
        p.setUpdatedAt(now);

        assertEquals(123L, p.getId());
        assertEquals("Somewhere", p.getAddress());
        assertEquals(Integer.valueOf(5), p.getNumberOfApartments());
        assertSame(lt, p.getLockType());
        assertSame(m, p.getMunicipality());
        assertEquals(PropertyType.VERKSAMHET, p.getPropertyType());
        assertEquals(Double.valueOf(2.5), p.getAccessPathLength());
        assertSame(u, p.getCreatedBy());
        assertEquals(now, p.getUpdatedAt());
    }

    @Test
    void preUpdate_updatesUpdatedAtToNow() {
        Property p = new Property();

        LocalDateTime old = LocalDateTime.now().minusDays(1);
        p.setUpdatedAt(old);

        p.preUpdate();

        assertNotNull(p.getUpdatedAt());
        assertTrue(p.getUpdatedAt().isAfter(old), "preUpdate should refresh updatedAt to a later timestamp");
    }
}
