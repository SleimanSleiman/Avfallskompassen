package com.avfallskompassen.dto;

import com.avfallskompassen.model.Property;
import java.time.LocalDateTime;

/**
 * DTO for Property responses to avoid Hibernate proxy issues.
 */
public class PropertyDTO {
    private Long id;
    private String address;
    private Integer numberOfApartments;
    private String propertyType;
    private Double accessPathLength;
    private LocalDateTime createdAt;
    private LockTypeDto lockTypeDto;
    
    // Constructors
    public PropertyDTO() {}
    
    public PropertyDTO(Property property) {
        this.id = property.getId();
        this.address = property.getAddress();
        this.numberOfApartments = property.getNumberOfApartments();
        this.propertyType = property.getPropertyType() != null ? property.getPropertyType().getDisplayName() : null;
        this.lockTypeDto = property.getLockType() != null? new LockTypeDto(property.getLockType()) : null;
        this.accessPathLength = property.getAccessPathLength();
        this.createdAt = property.getCreatedAt();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public Integer getNumberOfApartments() { return numberOfApartments; }
    public void setNumberOfApartments(Integer numberOfApartments) { this.numberOfApartments = numberOfApartments; }

    public String getPropertyType() { return propertyType; }
    public void setPropertyType(String propertyType) { this.propertyType = propertyType; }

    public LockTypeDto getLockTypeDto() {
        return lockTypeDto;
    }
    public void setLockTypeDto(LockTypeDto lockTypeDto) {
        this.lockTypeDto = lockTypeDto;
    }

    public Double getAccessPathLength() { return accessPathLength; }
    public void setAccessPathLength(Double accessPathLength) { this.accessPathLength = accessPathLength; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}