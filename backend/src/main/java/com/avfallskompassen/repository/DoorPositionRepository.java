package com.avfallskompassen.repository;

import com.avfallskompassen.model.DoorPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoorPositionRepository extends JpaRepository<DoorPosition, Long> {
    List<DoorPosition> findByWasteRoomId(Long wasteRoomId);
}
