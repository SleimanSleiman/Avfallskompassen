package com.avfallskompassen.dto;

import com.avfallskompassen.model.Door;
/**
 * DTO for sending data related to {@link Door} out from the server
 * @author Anton Persson
 */
public class DoorDTO {
    private Long id;
    private double x;
    private double y;
    private double angle;
    private double width;
    private double depth;
    private String wall;
    private String swingDirection;
    private Long wasteRoomId;

    public DoorDTO(Long id, double x, double y, double angle, double width, double depth,
                   Long wasteRoomId, String wall, String swingDirection) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.width = width;
        this.depth = depth;
        this.wasteRoomId = wasteRoomId;
        this.wall = wall;
        this.swingDirection = swingDirection;
    }

    public DoorDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getX() { return x; }
    public void setX(double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }

    public double getAngle() { return angle; }
    public void setAngle(double angle) { this.angle = angle; }

    public double getWidth() { return width; }
    public void setWidth(double width) { this.width = width; }

    public double getDepth() { return depth; }
    public void setDepth(double depth) { this.depth = depth; }

    public Long getWasteRoomId() { return wasteRoomId; }
    public void setWasteRoomId(Long wasteRoomId) { this.wasteRoomId = wasteRoomId; }

    public String getWall() {
        return wall;
    }

    public void setWall(String wall) {
        this.wall = wall;
    }

    public String getSwingDirection() {
        return swingDirection;
    }

    public void setSwingDirection(String swingDirection) {
        this.swingDirection = swingDirection;
    }

    /**
     * Method for converting an entity object to a DTO object
     * @param entity The entity object to be converted
     * @return A converted DTO
     */
    public static DoorDTO fromEntity(Door entity) {
        DoorDTO dto = new DoorDTO();
        dto.setId(entity.getId());
        dto.setX(entity.getX());
        dto.setY(entity.getY());
        dto.setAngle(entity.getAngle());
        dto.setWidth(entity.getWidth());
        dto.setDepth(entity.getDepth());
        dto.setWasteRoomId(entity.getWasteRoom() != null ? entity.getWasteRoom().getId() : null);
        dto.setWall(entity.getWall());
        dto.setSwingDirection(entity.getSwingDirection());
        return dto;
    }
}