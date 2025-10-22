package com.avfallskompassen.repository;

import com.avfallskompassen.model.WasteRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WasteRoomRepository extends JpaRepository<WasteRoom, Long> {
    List<WasteRoom> findPropertyById(Long propertyId);
}
