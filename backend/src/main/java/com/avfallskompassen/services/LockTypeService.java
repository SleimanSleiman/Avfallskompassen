package com.avfallskompassen.services;

import java.util.List;

import com.avfallskompassen.dto.LockTypeDto;

/**
 * Interface class for the LockTypeServiceImpl
 * @Author Christian Storck
 */

public interface LockTypeService {
    LockTypeDto findLockTypeById(Long id);
    List<LockTypeDto> getAllLockTypes();
    LockTypeDto getPropertyLockTypeById(Long id);
    LockTypeDto updateLockTypeCost(Long id, java.math.BigDecimal cost);
}
