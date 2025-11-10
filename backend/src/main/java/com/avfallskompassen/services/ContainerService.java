package com.avfallskompassen.services;

import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.repository.ContainerPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Interface for the ContainerServiceImpl class.
 */
public interface ContainerService {

    /**
     * Get containers by municipality ID and service type ID.
     * @param municipalityId
     * @param serviceTypeId
     * @return List of ContainerPlan
     * @throws IllegalArgumentException if municipalityId or serviceTypeId is null
     */
    List<ContainerPlan> getContainersByMunicipalityAndService(Long municipalityId, Long serviceTypeId);
}
