package com.avfallskompassen.controller;

import com.avfallskompassen.dto.CollectionFeeDTO;
import com.avfallskompassen.services.CollectionFeeService;
import com.avfallskompassen.services.impl.CollectionFeeServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Rest API controller that serves DTO's containing the CollectionFee's.
 * @Author Christian Storck
 */

@RestController
@RequestMapping("/api/containerPlan")
public class ContainerPlanController {

    @Autowired
    private CollectionFeeService collectionFeeService;

    @GetMapping("/collectionFeeInput/{municipalityId}")
    public ResponseEntity<CollectionFeeDTO> getCollectionFeeByMunicalityId(@PathVariable Long municipalityId, @RequestParam(name = "distance") double distance){
        CollectionFeeDTO collectionFeeDTO = collectionFeeService.findCollectionFeeByMunicipalityId(municipalityId, distance);

        if(collectionFeeDTO == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Dragvägskostnad hittades ej");
        }

        return ResponseEntity.ok(collectionFeeDTO);
    }

    @GetMapping("/collectionFee/{propertyId}")
    public ResponseEntity<CollectionFeeDTO> getCollectionFeeById(@PathVariable Long propertyId){
        CollectionFeeDTO collectionFeeDTO = collectionFeeService.findCollectionFeeByPropertyId(propertyId);

        if(collectionFeeDTO == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Dragvägskostnad hittades ej");
        }

        return ResponseEntity.ok(collectionFeeDTO);
    }
}
