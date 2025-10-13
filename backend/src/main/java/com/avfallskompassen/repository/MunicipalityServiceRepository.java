package com.avfallskompassen.repository;

import com.avfallskompassen.model.MunicipalityService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MunicipalityServiceRepository extends JpaRepository<MunicipalityService, Long> {
    List<MunicipalityService> findByMunicipality_Id(long municipalityId);
}
