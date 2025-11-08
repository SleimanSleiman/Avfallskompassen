package com.avfallskompassen.services;

import com.avfallskompassen.dto.GeneralPropertyCostDTO;

import java.util.List;

/**
 * Interface for the service class PropertyCostServiceImpl
 * @Author Christian
 */

public interface PropertyCostService {

    GeneralPropertyCostDTO calculateAnnualCost(Long propertyId);
    List<GeneralPropertyCostDTO> calculateAllCostsForUser(String username);
}
