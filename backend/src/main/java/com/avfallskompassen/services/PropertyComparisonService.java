package com.avfallskompassen.services;

import com.avfallskompassen.dto.CollectionFrequencyComparisonDTO;
import com.avfallskompassen.dto.ContainerSizeComparisonDTO;
import com.avfallskompassen.dto.CostComparisonDTO;
import com.avfallskompassen.dto.PropertyComparisonDTO;
import com.avfallskompassen.dto.WasteAmountComparisonDTO;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.PropertyContainer;
import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.model.ContainerPosition;
import com.avfallskompassen.model.WasteRoom;
import com.avfallskompassen.repository.PropertyRepository;
import com.avfallskompassen.repository.WasteRoomRepository;
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
 * Service implementation for comparing properties with similar properties.
 * Implements comparison functionality for costs, container sizes, waste
 * amounts, and collection frequencies.
 */
@Service
@Transactional(readOnly = true)
public class PropertyComparisonService implements IPropertyComparisonService {

    private static final int APARTMENT_RANGE = 5;

    private final PropertyRepository propertyRepository;
    private final PropertyCostService propertyCostService;
    private final WasteRoomRepository wasteRoomRepository;

    @Autowired
    public PropertyComparisonService(PropertyRepository propertyRepository,
            PropertyCostService propertyCostService,
            WasteRoomRepository wasteRoomRepository) {
        this.propertyRepository = propertyRepository;
        this.propertyCostService = propertyCostService;
        this.wasteRoomRepository = wasteRoomRepository;
    }

    @Override
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
        comparison.setContainerSizeComparison(
                calculateContainerSizeComparison(property, similarProperties, containersByProperty));
        comparison.setWasteAmountComparisons(
                calculateWasteAmountComparisons(property, similarProperties, containersByProperty));
        comparison.setFrequencyComparisons(
                calculateFrequencyComparisons(property, similarProperties, containersByProperty));

