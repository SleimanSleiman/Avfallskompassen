package com.avfallskompassen.services;

import com.avfallskompassen.dto.ContainerDTO;
import com.avfallskompassen.dto.ContainerPositionDTO;
import com.avfallskompassen.dto.PropertyContainerDTO;
import com.avfallskompassen.model.ContainerPlan;

import java.util.List;

/**
 * Interface for the ContainerServiceImpl class.
 */
public interface ContainerService {

    List<ContainerDTO> getContainersByMunicipalityAndService(Long municipalityId, Long serviceTypeId);

    List<ContainerPositionDTO> getContainersByWasteRoomId(Long wasteRoomId);

    ContainerPlan getContainerPlanById(Long id);

    List<PropertyContainerDTO> getContainersByPropertyId(Long wasteRoomId);

}