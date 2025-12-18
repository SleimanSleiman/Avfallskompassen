package com.avfallskompassen.dto;

import com.avfallskompassen.model.Property;

/**
 * Lightweight summary DTO for properties – used by admin views to avoid
 * loading the entire waste room graph when only basic info is needed.
 */
public class PropertySummaryDTO {
    private Long id;
    private String address;
    private Integer numberOfApartments;
    private String municipalityName;
    private String lockName;
    private Double accessPathLength;
    private String createdAt;
    // total number of waste room versions for this property
    private Long versionsCount;

    public PropertySummaryDTO() {}

    public PropertySummaryDTO(Property property) {
        this.id = property.getId();
        this.address = property.getAddress();
        this.numberOfApartments = property.getNumberOfApartments();
        this.municipalityName = property.getMunicipality() != null ? property.getMunicipality().getName() : null;
        this.lockName = property.getLockType() != null ? property.getLockType().getName() : null;
        this.accessPathLength = property.getAccessPathLength();
        this.createdAt = property.getCreatedAt() != null ? property.getCreatedAt().toString() : null;
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

    public String getMunicipalityName() {
        return municipalityName;
    }

    public void setMunicipalityName(String municipalityName) {
        this.municipalityName = municipalityName;
    }

    public String getLockName() {
        return lockName;
    }

    public void setLockName(String lockName) {
        this.lockName = lockName;
    }

    public Double getAccessPathLength() {
        return accessPathLength;
    }

    public void setAccessPathLength(Double accessPathLength) {
        this.accessPathLength = accessPathLength;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public Long getVersionsCount() {
        return versionsCount;
    }

    public void setVersionsCount(Long versionsCount) {
        this.versionsCount = versionsCount;
    }
}


