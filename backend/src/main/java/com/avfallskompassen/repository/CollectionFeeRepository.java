package com.avfallskompassen.repository;

import com.avfallskompassen.model.CollectionFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectionFeeRepository extends JpaRepository<CollectionFee, Long> {
}
