package com.avfallskompassen.controller;

import com.avfallskompassen.dto.GeneralPropertyCostDTO;
import com.avfallskompassen.dto.PropertyCostDTO;
import com.avfallskompassen.services.PropertyCostService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Rest API controller that serves DTO's containing the different costs tied to a property.
 * @author Christian Storck
 */

@RestController
@RequestMapping("/api/propertycost")
public class PropertyCostController {

    @Autowired
    private PropertyCostService propertyCostService;

    /**
     * Handles requests for calculating the total annual cost of a specific property.
     *
     * @author Christian Storck
     * @param id The ID of the property to calculate the total cost for
     * @return A {@link GeneralPropertyCostDTO} containing the calculated costs,
     * or an error response if the property could not be found
     */
    @GetMapping("/{id}/totalCost")
    public ResponseEntity<?> getAnnualCost(@PathVariable Long id) {
        try{
            GeneralPropertyCostDTO costDTO = propertyCostService.calculateAnnualCost(id);
            return ResponseEntity.ok(costDTO);

        } catch(EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error","Property not found with id: " + id));

        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error","An unexpected error occured"));
        }
    }

    /**
     * Handles requests for calculating the total property costs for all properties owned by a user.
     *
     * @author Christian Storck
     * @param username The username associated with the user's properties
     * @return A list of {@link GeneralPropertyCostDTO} objects representing each property’s calculated cost,
     * or an error response if no properties were found
     */
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getAllCostsForUser(@PathVariable String username) {
        try{
            List<GeneralPropertyCostDTO> costDTOs = propertyCostService.calculateAllCostsForUser(username);
            return ResponseEntity.ok(costDTOs);

        } catch(EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error","Property not found for: " + username));

        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error","An unexpected error occured"));
        }
    }
}
