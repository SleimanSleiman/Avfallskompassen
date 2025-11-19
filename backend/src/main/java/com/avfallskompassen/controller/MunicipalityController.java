package com.avfallskompassen.controller;

import com.avfallskompassen.model.Municipality;
import com.avfallskompassen.repository.MunicipalityRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/municipalities")
@CrossOrigin(origins = "*")
public class MunicipalityController {

    private final MunicipalityRepository municipalityRepository;

    public MunicipalityController (MunicipalityRepository municipalityRepository) {
        this.municipalityRepository = municipalityRepository;
    }

    @GetMapping
    public ResponseEntity<List<Municipality>> getAllMunicipalities() {
        List<Municipality> list = municipalityRepository.findAll();
        return ResponseEntity.ok(list);
    }
}
