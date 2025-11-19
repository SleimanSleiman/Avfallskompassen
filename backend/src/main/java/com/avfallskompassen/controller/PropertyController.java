package com.avfallskompassen.controller;

import com.avfallskompassen.dto.LockTypeDto;
import com.avfallskompassen.dto.request.PropertyRequest;
import com.avfallskompassen.dto.response.PropertyResponse;
import com.avfallskompassen.dto.PropertyDTO;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.services.LockTypeService;
import com.avfallskompassen.services.PropertyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.avfallskompassen.exception.ExceptionResponseUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller for property management operations.
 * Handles creating, reading, updating, and deleting properties.
 * 
 * @author Akmal Safi
 */
@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyController {

    private PropertyService propertyService;
    private LockTypeService lockTypeService;

    public PropertyController(PropertyService propertyService, LockTypeService lockTypeService) {
        this.propertyService = propertyService;
        this.lockTypeService = lockTypeService;
    }
    
    /**
     * Create a new property for the current user.
     */
    @PostMapping
    public ResponseEntity<PropertyResponse> createProperty(
            @Valid @RequestBody PropertyRequest request,
            @RequestHeader(value = "X-Username", required = false) String username) {
        
        if (username == null || username.isEmpty()) {
            PropertyResponse response = new PropertyResponse(false, "User authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        try {
            LockTypeDto lockTypeDto = lockTypeService.findLockTypeById(request.getLockTypeId());
            Property property = propertyService.createProperty(request, username, lockTypeDto);
            
            PropertyResponse response = new PropertyResponse(true, "Property created successfully");
            response.setPropertyId(property.getId());
            response.setAddress(property.getAddress());
            response.setNumberOfApartments(property.getNumberOfApartments());
            response.setLockName(lockTypeDto.getName());
            response.setLockPrice(lockTypeDto.getCost());
            response.setAccessPathLength(property.getAccessPathLength());
            response.setCreatedAt(property.getCreatedAt());
            if (property.getMunicipality() != null) {
                response.setMunicipalityId(property.getMunicipality().getId());
                response.setMunicipalityName(property.getMunicipality().getName());
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            PropertyResponse response = new PropertyResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get all properties (admin function) - Returns DTOs to avoid proxy issues.
     */
    @GetMapping
    public ResponseEntity<List<PropertyDTO>> getAllProperties() {
        List<Property> properties = propertyService.getAllProperties();
        
        List<PropertyDTO> propertyDTOs = properties.stream()
                .map(PropertyDTO::new)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(propertyDTOs);
    }
    
    /**
     * Get all properties created by the current user - Returns DTOs to avoid proxy issues.
     */
    @GetMapping("/my-properties")
    public ResponseEntity<List<PropertyDTO>> getMyProperties(
            @RequestHeader(value = "X-Username", required = false) String username) {
        
        System.out.println("PropertyController: X-Username header = " + username);
        
        if (username == null || username.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            List<Property> properties = propertyService.getPropertiesByUser(username);
            System.out.println("PropertyController: Found " + properties.size() + " properties");
            
            // Convert to DTOs to avoid Hibernate proxy issues
            List<PropertyDTO> propertyDTOs = properties.stream()
                    .map(PropertyDTO::new)
                    .collect(Collectors.toList());
            
            System.out.println("PropertyController: Returning " + propertyDTOs.size() + " DTOs");
            return ResponseEntity.ok(propertyDTOs);
            
        } catch (Exception e) {
            System.out.println("PropertyController: Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get property by ID (only if owned by current user) - Returns DTO to avoid proxy issues.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PropertyDTO> getPropertyById(
            @PathVariable Long id, 
            @RequestHeader(value = "X-Username", required = false) String username) {
        
        if (username == null || username.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Optional<Property> property = propertyService.findByIdAndUser(id, username);
        
        if (property.isPresent()) {
            PropertyDTO propertyDTO = new PropertyDTO(property.get());
            return ResponseEntity.ok(propertyDTO);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found or access denied");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody PropertyRequest request,
            @RequestHeader(value = "X-Username", required = false) String username) {

        if (username == null || username.isEmpty()) {
            PropertyResponse response = new PropertyResponse(false, "User authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        if (!propertyService.isPropertyOwnedByUser(id, username)) {
            PropertyResponse response = new PropertyResponse(false, "Property not found or access denied");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        try {
            LockTypeDto lockTypeDto = lockTypeService.findLockTypeById(request.getLockTypeId());
            Property updated = propertyService.updateProperty(id, request, username, lockTypeDto);

            // Return a DTO instead of exposing the entity
            PropertyDTO propertyDTO = new PropertyDTO(updated);
            return ResponseEntity.ok(propertyDTO);

        } catch (RuntimeException e) {
            // Return 400 with a brief message wrapped in PropertyResponse body as before for errors
            PropertyResponse response = new PropertyResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get property by address - Returns DTO to avoid proxy issues.
     */
    @GetMapping("/address/{address}")
    public ResponseEntity<PropertyDTO> getPropertyByAddress(@PathVariable String address) {
        Optional<Property> property = propertyService.findByAddress(address);
        
        if (property.isPresent()) {
            PropertyDTO propertyDTO = new PropertyDTO(property.get());
            return ResponseEntity.ok(propertyDTO);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found");
        }
    }
    
    /**
     * Get properties by lock type - Returns DTOs to avoid proxy issues.
     */
    @GetMapping("/lock-type/{lockType}")
    public ResponseEntity<List<PropertyDTO>> getPropertiesByLockType(@PathVariable Long lockTypeId) {
        List<Property> properties = propertyService.findByLockType(lockTypeService.findLockTypeById(lockTypeId));
        
        List<PropertyDTO> propertyDTOs = properties.stream()
                .map(PropertyDTO::new)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(propertyDTOs);
    }

    /**
     * Fetches all available lock types from the DB - Returns DTO.
     * @return LockTypeDTO
     * @author Christian Storck
     */
    @GetMapping("/lock-type")
    public ResponseEntity<List<LockTypeDto>> getAllLockTypes() {
        List<LockTypeDto> lockTypeDtos = lockTypeService.getAllLockTypes();
        return ResponseEntity.ok(lockTypeDtos);
    }
    /**
     * Delete property by ID (only if owned by current user).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<PropertyResponse> deleteProperty(
            @PathVariable Long id,
            @RequestHeader(value = "X-Username", required = false) String username) {

        if (username == null || username.isEmpty()) {
            PropertyResponse response = new PropertyResponse(false, "User authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Check if user owns the property before deleting
        if (!propertyService.isPropertyOwnedByUser(id, username)) {
            PropertyResponse response = new PropertyResponse(false, "Property not found or access denied");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        boolean deleted = propertyService.deleteProperty(id);

        if (deleted) {
            PropertyResponse response = new PropertyResponse(true, "Property deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            PropertyResponse response = new PropertyResponse(false, "Property not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }


    /**
     * Global exception handler for ResponseStatusException
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<PropertyResponse> handleResponseStatusException(ResponseStatusException e) {
        return ExceptionResponseUtil.propertyResponse(e.getStatusCode(), false, e.getReason());
    }
    
    /**
     * Global exception handler for RuntimeException
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public PropertyResponse handleRuntimeException(RuntimeException e) {
        return new PropertyResponse(false, e.getMessage());
    }
}