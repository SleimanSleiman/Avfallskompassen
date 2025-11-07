package com.avfallskompassen.services;

import com.avfallskompassen.dto.request.PropertyRequest;
import com.avfallskompassen.model.LockType;
import com.avfallskompassen.model.Property;

import java.util.List;
import java.util.Optional;

public interface PropertyService {

    Property createProperty(PropertyRequest request, String username, LockType lockType);

    List<Property> getPropertiesByUser(String username);

    boolean isPropertyOwnedByUser(Long propertyId, String username);

    Optional<Property> findByIdAndUser(Long id, String username);

    Optional<Property> findByAddress(String address);

    Optional<Property> findById(Long id);

    List<Property> getAllProperties();

    List<Property> findByLockType(LockType lockType);

    boolean deleteProperty(Long id);

    Property updateProperty(Long id, PropertyRequest request, String username, LockType lockType);
}
