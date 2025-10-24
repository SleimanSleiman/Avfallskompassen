package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.RoomPdfDTO;
import com.avfallskompassen.dto.RoomPdfDTO;
import com.avfallskompassen.exception.ResourceNotFoundException;
import com.avfallskompassen.model.RoomPdf;
import com.avfallskompassen.model.WasteRoom;
import com.avfallskompassen.repository.RoomPdfRepository;
import com.avfallskompassen.repository.WasteRoomRepository;
import com.avfallskompassen.services.RoomPdfService;
import org.springframework.beans.factory.annotation.Autowired;
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
 * @Author Christian Storck
 */
@Service
@Transactional
public class RoomPdfServiceImpl implements RoomPdfService {

    @Autowired
    private RoomPdfRepository roomPdfRepository;

    @Autowired
    private WasteRoomRepository wasteRoomRepository;

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

    public byte[] downloadPdf(Long pdfId) {
        RoomPdf roomPdf = roomPdfRepository.findById(pdfId)
                .orElseThrow(() -> new ResourceNotFoundException("PDF not found"));

        return roomPdf.getPdfData();
    }

    public List<RoomPdfDTO> getPdfsByRoomId(Long roomId) {
        return roomPdfRepository.findByWasteRoomId(roomId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public RoomPdfDTO mapToDto(RoomPdf roomPdf) {
        RoomPdfDTO dto = new RoomPdfDTO();
        dto.setId(roomPdf.getId());
        dto.setWasteRoomId(roomPdf.getWasteRoom().getId());
        dto.setFileSize(roomPdf.getFileSize());
        dto.setCreatedAt(roomPdf.getCreatedAt());

        return dto;
    }
}
