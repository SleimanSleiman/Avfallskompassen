package com.avfallskompassen.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entity class for the RoomPdf entity.
 * @Author Christian Storck
 */

@Entity
@Table(name = "room_pdfs")
public class RoomPdf {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_room_id", nullable = false)
    private WasteRoom wasteRoom;

    @Lob
    // Postgres har inte typen BLOB – använd BYTEA
    @Column(name = "pdf_data", nullable = false, columnDefinition = "BYTEA")
    private byte[] pdfData;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "version")
    private int version = 1;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public WasteRoom getWasteRoom() {
        return wasteRoom;
    }

    public void setWasteRoom(WasteRoom wasteRoom) {
        this.wasteRoom = wasteRoom;
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

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
