package com.avfallskompassen.dto;

import java.time.LocalDateTime;


/**
 * DTO containing the served data regarding Roompdfs.
 * @Author Christian Storck
 */

public class RoomPdfDTO {
    private Long id;
    private Long wasteRoomId;
    private Long fileSize;
    private LocalDateTime createdAt;

    public RoomPdfDTO() {
    }

    public RoomPdfDTO(Long id, Long wasteRoomId, Long fileSize, LocalDateTime createdAt) {
        this.id = id;
        this.wasteRoomId = wasteRoomId;
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
