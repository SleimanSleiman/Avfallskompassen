package com.avfallskompassen.dto;

/**
 * DTO for collection frequency comparison.
 * Compares a property's collection frequency with similar properties.
 * 
 *  @author Sleiman Sleiman
 */
public class CollectionFrequencyComparisonDTO {
    
    private Integer propertyFrequency;        // Property's collection frequency per year
    private Double averageFrequency;          // Average frequency in comparison group
    private Double percentageDifference;      // Percentage difference from average
    private Integer comparisonGroupSize;       // Number of similar properties
    private String wasteType;                  // Type of waste
    
    public CollectionFrequencyComparisonDTO() {}
    
    public CollectionFrequencyComparisonDTO(Integer propertyFrequency, Double averageFrequency,
                                           Double percentageDifference, Integer comparisonGroupSize,
                                           String wasteType) {
        this.propertyFrequency = propertyFrequency;
        this.averageFrequency = averageFrequency;
        this.percentageDifference = percentageDifference;
        this.comparisonGroupSize = comparisonGroupSize;
        this.wasteType = wasteType;
    }
    
    // Getters and Setters
    public Integer getPropertyFrequency() {
        return propertyFrequency;
    }
    
    public void setPropertyFrequency(Integer propertyFrequency) {
        this.propertyFrequency = propertyFrequency;
    }
    
    public Double getAverageFrequency() {
        return averageFrequency;
    }
    
    public void setAverageFrequency(Double averageFrequency) {
        this.averageFrequency = averageFrequency;
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
