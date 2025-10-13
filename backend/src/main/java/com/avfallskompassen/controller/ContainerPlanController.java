package com.avfallskompassen.controller;

import com.avfallskompassen.dto.CollectionFeeDTO;
import com.avfallskompassen.model.CollectionFee;
import com.avfallskompassen.services.CollectionFeeService;
import com.avfallskompassen.services.ContainerPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/containerPlan")
public class ContainerPlanController {

    @Autowired
    private ContainerPlanService containerPlanService;
    @Autowired
    private CollectionFeeService collectionFeeService;

    @GetMapping("/collectionFee/{collectionFeeId}")
    public ResponseEntity<CollectionFeeDTO> getCollectionFeeById(@PathVariable Long collectionFeeId, @RequestParam(name = "distance") double distance){
        BigDecimal cost = collectionFeeService.findCollectionFeeById(collectionFeeId, distance);

        if(cost == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Dragvägskostnad hittades ej");
        }

        CollectionFeeDTO collectionFeeDTO = new CollectionFeeDTO();
        collectionFeeDTO.setId(collectionFeeId);
        collectionFeeDTO.setCost(cost);

        return ResponseEntity.ok(collectionFeeDTO);
    }
}
