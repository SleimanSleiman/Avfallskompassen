package com.avfallskompassen.dto.request;

import jakarta.validation.constraints.*;

/**
 * Class containing the necessary data to create doors in a wasteRoom
 * @author Anton Persson
 */
public class DoorRequest {

    @NotNull
    @DecimalMin("0.9")
    @Max(12)
    private double width;

    @NotNull
    private double x;

    @NotNull
    private double y;

    @NotNull
    @Min(0)
    @Max(360)
    private double angle;

    public DoorRequest() {}

    public DoorRequest(double width, double x, double y, double angle) {
        this.width = width;
        this.x = x;
        this.y = y;
        this.angle = angle;
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

    public double getAngle() {
        return angle;
    }

    public void setAngle(double angle) {
        this.angle = angle;
    }
}