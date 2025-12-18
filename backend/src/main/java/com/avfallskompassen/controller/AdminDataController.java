package com.avfallskompassen.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.avfallskompassen.dto.AdminDataDTO;
import com.avfallskompassen.dto.CollectionFeeAdminDTO;
import com.avfallskompassen.dto.ContainerPlanAdminDTO;
import com.avfallskompassen.dto.LockTypeDto;
import com.avfallskompassen.dto.request.UpdateCostRequest;
import com.avfallskompassen.services.AdminDataService;

import jakarta.validation.Valid;

/**
 * Admin-only controller for managing configurable data (prices, costs, etc.)
 */
@RestController
@RequestMapping("/api/admin/data")
@CrossOrigin(origins = "*")
public class AdminDataController {

    private final AdminDataService adminDataService;

    public AdminDataController(AdminDataService adminDataService) {
        this.adminDataService = adminDataService;
    }

    /**
     * Get all configurable data for admin management.
     * @return AdminDataDTO containing all lock types, container plans, and collection fees
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or isAuthenticated()")
    public ResponseEntity<AdminDataDTO> getAllAdminData() {
        AdminDataDTO data = adminDataService.getAllAdminData();
        return ResponseEntity.ok(data);
    }

    /**
     * Update the cost of a lock type.
     * @param id The ID of the lock type
     * @param request Request containing the new cost
     * @return Updated LockTypeDto
     */
    @PutMapping("/lock-types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LockTypeDto> updateLockTypeCost(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCostRequest request) {
        LockTypeDto updated = adminDataService.updateLockTypeCost(id, request.getCost());
        return ResponseEntity.ok(updated);
    }

    /**
     * Update the cost of a container plan.
     * @param id The ID of the container plan
     * @param request Request containing the new cost
     * @return Updated ContainerPlanAdminDTO
     */
    @PutMapping("/container-plans/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContainerPlanAdminDTO> updateContainerPlanCost(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCostRequest request) {
        ContainerPlanAdminDTO updated = adminDataService.updateContainerPlanCost(id, request.getCost());
        return ResponseEntity.ok(updated);
    }

    /**
     * Update the cost of a collection fee.
     * @param id The ID of the collection fee
     * @param request Request containing the new cost
     * @return Updated CollectionFeeAdminDTO
     */
    @PutMapping("/collection-fees/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CollectionFeeAdminDTO> updateCollectionFeeCost(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCostRequest request) {
        CollectionFeeAdminDTO updated = adminDataService.updateCollectionFeeCost(id, request.getCost());
        return ResponseEntity.ok(updated);
    }
}

