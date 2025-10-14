package com.avfallskompassen.services;

import com.avfallskompassen.dto.*;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for comparing properties with similar properties.
 * Implements comparison functionality for costs, container sizes, waste amounts, and collection frequencies.
 * 
 * @author Sleiman Sleiman
 */
@Service
@Transactional(readOnly = true)
public class PropertyComparisonService {
    
    private static final BigDecimal VAT_RATE = new BigDecimal("1.25"); // 25% VAT
    private static final int APARTMENT_RANGE = 5; // ±5 apartments for comparison
    
    @Autowired
    private PropertyRepository propertyRepository;
    
    /**
     * Get complete comparison data for a property.
     * 
     * @param propertyId the property ID to compare
     * @return complete comparison data
     */
    public PropertyComparisonDTO getPropertyComparison(Long propertyId) {
        Optional<Property> propertyOpt = propertyRepository.findById(propertyId);
        
        if (propertyOpt.isEmpty()) {
            throw new RuntimeException("Property not found with ID: " + propertyId);
        }
        
        Property property = propertyOpt.get();
        
        // Validate required fields
        if (property.getPropertyType() == null) {
            throw new RuntimeException("Property type is required for comparison");
        }
        
        if (property.getMunicipality() == null) {
            throw new RuntimeException("Municipality is required for comparison");
        }
        
        // Find similar properties
        List<Property> similarProperties = findSimilarProperties(property);
        
        // Build comparison response
        PropertyComparisonDTO comparison = new PropertyComparisonDTO();
        comparison.setPropertyId(property.getId());
        comparison.setAddress(property.getAddress());
        comparison.setNumberOfApartments(property.getNumberOfApartments());
        comparison.setPropertyType(property.getPropertyType().getDisplayName());
        
        // Cost comparison (MUST requirement)
        comparison.setCostComparison(calculateCostComparison(property, similarProperties));
        
        // Container size comparison (COULD requirement)
        comparison.setContainerSizeComparison(calculateContainerSizeComparison(property, similarProperties));
        
        // Waste amount comparisons (COULD requirement)
        comparison.setWasteAmountComparisons(calculateWasteAmountComparisons(property, similarProperties));
        
        // Collection frequency comparisons (COULD requirement)
        comparison.setFrequencyComparisons(calculateFrequencyComparisons(property, similarProperties));
        
        return comparison;
    }
    
    /**
     * Find similar properties based on property type, municipality, and apartment count (±5).
     */
    private List<Property> findSimilarProperties(Property property) {
        int minApartments = Math.max(1, property.getNumberOfApartments() - APARTMENT_RANGE);
        int maxApartments = property.getNumberOfApartments() + APARTMENT_RANGE;
        
        return propertyRepository.findSimilarProperties(
            property.getPropertyType(),
            property.getMunicipality(),
            minApartments,
            maxApartments,
            property.getId()
        );
    }
    
