package com.avfallskompassen.controller;

import com.avfallskompassen.dto.ServiceTypeDTO;
import com.avfallskompassen.repository.ServiceTypeRepository;
import com.avfallskompassen.services.ServiceTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for managing service types.
 * Provides an endpoint to retrieve all available service types.
 */
@RestController
@RequestMapping("/api/serviceTypes")
public class ServiceTypeController {

    @Autowired
    private ServiceTypeService serviceTypeService;

    /**
     * Get all service types.
     * @return List of ServiceTypeDTO containing service type names.
     * HTTP 200 OK with list of service types if successful,
     * HTTP 204 No Content if no service types found,
     * HTTP 500 Internal Server Error for other errors
     */
    @GetMapping("/all")
    public ResponseEntity<List<ServiceTypeDTO>> getAllServiceTypes() {
        try {
            List<ServiceTypeDTO> serviceTypes = serviceTypeService.getAllServiceTypes()
                    .stream()
                    .map(st -> new ServiceTypeDTO(st.getId(), st.getName()))
                    .collect(Collectors.toList());

            if (serviceTypes.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }

            return ResponseEntity.ok(serviceTypes);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }

}
