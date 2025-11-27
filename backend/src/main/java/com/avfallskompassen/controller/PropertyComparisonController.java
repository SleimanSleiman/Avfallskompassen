package com.avfallskompassen.controller;

import com.avfallskompassen.dto.CollectionFrequencyComparisonDTO;
import com.avfallskompassen.dto.ContainerSizeComparisonDTO;
import com.avfallskompassen.dto.CostComparisonDTO;
import com.avfallskompassen.dto.response.ErrorResponse;
import com.avfallskompassen.dto.PropertyComparisonDTO;
import com.avfallskompassen.dto.WasteAmountComparisonDTO;
import com.avfallskompassen.services.PropertyComparisonService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST Controller for property comparison endpoints.
 * Provides functionality to compare a property with similar properties.
 */
@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyComparisonController {

    private final PropertyComparisonService comparisonService;

    public PropertyComparisonController(PropertyComparisonService comparisonService) {
        this.comparisonService = comparisonService;
    }

    /**
     * Get comparison data for a specific property.
     * Compares the property with similar properties based on:
     * - Same property type (flerbostadshus, småhus, verksamhet)
     * - Same municipality
     * - Similar number of apartments (±5)
     *
     * @param propertyId the ID of the property to compare
     * @return comparison data including costs, container sizes, waste amounts, and collection frequencies
     */
    @GetMapping("/{propertyId}/comparison")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<?> getPropertyComparison(@PathVariable Long propertyId) {
        try {
            PropertyComparisonDTO comparison = comparisonService.getPropertyComparison(propertyId);
            return ResponseEntity.ok(comparison);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while processing the comparison request"));
        }
    }

    @GetMapping("/{propertyId}/comparison/cost")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<?> getCostComparison(@PathVariable Long propertyId) {
        try {
            CostComparisonDTO comparison = comparisonService.getCostComparison(propertyId);
            return ResponseEntity.ok(comparison);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while calculating the cost comparison"));
        }
    }

    @GetMapping("/{propertyId}/comparison/container-size")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<?> getContainerSizeComparison(@PathVariable Long propertyId) {
        try {
            ContainerSizeComparisonDTO comparison = comparisonService.getContainerSizeComparison(propertyId);
            return ResponseEntity.ok(comparison);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while calculating the container size comparison"));
        }
    }

    @GetMapping("/{propertyId}/comparison/waste-amounts")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<?> getWasteAmountComparisons(@PathVariable Long propertyId) {
        try {
            List<WasteAmountComparisonDTO> comparison = comparisonService.getWasteAmountComparisons(propertyId);
            return ResponseEntity.ok(comparison);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while calculating the waste amount comparison"));
        }
    }

    @GetMapping("/{propertyId}/comparison/frequencies")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<?> getFrequencyComparisons(@PathVariable Long propertyId) {
        try {
            List<CollectionFrequencyComparisonDTO> comparison = comparisonService.getFrequencyComparisons(propertyId);
            return ResponseEntity.ok(comparison);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while calculating the collection frequency comparison"));
        }
    }
}
