package com.avfallskompassen.dto;

import java.math.BigDecimal;

/**
 * DTO for CollectionFee in admin data management.
 */
public class CollectionFeeAdminDTO {
    private Long id;
    private String municipalityName;
    private BigDecimal cost;

    public CollectionFeeAdminDTO() {}

    public CollectionFeeAdminDTO(Long id, String municipalityName, BigDecimal cost) {
        this.id = id;
        this.municipalityName = municipalityName;
        this.cost = cost;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMunicipalityName() {
        return municipalityName;
    }

    public void setMunicipalityName(String municipalityName) {
        this.municipalityName = municipalityName;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }
}

