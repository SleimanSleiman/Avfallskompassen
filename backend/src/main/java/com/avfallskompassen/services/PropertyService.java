package com.avfallskompassen.services;

import com.avfallskompassen.dto.PropertyRequest;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.User;
import com.avfallskompassen.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service class for property-related operations.
 * 
 * @author Akmal Safi
 */
@Service
@Transactional
public class PropertyService {
    
    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserService userService;
    
    /**
     * Create a new property.
     * @param request the property request data
     * @return the created property
     * @throws RuntimeException if property with same address already exists
     */
    public Property createProperty(PropertyRequest request, String username) {
        Optional<User> userOptional = userService.findByUsername(username);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found: " + username);
        }
        
        User user = userOptional.get();
        
        if (propertyRepository.existsByAddress(request.getAddress())) {
            throw new RuntimeException("Property with this address already exists");
        }
        
        try {
            Property property = new Property(
                request.getAddress(),
                request.getNumberOfApartments(),
                request.getLockType(),
                request.getAccessPathLength(),
                user  
            );
            
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
     * @param lockType the lock type
     * @return list of properties with the specified lock type
     */
    public List<Property> findByLockType(String lockType) {
        return propertyRepository.findByLockType(lockType);
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
}