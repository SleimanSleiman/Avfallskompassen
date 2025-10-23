package com.avfallskompassen.model;

import jakarta.persistence.*;

@Entity
@Table(
        name = "door_position",
        indexes = {
                @Index(name = "idx_waste_room_id", columnList = "waste_room_id"),
                @Index(name = "idx_door_id", columnList = "door_id")
        }
)
public class DoorPosition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private double x;

    @Column(nullable = false)
    private double y;

    @Column(nullable = false)
    private  double angle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "door_id", nullable = false)
    private Door door;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_room_id", nullable = false)
    private WasteRoom wasteRoom;

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

    public Door getDoor() {
        return door;
    }

    public void setDoor(Door door) {
        this.door = door;
    }

    public WasteRoom getWasteRoom() {
        return wasteRoom;
    }

    public void setWasteRoom(WasteRoom wasteRoom) {
        this.wasteRoom = wasteRoom;
    }
}