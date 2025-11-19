package com.avfallskompassen.controller;

import com.avfallskompassen.dto.CollectionFeeDTO;
import com.avfallskompassen.dto.PropertyContainerDTO;
import com.avfallskompassen.services.CollectionFeeService;
import com.avfallskompassen.services.ContainerService;
import com.avfallskompassen.services.PropertyContainerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * REST controller for handling collection fee-related requests.
 * Provides endpoints to retrieve collection fees by municipality or property.
 *
 * @author Christian Storck
 */
@RestController
@RequestMapping("/api/containerPlan")
public class ContainerPlanController {

    private final CollectionFeeService collectionFeeService;
    private final PropertyContainerService propertyContainerService;
    private final ContainerService containerService;

    private ContainerPlanController(CollectionFeeService collectionFeeService, PropertyContainerService propertyContainerService, ContainerService containerService) {
        this.collectionFeeService = collectionFeeService;
        this.propertyContainerService = propertyContainerService;
        this.containerService = containerService;
    }

    /**
     * Handles requests for fetching the collection fee based on municipality and distance.
     *
     * @author Christian Storck
     * @param municipalityId The ID of the municipality to look up the fee for
     * @param distance The drag distance in meters used to calculate the fee
     * @return A {@link CollectionFeeDTO} containing the collection fee details
     * @throws ResponseStatusException if no fee could be found for the given municipality or distance
     */
    @GetMapping("/collectionFeeInput/{municipalityId}")
    public ResponseEntity<CollectionFeeDTO> getCollectionFeeByMunicipalityId(@PathVariable Long municipalityId, @RequestParam(name = "distance") double distance){

        if(municipalityId == null || municipalityId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kommunens ID måste vara giltigt");
        }
        CollectionFeeDTO collectionFeeDTO = collectionFeeService.findCollectionFeeByMunicipalityId(municipalityId, distance);

        if(collectionFeeDTO == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Dragvägskostnad hittades ej");
        }

        return ResponseEntity.ok(collectionFeeDTO);
    }

    /**
     * Handles a request for fetching collection fee data based on a property ID.
     *
     * @author Christian Storck
     * @param propertyId ID of the property
     * @return A {@link ResponseEntity} containing a {@link CollectionFeeDTO} with collection fee details,
     *         or a 404 response if no fee is found
     * @throws ResponseStatusException if no fee data can be found for the given property
     */
    @GetMapping("/collectionFee/{propertyId}")
    public ResponseEntity<CollectionFeeDTO> getCollectionFeeById(@PathVariable Long propertyId){
        CollectionFeeDTO collectionFeeDTO = collectionFeeService.findCollectionFeeByPropertyId(propertyId);

        if(collectionFeeDTO == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Dragvägskostnad hittades ej");
        }

        return ResponseEntity.ok(collectionFeeDTO);
    }

    /**
     * Handles a request for fetching property container data based on PropertyId.
     *
     * @author Christian Storck
     * @param propertyId ID of the property
     * @return A {@link ResponseEntity} containing a {@link PropertyContainerDTO} with collection fee details,
     *         or a 404 response if no container is found
     * @throws ResponseStatusException if no container data can be found for the given property
     */
    @GetMapping("/{propertyId}/containers")
    public ResponseEntity<List<PropertyContainerDTO>> getPropertyContainers(@PathVariable Long propertyId) {
        List<PropertyContainerDTO> dtos = containerService.getContainersByPropertyId(propertyId);

        if(dtos == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fastighetskärl hittades ej");
        }
        return ResponseEntity.ok(dtos);
    }
}
