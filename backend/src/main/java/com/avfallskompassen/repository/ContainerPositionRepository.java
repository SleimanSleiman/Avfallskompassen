package com.avfallskompassen.repository;

import com.avfallskompassen.model.ContainerPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for managing {@link ContainerPosition} entities
 * @author Anton Persson
 */
@Repository
public interface ContainerPositionRepository extends JpaRepository<ContainerPosition, Long> {
    List<ContainerPosition> findByWasteRoomId(Long wasteRoomId);

    @Query("""
    select cp
    from ContainerPosition cp
    join cp.wasteRoom wr
    where wr.property.id = :propertyId
    """)
    List<ContainerPosition> findByPropertyId(Long propertyId);

    @Query("""
    select cp
    from ContainerPosition cp
    join cp.wasteRoom wr
    where wr.property.id = :propertyId
        and wr.isActive = true
    """)
    List<ContainerPosition> findByPropertyIdAndIsActive(Long propertyId);
}
