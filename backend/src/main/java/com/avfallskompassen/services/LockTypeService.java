package com.avfallskompassen.services;

import com.avfallskompassen.model.LockType;

import java.util.List;

/**
 * Interface class for the LockTypeServiceImpl
 * @Author Christian Storck
 */

public interface LockTypeService {
    public LockType findLockTypeById(Long id);
    public List<LockType> getAllLockTypes();
}
