package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.*;
import com.avfallskompassen.dto.request.PropertyRequest;
import com.avfallskompassen.model.*;
import com.avfallskompassen.repository.MunicipalityRepository;
import com.avfallskompassen.repository.PropertyRepository;
import com.avfallskompassen.services.PropertyService;
import com.avfallskompassen.services.UserService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service class for property-related operations.
 * 
 * @author Akmal Safi
 * @author Sleiman Sleiman
 */
@Service
@Transactional
public class PropertyServiceImpl implements PropertyService {
    
    private PropertyRepository propertyRepository;
    private com.avfallskompassen.repository.MunicipalityRepository municipalityRepository;
    private UserService userService;

    public PropertyServiceImpl(PropertyRepository propertyRepository,
                               MunicipalityRepository municipalityRepository,
                               UserService userService) {
        this.propertyRepository = propertyRepository;
        this.municipalityRepository = municipalityRepository;
        this.userService = userService;
    }

    /**
     * Create a new property.
     * @param request the property request data
     * @return the created property
     * @throws RuntimeException if property with same address already exists
     */
    public Property createProperty(PropertyRequest request, String username, LockTypeDto lockType) {
        Optional<User> userOptional = userService.findByUsername(username);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found: " + username);
        }
        
        User user = userOptional.get();

        if (lockType == null) {
            throw new RuntimeException("Lock type not found or not provided");
        }
        
        if (propertyRepository.existsByAddress(request.getAddress())) {
            throw new RuntimeException("Property with this address already exists");
        }
        
        try {
            // Parse property type from request, default to FLERBOSTADSHUS if not provided
            PropertyType propertyType = PropertyType.FLERBOSTADSHUS;
            if (request.getPropertyType() != null && !request.getPropertyType().isEmpty()) {
                try {
                    propertyType = PropertyType.valueOf(request.getPropertyType().toUpperCase());
                } catch (IllegalArgumentException e) {
                    // Invalid property type, use default
                }
            }

            Municipality municipality = null;
            if (request.getMunicipalityId() != null) {
                municipality = municipalityRepository.findById(request.getMunicipalityId()).orElse(null);
            }

            LockType lockType1 = new LockType();
            lockType1.setId(lockType.getId());
            lockType1.setName(lockType.getName());
            lockType1.setCost(lockType.getCost());

            Property property = new Property(
                request.getAddress(),
                request.getNumberOfApartments(),
                lockType1,
                propertyType,
                request.getAccessPathLength(),
                user  
            );
            property.setMunicipality(municipality);
            
            return propertyRepository.save(property);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Failed to create property: duplicate address");
        }
    }

    /**
     * Get all properties created by a specific user.
     */
    public List<Property> getPropertiesByUser(String username) {
        return propertyRepository.findByCreatedByUsername(username);
    }

    /**
     *
     * @param username
     * @return
     */
    public List<PropertyDTO> getPropertiesWithRoomsByUser(String username) { // TODO ------------------------ WRITE TESTS
        List<Property> properties = propertyRepository.findAllByUserWithRooms(username);

        return properties.stream()
                .map(PropertyDTO::new)
                .toList();
    }

    /**
     *
     * @return
     */
    public List<UserStatsDTO> getUsersInfoCount() { // TODO --------------------------------- WRITE TESTS
        List<Object[]> rawRows = propertyRepository.getUserPropertyAndWasteRoomStats();
        List<UserStatsDTO> userStatsDTO = new LinkedList<>();

        for (Object[] row : rawRows) {
            Long userId = ((Number) row[0]).longValue();
            String username = (String) row[1];
            LocalDateTime createdAt = (LocalDateTime) row[2];
            Long propertiesCount = ((Number) row[3]).longValue();
            Long wasteRoomsCount = ((Number) row[4]).longValue();

            userStatsDTO.add(new UserStatsDTO(userId, username, createdAt, propertiesCount, wasteRoomsCount));
        }
        return userStatsDTO;
    }

    /**
     * Gets all properties with a simpler DTO format for a specific user:
     * @param username
     * @return PropertySimpleDTO
     */
    public List<PropertySimpleDTO> getSimplePropertiesByUser(String username) {
        List<Property> properties = propertyRepository.findByCreatedByUsername(username);

        return properties.stream()
                .map(PropertySimpleDTO::from)
                .toList();
    }

     /**
     * Check if a user owns a specific property.
     */
    public boolean isPropertyOwnedByUser(Long propertyId, String username) {
        Optional<User> userOptional = userService.findByUsername(username);
        if (userOptional.isEmpty()) {
            return false;
        }
        return propertyRepository.existsByIdAndCreatedBy(propertyId, userOptional.get());
    }

    /**
     * Find property by ID, but only if owned by the specified user.
     */
    public Optional<Property> findByIdAndUser(Long id, String username) {
        Optional<Property> property = propertyRepository.findById(id);
        if (property.isPresent() && isPropertyOwnedByUser(id, username)) {
            return property;
        }
        return Optional.empty();
    }
    
    /**
     * Find property by ID.
     * @param id the property ID
     * @return Optional containing the property if found
     */
    public Optional<Property> findById(Long id) {
        return propertyRepository.findById(id);
    }
    
    /**
     * Find property by address.
     * @param address the property address
     * @return Optional containing the property if found
     */
    public Optional<Property> findByAddress(String address) {
        return propertyRepository.findByAddress(address);
    }
    
    /**
     * Get all properties.
     * @return list of all properties
     */
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }
    
    /**
     * Find properties by lock type.
     * @param lockTypeDto the lock type
     * @return list of properties with the specified lock type
     */
    public List<Property> findByLockType(LockTypeDto lockTypeDto) {
        return propertyRepository.findByLockType_id(lockTypeDto.getId());
    }
    
    /**
     * Delete property by ID.
     * @param id the property ID
     * @return true if property was deleted
     */
    public boolean deleteProperty(Long id) {
        if (propertyRepository.existsById(id)) {
            propertyRepository.deleteById(id);
            return true;
        }
        return false;
    }

     public Property updateProperty(Long id, PropertyRequest request, String username, LockTypeDto lockTypeDto) {
        Optional<Property> existingOpt = propertyRepository.findById(id);
        if (existingOpt.isEmpty()) {
            throw new RuntimeException("Property not found");
        }
        Property property = existingOpt.get();

        // ownership check
        if (!isPropertyOwnedByUser(id, username)) {
            throw new RuntimeException("Property not found or access denied");
        }

        String newAddress = request.getAddress();
        if (newAddress != null && !newAddress.equals(property.getAddress())) {
            if (propertyRepository.existsByAddress(newAddress)) {
                throw new RuntimeException("Property with this address already exists");
            }
            property.setAddress(newAddress);
        }

        if (request.getNumberOfApartments() != null) {
            property.setNumberOfApartments(request.getNumberOfApartments());
        }

        if (lockTypeDto != null) {
            LockType lockType1 = new LockType();
            lockType1.setId(lockTypeDto.getId());
            lockType1.setName(lockTypeDto.getName());
            lockType1.setCost(lockTypeDto.getCost());
            property.setLockType(lockType1);
        }

        if (request.getAccessPathLength() != null) {
            property.setAccessPathLength(request.getAccessPathLength());
        }

        if (request.getMunicipalityId() != null) {
            Municipality municipality = municipalityRepository.findById(request.getMunicipalityId()).orElse(null);
            property.setMunicipality(municipality);
        }

        try {
            return propertyRepository.save(property);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Failed to update property: " + e.getMessage());
        }
    }
}