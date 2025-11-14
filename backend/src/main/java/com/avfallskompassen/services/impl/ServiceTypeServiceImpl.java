package com.avfallskompassen.services.impl;

import com.avfallskompassen.model.ServiceType;
import com.avfallskompassen.services.ServiceTypeService;
import org.springframework.stereotype.Service;
import com.avfallskompassen.repository.ServiceTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * Implementation of the ServiceTypeService interface.
 * Handles the logic for managing service types.
 */
@Service
public class ServiceTypeServiceImpl implements ServiceTypeService {

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    /**
     * Get all service types.
     * @return List of ServiceType
     */
    public List<ServiceType> getAllServiceTypes() {
        return serviceTypeRepository.findAll();
    }
}
