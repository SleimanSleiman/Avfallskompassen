package com.avfallskompassen.services.impl;

import com.avfallskompassen.model.LockType;
import com.avfallskompassen.repository.LockTypeRepository;
import com.avfallskompassen.services.LockTypeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class that serves DTO's to the controller layer.
 * And implementation of the LockTypeService interface.
 * @Author Christian Storck
 */

@Service
public class LockTypeServiceImpl implements LockTypeService {
    private final LockTypeRepository lockTypeRepository;

    public LockTypeServiceImpl(LockTypeRepository lockTypeRepository) {
        this.lockTypeRepository = lockTypeRepository;
    }

    /**
     * Fetches a lock type based on its ID.
     *
     * @Author Christian Storck
     * @param lockTypeId Id of the lock type to retrieve
     * @return A {@link LockType} entity matching the provided ID
     * @throws RuntimeException if no lock type is found with the given ID
     */
    @Transactional(readOnly = true)
    public LockType findLockTypeById(Long lockTypeId) {
        return lockTypeRepository.findById(lockTypeId)
                .orElseThrow(() -> new RuntimeException("No Locktype found with ID: " + lockTypeId));
    }
}
