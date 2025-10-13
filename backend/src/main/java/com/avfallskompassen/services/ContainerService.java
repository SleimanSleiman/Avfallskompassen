package com.avfallskompassen.services;

import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.repository.ContainerPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service class for container-related operations.
 */
@Service
public class ContainerService {

    @Autowired
    private ContainerPlanRepository containerPlanRepository;

    /**
     * Get containers by municipality ID and service type ID.
     * @param municipalityId
     * @param serviceTypeId
     * @return List of ContainerPlan
     */
    public List<ContainerPlan> getContainersByMunicipalityAndService(Long municipalityId, Long serviceTypeId) {
        return containerPlanRepository.findByMunicipalityService_Municipality_IdAndMunicipalityService_ServiceType_Id(
                municipalityId, serviceTypeId
        );
    }
}
