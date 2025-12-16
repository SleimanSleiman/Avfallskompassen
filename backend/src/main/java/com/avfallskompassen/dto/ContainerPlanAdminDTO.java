package com.avfallskompassen.dto;

import java.math.BigDecimal;

/**
 * DTO for ContainerPlan in admin data management.
 */
public class ContainerPlanAdminDTO {
    private Long id;
    private String municipalityName;
    private String serviceTypeName;
    private String containerTypeName;
    private int containerSize;
    private int emptyingFrequencyPerYear;
    private BigDecimal cost;

    public ContainerPlanAdminDTO() {}

    public ContainerPlanAdminDTO(Long id, String municipalityName, String serviceTypeName, 
                                 String containerTypeName, int containerSize, 
                                 int emptyingFrequencyPerYear, BigDecimal cost) {
        this.id = id;
        this.municipalityName = municipalityName;
        this.serviceTypeName = serviceTypeName;
        this.containerTypeName = containerTypeName;
        this.containerSize = containerSize;
        this.emptyingFrequencyPerYear = emptyingFrequencyPerYear;
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

    public String getServiceTypeName() {
        return serviceTypeName;
    }

    public void setServiceTypeName(String serviceTypeName) {
        this.serviceTypeName = serviceTypeName;
    }

    public String getContainerTypeName() {
        return containerTypeName;
    }

    public void setContainerTypeName(String containerTypeName) {
        this.containerTypeName = containerTypeName;
    }

    public int getContainerSize() {
        return containerSize;
    }

    public void setContainerSize(int containerSize) {
        this.containerSize = containerSize;
    }

    public int getEmptyingFrequencyPerYear() {
        return emptyingFrequencyPerYear;
    }

    public void setEmptyingFrequencyPerYear(int emptyingFrequencyPerYear) {
        this.emptyingFrequencyPerYear = emptyingFrequencyPerYear;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }
}

