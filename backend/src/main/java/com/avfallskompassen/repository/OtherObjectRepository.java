package com.avfallskompassen.repository;

import com.avfallskompassen.model.OtherObject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtherObjectRepository extends JpaRepository<OtherObject, Long> {
}
