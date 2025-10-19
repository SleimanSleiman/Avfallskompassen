package com.avfallskompassen.repository;

import com.avfallskompassen.model.ContainerType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for ContainerType entity.
 */
@Repository
public interface ContainerTypeRepository extends JpaRepository<ContainerType, Long> {

}
