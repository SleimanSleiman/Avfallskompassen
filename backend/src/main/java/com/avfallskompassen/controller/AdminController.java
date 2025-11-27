package com.avfallskompassen.controller;

import com.avfallskompassen.dto.UserDTO;
import com.avfallskompassen.dto.WasteRoomDTO;
import com.avfallskompassen.dto.request.WasteRoomRequest;
import com.avfallskompassen.services.UserService;
import com.avfallskompassen.services.WasteRoomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin-only endpoints for user management and waste room versioning.
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserService userService;
    private final WasteRoomService wasteRoomService;

    public AdminController(UserService userService, WasteRoomService wasteRoomService) {
        this.userService = userService;
        this.wasteRoomService = wasteRoomService;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> listUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUserRole(@PathVariable Integer id, @RequestParam String role) {
        UserDTO updated = userService.updateUserRole(id, role);
        return ResponseEntity.ok(updated);
    }

    /**
     * Handles requests for creating a new admin version of a waste room
     * @param propertyId Id of the property
     * @param roomName Name of the waste room
     * @param request Request containing all the information needed to create the new version
     * @return A status code with either an error message or a DTO containing information about the
     * newly created version
     */
    @PostMapping("/properties/{propertyId}/wasterooms/{roomName}/version")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WasteRoomDTO> createAdminVersion(
            @PathVariable Long propertyId,
            @PathVariable String roomName,
            @Valid @RequestBody WasteRoomRequest request) {
        WasteRoomDTO savedVersion = wasteRoomService.saveAdminVersion(propertyId, roomName, request);
        return ResponseEntity.ok(savedVersion);
    }

    /**
     * Handles requests for fetching all versions of a waste room
     * @param propertyId Id of the property
     * @param roomName Name of the waste room
     * @return A status code with either an error message or a list containing DTOs with information
     * about all versions of the waste room
     */
    @GetMapping("/properties/{propertyId}/wasterooms/{roomName}/versions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<WasteRoomDTO>> getAllVersions(
            @PathVariable Long propertyId,
            @PathVariable String roomName) {
        List<WasteRoomDTO> versions = wasteRoomService.getAllVersionsByPropertyAndName(propertyId, roomName);
        return ResponseEntity.ok(versions);
    }
}
