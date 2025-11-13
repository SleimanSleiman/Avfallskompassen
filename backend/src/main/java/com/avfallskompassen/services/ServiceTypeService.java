package com.avfallskompassen.services;

import com.avfallskompassen.model.ServiceType;

import java.util.List;

/**
 * Interface for the ServiceTypeServiceImpl class.
 */
public interface ServiceTypeService {

    /**
     * Get all service types.
     * @return List of ServiceType
     */
    List<ServiceType> getAllServiceTypes();
}
