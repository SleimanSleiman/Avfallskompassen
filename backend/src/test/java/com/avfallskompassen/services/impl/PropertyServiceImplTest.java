package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.LockTypeDto;
import com.avfallskompassen.dto.request.PropertyRequest;
import com.avfallskompassen.model.*;
import com.avfallskompassen.repository.MunicipalityRepository;
import com.avfallskompassen.repository.PropertyRepository;
import com.avfallskompassen.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PropertyServiceImplTest {

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private MunicipalityRepository municipalityRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private PropertyServiceImpl service;

    private User user;
    private LockTypeDto lockTypeDto;

    @BeforeEach
    void setup() {
        user = new User("tester", "pw");
        user.setId(1);

        lockTypeDto = new LockTypeDto();
        lockTypeDto.setId(2);
        lockTypeDto.setName("L1");
        lockTypeDto.setCost(new BigDecimal("5.0"));
    }

    @Test
    void createProperty_success_withMunicipality() {
        PropertyRequest req = new PropertyRequest();
        req.setAddress("A1");
        req.setNumberOfApartments(3);
        req.setAccessPathLength(1.5);
        req.setPropertyType("SMAHUS");
        req.setMunicipalityId(10L);

        when(userService.findByUsername("tester")).thenReturn(Optional.of(user));
        when(propertyRepository.existsByAddress("A1")).thenReturn(false);
        Municipality m = new Municipality(); m.setId(10L); m.setName("M");
        when(municipalityRepository.findById(10L)).thenReturn(Optional.of(m));

        Property saved = new Property();
        saved.setId(99L);
        when(propertyRepository.save(any())).thenReturn(saved);

        Property result = service.createProperty(req, "tester", lockTypeDto);

        assertNotNull(result);
        assertEquals(99L, result.getId());
        ArgumentCaptor<Property> cap = ArgumentCaptor.forClass(Property.class);
        verify(propertyRepository).save(cap.capture());
        Property toSave = cap.getValue();
        assertEquals("A1", toSave.getAddress());
        assertEquals(PropertyType.SMAHUS, toSave.getPropertyType());

        assertEquals(lockTypeDto.getId(), toSave.getLockType().getId());
        assertEquals(lockTypeDto.getName(), toSave.getLockType().getName());
        assertEquals(lockTypeDto.getCost(), toSave.getLockType().getCost());

        assertSame(m, toSave.getMunicipality());
    }

    @Test
    void createProperty_userNotFound_throws() {
        PropertyRequest req = new PropertyRequest(); req.setAddress("A");
        when(userService.findByUsername("nope")).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.createProperty(req, "nope", lockTypeDto));
        assertTrue(ex.getMessage().contains("User not found"));
    }

    @Test
    void createProperty_addressExists_throws() {
        PropertyRequest req = new PropertyRequest(); req.setAddress("A");
        when(userService.findByUsername("tester")).thenReturn(Optional.of(user));
        when(propertyRepository.existsByAddress("A")).thenReturn(true);
        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.createProperty(req, "tester", lockTypeDto));
        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    void createProperty_invalidPropertyType_usesDefault() {
        PropertyRequest req = new PropertyRequest();
        req.setAddress("A2");
        req.setNumberOfApartments(1);
        req.setAccessPathLength(0.0);
        req.setPropertyType("badtype");

        when(userService.findByUsername("tester")).thenReturn(Optional.of(user));
        when(propertyRepository.existsByAddress("A2")).thenReturn(false);
        when(propertyRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Property saved = service.createProperty(req, "tester", lockTypeDto);
        assertEquals(PropertyType.FLERBOSTADSHUS, saved.getPropertyType());
    }

    @Test
    void getPropertiesByUser_delegatesToRepository() {
        when(propertyRepository.findByCreatedByUsername("u")).thenReturn(List.of());
        List<Property> res = service.getPropertiesByUser("u");
        assertNotNull(res);
        verify(propertyRepository).findByCreatedByUsername("u");
    }

    @Test
    void isPropertyOwnedByUser_userNotFound_returnsFalse() {
        when(userService.findByUsername("x")).thenReturn(Optional.empty());
        assertFalse(service.isPropertyOwnedByUser(1L, "x"));
    }

    @Test
    void isPropertyOwnedByUser_checksRepository() {
        when(userService.findByUsername("tester")).thenReturn(Optional.of(user));
        when(propertyRepository.existsByIdAndCreatedBy(5L, user)).thenReturn(true);
        assertTrue(service.isPropertyOwnedByUser(5L, "tester"));
    }

    @Test
    void findByIdAndUser_returnsOnlyWhenOwned() {
        Property p = new Property(); p.setId(11L);
        when(propertyRepository.findById(11L)).thenReturn(Optional.of(p));
        when(userService.findByUsername("tester")).thenReturn(Optional.of(user));
        when(propertyRepository.existsByIdAndCreatedBy(11L, user)).thenReturn(true);
        Optional<Property> res = service.findByIdAndUser(11L, "tester");
        assertTrue(res.isPresent());

        when(propertyRepository.existsByIdAndCreatedBy(11L, user)).thenReturn(false);
        Optional<Property> res2 = service.findByIdAndUser(11L, "tester");
        assertTrue(res2.isEmpty());
    }

    @Test
    void deleteProperty_trueAndFalse() {
        when(propertyRepository.existsById(7L)).thenReturn(true);
        boolean r = service.deleteProperty(7L);
        assertTrue(r);
        verify(propertyRepository).deleteById(7L);

        when(propertyRepository.existsById(8L)).thenReturn(false);
        assertFalse(service.deleteProperty(8L));
    }

    @Test
    void updateProperty_notFound_throws() {
        when(propertyRepository.findById(100L)).thenReturn(Optional.empty());
        PropertyRequest req = new PropertyRequest();
        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.updateProperty(100L, req, "tester", lockTypeDto));
        assertTrue(ex.getMessage().contains("Property not found"));
    }

    @Test
    void updateProperty_notOwner_throws() {
        Property existing = new Property(); existing.setId(20L); existing.setAddress("Old");
        when(propertyRepository.findById(20L)).thenReturn(Optional.of(existing));
        when(userService.findByUsername("tester")).thenReturn(Optional.of(user));
        when(propertyRepository.existsByIdAndCreatedBy(20L, user)).thenReturn(false);

        PropertyRequest req = new PropertyRequest();
        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.updateProperty(20L, req, "tester", lockTypeDto));
        assertTrue(ex.getMessage().contains("access denied") || ex.getMessage().contains("not found"));
    }

    @Test
    void updateProperty_addressConflict_throws() {
        Property existing = new Property(); existing.setId(30L); existing.setAddress("Old");
        when(propertyRepository.findById(30L)).thenReturn(Optional.of(existing));
        when(userService.findByUsername("tester")).thenReturn(Optional.of(user));
        when(propertyRepository.existsByIdAndCreatedBy(30L, user)).thenReturn(true);
        when(propertyRepository.existsByAddress("NewAddr")).thenReturn(true);

        PropertyRequest req = new PropertyRequest(); req.setAddress("NewAddr");
        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.updateProperty(30L, req, "tester", lockTypeDto));
        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    void updateProperty_success_changesFieldsAndSaves() {
        Property existing = new Property(); existing.setId(40L); existing.setAddress("Old");
        when(propertyRepository.findById(40L)).thenReturn(Optional.of(existing));
        when(userService.findByUsername("tester")).thenReturn(Optional.of(user));
        when(propertyRepository.existsByIdAndCreatedBy(40L, user)).thenReturn(true);
        when(propertyRepository.existsByAddress("Other")).thenReturn(false);
        when(propertyRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        PropertyRequest req = new PropertyRequest();
        req.setAddress("Other");
        req.setNumberOfApartments(9);
        req.setAccessPathLength(4.5);

        Property updated = service.updateProperty(40L, req, "tester", lockTypeDto);
        assertEquals("Other", updated.getAddress());
        assertEquals(Integer.valueOf(9), updated.getNumberOfApartments());
        assertEquals(Double.valueOf(4.5), updated.getAccessPathLength());
        assertEquals(lockTypeDto.getId(), updated.getLockType().getId());
        assertEquals(lockTypeDto.getName(), updated.getLockType().getName());
        assertEquals(lockTypeDto.getCost(), updated.getLockType().getCost());
    }

    @Test
    void updateProperty_saveThrows_wrappedAsRuntime() {
        Property existing = new Property(); existing.setId(50L); existing.setAddress("Old");
        when(propertyRepository.findById(50L)).thenReturn(Optional.of(existing));
        when(userService.findByUsername("tester")).thenReturn(Optional.of(user));
        when(propertyRepository.existsByIdAndCreatedBy(50L, user)).thenReturn(true);
        when(propertyRepository.save(any())).thenThrow(new DataIntegrityViolationException("boom"));

        PropertyRequest req = new PropertyRequest();
        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.updateProperty(50L, req, "tester", lockTypeDto));
        assertTrue(ex.getMessage().contains("Failed to update property"));
    }
}
