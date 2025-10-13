package com.avfallskompassen.controller;

import com.avfallskompassen.dto.ServiceTypeDTO;
import com.avfallskompassen.repository.ServiceTypeRepository;
import com.avfallskompassen.services.ServiceTypeService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private ServiceTypeService serviceTypeService;

    /**
     * Get all service types.
     * @return List of ServiceTypeDTO containing service type names.
     */
    @GetMapping
    public List<ServiceTypeDTO> getAllServiceTypes() {
        return serviceTypeService.getAllServiceTypes()
                .stream()
                .map(st -> new ServiceTypeDTO(st.getName()))
                .collect(Collectors.toList());
    }
}
