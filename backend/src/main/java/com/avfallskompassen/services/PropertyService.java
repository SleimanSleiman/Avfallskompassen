package com.avfallskompassen.services;

import com.avfallskompassen.dto.LockTypeDto;
import com.avfallskompassen.dto.PropertyDTO;
import com.avfallskompassen.dto.PropertySimpleDTO;
import com.avfallskompassen.dto.PropertySummaryDTO;
import com.avfallskompassen.dto.UserStatsDTO;
import com.avfallskompassen.dto.request.PropertyRequest;
import com.avfallskompassen.model.Property;

import java.util.List;
import java.util.Optional;

public interface PropertyService {

    Property createProperty(PropertyRequest request, String username, LockTypeDto lockTypeDto);

    List<Property> getPropertiesByUser(String username);

    List<PropertySimpleDTO> getSimplePropertiesByUser(String username);

    boolean isPropertyOwnedByUser(Long propertyId, String username);

    List<PropertyDTO> getPropertiesWithRoomsByUser(String username);
    
    /**
     * Lightweight summary list of properties for a given user,
     * without loading the full waste room graph.
     */
    List<PropertySummaryDTO> getPropertiesSummaryByUser(String username);

    Optional<Property> findByIdAndUser(Long id, String username);

    Optional<Property> findByAddress(String address);

    Optional<Property> findById(Long id);

    List<Property> getAllProperties();

    List<UserStatsDTO> getUsersInfoCount();

    List<Property> findByLockType(LockTypeDto lockType);

    boolean deleteProperty(Long id);

    Property updateProperty(Long id, PropertyRequest request, String username, LockTypeDto lockType);
}
