package com.avfallskompassen.controller;

import com.avfallskompassen.dto.WasteRoomDTO;
import com.avfallskompassen.dto.WasteRoomRequest;
import com.avfallskompassen.services.WasteRoomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for handling waste rooms.
 * Includes operations such as creating, deleting, updating and fetching waste rooms
 * @author Anton Persson
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class WasteRoomController {
    private WasteRoomService wasteRoomService;

    public WasteRoomController(WasteRoomService wasteRoomService) {
        this.wasteRoomService = wasteRoomService;
    }

    /**
     * Handles requests for creating waste rooms in the database
     * @param request Request containing all the information needed to create waste room
     * @return A status code with either an error message or a DTO containing information about the
     * newly created waste room
     */
    @PostMapping("/wasterooms")
    public ResponseEntity<WasteRoomDTO> createWasteRoom(@Valid @RequestBody WasteRoomRequest request) {
        WasteRoomDTO savedRoom = wasteRoomService.saveWasteRoom(request);
        return ResponseEntity.ok(savedRoom);
    }

    /**
     * Handles a request for updating a certain waste room
     * @param request Request containing all the information needed to create waste room
     * @return A status code with either an error message or a DTO containing information about the
     * newly updated waste room
     */
    @PutMapping("/wasterooms/{id}")
    public ResponseEntity<WasteRoomDTO> updateWasteRoom(@PathVariable Long id, @Valid @RequestBody WasteRoomRequest request) {
        WasteRoomDTO updated = wasteRoomService.updateWasteRoom(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Handles a request for deleting a waste room
     * @param id Id to the waste room
     * @return Status code on if the deletion was successful or not
     */
    @DeleteMapping("/wasterooms/{id}")
    public ResponseEntity<Void> deleteWasteRoom(@PathVariable Long id) {
        wasteRoomService.deleteWasteRoom(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Handles request for fetching a certain waste room
     * @param id Id to waste room
     * @return A status code with either an error message or a DTO with information
     * about the waste room collected.
     */
    @GetMapping("/wasterooms/{id}")
    public ResponseEntity<WasteRoomDTO> getWasteRoomById(@PathVariable Long id) {
        WasteRoomDTO dto = wasteRoomService.getWasteRoomById(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * Handles requests for fetching a certain waste room
     * @param propertyId Id to property
     * @return A status code with either an error message or a list containing DTO with information
     * about the waste rooms collected.
     */
    @GetMapping("/properties/{propertyId}/wasterooms")
    public ResponseEntity<List<WasteRoomDTO>> getWasteRoomsByPropertyId(@PathVariable Long propertyId) {
        List<WasteRoomDTO> rooms = wasteRoomService.getWasteRoomsByPropertyId(propertyId);
        return ResponseEntity.ok(rooms);
    }
}