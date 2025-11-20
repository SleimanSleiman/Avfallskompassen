package com.avfallskompassen.repository;

import com.avfallskompassen.model.Door;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing {@link Door} entities
 * @author Anton Persson
 */
@Repository
public interface DoorRepository extends JpaRepository<Door, Long> {

}
