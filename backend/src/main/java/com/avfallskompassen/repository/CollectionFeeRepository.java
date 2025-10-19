package com.avfallskompassen.repository;

import com.avfallskompassen.model.CollectionFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository class responsible for handling the CollectionFee entity.
 * @Author Christian Storck
 */

@Repository
public interface CollectionFeeRepository extends JpaRepository<CollectionFee, Long> {
    Optional<CollectionFee> findByMunicipalityId(Long id);
}
