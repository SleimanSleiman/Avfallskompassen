package com.avfallskompassen.services;

import com.avfallskompassen.dto.CollectionFeeDTO;

/**
 * Interface for the service class CollectionFeeImpl
 * @Author Christian
 */

public interface CollectionFeeService {

    CollectionFeeDTO findCollectionFeeByMunicipalityId(Long id, double distance);

    CollectionFeeDTO findCollectionFeeByPropertyId(Long propertyId);
}
