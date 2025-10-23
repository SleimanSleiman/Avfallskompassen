package com.avfallskompassen.repository;

import com.avfallskompassen.model.WasteRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

import java.util.List;
import java.util.Optional;

@Repository
public interface WasteRoomRepository extends JpaRepository<WasteRoom, Long> {
    List<WasteRoom> findByPropertyId(Long propertyId);

    Optional<WasteRoom> findById(Long id);
}
