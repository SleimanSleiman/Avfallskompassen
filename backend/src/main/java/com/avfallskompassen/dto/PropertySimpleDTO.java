package com.avfallskompassen.dto;

import com.avfallskompassen.model.Property;

import java.math.BigDecimal;

public class PropertySimpleDTO {

    private Long id;
    private String address;
    private Integer numberOfApartments;
    private String lockName;
    private BigDecimal lockPrice;
    private double accessPathLength;
    private String municipalityName;

    public PropertySimpleDTO() {
    }

    public PropertySimpleDTO(Long id, String address, Integer numberOfApartments, String lockName, BigDecimal lockPrice, double accessPathLength, String municipalityName) {
        this.id = id;
        this.numberOfApartments = numberOfApartments;
        this.address = address;
        this.lockName = lockName;
        this.lockPrice = lockPrice;
        this.accessPathLength = accessPathLength;
        this.municipalityName = municipalityName;
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

    public String getLockName() {
        return lockName;
    }

    public void setLockName(String lockName) {
        this.lockName = lockName;
    }

    public BigDecimal getLockPrice() {
        return lockPrice;
    }

    public void setLockPrice(BigDecimal lockPrice) {
        this.lockPrice = lockPrice;
    }

    public double getAccessPathLength() {
        return accessPathLength;
    }

    public void setAccessPathLength(double accessPathLength) {
        this.accessPathLength = accessPathLength;
    }

    public String getMunicipalityName() {
        return municipalityName;
    }

    public void setMunicipalityName(String municipalityName) {
        this.municipalityName = municipalityName;
    }

    public static PropertySimpleDTO from(Property property) {
        if(property == null)
            return null;

        String lockName = property.getLockType().getName();

        return new PropertySimpleDTO(
                property.getId(),
                property.getAddress(),
                property.getNumberOfApartments(),
                lockName,
                property.getLockType().getCost(),
                property.getAccessPathLength() != null ? property.getAccessPathLength() : 0,
                property.getMunicipality().getName()
        );
    }
}
