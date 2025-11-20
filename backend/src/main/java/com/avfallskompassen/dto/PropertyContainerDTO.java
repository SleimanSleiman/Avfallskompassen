package com.avfallskompassen.dto;

import java.math.BigDecimal;

public class PropertyContainerDTO {
    private String fractionType;
    private String containerName;
    private int size;
    private int quantity;
    private int emptyingFrequency;
    private BigDecimal cost;

    public PropertyContainerDTO() {}

    public PropertyContainerDTO(String fractionType, String containerName, int size, int quantity, int emptyingFrequency, BigDecimal cost) {
        this.fractionType = fractionType;
        this.containerName = containerName;
        this.size = size;
        this.quantity = quantity;
        this.emptyingFrequency = emptyingFrequency;
        this.cost = cost;
    }

    public String getFractionType() {
        return fractionType;
    }

    public void setFractionType(String fractionType) {
        this.fractionType = fractionType;
    }

    public String getContainerName() {
        return containerName;
    }

    public void setContainerName(String containerName) {
        this.containerName = containerName;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getEmptyingFrequency() {
        return emptyingFrequency;
    }

    public void setEmptyingFrequency(int emptyingFrequency) {
        this.emptyingFrequency = emptyingFrequency;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }
}
