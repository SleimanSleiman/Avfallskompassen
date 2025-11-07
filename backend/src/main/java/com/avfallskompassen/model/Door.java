package com.avfallskompassen.model;

import jakarta.persistence.*;

/**
 * Entity class representing a door in a waste room
 * @author Anton Persson
 */
@Entity
@Table(
        name = "doors",
        indexes = {
                @Index(name = "idx_waste_room_id", columnList = "waste_room_id")
        }
)
public class Door {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private double width;

    @Column(nullable = false)
    private double depth;

    @Column(nullable = false)
    private double x;

    @Column(nullable = false)
    private double y;

    @Column(nullable = false)
    private double angle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_room_id", nullable = false)
    private WasteRoom wasteRoom;

    public Door() {
    }

    public Door(double width, double depth, double x, double y, double angle, WasteRoom wasteRoom) {
        this.width = width;
        this.depth = depth;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.wasteRoom = wasteRoom;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public double getAngle() {
        return angle;
    }

    public void setAngle(double angle) {
        this.angle = angle;
    }

    public WasteRoom getWasteRoom() {
        return wasteRoom;
    }

    public void setWasteRoom(WasteRoom wasteRoom) {
        this.wasteRoom = wasteRoom;
    }
}