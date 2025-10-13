package com.avfallskompassen.dto;

import java.math.BigDecimal;

/**
 * DTO for cost comparison statistics.
 * Contains cost data for a property compared to similar properties.
 *  @author Sleiman Sleiman
 */
public class CostComparisonDTO {
    
    private BigDecimal propertyCost;           // Total cost for the property (with VAT)
    private BigDecimal averageCost;            // Average cost for similar properties
    private BigDecimal minCost;                // Minimum cost in comparison group
    private BigDecimal maxCost;                // Maximum cost in comparison group
    private Double percentageDifference;       // Percentage difference from average
    private Integer comparisonGroupSize;       // Number of similar properties found
    
    public CostComparisonDTO() {}
    
    public CostComparisonDTO(BigDecimal propertyCost, BigDecimal averageCost, 
                            BigDecimal minCost, BigDecimal maxCost, 
                            Double percentageDifference, Integer comparisonGroupSize) {
        this.propertyCost = propertyCost;
        this.averageCost = averageCost;
        this.minCost = minCost;
        this.maxCost = maxCost;
        this.percentageDifference = percentageDifference;
        this.comparisonGroupSize = comparisonGroupSize;
    }
    
    // Getters and Setters
    public BigDecimal getPropertyCost() {
        return propertyCost;
    }
    
    public void setPropertyCost(BigDecimal propertyCost) {
        this.propertyCost = propertyCost;
    }
    
    public BigDecimal getAverageCost() {
        return averageCost;
    }
    
    public void setAverageCost(BigDecimal averageCost) {
        this.averageCost = averageCost;
    }
    
    public BigDecimal getMinCost() {
        return minCost;
    }
    
    public void setMinCost(BigDecimal minCost) {
        this.minCost = minCost;
    }
    
    public BigDecimal getMaxCost() {
        return maxCost;
    }
    
    public void setMaxCost(BigDecimal maxCost) {
        this.maxCost = maxCost;
    }
    
    public Double getPercentageDifference() {
        return percentageDifference;
    }
    
    public void setPercentageDifference(Double percentageDifference) {
        this.percentageDifference = percentageDifference;
    }
    
    public Integer getComparisonGroupSize() {
        return comparisonGroupSize;
    }
    
    public void setComparisonGroupSize(Integer comparisonGroupSize) {
        this.comparisonGroupSize = comparisonGroupSize;
    }
}
