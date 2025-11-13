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

    @Autowired
    private ContainerPositionRepository containerPositionRepository;

    /**
     * Get containers by municipality ID and service type ID.
     * @param municipalityId
     * @param serviceTypeId
     * @return List of ContainerPlan
     * @throws IllegalArgumentException if municipalityId or serviceTypeId is null
     */
    List<ContainerPlan> getContainersByMunicipalityAndService(Long municipalityId, Long serviceTypeId);
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

        String topViewUrl = plan.getImageTopViewUrl() != null
                ? plan.getImageTopViewUrl()
                : type.getImageTopViewUrl();

        return new ContainerDTO(
                type.getName(),
                type.getSize(),
                type.getWidth(),
                type.getDepth(),
                type.getHeight(),
                type.getImageFrontViewUrl(),
                topViewUrl,
                plan.getEmptyingFrequencyPerYear(),
                plan.getCost()
        );
    }
}
