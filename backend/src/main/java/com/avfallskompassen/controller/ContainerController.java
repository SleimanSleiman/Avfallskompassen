package com.avfallskompassen.controller;

import com.avfallskompassen.dto.ContainerDTO;
import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.services.ContainerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for managing container-related endpoints.
 */
@RestController
@RequestMapping("/api/containers")
@CrossOrigin(origins = "*")
public class ContainerController {

    @Autowired
    private ContainerService containerService;

    /**
     * Get containers by municipality ID and service type ID.
     * @param municipalityId
     * @param serviceTypeId
     * @return List of ContainerDTO
     */
    @GetMapping("/municipality/{municipalityId}/service/{serviceTypeId}")
    public List<ContainerDTO> getContainersByMunicipalityAndService(
            @PathVariable Long municipalityId,
            @PathVariable Long serviceTypeId
    ) {
        return containerService.getContainersByMunicipalityAndService(municipalityId, serviceTypeId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Help method to map ContainerPlan to ContainerDTO.
     * @param plan the ContainerPlan entity
     * @return the mapped ContainerDTO
     */
    private ContainerDTO mapToDTO(ContainerPlan plan) {
        var type = plan.getContainerType();

        return new ContainerDTO(
                type.getName(),
                type.getSize(),
                type.getWidth(),
                type.getDepth(),
                type.getHeight(),
                type.getImageFrontViewUrl(),
                type.getImageTopViewUrl(),
                plan.getEmptyingFrequencyPerYear(),
                plan.getCost()
        );
    }

}
