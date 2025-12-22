package com.avfallskompassen.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.avfallskompassen.dto.LockTypeDto;
import com.avfallskompassen.model.LockType;
import com.avfallskompassen.repository.LockTypeRepository;
import com.avfallskompassen.services.LockTypeService;

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
     * @author Christian Storck
     * @param lockTypeId Id of the lock type to retrieve
     * @return A {@link LockType} entity matching the provided ID
     * @throws RuntimeException if no lock type is found with the given ID
     */
    @Transactional(readOnly = true)
    public LockTypeDto findLockTypeById(Long lockTypeId) {
        LockType lockType = lockTypeRepository.findById(lockTypeId)
                .orElseThrow(() -> new RuntimeException("No Locktype found with ID: " + lockTypeId));
        return new LockTypeDto(lockType);
    }

    /**
     * Fetches the lockType associated with a certain propertyId
     * @param propertyId
     * @return LockTypeDto
     */
    public LockTypeDto getPropertyLockTypeById(Long propertyId) {
        LockType lockType = lockTypeRepository.findLockTypeByPropertyId(propertyId)
                .orElseThrow(() -> new RuntimeException("No Locktype found for this property"));
        return new LockTypeDto(lockType);
    }

    /**
     * Fetches all lock types.
     * @author Christian Storck
     * @return A list of {@link LockType} entity.
     */
    public List<LockTypeDto> getAllLockTypes() {
        return lockTypeRepository.findAll()
                .stream()
                .map(LockTypeDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Updates the cost of a lock type.
     * @param id The ID of the lock type to update
     * @param cost The new cost value
     * @return Updated LockTypeDto
     */
    @Transactional
    public LockTypeDto updateLockTypeCost(Long id, java.math.BigDecimal cost) {
        LockType lockType = lockTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No Locktype found with ID: " + id));
        lockType.setCost(cost);
        lockType = lockTypeRepository.save(lockType);
        return new LockTypeDto(lockType);
    }
}
