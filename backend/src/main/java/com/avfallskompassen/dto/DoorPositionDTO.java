package com.avfallskompassen.dto;

import com.avfallskompassen.model.DoorPosition;

public class DoorPositionDTO {
    private Long id;
    private double x;
    private double y;
    private double angle;
    private Long doorId;
    private Long wasteRoomId;

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