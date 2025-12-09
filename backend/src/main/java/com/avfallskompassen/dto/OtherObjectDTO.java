package com.avfallskompassen.dto;

import com.avfallskompassen.model.OtherObject;

public class OtherObjectDTO {
    private Long id;
    private String name;
    private double x;
    private double y;;
    private double width;
    private double depth;
    private int rotation;
    private Long wasteRoomId;

    public OtherObjectDTO() {}

    public OtherObjectDTO(Long id, String name, double x, double y, double width, double depth, int rotation, Long wasteRoomId) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = width;
        this.depth = depth;
        this.rotation = rotation;
        this.wasteRoomId = wasteRoomId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public double getWidth() {
        return width;
    }

    public void setWidth(double width) {
        this.width = width;
    }

    public double getDepth() {
        return depth;
    }

    public void setDepth(double depth) {
        this.depth = depth;
    }

    public int getRotation() {
        return rotation;
    }

    public void setRotation(int rotation) {
        this.rotation = rotation;
    }

    public Long getWasteRoomId() {
        return wasteRoomId;
    }

    public void setWasteRoomId(Long wasteRoomId) {
        this.wasteRoomId = wasteRoomId;
    }

    public static OtherObjectDTO fromEntity(OtherObject entity) {
        OtherObjectDTO dto = new OtherObjectDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setX(entity.getX());
        dto.setY(entity.getY());
        dto.setRotation(entity.getRotation());
        dto.setWidth(entity.getWidth());
        dto.setDepth(entity.getDepth());
        dto.setWasteRoomId(entity.getWasteRoom() != null ? entity.getWasteRoom().getId() : null);
        return dto;
    }
}
