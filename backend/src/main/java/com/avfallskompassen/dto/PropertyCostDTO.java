package com.avfallskompassen.dto;

import java.math.BigDecimal;

public class PropertyCostDTO {
    private BigDecimal totalCost;
    private BigDecimal collectionFee;
    private BigDecimal lockCost;
    private BigDecimal containerCost;

    public PropertyCostDTO(BigDecimal totalCost, BigDecimal collectionFee,
                           BigDecimal lockCost, BigDecimal containerCost) {
        this.totalCost = totalCost;
        this.collectionFee = collectionFee;
        this.lockCost = lockCost;
        this.containerCost = containerCost;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public BigDecimal getCollectionFee() {
        return collectionFee;
    }

    public BigDecimal getLockCost() {
        return lockCost;
    }

    public BigDecimal getContainerCost() {
        return containerCost;
    }
}
