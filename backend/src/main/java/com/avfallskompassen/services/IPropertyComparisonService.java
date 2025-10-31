package com.avfallskompassen.services;

import com.avfallskompassen.dto.CollectionFrequencyComparisonDTO;
import com.avfallskompassen.dto.ContainerSizeComparisonDTO;
import com.avfallskompassen.dto.CostComparisonDTO;
import com.avfallskompassen.dto.PropertyComparisonDTO;
import com.avfallskompassen.dto.WasteAmountComparisonDTO;

import java.util.List;

public interface IPropertyComparisonService {

    PropertyComparisonDTO getPropertyComparison(Long propertyId);

    CostComparisonDTO getCostComparison(Long propertyId);

    ContainerSizeComparisonDTO getContainerSizeComparison(Long propertyId);

    List<WasteAmountComparisonDTO> getWasteAmountComparisons(Long propertyId);

    List<CollectionFrequencyComparisonDTO> getFrequencyComparisons(Long propertyId);
}
