package com.avfallskompassen.dto;

import java.math.BigDecimal;

public class GeneralPropertyCostDTO {
    private String address;
    private BigDecimal totalCost;
    private BigDecimal costPerApartment;

    public GeneralPropertyCostDTO(String address, BigDecimal totalCost, BigDecimal costPerApartment) {
        this.address = address;
        this.totalCost = totalCost;
        this.costPerApartment = costPerApartment;
    }

    public String getAddress() {
        return address;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public BigDecimal getCostPerApartment() {
        return costPerApartment;
    }
}
