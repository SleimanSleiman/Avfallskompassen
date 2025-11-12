package com.avfallskompassen.services;

import com.avfallskompassen.dto.LockTypeDto;

import java.util.List;

/**
 * Interface class for the LockTypeServiceImpl
 * @Author Christian Storck
 */

public interface LockTypeService {
    public LockTypeDto findLockTypeById(Long id);
    public List<LockTypeDto> getAllLockTypes();
}
