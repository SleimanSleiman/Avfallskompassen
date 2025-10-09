package com.avfallskompassen.controller;

import com.avfallskompassen.dto.ServiceTypeDTO;
import com.avfallskompassen.repository.ServiceTypeRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for managing service types.
 * Provides an endpoint to retrieve all available service types.
 */
@RestController
@RequestMapping("/api/serviceTypes")
public class ServiceTypeController {

    private final ServiceTypeRepository serviceTypeRepository;

    public ServiceTypeController(ServiceTypeRepository serviceTypeRepository) {
        this.serviceTypeRepository = serviceTypeRepository;
    }

    /**
     * Get all service types.
     * @return List of ServiceTypeDTO containing service type names.
     */
    @GetMapping
    public List<ServiceTypeDTO> getAllServiceTypes() {
        return serviceTypeRepository.findAll()
                .stream()
                .map(st -> new ServiceTypeDTO(st.getName()))
                .collect(Collectors.toList());
    }
}
