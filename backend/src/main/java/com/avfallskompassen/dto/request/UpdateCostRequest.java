package com.avfallskompassen.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

/**
 * Request DTO for updating cost values.
 */
public class UpdateCostRequest {
    @NotNull(message = "Cost is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Cost must be non-negative")
    private BigDecimal cost;

    public UpdateCostRequest() {}

    public UpdateCostRequest(BigDecimal cost) {
        this.cost = cost;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }
}

