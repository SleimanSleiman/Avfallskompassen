package com.avfallskompassen.services;

import com.avfallskompassen.dto.CollectionFrequencyComparisonDTO;
import com.avfallskompassen.dto.ContainerSizeComparisonDTO;
import com.avfallskompassen.dto.CostComparisonDTO;
import com.avfallskompassen.dto.PropertyComparisonDTO;
import com.avfallskompassen.dto.WasteAmountComparisonDTO;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.PropertyContainer;
import com.avfallskompassen.repository.PropertyContainerRepository;
import com.avfallskompassen.repository.PropertyRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

/**
 * Service for comparing properties with similar properties.
 * Implements comparison functionality for costs, container sizes, waste amounts, and collection frequencies.
 */
@Service
@Transactional(readOnly = true)
public class PropertyComparisonService {

    private static final int APARTMENT_RANGE = 5;

    private final PropertyRepository propertyRepository;
    private final PropertyCostService propertyCostService;
    private final PropertyContainerRepository propertyContainerRepository;

    @Autowired
    public PropertyComparisonService(PropertyRepository propertyRepository,
                                     PropertyCostService propertyCostService,
                                     PropertyContainerRepository propertyContainerRepository) {
        this.propertyRepository = propertyRepository;
        this.propertyCostService = propertyCostService;
        this.propertyContainerRepository = propertyContainerRepository;
    }

    /**
     * Get complete comparison data for a property.
     *
     * @param propertyId the property ID to compare
     * @return complete comparison data
     */
    public PropertyComparisonDTO getPropertyComparison(Long propertyId) {
        Property property = loadProperty(propertyId);
        List<Property> similarProperties = findSimilarProperties(property);
        Map<Long, List<PropertyContainer>> containersByProperty = loadContainers(property, similarProperties);

        PropertyComparisonDTO comparison = new PropertyComparisonDTO();
        comparison.setPropertyId(property.getId());
        comparison.setAddress(property.getAddress());
        comparison.setNumberOfApartments(property.getNumberOfApartments());
        comparison.setPropertyType(property.getPropertyType().getDisplayName());

        comparison.setCostComparison(calculateCostComparison(property, similarProperties));
        comparison.setContainerSizeComparison(calculateContainerSizeComparison(property, similarProperties, containersByProperty));
        comparison.setWasteAmountComparisons(calculateWasteAmountComparisons(property, similarProperties, containersByProperty));
        comparison.setFrequencyComparisons(calculateFrequencyComparisons(property, similarProperties, containersByProperty));

        return comparison;
    }

    public CostComparisonDTO getCostComparison(Long propertyId) {
        Property property = loadProperty(propertyId);
        List<Property> similarProperties = findSimilarProperties(property);
        return calculateCostComparison(property, similarProperties);
    }

    public ContainerSizeComparisonDTO getContainerSizeComparison(Long propertyId) {
        Property property = loadProperty(propertyId);
        List<Property> similarProperties = findSimilarProperties(property);
        Map<Long, List<PropertyContainer>> containersByProperty = loadContainers(property, similarProperties);
        return calculateContainerSizeComparison(property, similarProperties, containersByProperty);
    }

    public List<WasteAmountComparisonDTO> getWasteAmountComparisons(Long propertyId) {
        Property property = loadProperty(propertyId);
        List<Property> similarProperties = findSimilarProperties(property);
        Map<Long, List<PropertyContainer>> containersByProperty = loadContainers(property, similarProperties);
        return calculateWasteAmountComparisons(property, similarProperties, containersByProperty);
    }

    public List<CollectionFrequencyComparisonDTO> getFrequencyComparisons(Long propertyId) {
        Property property = loadProperty(propertyId);
        List<Property> similarProperties = findSimilarProperties(property);
        Map<Long, List<PropertyContainer>> containersByProperty = loadContainers(property, similarProperties);
        return calculateFrequencyComparisons(property, similarProperties, containersByProperty);
    }

