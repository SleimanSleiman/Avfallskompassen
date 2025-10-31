package com.avfallskompassen.dto;

import java.util.List;

/**
 * DTO for complete property comparison response.
 * Contains all comparison data for a property.
 * @author Sleiman Sleiman
 */
public class PropertyComparisonDTO {
    
    private Long propertyId;
    private String address;
    private Integer numberOfApartments;
    private String propertyType;
    private CostComparisonDTO costComparison;
    private ContainerSizeComparisonDTO containerSizeComparison;
    private List<WasteAmountComparisonDTO> wasteAmountComparisons;
    private List<CollectionFrequencyComparisonDTO> frequencyComparisons;
    
    public PropertyComparisonDTO() {}
    
    public Long getPropertyId() {
        return propertyId;
    }
    
    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public Integer getNumberOfApartments() {
        return numberOfApartments;
    }
    
    public void setNumberOfApartments(Integer numberOfApartments) {
        this.numberOfApartments = numberOfApartments;
    }
    
    public String getPropertyType() {
        return propertyType;
    }
    
    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }
    
    public CostComparisonDTO getCostComparison() {
        return costComparison;
    }
    
    public void setCostComparison(CostComparisonDTO costComparison) {
        this.costComparison = costComparison;
    }
    
    public ContainerSizeComparisonDTO getContainerSizeComparison() {
        return containerSizeComparison;
    }
    
    public void setContainerSizeComparison(ContainerSizeComparisonDTO containerSizeComparison) {
        this.containerSizeComparison = containerSizeComparison;
    }
    
    public List<WasteAmountComparisonDTO> getWasteAmountComparisons() {
        return wasteAmountComparisons;
    }
    
    public void setWasteAmountComparisons(List<WasteAmountComparisonDTO> wasteAmountComparisons) {
        this.wasteAmountComparisons = wasteAmountComparisons;
    }
    
    public List<CollectionFrequencyComparisonDTO> getFrequencyComparisons() {
        return frequencyComparisons;
    }
    
    public void setFrequencyComparisons(List<CollectionFrequencyComparisonDTO> frequencyComparisons) {
        this.frequencyComparisons = frequencyComparisons;
    }
}
