package com.avfallskompassen.repository;

import com.avfallskompassen.model.LockType;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Property entity operations.
 * 
 * @author Akmal Safi
 */

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    /**
     * Find property by address.
     * @param address the property address
     * @return Optional containing the property if found
     */
    
    Optional<Property> findByAddress(String address);
    /**
     * Check if property exists by address.
     * @param address the property address
     * @return true if property exists
     */
    boolean existsByAddress(String address); 

    /**
     * Find properties by lock type.
     * @param lockType the lock type
     * @return list of properties with the specified lock type
     */
    List<Property> findByLockType(LockType lockType);
    /**
     * 
     * Find properties created by a specific user.
     * @param user
     * @return list of properties created by the user
     */
    List<Property> findByCreatedBy(User user);
    
    /**
     * Find properties created by a specific user.
     * @param username
     * @return list of properties created by the user
     */
    List<Property> findByCreatedByUsername(String username);

    /**
     * Check if a property with the given ID exists and is created by the specified user.
     * @param propertyId the property ID
     * @param user the user
     * @return true if such a property exists
     */

    boolean existsByIdAndCreatedBy(Long propertyId, User user);

}