package com.avfallskompassen.repository;

import com.avfallskompassen.model.Municipality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Municipality entity.
 */
@Repository
public interface MunicipalityRepository extends JpaRepository<Municipality, Long> {
}
