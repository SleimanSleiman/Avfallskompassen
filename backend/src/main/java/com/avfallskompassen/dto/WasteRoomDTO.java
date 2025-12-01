package com.avfallskompassen.dto;

import com.avfallskompassen.model.WasteRoom;
import java.util.List;
import java.util.stream.Collectors;

public class WasteRoomDTO {

    private Long propertyId;
    private double length;
    private double width;
    private double x;
    private double y;
    private List<ContainerPositionDTO> containers;
    private List<DoorDTO> doors;
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

    public WasteRoomDTO() {}

    public WasteRoomDTO(Long propertyId, double length, double width, double x, double y,
                        List<ContainerPositionDTO> containers, List<DoorDTO> doors, Long wasteRoomId, String name,
                        int versionNumber, String createdBy, String adminUsername, String versionName,
                        Boolean isActive, String createdAt, String updatedAt, String thumbnailUrl) {

        this.propertyId = propertyId;
        this.length = length;
        this.width = width;
        this.x = x;
        this.y = y;
        this.containers = containers;
        this.doors = doors;
        this.wasteRoomId = wasteRoomId;
        this.name = name;
        this.versionNumber = versionNumber;
        this.createdBy = createdBy;
        this.adminUsername = adminUsername;
        this.versionName = versionName;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.thumbnailUrl = thumbnailUrl;
    }

   /** 
   * Method for converting an entity object to a DTO object 
   * @param entity The entity object to be converted 
   * @return A converted DTO 
   */

    public static WasteRoomDTO fromEntity(WasteRoom entity) {
        return new WasteRoomDTO(
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
            entity.getId(),
            entity.getName(),
            entity.getVersionNumber(),
            entity.getCreatedBy(),
            entity.getAdminUsername(),
            entity.getVersionName(),
            entity.getIsActive(),
            entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null,
            entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null,
            entity.getThumbnailUrl()
        );
    }
}
