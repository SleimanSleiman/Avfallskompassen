package com.avfallskompassen.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;
/**
 * This class maps to the "properties" table in the PostgreSQL database and
 * represents a property with its details.
 * 
 * @author Akmal Safi
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
    
    @Column(nullable = false, length = 50)
    @NotBlank(message = "Lock type is required")
    private String lockType;
    
    @Column(nullable = false)
    @NotNull(message = "Access path length is required")
    @Min(value = 0, message = "Access path length cannot be negative")
    private Double accessPathLength;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Property() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Property(String address, Integer numberOfApartments, String lockType, Double accessPathLength, User createdBy) {
        this();
        this.address = address;
        this.numberOfApartments = numberOfApartments;
        this.lockType = lockType;
        this.accessPathLength = accessPathLength;
        this.createdBy = createdBy;
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
    
    public String getLockType() {
        return lockType;
    }

    public void setLockType(String lockType) {
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
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}