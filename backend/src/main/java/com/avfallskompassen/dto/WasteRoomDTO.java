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

    // Constructors
    public WasteRoomDTO() {}

    public WasteRoomDTO(Long propertyId, double length, double width, double x, double y,
                        List<ContainerPositionDTO> containers, List<DoorDTO> doors) {
        this.propertyId = propertyId;
        this.length = length;
        this.width = width;
        this.x = x;
        this.y = y;
        this.containers = containers;
        this.doors = doors;
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
                        : null
        );
    }
}