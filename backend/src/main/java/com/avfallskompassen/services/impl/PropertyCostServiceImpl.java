package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.GeneralPropertyCostDTO;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.PropertyContainer;
import com.avfallskompassen.repository.PropertyContainerRepository;
import com.avfallskompassen.services.CollectionFeeService;
import com.avfallskompassen.services.LockTypeService;
import com.avfallskompassen.services.PropertyCostService;
import com.avfallskompassen.services.PropertyService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private  PropertyService propertyService;
    @Autowired
    private  PropertyContainerRepository propertyContainerRepository;
    @Autowired
    private  LockTypeService lockTypeService;
    @Autowired
    private  CollectionFeeService collectionFeeService;

    public GeneralPropertyCostDTO calculateAnnualCost(Long propertyId) {
        Property property = propertyService.findById(propertyId)
                .orElseThrow(() -> new EntityNotFoundException("Property not found"));

        BigDecimal collectionFee = collectionFeeService.findCollectionFeeByPropertyId(propertyId).getCost();

        BigDecimal lockCost = lockTypeService.findLockTypeById(propertyId).getCost();

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
