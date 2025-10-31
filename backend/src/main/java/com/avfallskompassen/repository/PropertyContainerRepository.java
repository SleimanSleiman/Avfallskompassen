package com.avfallskompassen.repository;

import com.avfallskompassen.model.PropertyContainer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

/**
 * Repository class responsible for handling the PropertyContainer entity.
 * @Author Christian Storck
 */

@Repository
public interface PropertyContainerRepository extends JpaRepository<PropertyContainer, Long> {
    List<PropertyContainer> findByPropertyId(Long propertyId);

    List<PropertyContainer> findByPropertyIdIn(Collection<Long> propertyIds);
}
