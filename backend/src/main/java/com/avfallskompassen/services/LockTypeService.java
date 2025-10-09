package com.avfallskompassen.services;

import com.avfallskompassen.model.LockType;
import com.avfallskompassen.repository.LockTypeRepository;
import jakarta.persistence.Transient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class LockTypeService {
    private final LockTypeRepository lockTypeRepository;

    public LockTypeService(LockTypeRepository lockTypeRepository) {
        this.lockTypeRepository = lockTypeRepository;
    }

    @Transactional(readOnly = true)
    public LockType findLockTypeById(Long lockTypeId) {
        return lockTypeRepository.findById(lockTypeId)
                .orElseThrow(() -> new RuntimeException("No Locktype found with ID: " + lockTypeId));
    }


}
