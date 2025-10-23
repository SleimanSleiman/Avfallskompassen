package com.avfallskompassen.services;

import com.avfallskompassen.dto.RoomPdfDTO;
import com.avfallskompassen.model.RoomPdf;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RoomPdfService {
    RoomPdfDTO uploadPdf(MultipartFile file, Long roomId);
    byte[] downloadPdf(Long pdfId);
    List<RoomPdfDTO> getPdfsByRoomId(Long roomId);
    RoomPdfDTO mapToDto(RoomPdf roomPdf);
}
