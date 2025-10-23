package com.avfallskompassen.dto;

import java.time.LocalDateTime;

public class RoomPdfDTO {
    private Long id;
    private Long wasteRoomId;
    private byte[] pdfData;
    private Long fileSize;
    private LocalDateTime createdAt;

    public RoomPdfDTO() {
    }

    public RoomPdfDTO(Long id, Long wasteRoomId, byte[] pdfData, Long fileSize, LocalDateTime createdAt) {
        this.id = id;
        this.wasteRoomId = wasteRoomId;
        this.pdfData = pdfData;
        this.fileSize = fileSize;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWasteRoomId() {
        return wasteRoomId;
    }

    public void setWasteRoomId(Long wasteRoomId) {
        this.wasteRoomId = wasteRoomId;
    }

    public byte[] getPdfData() {
        return pdfData;
    }

    public void setPdfData(byte[] pdfData) {
        this.pdfData = pdfData;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
