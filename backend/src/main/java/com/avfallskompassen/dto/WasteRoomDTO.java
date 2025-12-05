package com.avfallskompassen.dto;

import com.avfallskompassen.model.WasteRoom;

import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO for sending data related to {@link WasteRoom} out from the server
 * @author Anton Persson
 */
public class WasteRoomDTO {

    private Long propertyId;
    private double length;
    private double width;
    private double x;
    private double y;
    private List<ContainerPositionDTO> containers;
    private List<DoorDTO> doors;
    private List<OtherObjectDTO> otherObjects;
    private Long wasteRoomId;
    private String name;
    private int versionNumber;
    private String createdBy;
    private String adminUsername;
    private String versionName;
    private Boolean isActive;
    private String createdAt;
    private String updatedAt;
    private String thumbnailUrl;

    // Constructors
    public WasteRoomDTO() {}

    public WasteRoomDTO(Long propertyId, double length, double width, double x, double y,
                        List<ContainerPositionDTO> containers, List<DoorDTO> doors, List<OtherObjectDTO> otherObjects, Long wasteRoomId, String name,
                        int versionNumber, String createdBy, String adminUsername, String versionName,
                        Boolean isActive, String createdAt, String updatedAt) {
        this.propertyId = propertyId;
        this.length = length;
        this.width = width;
        this.x = x;
        this.y = y;
        this.containers = containers;
        this.doors = doors;
        this.otherObjects = otherObjects;
        this.wasteRoomId = wasteRoomId;
        this.name = name;
        this.versionNumber = versionNumber;
        this.createdBy = createdBy;
        this.adminUsername = adminUsername;
        this.versionName = versionName;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getPropertyId() {
        return propertyId;
    }
    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public double getLength() {
        return length;
    }
    public void setLength(double length) {
        this.length = length;
    }

    public double getWidth() {
        return width;
    }
    public void setWidth(double width) {
        this.width = width;
    }

    public double getX() {
        return x;
    }
    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }
    public void setY(double y) {
        this.y = y;
    }

    public List<ContainerPositionDTO> getContainers() {
        return containers;
    }
    public void setContainers(List<ContainerPositionDTO> containers) {
        this.containers = containers;
    }

    public List<DoorDTO> getDoors() {
        return doors;
    }
    public void setDoors(List<DoorDTO> doors) {
        this.doors = doors;
    }

    public List<OtherObjectDTO> getOtherObjects() {
        return otherObjects;
    }
    public void setOtherObjects(List<OtherObjectDTO> otherObjects) {
        this.otherObjects = otherObjects;
    }

    public Long getWasteRoomId() { return wasteRoomId; }
    public void setWasteRoomId(Long wasteRoomId) { this.wasteRoomId = wasteRoomId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getThumbnailUrl() {return thumbnailUrl;}

    public void setThumbnailUrl(String thumbnailUrl) {this.thumbnailUrl = thumbnailUrl;}

    public int getVersionNumber() { return versionNumber; }
    public void setVersionNumber(int versionNumber) { this.versionNumber = versionNumber; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getAdminUsername() { return adminUsername; }
    public void setAdminUsername(String adminUsername) { this.adminUsername = adminUsername; }

    public String getVersionName() { return versionName; }
    public void setVersionName(String versionName) { this.versionName = versionName; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    /**
     * Method for converting an entity object to a DTO object
     * @param entity The entity object to be converted
     * @return A converted DTO
     */
    public static WasteRoomDTO fromEntity(WasteRoom entity) {
        WasteRoomDTO dto = new WasteRoomDTO(
                entity.getProperty().getId(),
                entity.getLength(),
                entity.getWidth(),
                entity.getX(),
                entity.getY(),
                entity.getContainers() != null
                        ? entity.getContainers().stream()
                        .map(ContainerPositionDTO::fromEntity)
                        .collect(Collectors.toList())
                        : null,
                entity.getDoors() != null
                        ? entity.getDoors().stream()
                        .map(DoorDTO::fromEntity)
                        .collect(Collectors.toList())
                        : null,
                entity.getOtherObjects() != null
                        ? entity.getOtherObjects().stream()
                        .map(OtherObjectDTO::fromEntity)
                        .collect(Collectors.toList())
                        : null,
                entity.getId(),
                entity.getName(),
                entity.getVersionNumber(),
                entity.getCreatedBy(),
                entity.getAdminUsername(),
                entity.getVersionName(),
                entity.getIsActive(),
                entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null,
                entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null
        );
        dto.setThumbnailUrl(entity.getThumbnailUrl());
        return dto;
    }
}