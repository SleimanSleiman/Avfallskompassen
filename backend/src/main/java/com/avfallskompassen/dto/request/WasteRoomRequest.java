package com.avfallskompassen.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Class containing the necessary data to create a wasteRoom
 * @author Anton Persson
 */
public class WasteRoomRequest {
    @NotNull
    @DecimalMin("2.5")
    @Max(35)
    private double length;

    @NotNull
    @DecimalMin("2.5")
    @Max(27)
    private double width;

    @NotNull
    private double x;

    @NotNull
    private double y;

    private List<DoorRequest> doors;
    private List<ContainerPositionRequest> containers;

    @NotNull
    private Long propertyId;

    public WasteRoomRequest(double length, double width, double x,
                            double y, List<DoorRequest> doors,
                            List<ContainerPositionRequest> containers,
                            Long propertyId) {
        this.length = length;
        this.width = width;
        this.x = x;
        this.y = y;
        this.doors = doors;
        this.containers = containers;
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

    public List<DoorRequest> getDoors() {
        return doors;
    }

    public void setDoors(List<DoorRequest> doorPositionRequests) {
        this.doors = doorPositionRequests;
    }

    public List<ContainerPositionRequest> getContainers() {
        return containers;
    }

    public void setContainers(List<ContainerPositionRequest> containerPositionRequests) {
        this.containers = containerPositionRequests;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }
}