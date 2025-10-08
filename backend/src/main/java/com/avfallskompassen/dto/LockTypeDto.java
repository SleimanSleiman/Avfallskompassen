package com.avfallskompassen.dto;

import com.avfallskompassen.model.LockType;

import java.math.BigDecimal;

public class LockTypeDto {
    private long id;
    private String name;
    private BigDecimal cost;

    public LockTypeDto(LockType lockType) {
        this.id = lockType.getId();
        this.name = lockType.getName();
        this.cost = lockType.getCost();
    }
}
