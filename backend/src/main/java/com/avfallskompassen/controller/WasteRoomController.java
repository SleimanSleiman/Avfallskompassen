package com.avfallskompassen.controller;

import com.avfallskompassen.dto.RoomPdfDTO;
import com.avfallskompassen.dto.WasteRoomDTO;
import com.avfallskompassen.dto.WasteRoomRequest;
import com.avfallskompassen.services.RoomPdfService;
import com.avfallskompassen.services.WasteRoomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class WasteRoomController {
    private WasteRoomService wasteRoomService;

    @Autowired
    private RoomPdfService roomPdfService;

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

    @PostMapping("/upload-pdf")
    public ResponseEntity<RoomPdfDTO> uploadPdf(@RequestParam("file")MultipartFile file,
                                                 @RequestParam("roomId") Long roomId) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Uploaded file is empty");
        }
        try {
            RoomPdfDTO response = roomPdfService.uploadPdf(file, roomId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload PDF", e);
        }
    }

    @GetMapping("/{roomId}/pdfs")
    public ResponseEntity<List<RoomPdfDTO>> getRoomPdfs(@PathVariable Long roomId) {
        try {
            List<RoomPdfDTO> pdfs = roomPdfService.getPdfsByRoomId(roomId);
            return ResponseEntity.ok(pdfs);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
    }

    @GetMapping
    public ResponseEntity<byte[]> downloadPfd(@PathVariable Long pdfId) {
        try {
            byte[] pdfData = roomPdfService.downloadPdf(pdfId);

            if (pdfData == null || pdfData.length == 0) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PDF not found with id: " + pdfId);
            }
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("room-" + pdfId + ".pdf")
                    .build());

            return new ResponseEntity<>(pdfData, headers, HttpStatus.OK);

        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error while downloading PDF", e);
        }
    }
}