package com.avfallskompassen.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.BatchSize;

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
    @BatchSize(size = 50)
    private List<ContainerPosition> containers;

    @OneToMany(mappedBy = "wasteRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 50)
    private List<Door> doors;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "version_number", nullable = false)
    private int versionNumber = 1;

    @Column(name = "created_by", nullable = false, length = 50)
    private String createdBy = "user";

    @Column(name = "admin_username")
    private String adminUsername;

    @Column(name = "version_name")
    private String versionName;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "thumbnail")
    private String thumbnailUrl;


    public void onCreate() {createdAt = LocalDateTime.now();}
    public void onUpdate() {updatedAt = LocalDateTime.now();}

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

    public int getVersionNumber() { return versionNumber; }
    public void setVersionNumber(int versionNumber) { this.versionNumber = versionNumber; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getAdminUsername() { return adminUsername; }
    public void setAdminUsername(String adminUsername) { this.adminUsername = adminUsername; }

    public String getVersionName() { return versionName; }
    public void setVersionName(String versionName) { this.versionName = versionName; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getThumbnailUrl() {return thumbnailUrl;}

    public void setThumbnailUrl(String thumbnailUrl) {this.thumbnailUrl = thumbnailUrl;}
}