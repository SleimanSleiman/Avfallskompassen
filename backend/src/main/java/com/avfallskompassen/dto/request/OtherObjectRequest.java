package com.avfallskompassen.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class OtherObjectRequest {

    @NotNull
    private String name;

    @NotNull
    private double width;

    @NotNull
    private double depth;

    @NotNull
    private double x;

    @NotNull
    private double y;

    @NotNull
    @Min(0)
    @Max(360)
    private int rotation;

    public OtherObjectRequest() {
    }

    public OtherObjectRequest(String name, double width, double depth, double x, double y, int rotation) {
        this.name = name;
        this.width = width;
        this.depth = depth;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public int getRotation() {
        return rotation;
    }

    public void setRotation(int rotation) {
        this.rotation = rotation;
    }
}