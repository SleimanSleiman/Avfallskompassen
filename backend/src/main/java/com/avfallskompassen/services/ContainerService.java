package com.avfallskompassen.services;

import com.avfallskompassen.dto.ContainerDTO;
import com.avfallskompassen.dto.ContainerPositionDTO;
import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.model.ContainerPosition;
import com.avfallskompassen.model.ContainerType;
import com.avfallskompassen.repository.ContainerPlanRepository;
import com.avfallskompassen.repository.ContainerPositionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for container-related operations.
 */
@Service
public class ContainerService {

    @Autowired
    private ContainerPlanRepository containerPlanRepository;

    @Autowired
    private ContainerPositionRepository containerPositionRepository;

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

    public List<ContainerPositionDTO> getContainersByWasteRoomId(Long wasteRoomId) {
        List<ContainerPosition> positions = containerPositionRepository.findByWasteRoomId(wasteRoomId);

        return positions.stream()
                .map(this::mapPositionToDTO)
                .toList();
    }

    private ContainerPositionDTO mapPositionToDTO(ContainerPosition position) {
        ContainerPositionDTO dto = new ContainerPositionDTO();
        dto.setId(position.getId());
        dto.setX(position.getX());
        dto.setY(position.getY());
        dto.setAngle(position.getAngle());
        dto.setWasteRoomId(position.getWasteRoom().getId());

        ContainerPlan plan = position.getContainerPlan();
        dto.setContainerPlanId(plan.getId());

        // map plan to ContainerDTO
        ContainerType type = plan.getContainerType();
        ContainerDTO containerDTO = new ContainerDTO(
                type.getName(),
                type.getSize(),
                type.getWidth(),
                type.getDepth(),
                type.getHeight(),
                type.getImageFrontViewUrl(),
                plan.getImageTopViewUrl() != null ? plan.getImageTopViewUrl() : type.getImageTopViewUrl(),
                plan.getEmptyingFrequencyPerYear(),
                plan.getCost()
        );
        dto.setContainerDTO(containerDTO);

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
