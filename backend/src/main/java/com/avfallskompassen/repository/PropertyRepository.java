package com.avfallskompassen.repository;

import com.avfallskompassen.model.Municipality;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.PropertyType;
import com.avfallskompassen.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Property entity operations.
 * 
 * @author Akmal Safi
 * @author Sleiman Sleiman
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
     * @param lockTypeId the lock type
     * @return list of properties with the specified lock type
     */
    List<Property> findByLockType_id(Long lockTypeId);
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
     * Find which user created a certain property
     * @param id Id to the property
     * @return User who created the property
     */
    @Query("SELECT p.createdBy FROM Property p WHERE p.id = :id")
    User findCreatedByUserByPropertyId(Long id);

    /**
     * Check if a property with the given ID exists and is created by the specified user.
     * @param propertyId the property ID
     * @param user the user
     * @return true if such a property exists
     */
    boolean existsByIdAndCreatedBy(Long propertyId, User user);


    @Query("""
        SELECT DISTINCT p FROM Property p
        LEFT JOIN FETCH p.wasteRooms wr
        WHERE p.createdBy.username = :username
    """)
    List<Property> findAllByUserWithRooms(String username);

    @Query("""
    SELECT 
        u.id,
        u.username,
        u.role,
        u.createdAt,
        COUNT(DISTINCT p.id),
        COUNT(wr.id)
    FROM User u
    LEFT JOIN Property p ON p.createdBy.id = u.id
    LEFT JOIN p.wasteRooms wr
    GROUP BY u.id, u.username, u.role, u.createdAt
""")
    List<Object[]> getUserPropertyAndWasteRoomStats();

    /**
     * Returns total number of waste room versions per property for a given user.
     */
    @Query("""
        SELECT p.id, COUNT(wr.id)
        FROM Property p
        LEFT JOIN p.wasteRooms wr
        WHERE p.createdBy.username = :username
        GROUP BY p.id
    """)
    List<Object[]> getPropertyRoomVersionCountsByUser(@Param("username") String username);




    /**
     * Find similar properties for comparison.
     * Properties are similar if they have the same property type, same municipality,
     * and number of apartments within ±5 of the given property.
     * 
     * @param propertyType the property type
     * @param municipality the municipality
     * @param minApartments minimum number of apartments (numberOfApartments - 5)
     * @param maxApartments maximum number of apartments (numberOfApartments + 5)
     * @param excludePropertyId the property ID to exclude from results
     * @return list of similar properties
     */
    @Query("SELECT p FROM Property p WHERE p.propertyType = :propertyType " +
           "AND p.municipality = :municipality " +
           "AND p.numberOfApartments BETWEEN :minApartments AND :maxApartments " +
           "AND p.id != :excludePropertyId")
    List<Property> findSimilarProperties(
        @Param("propertyType") PropertyType propertyType,
        @Param("municipality") Municipality municipality,
        @Param("minApartments") Integer minApartments,
        @Param("maxApartments") Integer maxApartments,
        @Param("excludePropertyId") Long excludePropertyId
    );

    /**
     * Update lastNotifiedAt for a property without loading the full entity.
     * Uses a new transaction to avoid rolling back other updates if one fails.
     * @param id property id
     * @param now timestamp to set
     * @return number of rows updated (should be 1)
     */
    @Modifying
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Query("UPDATE Property p SET p.lastNotifiedAt = :now WHERE p.id = :id")
    int updateLastNotifiedAt(@Param("id") Long id, @Param("now") java.time.LocalDateTime now);

}