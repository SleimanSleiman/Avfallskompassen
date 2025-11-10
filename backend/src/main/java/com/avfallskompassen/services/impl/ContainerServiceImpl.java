package com.avfallskompassen.services.impl;

import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.repository.ContainerPlanRepository;
import com.avfallskompassen.services.ContainerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of the ContainerService interface.
 * Handles the logic for managing containers.
 */
@Service
@Transactional
public class ContainerServiceImpl implements ContainerService {

    @Autowired
    private ContainerPlanRepository containerPlanRepository;

    /**
     * Get containers by municipality ID and service type ID.
     * @param municipalityId
     * @param serviceTypeId
     * @return List of ContainerPlan
     * @throws IllegalArgumentException if municipalityId or serviceTypeId is null
     */
    @Override
    public List<ContainerPlan> getContainersByMunicipalityAndService(Long municipalityId, Long serviceTypeId) {
        if (municipalityId == null || serviceTypeId == null) {
            throw new IllegalArgumentException("Municipality ID and Service Type ID must not be null");
        }

        return containerPlanRepository
            .findByMunicipalityService_Municipality_IdAndMunicipalityService_ServiceType_Id(
                    municipalityId, serviceTypeId
            );
    }
}
