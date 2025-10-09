package com.avfallskompassen.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for property operations.
 * 
 * @author Akmal Safi
 */
public class PropertyResponse {
    
    private boolean success;
    private String message;
    private Long propertyId;
    private String address;
    private Integer numberOfApartments;
    private String lockName;
    private BigDecimal lockPrice;
    private Double accessPathLength;
    private LocalDateTime createdAt;
    
    // Constructors
    public PropertyResponse() {}
    
    public PropertyResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public PropertyResponse(boolean success, String message, Long propertyId, String address, 
                          Integer numberOfApartments, String lockName, Double accessPathLength, LocalDateTime createdAt) {
        this.success = success;
        this.message = message;
        this.propertyId = propertyId;
        this.address = address;
        this.numberOfApartments = numberOfApartments;
        this.lockName = lockName;
        this.accessPathLength = accessPathLength;
        this.createdAt = createdAt;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Long getPropertyId() {
        return propertyId;
    }
    
    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
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
    
    public String getLockName() {
        return lockName;
    }
    
    public void setLockName(String lockType) {
        this.lockName = lockType;
    }

    public BigDecimal getLockPrice() {
        return lockPrice;
    }

    public void setLockPrice(BigDecimal lockPrice) {
        this.lockPrice = lockPrice;
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
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}