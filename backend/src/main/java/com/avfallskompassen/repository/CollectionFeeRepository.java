package com.avfallskompassen.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.avfallskompassen.model.CollectionFee;

/**
 * Repository class responsible for handling the CollectionFee entity.
 * @Author Christian Storck
 */

@Repository
public interface CollectionFeeRepository extends JpaRepository<CollectionFee, Long> {
    Optional<CollectionFee> findByMunicipalityId(Long id);

    /**
     * Find all collection fees with eagerly loaded municipality relationship.
     * @return List of CollectionFee with municipality loaded
     */
    @Query("SELECT cf FROM CollectionFee cf LEFT JOIN FETCH cf.municipality")
    List<CollectionFee> findAllWithMunicipality();
}
