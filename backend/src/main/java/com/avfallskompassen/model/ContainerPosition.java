package com.avfallskompassen.model;

import jakarta.persistence.*;

/**
 * Entity class for Containers in a waste room.
 * @author Anton Persson
 */
@Entity
@Table(
        name = "container_position",
        indexes = {
                @Index(name = "idx_waste_room_id", columnList = "waste_room_id"),
                @Index(name = "idx_container_type_id", columnList = "container_type_id")
        }
)
public class ContainerPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private double x;

    @Column(nullable = false)
    private double y;

    @Column(nullable = false)
    private double angle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "container_plan_id", nullable = false)
    private ContainerPlan containerPlan;

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

    public WasteRoom getWasteRoom() {
        return wasteRoom;
    }

    public void setWasteRoom(WasteRoom wasteRoom) {
        this.wasteRoom = wasteRoom;
    }

    public ContainerPlan getContainerPlan() {
        return containerPlan;
    }

    public void setContainerPlan(ContainerPlan containerPlan) {
        this.containerPlan = containerPlan;
    }
}
