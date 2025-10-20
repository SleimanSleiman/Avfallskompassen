package com.avfallskompassen.services;

import com.avfallskompassen.model.LockType;

/**
 * Interface class for the LockTypeServiceImpl
 * @Author Christian Storck
 */

public interface LockTypeService {
    public LockType findLockTypeById(Long id);
}
