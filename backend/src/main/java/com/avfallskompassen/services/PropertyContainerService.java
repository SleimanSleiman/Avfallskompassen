package com.avfallskompassen.services;

import com.avfallskompassen.dto.PropertyContainerDTO;

import java.util.List;

public interface PropertyContainerService {

    List<PropertyContainerDTO> getContainersByPropertyId(Long propertyId);
}
