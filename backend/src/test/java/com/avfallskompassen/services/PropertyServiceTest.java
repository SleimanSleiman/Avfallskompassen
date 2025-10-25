package com.avfallskompassen.services;

import com.avfallskompassen.dto.PropertyRequest;
import com.avfallskompassen.model.LockType;
import com.avfallskompassen.model.Property;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

public class PropertyServiceTest {

    @Test
    void propertyService_isInterface() {
        assertTrue(PropertyService.class.isInterface(), "PropertyService should be an interface");
    }

    @Test
    void has_createProperty_method_with_expected_signature() throws NoSuchMethodException {
        Method m = PropertyService.class.getMethod("createProperty", PropertyRequest.class, String.class, LockType.class);
        assertEquals(Property.class, m.getReturnType(), "createProperty should return Property");
    }

    @Test
    void has_getPropertiesByUser_method_with_expected_signature() throws NoSuchMethodException {
        Method m = PropertyService.class.getMethod("getPropertiesByUser", String.class);
        assertTrue(List.class.isAssignableFrom(m.getReturnType()), "getPropertiesByUser should return a List");
    }

    @Test
    void has_isPropertyOwnedByUser_method_with_expected_signature() throws NoSuchMethodException {
        Method m = PropertyService.class.getMethod("isPropertyOwnedByUser", Long.class, String.class);
        assertEquals(boolean.class, m.getReturnType(), "isPropertyOwnedByUser should return boolean");
    }

    @Test
    void has_findByIdAndUser_method_with_expected_signature() throws NoSuchMethodException {
        Method m = PropertyService.class.getMethod("findByIdAndUser", Long.class, String.class);
        assertEquals(Optional.class, m.getReturnType(), "findByIdAndUser should return Optional");
    }

    @Test
    void has_findByAddress_method_with_expected_signature() throws NoSuchMethodException {
        Method m = PropertyService.class.getMethod("findByAddress", String.class);
        assertEquals(Optional.class, m.getReturnType(), "findByAddress should return Optional");
    }

    @Test
    void has_findById_method_with_expected_signature() throws NoSuchMethodException {
        Method m = PropertyService.class.getMethod("findById", Long.class);
        assertEquals(Optional.class, m.getReturnType(), "findById should return Optional");
    }

    @Test
    void has_getAllProperties_method_with_expected_signature() throws NoSuchMethodException {
        Method m = PropertyService.class.getMethod("getAllProperties");
        assertTrue(List.class.isAssignableFrom(m.getReturnType()), "getAllProperties should return a List");
    }

    @Test
    void has_findByLockType_method_with_expected_signature() throws NoSuchMethodException {
        Method m = PropertyService.class.getMethod("findByLockType", LockType.class);
        assertTrue(List.class.isAssignableFrom(m.getReturnType()), "findByLockType should return a List");
    }

    @Test
    void has_deleteProperty_method_with_expected_signature() throws NoSuchMethodException {
        Method m = PropertyService.class.getMethod("deleteProperty", Long.class);
        assertEquals(boolean.class, m.getReturnType(), "deleteProperty should return boolean");
    }

    @Test
    void has_updateProperty_method_with_expected_signature() throws NoSuchMethodException {
        Method m = PropertyService.class.getMethod("updateProperty", Long.class, PropertyRequest.class, String.class, LockType.class);
        assertEquals(Property.class, m.getReturnType(), "updateProperty should return Property");
    }
}