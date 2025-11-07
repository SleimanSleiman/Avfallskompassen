package com.avfallskompassen.controller;

import com.avfallskompassen.dto.ContainerDTO;
import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.services.ContainerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
     * @param municipalityId the ID of the municipality
     * @param serviceTypeId the ID of the service type
     * @return List of ContainerDTO
     * HTTP 200 OK with list of containers if found,
     * HTTP 400 Bad Request if parameters are invalid,
     * HTTP 500 Internal Server Error for other errors
     */
    @GetMapping("/municipality/{municipalityId}/service/{serviceTypeId}")
    public ResponseEntity<List<ContainerDTO>> getContainersByMunicipalityAndService(
            @PathVariable Long municipalityId,
            @PathVariable Long serviceTypeId
    ) {
        if (municipalityId == null || serviceTypeId == null || municipalityId <= 0 || serviceTypeId <= 0) {
            return ResponseEntity.badRequest().build();
        }

        try {
            var containers = containerService.getContainersByMunicipalityAndService(municipalityId, serviceTypeId)
                    .stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(containers);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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
