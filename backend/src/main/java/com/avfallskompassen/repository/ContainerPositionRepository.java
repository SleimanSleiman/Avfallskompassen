package com.avfallskompassen.repository;

import com.avfallskompassen.model.ContainerPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for managing {@link ContainerPosition} entities
 * @author Anton Persson
 */
@Repository
public interface ContainerPositionRepository extends JpaRepository<ContainerPosition, Long> {
    List<ContainerPosition> findByWasteRoomId(Long wasteRoomId);
}
