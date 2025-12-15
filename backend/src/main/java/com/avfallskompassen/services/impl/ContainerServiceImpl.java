package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.ContainerDTO;
import com.avfallskompassen.dto.ContainerPositionDTO;
import com.avfallskompassen.dto.PropertyContainerDTO;
import com.avfallskompassen.exception.ResourceNotFoundException;
import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.model.ContainerPosition;
import com.avfallskompassen.repository.ContainerPlanRepository;
import com.avfallskompassen.repository.ContainerPositionRepository;
import com.avfallskompassen.services.ContainerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementation of the ContainerService interface.
 * Handles the logic for managing containers.
 */
@Service
@Transactional
public class ContainerServiceImpl implements ContainerService {

    private ContainerPlanRepository containerPlanRepository;
    private ContainerPositionRepository containerPositionRepository;

    public ContainerServiceImpl(ContainerPlanRepository containerPlanRepository,
                                ContainerPositionRepository containerPositionRepository) {
        this.containerPlanRepository = containerPlanRepository;
        this.containerPositionRepository = containerPositionRepository;
    }

    /**
     * Get containers by municipality ID and service type ID.
     * @param municipalityId
     * @param serviceTypeId
     * @return List of ContainerPlan
     * @throws IllegalArgumentException if municipalityId or serviceTypeId is null
     */
    public List<ContainerDTO> getContainersByMunicipalityAndService(Long municipalityId, Long serviceTypeId) {
        if (municipalityId == null || serviceTypeId == null) {
            throw new IllegalArgumentException("Municipality ID and Service Type ID must not be null");
        }

        return containerPlanRepository.findByMunicipalityService_Municipality_IdAndMunicipalityService_ServiceType_Id(
                        municipalityId, serviceTypeId
                ).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get containers for a certain waste room.
     * @param wasteRoomId Id to the waste room whose containers are to be fetched
     * @return List of containers in a specific waste room
     */
    public List<ContainerPositionDTO> getContainersByWasteRoomId(Long wasteRoomId) {
        List<ContainerPosition> positions = containerPositionRepository.findByWasteRoomId(wasteRoomId);

        return positions.stream()
                .map(this::mapPositionToDTO)
                .toList();
    }

    /**
     * Gets container plan based on ID, or throw {@link ResourceNotFoundException}
     * @param id Id to the container plan
     * @return {@link ContainerPlan} matching id
     */
    public ContainerPlan getContainerPlanById(Long id) {
        return containerPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ContainerPlan with ID: " + id + " can't be found"
                ));
    }

    public List<PropertyContainerDTO> getContainersByPropertyId(Long propertyId) {
        List<ContainerPosition> positions = containerPositionRepository.findByPropertyId(propertyId);

        Map<ContainerPlan, Long> grouped = positions.stream()
                .collect(Collectors.groupingBy(ContainerPosition::getContainerPlan, Collectors.counting()));

        List<PropertyContainerDTO> results = grouped.entrySet().stream()
                .map(entry -> {
                    ContainerPlan containerPlan = entry.getKey();
                    Long count = entry.getValue();

                    return new PropertyContainerDTO(
                            containerPlan.getMunicipalityService().getServiceType().getName(),
                            containerPlan.getContainerType().getName(),
                            containerPlan.getContainerType().getSize(),
                            count.intValue(),
                            containerPlan.getEmptyingFrequencyPerYear(),
                            containerPlan.getCost()
                    );
                })
                .toList();
        return results;
    }

    /**
     * Help method to map ContainerPosition to a DTO
     * @param position The {@link ContainerPosition} to transform into DTO
     * @return {@link ContainerPositionDTO}
     */
    private ContainerPositionDTO mapPositionToDTO(ContainerPosition position) {
        ContainerPositionDTO dto = new ContainerPositionDTO();
        dto.setId(position.getId());
        dto.setX(position.getX());
        dto.setY(position.getY());
        dto.setAngle(position.getAngle());
        dto.setWasteRoomId(position.getWasteRoom().getId());

        ContainerPlan plan = position.getContainerPlan();
        dto.setContainerPlanId(plan.getId());

        dto.setContainerDTO(mapToDTO(plan));

        return dto;
    }


    /**
     * Help method to map ContainerPlan to ContainerDTO.
     * @param plan the ContainerPlan entity
     * @return the mapped ContainerDTO
     */
    private ContainerDTO mapToDTO(ContainerPlan plan) {
        var type = plan.getContainerType();

        return new ContainerDTO(
                plan.getId(),
                plan.getMunicipalityService().getServiceType().getName(),
                type.getSize(),
                type.getWidth(),
                type.getDepth(),
                type.getHeight(),
                plan.getImageFrontViewUrl(),
                plan.getImageTopViewUrl(),
                plan.getEmptyingFrequencyPerYear(),
                plan.getCost()
        );
    }
}