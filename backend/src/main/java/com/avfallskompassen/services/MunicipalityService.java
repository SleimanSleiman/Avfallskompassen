package com.avfallskompassen.services;

import com.avfallskompassen.dto.MunicipalityDTO;
import com.avfallskompassen.repository.MunicipalityRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for municipality-related business logic.
 * Returns DTOs to controllers instead of entities.
 * 
 * @author Christian Storck
 */
@Service
public class MunicipalityService {
    
    private final MunicipalityRepository municipalityRepository;
    
    public MunicipalityService(MunicipalityRepository municipalityRepository) {
        this.municipalityRepository = municipalityRepository;
    }
    
    /**
     * Get all municipalities as DTOs.
     * 
     * @return List of MunicipalityDTO
     */
    public List<MunicipalityDTO> getAllMunicipalities() {
        return municipalityRepository.findAll().stream()
                .map(MunicipalityDTO::new)
                .collect(Collectors.toList());
    }
}
