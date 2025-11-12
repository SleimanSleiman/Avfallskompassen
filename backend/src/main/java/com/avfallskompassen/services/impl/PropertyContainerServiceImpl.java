package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.PropertyContainerDTO;
import com.avfallskompassen.repository.PropertyContainerRepository;
import com.avfallskompassen.services.PropertyContainerService;

import java.util.List;

public class PropertyContainerServiceImpl implements PropertyContainerService {

    private final PropertyContainerRepository propertyContainerRepository;

    public PropertyContainerServiceImpl(PropertyContainerRepository propertyContainerRepository) {
        this.propertyContainerRepository = propertyContainerRepository;
    }

    public List<PropertyContainerDTO> getContainersByPropertyId(Long propertyId) {
        return propertyContainerRepository.findByPropertyId(propertyId)
                .stream()
                .map(pc -> {
                    var plan = pc.getContainerPlan();
                    var type = plan.getContainerType();
                    var fractionType = plan.getMunicipalityService().getServiceType().getName();
                    return new PropertyContainerDTO(
                            fractionType,
                            type.getName(),
                            type.getSize(),
                            pc.getContainerCount(),
                            plan.getEmptyingFrequencyPerYear(),
                            plan.getCost()
                    );
                })
                .toList();
    }
}

