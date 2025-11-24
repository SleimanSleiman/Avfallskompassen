package com.avfallskompassen.services;

import com.avfallskompassen.dto.PropertyContainerDTO;

import java.util.List;

/**
 * Interface for the service class PropertyContainerServiceImpl
 * @Author Christian Storck
 */
public interface PropertyContainerService {

    List<PropertyContainerDTO> getContainersByPropertyId(Long propertyId);
}