    private Property loadProperty(Long propertyId) {
        return propertyRepository.findById(propertyId)
            .orElseThrow(() -> new EntityNotFoundException("Property not found with ID: " + propertyId));
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

    private Map<Long, List<PropertyContainer>> loadContainers(Property property, List<Property> similarProperties) {
        Map<Long, List<PropertyContainer>> containersByProperty = new HashMap<>();
        containersByProperty.put(property.getId(), propertyContainerRepository.findByPropertyId(property.getId()));

        Set<Long> similarIds = similarProperties.stream()
            .map(Property::getId)
            .collect(Collectors.toCollection(HashSet::new));

        if (!similarIds.isEmpty()) {
            List<PropertyContainer> similarContainers = propertyContainerRepository.findByPropertyIdIn(similarIds);
            Map<Long, List<PropertyContainer>> grouped = similarContainers.stream()
                .collect(Collectors.groupingBy(container -> container.getProperty().getId()));
            containersByProperty.putAll(grouped);
            similarIds.forEach(id -> containersByProperty.computeIfAbsent(id, ignored -> Collections.emptyList()));
        }

        return containersByProperty;
    }

    private CostComparisonDTO calculateCostComparison(Property property, List<Property> similarProperties) {
        BigDecimal propertyCost = propertyCostService.calculateAnnualCost(property.getId()).getTotalCost()
            .setScale(2, RoundingMode.HALF_UP);

        if (similarProperties.isEmpty()) {
            return new CostComparisonDTO(propertyCost, propertyCost, propertyCost, propertyCost, 0.0, 0);
        }

        List<BigDecimal> costs = similarProperties.stream()
            .map(similar -> propertyCostService.calculateAnnualCost(similar.getId()).getTotalCost().setScale(2, RoundingMode.HALF_UP))
            .collect(Collectors.toList());

        BigDecimal minCost = costs.stream().min(BigDecimal::compareTo).orElse(propertyCost);
        BigDecimal maxCost = costs.stream().max(BigDecimal::compareTo).orElse(propertyCost);

        BigDecimal totalCost = costs.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal averageCost = totalCost.divide(BigDecimal.valueOf(costs.size()), 2, RoundingMode.HALF_UP);

        double percentageDifference = 0.0;
        if (averageCost.compareTo(BigDecimal.ZERO) > 0) {
            percentageDifference = propertyCost.subtract(averageCost)
                .divide(averageCost, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
        }

        return new CostComparisonDTO(
            propertyCost,
            averageCost,
            minCost,
            maxCost,
            roundDouble(percentageDifference),
            costs.size()
        );
    }

    private ContainerSizeComparisonDTO calculateContainerSizeComparison(Property property,
                                                                        List<Property> similarProperties,
                                                                        Map<Long, List<PropertyContainer>> containersByProperty) {
        int propertyVolume = calculateTotalContainerVolume(containersByProperty.get(property.getId()));

        if (similarProperties.isEmpty()) {
            return new ContainerSizeComparisonDTO(propertyVolume, (double) propertyVolume, "lika stora", 0);
        }

        List<Integer> volumes = similarProperties.stream()
            .map(similar -> calculateTotalContainerVolume(containersByProperty.get(similar.getId())))
            .collect(Collectors.toList());

        double averageVolume = volumes.stream().mapToInt(Integer::intValue).average().orElse(0.0);

        double tolerance = 0.1;
        String comparison;
        if (propertyVolume < averageVolume * (1 - tolerance)) {
            comparison = "mindre";
        } else if (propertyVolume > averageVolume * (1 + tolerance)) {
            comparison = "större";
        } else {
            comparison = "lika stora";
        }

        return new ContainerSizeComparisonDTO(
            propertyVolume,
            roundDouble(averageVolume),
            comparison,
            volumes.size()
        );
    }

    private int calculateTotalContainerVolume(List<PropertyContainer> containers) {
        if (containers == null || containers.isEmpty()) {
            return 0;
        }

        return containers.stream()
            .filter(this::hasRequiredContainerRelations)
            .mapToInt(container -> container.getContainerPlan().getContainerType().getSize() * container.getContainerCount())
            .sum();
    }

    private List<WasteAmountComparisonDTO> calculateWasteAmountComparisons(Property property,
                                                                           List<Property> similarProperties,
                                                                           Map<Long, List<PropertyContainer>> containersByProperty) {
        Map<String, Double> propertyWaste = calculateWasteAmountByService(containersByProperty.get(property.getId()));
        List<Map<String, Double>> similarWaste = similarProperties.stream()
            .map(similar -> calculateWasteAmountByService(containersByProperty.get(similar.getId())))
            .collect(Collectors.toList());

        Set<String> wasteTypes = new TreeSet<>(propertyWaste.keySet());
        similarWaste.forEach(map -> wasteTypes.addAll(map.keySet()));

        if (wasteTypes.isEmpty()) {
            return Collections.emptyList();
        }

        List<WasteAmountComparisonDTO> comparisons = new ArrayList<>();
        for (String wasteType : wasteTypes) {
            double propertyAmount = propertyWaste.getOrDefault(wasteType, 0.0d);

            List<Double> similarAmounts = similarWaste.stream()
                .filter(map -> map.containsKey(wasteType))
                .map(map -> map.get(wasteType))
                .collect(Collectors.toList());

            double average = similarAmounts.stream().mapToDouble(Double::doubleValue).average().orElse(propertyAmount);
            double min = similarAmounts.stream().min(Double::compare).orElse(propertyAmount);
            double max = similarAmounts.stream().max(Double::compare).orElse(propertyAmount);
            double percentageDifference = average > 0 ? ((propertyAmount - average) / average) * 100 : 0.0;

            comparisons.add(new WasteAmountComparisonDTO(
                roundDouble(propertyAmount),
                roundDouble(average),
                roundDouble(min),
                roundDouble(max),
                roundDouble(percentageDifference),
                similarAmounts.size(),
                wasteType
            ));
        }

        return comparisons;
    }

    private Map<String, Double> calculateWasteAmountByService(List<PropertyContainer> containers) {
        if (containers == null || containers.isEmpty()) {
            return Collections.emptyMap();
        }

        return containers.stream()
            .filter(this::hasRequiredContainerRelations)
            .collect(Collectors.groupingBy(
                container -> container.getContainerPlan().getMunicipalityService().getServiceType().getName(),
                Collectors.summingDouble(container -> container.getContainerPlan().getContainerType().getSize()
                    * container.getContainerPlan().getEmptyingFrequencyPerYear()
                    * container.getContainerCount())
            ));
    }

    private List<CollectionFrequencyComparisonDTO> calculateFrequencyComparisons(Property property,
                                                                                List<Property> similarProperties,
                                                                                Map<Long, List<PropertyContainer>> containersByProperty) {
        Map<String, Double> propertyFrequencies = calculateAverageFrequencyByService(containersByProperty.get(property.getId()));
        List<Map<String, Double>> similarFrequencies = similarProperties.stream()
            .map(similar -> calculateAverageFrequencyByService(containersByProperty.get(similar.getId())))
            .collect(Collectors.toList());

        Set<String> serviceTypes = new TreeSet<>(propertyFrequencies.keySet());
        similarFrequencies.forEach(map -> serviceTypes.addAll(map.keySet()));

        if (serviceTypes.isEmpty()) {
            return Collections.emptyList();
        }

        List<CollectionFrequencyComparisonDTO> comparisons = new ArrayList<>();
        for (String serviceType : serviceTypes) {
            double propertyFrequency = propertyFrequencies.getOrDefault(serviceType, 0.0d);

            List<Double> similarValues = similarFrequencies.stream()
                .filter(map -> map.containsKey(serviceType))
                .map(map -> map.get(serviceType))
                .collect(Collectors.toList());

            double average = similarValues.stream().mapToDouble(Double::doubleValue).average().orElse(propertyFrequency);
            double percentageDifference = average > 0 ? ((propertyFrequency - average) / average) * 100 : 0.0;

            comparisons.add(new CollectionFrequencyComparisonDTO(
                roundToInt(propertyFrequency),
                roundDouble(average),
                roundDouble(percentageDifference),
                similarValues.size(),
                serviceType
            ));
        }

        return comparisons;
    }

    private Map<String, Double> calculateAverageFrequencyByService(List<PropertyContainer> containers) {
        if (containers == null || containers.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, FrequencyAccumulator> accumulators = new HashMap<>();

        for (PropertyContainer container : containers) {
            if (!hasRequiredContainerRelations(container)) {
                continue;
            }

            String serviceName = container.getContainerPlan().getMunicipalityService().getServiceType().getName();
            FrequencyAccumulator accumulator = accumulators.computeIfAbsent(serviceName, ignored -> new FrequencyAccumulator());
            accumulator.add(container.getContainerPlan().getEmptyingFrequencyPerYear(), container.getContainerCount());
        }

        Map<String, Double> result = new HashMap<>();
        accumulators.forEach((serviceName, accumulator) -> {
            if (accumulator.totalUnits > 0) {
                result.put(serviceName, accumulator.totalFrequency / accumulator.totalUnits);
            }
        });

        return result;
    }

    private boolean hasRequiredContainerRelations(PropertyContainer container) {
        return container.getContainerPlan() != null
            && container.getContainerPlan().getContainerType() != null
            && container.getContainerPlan().getMunicipalityService() != null
            && container.getContainerPlan().getMunicipalityService().getServiceType() != null;
    }

    private double roundDouble(double value) {
        return Math.round(value * 100.0d) / 100.0d;
    }

    private int roundToInt(double value) {
        return (int) Math.round(value);
    }

    private static final class FrequencyAccumulator {
        private double totalFrequency;
        private int totalUnits;

        private void add(int frequencyPerYear, int units) {
            this.totalFrequency += (double) frequencyPerYear * units;
            this.totalUnits += units;
        }
    }
}
