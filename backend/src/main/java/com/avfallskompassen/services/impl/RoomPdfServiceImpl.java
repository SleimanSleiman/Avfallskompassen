package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.RoomPdfDTO;
import com.avfallskompassen.exception.ResourceNotFoundException;
import com.avfallskompassen.model.RoomPdf;
import com.avfallskompassen.model.WasteRoom;
import com.avfallskompassen.repository.RoomPdfRepository;
import com.avfallskompassen.repository.WasteRoomRepository;
import com.avfallskompassen.services.RoomPdfService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation of RoomPpfService.
 * Manages PDF files associated with waste rooms.
 * Handles uploading, downloading and listing PDF files linked to specifik waste rooms.
 * @author Christian Storck
 */
@Service
@Transactional
public class RoomPdfServiceImpl implements RoomPdfService {

    private final RoomPdfRepository roomPdfRepository;

    private final  WasteRoomRepository wasteRoomRepository;

    public RoomPdfServiceImpl(RoomPdfRepository roomPdfRepository, WasteRoomRepository wasteRoomRepository) {
        this.roomPdfRepository = roomPdfRepository;
        this.wasteRoomRepository = wasteRoomRepository;
    }

    /**
     * Handles uploading and saving a PDF file linked to a specific waste room.
     *
     * @author Christian Storck
     * @param file   Multipart file containing the PDF data
     * @param roomId Id of the waste room the PDF should be linked to
     * @return A {@link RoomPdfDTO} containing details of the uploaded file
     * @throws ResourceNotFoundException if the specified waste room cannot be found
     * @throws RuntimeException if an error occurs while saving the file data
     */
    public RoomPdfDTO uploadPdf(MultipartFile file, Long roomId){
        try {
            WasteRoom room = wasteRoomRepository.findById(roomId)
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

            RoomPdf roomPdf = new RoomPdf();
            roomPdf.setWasteRoom(room);
            roomPdf.setPdfData(file.getBytes());
            roomPdf.setFileSize(file.getSize());

            RoomPdf saved = roomPdfRepository.save(roomPdf);

            return mapToDto(saved);
        } catch (IOException e) {
            throw new RuntimeException("Failed to saved PDF");
        }
    }

    /**
     * Fetches a stored PDF file by its ID.
     *
     * @author Christian Storck
     * @param pdfId Id of the PDF file to retrieve
     * @return A byte array containing the PDF data
     * @throws ResourceNotFoundException if no PDF file is found with the given ID
     */
    public byte[] downloadPdf(Long pdfId) {
        RoomPdf roomPdf = roomPdfRepository.findById(pdfId)
                .orElseThrow(() -> new ResourceNotFoundException("PDF not found"));

        return roomPdf.getPdfData();
    }

    /**
     * Retrieves all PDF files associated with a specific waste room.
     *
     * @author Christian Storck
     * @param roomId Id of the waste room
     * @return A list of {@link RoomPdfDTO} objects representing all PDFs linked to the given room
     */
    public List<RoomPdfDTO> getPdfsByRoomId(Long roomId) {
        return roomPdfRepository.findByWasteRoomId(roomId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Maps a {@link RoomPdf} entity to a {@link RoomPdfDTO}.
     *
     * @author Christian Storck
     * @param roomPdf The entity to map
     * @return A {@link RoomPdfDTO} containing relevant information about the PDF
     */
    public RoomPdfDTO mapToDto(RoomPdf roomPdf) {
        RoomPdfDTO dto = new RoomPdfDTO();
        dto.setId(roomPdf.getId());
        dto.setWasteRoomId(roomPdf.getWasteRoom().getId());
        dto.setFileSize(roomPdf.getFileSize());
        dto.setCreatedAt(roomPdf.getCreatedAt());

        return dto;
    }
}
