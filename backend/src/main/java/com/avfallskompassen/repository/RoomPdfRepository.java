package com.avfallskompassen.repository;

import com.avfallskompassen.model.RoomPdf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomPdfRepository extends JpaRepository<RoomPdf, Long> {
    Optional <RoomPdf> findById(Long roomPdfId);
    List<RoomPdf> findByWasteRoomId(Long wasteRoomId);
}
