package com.avfallskompassen.controller;

import com.avfallskompassen.dto.MunicipalityDTO;
import com.avfallskompassen.services.MunicipalityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/municipalities")
@CrossOrigin(origins = "*")
public class MunicipalityController {

    private final MunicipalityService municipalityService;

    public MunicipalityController (MunicipalityService municipalityService) {
        this.municipalityService = municipalityService;
    }

    @GetMapping
    public ResponseEntity<List<MunicipalityDTO>> getAllMunicipalities() {
        List<MunicipalityDTO> list = municipalityService.getAllMunicipalities();
        return ResponseEntity.ok(list);
    }
}
