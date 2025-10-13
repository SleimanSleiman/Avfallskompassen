package com.avfallskompassen.controller;

import com.avfallskompassen.dto.PropertyComparisonDTO;
import com.avfallskompassen.services.PropertyComparisonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for property comparison endpoints.
 * Provides functionality to compare a property with similar properties.
 * 
 * @author Sleiman Sleiman
 */
@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyComparisonController {
    
    @Autowired
    private PropertyComparisonService comparisonService;
    
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
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getPropertyComparison(@PathVariable Long propertyId) {
        try {
            PropertyComparisonDTO comparison = comparisonService.getPropertyComparison(propertyId);
            return ResponseEntity.ok(comparison);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while processing the comparison"));
        }
    }
    

    private static class ErrorResponse {
        private final String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
    }
}
