package com.avfallskompassen.dto;

import com.avfallskompassen.model.DoorPosition;

/**
 * DTO for sending data related to {@link DoorPosition} out from the server
 * @author Anton Persson
 */
public class DoorPositionDTO {
    private Long id;
    private double x;
    private double y;
    private double angle;
    private Long doorId;
    private Long wasteRoomId;

    public DoorPositionDTO(Long id, double x, double y, double angle, Long doorId, Long wasteRoomId) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.doorId = doorId;
        this.wasteRoomId = wasteRoomId;
    }

    public DoorPositionDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getX() { return x; }
    public void setX(double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }

    public double getAngle() { return angle; }
    public void setAngle(double angle) { this.angle = angle; }

    public Long getDoorId() { return doorId; }
    public void setDoorId(Long doorId) { this.doorId = doorId; }

    public Long getWasteRoomId() { return wasteRoomId; }
    public void setWasteRoomId(Long wasteRoomId) { this.wasteRoomId = wasteRoomId; }

    /**
     * Method for converting an entity object to a DTO object
     * @param entity The entity object to be converted
     * @return A converted DTO
     */
    public static DoorPositionDTO fromEntity(DoorPosition entity) {
        DoorPositionDTO dto = new DoorPositionDTO();
        dto.setId(entity.getId());
        dto.setX(entity.getX());
        dto.setY(entity.getY());
        dto.setAngle(entity.getAngle());
        dto.setDoorId(entity.getDoor() != null ? entity.getDoor().getId() : null);
        dto.setWasteRoomId(entity.getWasteRoom() != null ? entity.getWasteRoom().getId() : null);
        return dto;
    }
}