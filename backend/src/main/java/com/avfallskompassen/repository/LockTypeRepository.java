package com.avfallskompassen.repository;

import com.avfallskompassen.model.LockType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Repository class responsible for handling the LockType entity.
 * @Author Christian Storck
 */

public interface LockTypeRepository extends JpaRepository<LockType, Long> {
    @Query("SELECT p.lockType FROM Property p WHERE p.id = :propertyId")
    Optional<LockType> findLockTypeByPropertyId(@Param("propertyId")Long propertyId);
}
