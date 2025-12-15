package com.avfallskompassen.services;

import com.avfallskompassen.dto.LockTypeDto;
import com.avfallskompassen.model.LockType;

import java.util.List;

/**
 * Interface class for the LockTypeServiceImpl
 * @Author Christian Storck
 */

public interface LockTypeService {
    LockTypeDto findLockTypeById(Long id);
    List<LockTypeDto> getAllLockTypes();
    LockTypeDto getPropertyLockTypeById(Long id);
}
