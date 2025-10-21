package com.avfallskompassen.services;

import com.avfallskompassen.dto.GeneralPropertyCostDTO;
import com.avfallskompassen.dto.PropertyCostDTO;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.repository.PropertyContainerRepository;
import com.avfallskompassen.repository.PropertyRepository;

import java.util.List;

public interface PropertyCostService {

    GeneralPropertyCostDTO calculateAnnualCost(Long propertyId);
    List<GeneralPropertyCostDTO> calculateAllCostsForUser(String username);
}
