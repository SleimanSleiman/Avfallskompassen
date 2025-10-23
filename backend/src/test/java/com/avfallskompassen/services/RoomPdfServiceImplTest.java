package com.avfallskompassen.services;

import com.avfallskompassen.dto.RoomPdfDTO;
import com.avfallskompassen.exception.ResourceNotFoundException;
import com.avfallskompassen.model.Municipality;
import com.avfallskompassen.model.RoomPdf;
import com.avfallskompassen.model.WasteRoom;
import com.avfallskompassen.repository.RoomPdfRepository;
import com.avfallskompassen.repository.WasteRoomRepository;
import com.avfallskompassen.services.impl.RoomPdfServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RoomPdfServiceImplTest {

    @Mock
    private RoomPdfRepository roomPdfRepository;

    @Mock
    private WasteRoomRepository wasteRoomRepository;

    @InjectMocks
    private RoomPdfServiceImpl roomPdfService;

    private WasteRoom testRoom;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testRoom = new WasteRoom();
        testRoom.setId(1L);
    }

    @Test
    void uploadPdf_ShouldSaveAndReturnDto_WhenRoomExists() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "PDFDATA".getBytes());

        when(wasteRoomRepository.findById(1L)).thenReturn(Optional.of(testRoom));

        RoomPdf savedPdf = new RoomPdf();
        savedPdf.setId(10L);
        savedPdf.setWasteRoom(testRoom);
        savedPdf.setPdfData(file.getBytes());
        savedPdf.setFileSize(file.getSize());
        savedPdf.setCreatedAt(LocalDateTime.now());

        when(roomPdfRepository.save(any(RoomPdf.class))).thenReturn(savedPdf);

        RoomPdfDTO result = roomPdfService.uploadPdf(file, 1L);

        assertNotNull(result);
        assertEquals(savedPdf.getId(), result.getId());
        assertEquals(savedPdf.getWasteRoom().getId(), result.getWasteRoomId());
        verify(roomPdfRepository, times(1)).save(any(RoomPdf.class));
    }

    @Test
    void uploadPdf_ShouldThrowResourceNotFound_WhenRoomDoesNotExist() {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "PDFDATA".getBytes());
        when(wasteRoomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> roomPdfService.uploadPdf(file, 99L));
        verify(roomPdfRepository, never()).save(any());
    }

    @Test
    void downloadPdf_ShouldReturnPdfData_WhenPdfExists() {
        RoomPdf roomPdf = new RoomPdf();
        roomPdf.setId(5L);
        roomPdf.setPdfData("PDFDATA".getBytes());

        when(roomPdfRepository.findById(5L)).thenReturn(Optional.of(roomPdf));

        byte[] result = roomPdfService.downloadPdf(5L);

        assertNotNull(result);
        assertArrayEquals("PDFDATA".getBytes(), result);
    }

    @Test
    void downloadPdf_ShouldThrowResourceNotFound_WhenPdfDoesNotExist() {
        when(roomPdfRepository.findById(44L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> roomPdfService.downloadPdf(44L));
    }

    @Test
    void getPdfsByRoomId_ShouldReturnListOfDtos() {
        RoomPdf pdf1 = new RoomPdf();
        pdf1.setId(1L);
        pdf1.setWasteRoom(testRoom);
        pdf1.setFileSize(100L);
        pdf1.setCreatedAt(LocalDateTime.now());

        RoomPdf pdf2 = new RoomPdf();
        pdf2.setId(2L);
        pdf2.setWasteRoom(testRoom);
        pdf2.setFileSize(200L);
        pdf2.setCreatedAt(LocalDateTime.now());
        List<RoomPdf> pdfs = List.of(pdf1, pdf2);


        when(roomPdfRepository.findByWasteRoomId(1L)).thenReturn(List.of(pdf1, pdf2));

        List<RoomPdfDTO> result = roomPdfService.getPdfsByRoomId(1L);

        assertEquals(2, result.size());
        assertEquals(1, result.get(0).getWasteRoomId());
        verify(roomPdfRepository, times(1)).findByWasteRoomId(1L);
    }

    @Test
    void mapToDto_ShouldReturnValidDto() {
        RoomPdf pdf = new RoomPdf();
        pdf.setId(11L);
        pdf.setWasteRoom(testRoom);
        pdf.setFileSize(500L);
        pdf.setCreatedAt(LocalDateTime.now());

        RoomPdfDTO dto = roomPdfService.mapToDto(pdf);

        assertEquals(11L, dto.getId());
        assertEquals(1L, dto.getWasteRoomId());
        assertEquals(500L, dto.getFileSize());
        assertNotNull(dto.getCreatedAt());
    }
}
