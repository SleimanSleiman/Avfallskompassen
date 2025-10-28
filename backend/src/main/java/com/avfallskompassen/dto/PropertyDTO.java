package com.avfallskompassen.dto;

import com.avfallskompassen.model.Property;
// timestamps are exposed as ISO strings for frontend compatibility

/**
 * DTO for Property responses to avoid Hibernate proxy issues.
 */
public class PropertyDTO {
    private Long id;
    private String address;
    private Integer numberOfApartments;
    private String propertyType;
    private Double accessPathLength;
    private String createdAt;
    private String updatedAt;
    private String lastNotifiedAt;
    private LockTypeDto lockTypeDto;
    private Long municipalityId;
    private String municipalityName;
    
    // Constructors
    public PropertyDTO() {}
    
    public PropertyDTO(Property property) {
        this.id = property.getId();
        this.address = property.getAddress();
        this.numberOfApartments = property.getNumberOfApartments();
        this.propertyType = property.getPropertyType() != null ? property.getPropertyType().getDisplayName() : null;
        this.lockTypeDto = property.getLockType() != null? new LockTypeDto(property.getLockType()) : null;
    this.accessPathLength = property.getAccessPathLength();
    this.createdAt = property.getCreatedAt() != null ? property.getCreatedAt().toString() : null;
    this.updatedAt = property.getUpdatedAt() != null ? property.getUpdatedAt().toString() : null;
    this.lastNotifiedAt = property.getLastNotifiedAt() != null ? property.getLastNotifiedAt().toString() : null;
        this.municipalityId = property.getMunicipality() != null ? property.getMunicipality().getId() : null;
        this.municipalityName = property.getMunicipality() != null ? property.getMunicipality().getName() : null;
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
    
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getLastNotifiedAt() { return lastNotifiedAt; }
    public void setLastNotifiedAt(String lastNotifiedAt) { this.lastNotifiedAt = lastNotifiedAt; }

    public Long getMunicipalityId() {
        return municipalityId;
    }

    public void setMunicipalityId(Long municipalityId) {
        this.municipalityId = municipalityId;
    }

    public String getMunicipalityName() {
        return municipalityName;
    }

    public void setMunicipalityName(String municipalityName) {
        this.municipalityName = municipalityName;
    }

    public String getLockName() {
        return lockTypeDto != null ? lockTypeDto.getName() : null;
    }
}