        return comparison;
    }

    @Override
    public CostComparisonDTO getCostComparison(Long propertyId) {
        Property property = loadProperty(propertyId);
        List<Property> similarProperties = findSimilarProperties(property);
        return calculateCostComparison(property, similarProperties);
    }

    @Override
    public ContainerSizeComparisonDTO getContainerSizeComparison(Long propertyId) {
        Property property = loadProperty(propertyId);
        List<Property> similarProperties = findSimilarProperties(property);
        Map<Long, List<PropertyContainer>> containersByProperty = loadContainers(property, similarProperties);
        return calculateContainerSizeComparison(property, similarProperties, containersByProperty);
    }

    @Override
    public List<WasteAmountComparisonDTO> getWasteAmountComparisons(Long propertyId) {
        Property property = loadProperty(propertyId);
        List<Property> similarProperties = findSimilarProperties(property);
        Map<Long, List<PropertyContainer>> containersByProperty = loadContainers(property, similarProperties);
        return calculateWasteAmountComparisons(property, similarProperties, containersByProperty);
    }

    @Override
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

    private List<Property> findSimilarProperties(Property property) {
        int minApartments = Math.max(1, property.getNumberOfApartments() - APARTMENT_RANGE);
        int maxApartments = property.getNumberOfApartments() + APARTMENT_RANGE;

        return propertyRepository.findSimilarProperties(
                property.getPropertyType(),
                property.getMunicipality(),
                minApartments,
                maxApartments,
                property.getId());
    }

    private Map<Long, List<PropertyContainer>> loadContainers(Property property, List<Property> similarProperties) {
        Map<Long, List<PropertyContainer>> containersByProperty = new HashMap<>();
        containersByProperty.put(property.getId(), fetchContainersFromWasteRooms(property.getId()));

        Set<Long> similarIds = similarProperties.stream()
                .map(Property::getId)
                .collect(Collectors.toCollection(HashSet::new));

        if (!similarIds.isEmpty()) {
            List<WasteRoom> allWasteRooms = wasteRoomRepository.findByPropertyIdIn(similarIds);

            Map<Long, List<PropertyContainer>> grouped = allWasteRooms.stream()
                    .filter(wr -> Boolean.TRUE.equals(wr.getIsActive()))
                    .collect(Collectors.groupingBy(
                            wr -> wr.getProperty().getId(),
                            Collectors.collectingAndThen(
                                    Collectors.toList(),
                                    this::convertWasteRoomsToPropertyContainers)));

            containersByProperty.putAll(grouped);
            similarIds.forEach(id -> containersByProperty.computeIfAbsent(id, ignored -> Collections.emptyList()));
        }

        return containersByProperty;
    }

    private List<PropertyContainer> fetchContainersFromWasteRooms(Long propertyId) {
        List<WasteRoom> rooms = wasteRoomRepository.findByPropertyId(propertyId);
        return convertWasteRoomsToPropertyContainers(
                rooms.stream()
                        .filter(r -> Boolean.TRUE.equals(r.getIsActive()))
                        .collect(Collectors.toList()));
    }

    private List<PropertyContainer> convertWasteRoomsToPropertyContainers(List<WasteRoom> rooms) {
        Map<ContainerPlan, Long> planCounts = rooms.stream()
                .flatMap(r -> r.getContainers().stream())
                .map(ContainerPosition::getContainerPlan)
                .collect(Collectors.groupingBy(java.util.function.Function.identity(), Collectors.counting()));

        return planCounts.entrySet().stream().map(entry -> {
            PropertyContainer pc = new PropertyContainer();
            pc.setContainerPlan(entry.getKey());
            pc.setContainerCount(entry.getValue().intValue());
            return pc;
        }).collect(Collectors.toList());
    }

    private CostComparisonDTO calculateCostComparison(Property property, List<Property> similarProperties) {
        BigDecimal propertyCost = propertyCostService.calculateAnnualCost(property.getId()).getTotalCost()
                .setScale(2, RoundingMode.HALF_UP);

        List<BigDecimal> allCosts = new ArrayList<>();
        allCosts.add(propertyCost);

        if (!similarProperties.isEmpty()) {
            List<BigDecimal> similarCosts = similarProperties.stream()
                    .map(similar -> propertyCostService.calculateAnnualCost(similar.getId()).getTotalCost().setScale(2,
                            RoundingMode.HALF_UP))
                    .collect(Collectors.toList());
            allCosts.addAll(similarCosts);
        }

        BigDecimal minCost = allCosts.stream().min(BigDecimal::compareTo).orElse(propertyCost);
        BigDecimal maxCost = allCosts.stream().max(BigDecimal::compareTo).orElse(propertyCost);

        BigDecimal totalCost = allCosts.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal averageCost = totalCost.divide(BigDecimal.valueOf(allCosts.size()), 2, RoundingMode.HALF_UP);

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
                allCosts.size() // Return total size including self
        );
    }

    private ContainerSizeComparisonDTO calculateContainerSizeComparison(Property property,
            List<Property> similarProperties,
            Map<Long, List<PropertyContainer>> containersByProperty) {
        int propertyVolume = calculateTotalContainerVolume(containersByProperty.get(property.getId()));
        double propertyFrequency = getAverageFrequencyForProperty(property.getId());

        List<Integer> allVolumes = new ArrayList<>();
        allVolumes.add(propertyVolume);

        List<Double> allFrequencies = new ArrayList<>();
        if (propertyFrequency > 0) {
            allFrequencies.add(propertyFrequency);
        }

        if (!similarProperties.isEmpty()) {
            List<Integer> similarVolumes = similarProperties.stream()
                    .map(similar -> calculateTotalContainerVolume(containersByProperty.get(similar.getId())))
                    .collect(Collectors.toList());
            allVolumes.addAll(similarVolumes);

            List<Double> similarFrequencies = similarProperties.stream()
                    .map(similar -> getAverageFrequencyForProperty(similar.getId()))
                    .filter(freq -> freq > 0)
                    .collect(Collectors.toList());
            allFrequencies.addAll(similarFrequencies);
        }

        double averageVolume = allVolumes.stream().mapToInt(Integer::intValue).average().orElse(0.0);
        double averageFrequency = allFrequencies.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

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
                allVolumes.size(),
                roundDouble(averageFrequency));
    }

    private double getAverageFrequencyForProperty(Long propertyId) {
        List<WasteRoom> rooms = wasteRoomRepository.findByPropertyId(propertyId);
        return rooms.stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsActive()) && r.getAverageCollectionFrequency() != null)
                .mapToDouble(WasteRoom::getAverageCollectionFrequency)
                .average()
                .orElse(0.0);
    }

    private int calculateTotalContainerVolume(List<PropertyContainer> containers) {
        if (containers == null || containers.isEmpty()) {
            return 0;
        }

        return containers.stream()
                .filter(this::hasRequiredContainerRelations)
                .mapToInt(container -> container.getContainerPlan().getContainerType().getSize()
                        * container.getContainerCount())
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
                    wasteType));
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
                                * container.getContainerCount())));
    }

    private List<CollectionFrequencyComparisonDTO> calculateFrequencyComparisons(Property property,
            List<Property> similarProperties,
            Map<Long, List<PropertyContainer>> containersByProperty) {
        Map<String, Double> propertyFrequencies = calculateAverageFrequencyByService(
                containersByProperty.get(property.getId()));
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

            double average = similarValues.stream().mapToDouble(Double::doubleValue).average()
                    .orElse(propertyFrequency);
            double percentageDifference = average > 0 ? ((propertyFrequency - average) / average) * 100 : 0.0;

            comparisons.add(new CollectionFrequencyComparisonDTO(
                    roundToInt(propertyFrequency),
                    roundDouble(average),
                    roundDouble(percentageDifference),
                    similarValues.size(),
                    serviceType));
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
            FrequencyAccumulator accumulator = accumulators.computeIfAbsent(serviceName,
                    ignored -> new FrequencyAccumulator());
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
