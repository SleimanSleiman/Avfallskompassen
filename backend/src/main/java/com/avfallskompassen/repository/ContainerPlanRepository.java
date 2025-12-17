package com.avfallskompassen.repository;

import com.avfallskompassen.model.ContainerPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for ContainerPlan entity.
 */
@Repository
public interface ContainerPlanRepository extends JpaRepository<ContainerPlan, Long> {

    /**
     * Find container plans by municipality ID and service type ID.
     * @param municipalityId
     * @param serviceTypeId
     * @return List of ContainerPlan
     */
    List<ContainerPlan> findByMunicipalityService_Municipality_IdAndMunicipalityService_ServiceType_Id(
            long municipalityId,
            long serviceTypeId
    );

    /**
     * Find all container plans with eagerly loaded relationships.
     * @return List of ContainerPlan with all relationships loaded
     */
    @Query("SELECT cp FROM ContainerPlan cp " +
           "LEFT JOIN FETCH cp.municipalityService ms " +
           "LEFT JOIN FETCH ms.municipality " +
           "LEFT JOIN FETCH ms.serviceType " +
           "LEFT JOIN FETCH cp.containerType")
    List<ContainerPlan> findAllWithRelations();
}
