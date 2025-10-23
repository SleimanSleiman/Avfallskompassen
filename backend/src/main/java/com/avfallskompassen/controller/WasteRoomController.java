package com.avfallskompassen.controller;

import com.avfallskompassen.dto.WasteRoomDTO;
import com.avfallskompassen.dto.WasteRoomRequest;
import com.avfallskompassen.services.WasteRoomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
     * Handles request for fetching a certain waste room
     * @param id
     * @return
     */
    @GetMapping("/wasterooms/{id}")
    public ResponseEntity<WasteRoomDTO> getWasteRoomById(@PathVariable Long id) {
        WasteRoomDTO dto = wasteRoomService.getWasteRoomById(id);
        return ResponseEntity.ok(dto);
    }


    @GetMapping("/properties/{propertyId}/wasterooms")
    public ResponseEntity<List<WasteRoomDTO>> getWasteRoomsByPropertyId(@PathVariable Long propertyId) {
        List<WasteRoomDTO> rooms = wasteRoomService.getWasteRoomsByPropertyId(propertyId);
        return ResponseEntity.ok(rooms);
    }
}