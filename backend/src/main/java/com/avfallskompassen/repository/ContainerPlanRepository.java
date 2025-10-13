package com.avfallskompassen.repository;

import com.avfallskompassen.model.CollectionFee;
import com.avfallskompassen.model.ContainerPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContainerPlanRepository extends JpaRepository<ContainerPlan, Long> {
}
