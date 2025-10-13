package com.avfallskompassen.dto;

import com.avfallskompassen.model.CollectionFee;

import java.math.BigDecimal;

public class CollectionFeeDTO {
    private Long id;
    private BigDecimal cost;

    public CollectionFeeDTO() {}

    public CollectionFeeDTO(Long id, BigDecimal cost) {
        this.id = id;
        this.cost = cost;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public static CollectionFeeDTO fromEntity(CollectionFee fee) {
        CollectionFeeDTO dto = new CollectionFeeDTO();
        dto.id = fee.getId();
        dto.cost = fee.getCost();
        return dto;
    }
}
