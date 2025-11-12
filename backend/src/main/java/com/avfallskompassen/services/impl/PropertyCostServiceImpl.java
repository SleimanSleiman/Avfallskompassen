package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.GeneralPropertyCostDTO;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.PropertyContainer;
import com.avfallskompassen.repository.PropertyContainerRepository;
import com.avfallskompassen.services.CollectionFeeService;
import com.avfallskompassen.services.PropertyCostService;
import com.avfallskompassen.services.PropertyService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class that serves DTO's to the controller layer. Handles the PropertyCost calculations.
 * And implementation of the PropertyCostService interface.
 * @Author Christian Storck
 */
@Service
@Transactional
public class PropertyCostServiceImpl implements PropertyCostService {

    private final PropertyService propertyService;
    private final PropertyContainerRepository propertyContainerRepository;
    private final CollectionFeeService collectionFeeService;

    public PropertyCostServiceImpl(
            PropertyService propertyService,
            PropertyContainerRepository propertyContainerRepository,
            CollectionFeeService collectionFeeService
    ) {
        this.propertyService = propertyService;
        this.propertyContainerRepository = propertyContainerRepository;
        this.collectionFeeService = collectionFeeService;
    }

    /**
     * Calculates the total annual cost for a specific property.
     * The total cost is composed of the collection fee, lock cost and container costs.
     * Also calculates cost per apartment based on the number of apartments in the property.
     *
     * @Author Christian Storck
     * @param propertyId Id of the property for which the annual cost should be calculated
     * @return A {@link GeneralPropertyCostDTO} containing the total and per-apartment cost for the property
     * @throws EntityNotFoundException if no property is found with the given id
     */
    public GeneralPropertyCostDTO calculateAnnualCost(Long propertyId) {
        Property property = propertyService.findById(propertyId)
                .orElseThrow(() -> new EntityNotFoundException("Property not found"));

        BigDecimal collectionFee = collectionFeeService.findCollectionFeeByPropertyId(propertyId).getCost();

        BigDecimal lockCost = property.getLockType().getCost();

        List<PropertyContainer> propertyContainerList = propertyContainerRepository.findByPropertyId(propertyId);

        BigDecimal containerCost = propertyContainerList.stream()
                .map(propertyContainer -> {
                    BigDecimal costPerPlan = propertyContainer.getContainerPlan().getCost();
                    return costPerPlan.multiply(BigDecimal.valueOf(propertyContainer.getContainerCount()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCost = collectionFee.add(lockCost).add(containerCost);

        BigDecimal costPerApartment = BigDecimal.ZERO;
        if (property.getNumberOfApartments() != null && property.getNumberOfApartments() > 0) {
            costPerApartment = totalCost.divide(
                    BigDecimal.valueOf(property.getNumberOfApartments()),2, RoundingMode.HALF_UP
            );
        }
        return new GeneralPropertyCostDTO(property.getAddress(),totalCost, costPerApartment);
    }


    /**
     * Calculates the total annual costs for all properties belonging to a specific user.
     * Returns a list of DTOs where each DTO represents one property and its associated costs.
     *
     * @Author Christian Storck
     * @param username Username of the user whose property costs should be calculated
     * @return A list of {@link GeneralPropertyCostDTO} objects containing cost details for each property
     * @throws EntityNotFoundException if no properties are found for the given username
     */
    public List<GeneralPropertyCostDTO> calculateAllCostsForUser(String username) {
        List<Property> properties = propertyService.getPropertiesByUser(username);

        if(properties.isEmpty()) {
            throw new EntityNotFoundException("No properties found for: " + username);
        }

        return properties.stream()
                .map(property -> calculateAnnualCost(property.getId()))
                .collect(Collectors.toList());
    }
}
