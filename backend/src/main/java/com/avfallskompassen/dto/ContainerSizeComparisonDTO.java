package com.avfallskompassen.dto;

/**
 * DTO for container size comparison.
 * Compares a property's container sizes with similar properties.
 *  @author Sleiman Sleiman
 */
public class ContainerSizeComparisonDTO {
    
    private Integer propertyTotalVolume;      // Total volume in liters/m³
    private Double averageVolume;             // Average volume in comparison group
    private String comparison;                 // "mindre", "större", "lika stora"
    private Integer comparisonGroupSize;       // Number of similar properties
    
    public ContainerSizeComparisonDTO() {}
    
    public ContainerSizeComparisonDTO(Integer propertyTotalVolume, Double averageVolume, 
                                     String comparison, Integer comparisonGroupSize) {
        this.propertyTotalVolume = propertyTotalVolume;
        this.averageVolume = averageVolume;
        this.comparison = comparison;
        this.comparisonGroupSize = comparisonGroupSize;
    }
    
    // Getters and Setters
    public Integer getPropertyTotalVolume() {
        return propertyTotalVolume;
    }
    
    public void setPropertyTotalVolume(Integer propertyTotalVolume) {
        this.propertyTotalVolume = propertyTotalVolume;
    }
    
    public Double getAverageVolume() {
        return averageVolume;
    }
    
    public void setAverageVolume(Double averageVolume) {
        this.averageVolume = averageVolume;
    }
    
    public String getComparison() {
        return comparison;
    }
    
    public void setComparison(String comparison) {
        this.comparison = comparison;
    }
    
    public Integer getComparisonGroupSize() {
        return comparisonGroupSize;
    }
    
    public void setComparisonGroupSize(Integer comparisonGroupSize) {
        this.comparisonGroupSize = comparisonGroupSize;
    }
}
