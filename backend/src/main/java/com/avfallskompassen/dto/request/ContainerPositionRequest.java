package com.avfallskompassen.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * Class containing the necessary data to create containers in a wasteRoom
 * @author Anton Persson
 */
public class ContainerPositionRequest {
    @NotNull
    private Long id;

    @NotNull
    private double x;

    @NotNull
    private double y;

    @NotNull
    private double angle;

    @NotNull
    private boolean hasLockILock;

    public ContainerPositionRequest(Long id, double x, double y, double angle, boolean hasLockILock) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.hasLockILock = hasLockILock;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean getHasLockILock() {
        return hasLockILock;
    }

    public void setHasLockILock(boolean hasLockILock) {
        this.hasLockILock = hasLockILock;
    }
}