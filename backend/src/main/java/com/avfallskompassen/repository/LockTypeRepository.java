package com.avfallskompassen.repository;

import com.avfallskompassen.model.LockType;
import com.avfallskompassen.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository class responsible for handling the LockType entity.
 * @Author Christian Storck
 */

public interface LockTypeRepository extends JpaRepository<LockType, Long> {
}
