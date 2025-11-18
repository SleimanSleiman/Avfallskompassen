package com.avfallskompassen.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity class for waste rooms
 * @author Anton Persson
 */
@Entity
@Table(name = "waste_room")
public class WasteRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String name;

    @Column(nullable = false)
    private double length;

    @Column(nullable = false)
    private double width;

    @Column(nullable = false)
    private double x;

    @Column(nullable = false)
    private double y;

    @OneToMany(mappedBy = "wasteRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContainerPosition> containers;

    @OneToMany(mappedBy = "wasteRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Door> doors;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getLength() { return length; }
    public void setLength(double length) { this.length = length; }

    public double getWidth() { return width; }
    public void setWidth(double width) { this.width = width; }

    public double getX() { return x; }
    public void setX(double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Property getProperty() { return property; }
    public void setProperty(Property property) { this.property = property; }

    public List<Door> getDoors() { return doors; }
    public void setDoors(List<Door> doors) { this.doors = doors; }

    public List<ContainerPosition> getContainers() { return containers; }
    public void setContainers(List<ContainerPosition> containers) { this.containers = containers; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}