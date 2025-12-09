package com.avfallskompassen.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;
import java.util.List;

/**
 * This class maps to the "properties" table in the PostgreSQL database and
 * represents a property with its details.
 * 
 * @author Akmal Safi
 * @author Sleiman Sleiman
 */

@Entity
@Table(name = "properties")
public class Property {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    @NotBlank(message = "Address is required")
    private String address;
    
    @Column(nullable = false)
    @NotNull(message = "Number of apartments is required")
    @Min(value = 1, message = "Number of apartments must be at least 1")
    private Integer numberOfApartments;
    
    @JoinColumn(name = "lock_type_id", nullable = false)
    @NotNull(message = "Lock type is required")
    @ManyToOne
    private LockType lockType;

    @JoinColumn(name = "municipality_id") //Dessa ska sättas som nullable = false sen och @NotNull
    @ManyToOne
    private Municipality municipality;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false)
    @NotNull(message = "Property type is required")
    private PropertyType propertyType;

    @Column(nullable = false)
    @NotNull(message = "Access path length is required")
    @Min(value = 0, message = "Access path length cannot be negative")
    private Double accessPathLength;

    @JoinColumn(name = "created_by_user_id", nullable = false)
    @ManyToOne
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_notified_at")
    private LocalDateTime lastNotifiedAt;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WasteRoom> wasteRooms;

    // Constructors
    public Property() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Property(String address, Integer numberOfApartments, LockType lockType, Double accessPathLength, User createdBy) {
        this();
        this.address = address;
        this.numberOfApartments = numberOfApartments;
        this.lockType = lockType;
        this.accessPathLength = accessPathLength;
        this.createdBy = createdBy;
        this.propertyType = PropertyType.FLERBOSTADSHUS; // Default value
    }

    public Property(String address, Integer numberOfApartments, LockType lockType, PropertyType propertyType, Double accessPathLength, User createdBy) {
        this();
        this.address = address;
        this.numberOfApartments = numberOfApartments;
        this.lockType = lockType;
        this.propertyType = propertyType;
        this.accessPathLength = accessPathLength;
        this.createdBy = createdBy;
    }



    public Municipality getMunicipality() {
        return municipality;
    }

    public void setMunicipality(Municipality municipality) {
        this.municipality = municipality;
    }

    public PropertyType getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(PropertyType propertyType) {
        this.propertyType = propertyType;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

     public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getNumberOfApartments() {
        return numberOfApartments;
    }

    public void setNumberOfApartments(Integer numberOfApartments) {
        this.numberOfApartments = numberOfApartments;
    }

    public LockType getLockType() {
        return lockType;
    }

    public void setLockType(LockType lockType) {
        this.lockType = lockType;
    }

    public Double getAccessPathLength() {
        return accessPathLength;
    }

    public void setAccessPathLength(Double accessPathLength) {
        this.accessPathLength = accessPathLength;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getLastNotifiedAt() {
        return lastNotifiedAt;
    }

    public void setLastNotifiedAt(LocalDateTime lastNotifiedAt) {
        this.lastNotifiedAt = lastNotifiedAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public List<WasteRoom> getWasteRooms() {
        return wasteRooms;
    }

    public void setWasteRooms(List<WasteRoom> wasteRooms) {
        this.wasteRooms = wasteRooms;
    }

}