package com.avfallskompassen.dto;

/**
 * DTO for waste amount comparison.
 * Compares a property's waste amounts with similar properties.
 * @author Sleiman Sleiman
 */
public class WasteAmountComparisonDTO {
    
    private Double propertyWasteAmount;       // Property's waste amount in kg/year
    private Double averageWasteAmount;        // Average waste amount in comparison group
    private Double minWasteAmount;            // Minimum waste amount
    private Double maxWasteAmount;            // Maximum waste amount
    private Double percentageDifference;      // Percentage difference from average
    private Integer comparisonGroupSize;       // Number of similar properties
    private String wasteType;                  // Type of waste (restavfall, matavfall, etc.)
    
    public WasteAmountComparisonDTO() {}
    
    public WasteAmountComparisonDTO(Double propertyWasteAmount, Double averageWasteAmount,
                                   Double minWasteAmount, Double maxWasteAmount,
                                   Double percentageDifference, Integer comparisonGroupSize,
                                   String wasteType) {
        this.propertyWasteAmount = propertyWasteAmount;
        this.averageWasteAmount = averageWasteAmount;
        this.minWasteAmount = minWasteAmount;
        this.maxWasteAmount = maxWasteAmount;
        this.percentageDifference = percentageDifference;
        this.comparisonGroupSize = comparisonGroupSize;
        this.wasteType = wasteType;
    }
    
    // Getters and Setters
    public Double getPropertyWasteAmount() {
        return propertyWasteAmount;
    }
    
    public void setPropertyWasteAmount(Double propertyWasteAmount) {
        this.propertyWasteAmount = propertyWasteAmount;
    }
    
    public Double getAverageWasteAmount() {
        return averageWasteAmount;
    }
    
    public void setAverageWasteAmount(Double averageWasteAmount) {
        this.averageWasteAmount = averageWasteAmount;
    }
    
    public Double getMinWasteAmount() {
        return minWasteAmount;
    }
    
    public void setMinWasteAmount(Double minWasteAmount) {
        this.minWasteAmount = minWasteAmount;
    }
    
    public Double getMaxWasteAmount() {
        return maxWasteAmount;
    }
    
    public void setMaxWasteAmount(Double maxWasteAmount) {
        this.maxWasteAmount = maxWasteAmount;
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
    
    public String getWasteType() {
        return wasteType;
    }
    
    public void setWasteType(String wasteType) {
        this.wasteType = wasteType;
    }
}
