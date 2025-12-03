package com.avfallskompassen.controller;

import com.avfallskompassen.dto.UserDTO;
import com.avfallskompassen.dto.WasteRoomDTO;
import com.avfallskompassen.dto.request.WasteRoomRequest;
import com.avfallskompassen.services.UserService;
import com.avfallskompassen.services.WasteRoomService;
import com.avfallskompassen.repository.PropertyRepository;
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
    private final PropertyRepository propertyRepository;

    public AdminController(UserService userService, WasteRoomService wasteRoomService, PropertyRepository propertyRepository) {
        this.userService = userService;
        this.wasteRoomService = wasteRoomService;
        this.propertyRepository = propertyRepository;
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

    /**
     * Handles requests for fetching the waste rooms for a specific user's property.
     * The admin can use this endpoint to view the waste room for a user.
     * Fetches waste rooms directly from the database (not from cache/localStorage).
     * 
     * @param userId The ID of the user
     * @return A list of waste room DTOs for the user's property
     */
    @GetMapping("/users/{userId}/waste-rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<WasteRoomDTO>> getWasteRoomsForUser(@PathVariable Integer userId) {
        System.out.println("[AdminController] Fetching waste rooms for userId: " + userId);
        
        // Find the user from database
        com.avfallskompassen.model.User user = userService.findUserWithProperties(userId)
                .orElse(null);
        
        if (user == null) {
            System.out.println("[AdminController] User not found with ID: " + userId);
            return ResponseEntity.notFound().build();
        }
        
        System.out.println("[AdminController] Found user: " + user.getUsername());

        // Get user's properties from database
        java.util.List<com.avfallskompassen.model.Property> userProperties = propertyRepository.findByCreatedBy(user);
        
        System.out.println("[AdminController] User '" + user.getUsername() + "' has " + userProperties.size() + " properties");
        
        if (userProperties.isEmpty()) {
            System.out.println("[AdminController] User has no properties, returning empty list");
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }

        // Get the first property (main property) and fetch its waste rooms from database
        Long propertyId = userProperties.get(0).getId();
        System.out.println("[AdminController] Fetching waste rooms for propertyId: " + propertyId + " (Address: " + userProperties.get(0).getAddress() + ")");
        
        List<WasteRoomDTO> wasteRooms = wasteRoomService.getWasteRoomsByPropertyId(propertyId);
        
        System.out.println("[AdminController] Found " + wasteRooms.size() + " waste rooms for this property");
        wasteRooms.forEach(wr -> System.out.println("   → Room: '" + wr.getName() + "' (ID: " + wr.getWasteRoomId() + ", Version: " + wr.getVersionNumber() + ", Size: " + wr.getWidth() + "m × " + wr.getLength() + "m)"));
        
        return ResponseEntity.ok(wasteRooms);
    }
}
