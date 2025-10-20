package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.CollectionFeeDTO;
import com.avfallskompassen.model.CollectionFee;
import com.avfallskompassen.repository.CollectionFeeRepository;
import com.avfallskompassen.services.CollectionFeeService;
import com.avfallskompassen.services.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Service class that serves DTO's to the controller layer. Handles the CollectionFee calculations.
 * And implementation of the CollectionFeeService interface.
 * @Author Christian Storck
 */

@Service
@Transactional
public class CollectionFeeServiceImpl implements CollectionFeeService {

    @Autowired
    private CollectionFeeRepository collectionFeeRepository;
    @Autowired
    private PropertyService propertyService;

    /**
     * Method that returns a DTO based on userInput distance and municipality.
     * @param id
     * @param distance
     * @return CollectionFeeDTO
     * @Author Christian Storck
     */

    public CollectionFeeDTO findCollectionFeeByMunicipalityId(Long id, double distance) {
        CollectionFee collectionFee = collectionFeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collection fee not found"));

        if(distance <= 5) {
            return new CollectionFeeDTO(
                    collectionFee.getId(),
                    BigDecimal.ZERO);
        }

        double distanceFee = distance -5;

        int segment = (int) Math.ceil(distanceFee / 10.0);

        BigDecimal totalCost = collectionFee.getCost().multiply(BigDecimal.valueOf(segment));

        return new CollectionFeeDTO(
                collectionFee.getId(),
                totalCost
        );
    }

    /**
     * Method that finds and calculates the appropriate cost for a property.
     * @param propertyId
     * @return CollectionFeeDTO
     * @Author Christian Storck
     */

    public CollectionFeeDTO findCollectionFeeByPropertyId(Long propertyId) {
        var property = propertyService.findById(propertyId)
                .orElseThrow(()-> new IllegalArgumentException("Property not found"));

        Long municipalityId = property.getMunicipality().getId();
        double dragPathLength = property.getAccessPathLength();

        return findCollectionFeeByMunicipalityId(municipalityId, dragPathLength);
    }
}
