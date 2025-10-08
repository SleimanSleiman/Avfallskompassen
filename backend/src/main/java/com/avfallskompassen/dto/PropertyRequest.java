package com.avfallskompassen.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

/**
 * Request DTO for creating a new property.
 * 
 * @author Akmal Safi
 */
public class PropertyRequest {
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotNull(message = "Number of apartments is required")
    @Min(value = 1, message = "Number of apartments must be at least 1")
    private Integer numberOfApartments;
    
    @NotBlank(message = "Lock type is required")
    private long lockTypeId;
    
    @NotNull(message = "Access path length is required")
    @Min(value = 0, message = "Access path length cannot be negative")
    private Double accessPathLength;
    
    // Constructors
    public PropertyRequest() {}
    
    public PropertyRequest(String address, Integer numberOfApartments, Long lockTypeId, Double accessPathLength) {
        this.address = address;
        this.numberOfApartments = numberOfApartments;
        this.lockTypeId = lockTypeId;
        this.accessPathLength = accessPathLength;
    }
    
    // Getters and Setters
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
    
    public Long getLockTypeId() {
        return lockTypeId;
    }
    
    public void setLockTypeId(Long lockTypeId) {
        this.lockTypeId = lockTypeId;
    }
    
    public Double getAccessPathLength() {
        return accessPathLength;
    }
    
    public void setAccessPathLength(Double accessPathLength) {
        this.accessPathLength = accessPathLength;
    }
}