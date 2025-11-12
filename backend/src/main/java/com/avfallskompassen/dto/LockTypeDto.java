package com.avfallskompassen.dto;

import com.avfallskompassen.model.LockType;

import java.math.BigDecimal;

/**
 * DTO containing the served data regarding LockTypes.
 * @Author Christian Storck
 */

public class LockTypeDto {
    private long id;
    private String name;
    private BigDecimal cost;

    public LockTypeDto() {

    }

    public LockTypeDto(LockType lockType) {
        this.id = lockType.getId();
        this.name = lockType.getName();
        this.cost = lockType.getCost();
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

}
