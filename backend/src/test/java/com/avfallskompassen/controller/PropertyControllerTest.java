package com.avfallskompassen.controller;

import com.avfallskompassen.dto.LockTypeDto;
import com.avfallskompassen.dto.request.PropertyRequest;
import com.avfallskompassen.dto.response.PropertyResponse;
import com.avfallskompassen.dto.PropertyDTO;
import com.avfallskompassen.model.LockType;
import com.avfallskompassen.model.Municipality;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.PropertyType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PropertyControllerTest {

    @Mock
    private com.avfallskompassen.services.PropertyService propertyService;

    @Mock
    private com.avfallskompassen.services.LockTypeService lockTypeService;

    @InjectMocks
    private PropertyController controller;

    private LockTypeDto sampleLockDto() {
        LockTypeDto dto = new LockTypeDto();
        dto.setId(1);
        dto.setName("L1");
        dto.setCost(new BigDecimal("12.00"));
        return dto;
    }

    private Property sampleProperty() {
        Property p = new Property("Addr", 2, null, PropertyType.FLERBOSTADSHUS, 1.0, null);
        p.setId(10L);
        Municipality m = new Municipality();
        m.setId(5L);
        m.setName("Town");
        p.setMunicipality(m);
        return p;
    }

    @Test
    void createProperty_success_returnsCreatedResponse() {
        PropertyRequest req = new PropertyRequest("A", 3, 1L, 2.0, 5L);
        LockTypeDto lockDto = sampleLockDto();
        Property created = sampleProperty();

        when(lockTypeService.findLockTypeById(1L)).thenReturn(lockDto);
        when(propertyService.createProperty(req, "alice", lockDto)).thenReturn(created);

        ResponseEntity<PropertyResponse> resp = controller.createProperty(req, "alice");

        assertEquals(201, resp.getStatusCodeValue());
        assertNotNull(resp.getBody());
        assertTrue(resp.getBody().isSuccess());
        assertEquals(created.getId(), resp.getBody().getPropertyId());
        assertEquals(lockDto.getName(), resp.getBody().getLockName());
        verify(propertyService).createProperty(req, "alice", lockDto);
    }

    @Test
    void createProperty_noUsername_returnsUnauthorized() {
        PropertyRequest req = new PropertyRequest();
        ResponseEntity<PropertyResponse> resp = controller.createProperty(req, null);

        assertEquals(401, resp.getStatusCodeValue());
        assertFalse(resp.getBody().isSuccess());
        assertEquals("User authentication required", resp.getBody().getMessage());
        verifyNoInteractions(propertyService, lockTypeService);
    }

    @Test
    void createProperty_lockTypeLookupThrows_returnsBadRequest() {
        PropertyRequest req = new PropertyRequest("A", 1, 99L, 0.0);
        when(lockTypeService.findLockTypeById(99L)).thenThrow(new RuntimeException("lock not found"));

        ResponseEntity<PropertyResponse> resp = controller.createProperty(req, "bob");

        assertEquals(400, resp.getStatusCodeValue());
        assertFalse(resp.getBody().isSuccess());
        assertEquals("lock not found", resp.getBody().getMessage());
        verify(lockTypeService).findLockTypeById(99L);
    }

    @Test
    void getAllProperties_returnsDtos() {
        Property p = sampleProperty();
        when(propertyService.getAllProperties()).thenReturn(List.of(p));

        ResponseEntity<List<PropertyDTO>> resp = controller.getAllProperties();

        assertEquals(200, resp.getStatusCodeValue());
        assertNotNull(resp.getBody());
        assertEquals(1, resp.getBody().size());
        assertEquals(p.getId(), resp.getBody().get(0).getId());
    }

    @Test
    void getMyProperties_unauthorized_returns401() {
        ResponseEntity<List<PropertyDTO>> resp = controller.getMyProperties(null);
        assertEquals(401, resp.getStatusCodeValue());
    }

    @Test
    void getMyProperties_success_returnsDtos() {
        Property p = sampleProperty();
        when(propertyService.getPropertiesByUser("alice")).thenReturn(List.of(p));

        ResponseEntity<List<PropertyDTO>> resp = controller.getMyProperties("alice");

        assertEquals(200, resp.getStatusCodeValue());
        assertEquals(1, resp.getBody().size());
        assertEquals(p.getId(), resp.getBody().get(0).getId());
    }

    @Test
    void getPropertyById_success_returnsDto() {
        Property p = sampleProperty();
        when(propertyService.findByIdAndUser(10L, "alice")).thenReturn(Optional.of(p));

        ResponseEntity<PropertyDTO> resp = controller.getPropertyById(10L, "alice");

        assertEquals(200, resp.getStatusCodeValue());
        assertEquals(p.getId(), resp.getBody().getId());
    }

    @Test
    void getPropertyById_notFound_throws404() {
        when(propertyService.findByIdAndUser(99L, "alice")).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> controller.getPropertyById(99L, "alice"));
    }

    @Test
    void updateProperty_unauthorized_returns401() {
        PropertyRequest req = new PropertyRequest();
        ResponseEntity<?> resp = controller.updateProperty(1L, req, null);
        assertEquals(401, resp.getStatusCodeValue());
        assertTrue(resp.getBody() instanceof PropertyResponse);
        PropertyResponse body = (PropertyResponse) resp.getBody();
        assertFalse(body.isSuccess());
    }

    @Test
    void updateProperty_forbidden_returns403() {
        PropertyRequest req = new PropertyRequest();
        when(propertyService.isPropertyOwnedByUser(1L, "bob")).thenReturn(false);

        ResponseEntity<?> resp = controller.updateProperty(1L, req, "bob");

        assertEquals(403, resp.getStatusCodeValue());
        assertTrue(resp.getBody() instanceof PropertyResponse);
        assertFalse(((PropertyResponse) resp.getBody()).isSuccess());
    }

    @Test
    void updateProperty_success_returnsOk() {
        PropertyRequest req = new PropertyRequest("New", 4, 1L, 1.0, 5L);
        LockTypeDto lockDto = sampleLockDto();
        Property updated = sampleProperty();
        updated.setAddress("New");
        when(propertyService.isPropertyOwnedByUser(10L, "alice")).thenReturn(true);
        when(lockTypeService.findLockTypeById(1L)).thenReturn(lockDto);
        when(propertyService.updateProperty(10L, req, "alice", lockDto)).thenReturn(updated);

        ResponseEntity<?> resp = controller.updateProperty(10L, req, "alice");

        assertEquals(200, resp.getStatusCodeValue());
        assertTrue(resp.getBody() instanceof PropertyDTO, "Expected PropertyDTO on success");
        PropertyDTO dto = (PropertyDTO) resp.getBody();
        assertEquals(updated.getId(), dto.getId());
        assertEquals("New", dto.getAddress());
    }

    @Test
    void getPropertyByAddress_success_andNotFound() {
        Property p = sampleProperty();
        when(propertyService.findByAddress("X")).thenReturn(Optional.of(p));
        ResponseEntity<PropertyDTO> resp = controller.getPropertyByAddress("X");
        assertEquals(200, resp.getStatusCodeValue());
        assertEquals(p.getId(), resp.getBody().getId());

        when(propertyService.findByAddress("Y")).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> controller.getPropertyByAddress("Y"));
    }

    @Test
    void getPropertiesByLockType_mapsAndReturns() {
        LockTypeDto lockDto = sampleLockDto();
        Property p = sampleProperty();
        when(lockTypeService.findLockTypeById(1L)).thenReturn(lockDto);
        when(propertyService.findByLockType(lockDto)).thenReturn(List.of(p));

        ResponseEntity<List<PropertyDTO>> resp = controller.getPropertiesByLockType(1L);

        assertEquals(200, resp.getStatusCodeValue());
        assertEquals(1, resp.getBody().size());
        assertEquals(p.getId(), resp.getBody().get(0).getId());
    }

    @Test
    void deleteProperty_unauthorized_forbidden_deleted_notFound() {
        // unauthorized
        ResponseEntity<PropertyResponse> r1 = controller.deleteProperty(1L, null);
        assertEquals(401, r1.getStatusCodeValue());

        // forbidden
        when(propertyService.isPropertyOwnedByUser(2L, "u")).thenReturn(false);
        ResponseEntity<PropertyResponse> r2 = controller.deleteProperty(2L, "u");
        assertEquals(403, r2.getStatusCodeValue());

        // deleted
        when(propertyService.isPropertyOwnedByUser(3L, "u")).thenReturn(true);
        when(propertyService.deleteProperty(3L)).thenReturn(true);
        ResponseEntity<PropertyResponse> r3 = controller.deleteProperty(3L, "u");
        assertEquals(200, r3.getStatusCodeValue());
        assertTrue(r3.getBody().isSuccess());

        // not found
        when(propertyService.isPropertyOwnedByUser(4L, "u")).thenReturn(true);
        when(propertyService.deleteProperty(4L)).thenReturn(false);
        ResponseEntity<PropertyResponse> r4 = controller.deleteProperty(4L, "u");
        assertEquals(404, r4.getStatusCodeValue());
        assertFalse(r4.getBody().isSuccess());
    }

    @Test
    void exceptionHandlers_returnProperResponseBodies() {
        ResponseStatusException rse = new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "nope");
        ResponseEntity<PropertyResponse> handled = controller.handleResponseStatusException(rse);
        assertEquals(404, handled.getStatusCodeValue());
        assertFalse(handled.getBody().isSuccess());
        assertEquals("nope", handled.getBody().getMessage());

        PropertyResponse pr = controller.handleRuntimeException(new RuntimeException("bad"));
        assertFalse(pr.isSuccess());
        assertEquals("bad", pr.getMessage());
    }

    @Test
    void testGetAllLockTypes() {
        LockTypeDto lock1 = new LockTypeDto();
        lock1.setId(1);
        lock1.setName("Inget lås");

        LockTypeDto lock2 = new LockTypeDto();
        lock2.setId(2);
        lock2.setName("Fysisk nyckel");

        List<LockTypeDto> mockLockDtos = Arrays.asList(lock1, lock2);
        when(lockTypeService.getAllLockTypes()).thenReturn(mockLockDtos);

        ResponseEntity<List<LockTypeDto>> response = controller.getAllLockTypes();

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());

        List<LockTypeDto> body = response.getBody();
        assertNotNull(body);
        assertEquals(2, body.size());
        assertEquals("Inget lås", body.get(0).getName());
        assertEquals("Fysisk nyckel", body.get(1).getName());

        verify(lockTypeService, times(1)).getAllLockTypes();
    }
}