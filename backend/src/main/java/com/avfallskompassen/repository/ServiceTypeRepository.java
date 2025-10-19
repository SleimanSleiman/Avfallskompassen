package com.avfallskompassen.repository;

import com.avfallskompassen.model.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for ServiceType entity operations.
 */

@Repository
public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {

}