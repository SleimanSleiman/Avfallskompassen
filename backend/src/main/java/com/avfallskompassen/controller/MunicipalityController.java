package com.avfallskompassen.controller;

import com.avfallskompassen.model.Municipality;
import com.avfallskompassen.repository.MunicipalityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/municipalities")
@CrossOrigin(origins = "*")
public class MunicipalityController {

    @Autowired
    private MunicipalityRepository municipalityRepository;

    @GetMapping
    public ResponseEntity<List<Municipality>> getAllMunicipalities() {
        List<Municipality> list = municipalityRepository.findAll();
        return ResponseEntity.ok(list);
    }
}
