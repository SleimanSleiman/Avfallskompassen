package com.avfallskompassen.repository;

import com.avfallskompassen.model.PropertyContainer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyContainerRepository extends JpaRepository<PropertyContainer, Long> {
    List<PropertyContainer> findByProperty(Long propertyId);
}