    /**
     * Calculate cost comparison with mock data.
     * Uses Helsingborg's waste tariff 2025 data.
     */
    private CostComparisonDTO calculateCostComparison(Property property, List<Property> similarProperties) {
        // Mock cost calculation based on property type and apartments
        BigDecimal propertyCost = calculatePropertyCost(property);
        
        if (similarProperties.isEmpty()) {
            return new CostComparisonDTO(
                propertyCost, propertyCost, propertyCost, propertyCost, 0.0, 0
            );
        }
        
        // Calculate costs for similar properties
        List<BigDecimal> costs = similarProperties.stream()
            .map(this::calculatePropertyCost)
            .collect(Collectors.toList());
        
        BigDecimal minCost = costs.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal maxCost = costs.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        
        BigDecimal totalCost = costs.stream()
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal averageCost = totalCost.divide(
            new BigDecimal(costs.size()), 2, RoundingMode.HALF_UP
        );
        
        // Calculate percentage difference
        Double percentageDifference = 0.0;
        if (averageCost.compareTo(BigDecimal.ZERO) > 0) {
            percentageDifference = propertyCost.subtract(averageCost)
                .divide(averageCost, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .doubleValue();
        }
        
        return new CostComparisonDTO(
            propertyCost,
            averageCost,
            minCost,
            maxCost,
            percentageDifference,
            similarProperties.size()
        );
    }
    
    /**
     * Calculate property cost based on mock data from Helsingborg's tariff 2025.
     * Total cost = grundavgift + rörlig avgift + tilläggstjänster, including 25% VAT.
     */
    private BigDecimal calculatePropertyCost(Property property) {
        BigDecimal baseCost = BigDecimal.ZERO;
        
        switch (property.getPropertyType()) {
            case FLERBOSTADSHUS:
                // Mock: 190L container, 52 collections/year = 4565 kr/year per 10 apartments
                baseCost = new BigDecimal("4565")
                    .multiply(new BigDecimal(property.getNumberOfApartments()))
                    .divide(new BigDecimal("10"), 2, RoundingMode.HALF_UP);
                break;
                
            case SMAHUS:
                // Mock: Base fee 1250 kr + variable fee 1485 kr (fyrfack 2×370L)
                baseCost = new BigDecimal("1250").add(new BigDecimal("1485"));
                break;
                
            case VERKSAMHET:
                // Mock: Similar to flerbostadshus but higher rate
                baseCost = new BigDecimal("6845")
                    .multiply(new BigDecimal(property.getNumberOfApartments()))
                    .divide(new BigDecimal("10"), 2, RoundingMode.HALF_UP);
                break;
        }
        
        // Add random variation (±10%) to simulate real data
        double variation = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
        baseCost = baseCost.multiply(new BigDecimal(variation));
        
        // Apply VAT (25%)
        return baseCost.multiply(VAT_RATE).setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Calculate container size comparison with mock data.
     */
    private ContainerSizeComparisonDTO calculateContainerSizeComparison(Property property, List<Property> similarProperties) {
        Integer propertyVolume = calculateTotalContainerVolume(property);
        
        if (similarProperties.isEmpty()) {
            return new ContainerSizeComparisonDTO(
                propertyVolume, propertyVolume.doubleValue(), "lika stora", 0
            );
        }
        
        List<Integer> volumes = similarProperties.stream()
            .map(this::calculateTotalContainerVolume)
            .collect(Collectors.toList());
        
        double averageVolume = volumes.stream()
            .mapToInt(Integer::intValue)
            .average()
            .orElse(0.0);
        
        // Determine comparison (±10% tolerance for "lika stora")
        String comparison;
        double tolerance = 0.1;
        if (propertyVolume < averageVolume * (1 - tolerance)) {
            comparison = "mindre";
        } else if (propertyVolume > averageVolume * (1 + tolerance)) {
            comparison = "större";
        } else {
            comparison = "lika stora";
        }
        
        return new ContainerSizeComparisonDTO(
            propertyVolume,
            averageVolume,
            comparison,
            similarProperties.size()
        );
    }
    
    /**
     * Calculate total container volume in liters based on mock data.
     */
    private Integer calculateTotalContainerVolume(Property property) {
        switch (property.getPropertyType()) {
            case FLERBOSTADSHUS:
                // Mock: 190L per 5 apartments or 370L per 10 apartments
                return property.getNumberOfApartments() <= 20 ? 190 : 370;
                
            case SMAHUS:
                // Mock: 2×370L fyrfackskärl = 740L total
                return 740;
                
            case VERKSAMHET:
                // Mock: Larger containers, 660L base
                return 660;
                
            default:
                return 190;
        }
    }
    
    /**
     * Calculate waste amount comparisons for different waste types.
     */
    private List<WasteAmountComparisonDTO> calculateWasteAmountComparisons(Property property, List<Property> similarProperties) {
        List<WasteAmountComparisonDTO> comparisons = new ArrayList<>();
        
        // Waste types to compare
        String[] wasteTypes = {"Restavfall", "Matavfall", "Förpackningar & Tidningar"};
        
        for (String wasteType : wasteTypes) {
            Double propertyAmount = calculateWasteAmount(property, wasteType);
            
            if (similarProperties.isEmpty()) {
                comparisons.add(new WasteAmountComparisonDTO(
                    propertyAmount, propertyAmount, propertyAmount, propertyAmount, 0.0, 0, wasteType
                ));
                continue;
            }
            
            List<Double> amounts = similarProperties.stream()
                .map(p -> calculateWasteAmount(p, wasteType))
                .collect(Collectors.toList());
            
            Double minAmount = amounts.stream().min(Double::compareTo).orElse(0.0);
            Double maxAmount = amounts.stream().max(Double::compareTo).orElse(0.0);
            Double averageAmount = amounts.stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
            
            Double percentageDifference = 0.0;
            if (averageAmount > 0) {
                percentageDifference = ((propertyAmount - averageAmount) / averageAmount) * 100;
            }
            
            comparisons.add(new WasteAmountComparisonDTO(
                propertyAmount,
                averageAmount,
                minAmount,
                maxAmount,
                percentageDifference,
                similarProperties.size(),
                wasteType
            ));
        }
        
        return comparisons;
    }
    
    /**
     * Calculate waste amount in kg/year based on mock assumptions.
     */
    private Double calculateWasteAmount(Property property, String wasteType) {
        int apartments = property.getNumberOfApartments();
        double monthlyPerApartment;
        
        switch (wasteType) {
            case "Restavfall":
                // 20-35 kg/apartment/month
                monthlyPerApartment = 20 + (Math.random() * 15);
                break;
            case "Matavfall":
                // 5-10 kg/apartment/month
                monthlyPerApartment = 5 + (Math.random() * 5);
                break;
            case "Förpackningar & Tidningar":
                // 10-15 kg/apartment/month
                monthlyPerApartment = 10 + (Math.random() * 5);
                break;
            default:
                monthlyPerApartment = 10;
        }
        
        // Convert to kg/year
        return monthlyPerApartment * apartments * 12;
    }
    
    /**
     * Calculate collection frequency comparisons for different waste types.
     */
    private List<CollectionFrequencyComparisonDTO> calculateFrequencyComparisons(Property property, List<Property> similarProperties) {
        List<CollectionFrequencyComparisonDTO> comparisons = new ArrayList<>();
        
        String[] wasteTypes = {"Restavfall", "Matavfall"};
        
        for (String wasteType : wasteTypes) {
            Integer propertyFrequency = calculateCollectionFrequency(property, wasteType);
            
            if (similarProperties.isEmpty()) {
                comparisons.add(new CollectionFrequencyComparisonDTO(
                    propertyFrequency, propertyFrequency.doubleValue(), 0.0, 0, wasteType
                ));
                continue;
            }
            
            List<Integer> frequencies = similarProperties.stream()
                .map(p -> calculateCollectionFrequency(p, wasteType))
                .collect(Collectors.toList());
            
            Double averageFrequency = frequencies.stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
            
            Double percentageDifference = 0.0;
            if (averageFrequency > 0) {
                percentageDifference = ((propertyFrequency - averageFrequency) / averageFrequency) * 100;
            }
            
            comparisons.add(new CollectionFrequencyComparisonDTO(
                propertyFrequency,
                averageFrequency,
                percentageDifference,
                similarProperties.size(),
                wasteType
            ));
        }
        
        return comparisons;
    }
    
    /**
     * Calculate collection frequency per year based on mock data.
     */
    private Integer calculateCollectionFrequency(Property property, String wasteType) {
        switch (property.getPropertyType()) {
            case FLERBOSTADSHUS:
                // Flerbostadshus: 52/year for both restavfall and matavfall
                return 52;
                
            case SMAHUS:
                if (wasteType.equals("Restavfall")) {
                    // Småhus fyrfack: 26 tömningar/år
                    return 26;
                } else {
                    // Matavfall: 52/år
                    return 52;
                }
                
            case VERKSAMHET:
                // Business properties: varies, mock 26 or 52
                return property.getNumberOfApartments() > 10 ? 52 : 26;
                
            default:
                return 26;
        }
    }
}
