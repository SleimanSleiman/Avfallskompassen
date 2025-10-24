package com.avfallskompassen.services;

import com.avfallskompassen.dto.WasteRoomDTO;
import com.avfallskompassen.dto.WasteRoomRequest;
import com.avfallskompassen.model.WasteRoom;

import java.util.List;

public interface WasteRoomService {
    WasteRoomDTO saveWasteRoom(WasteRoomRequest request);

    WasteRoomDTO getWasteRoomById(Long id);

    List<WasteRoomDTO> getWasteRoomsByPropertyId(Long id);

    WasteRoomDTO updateWasteRoom(Long wasteRoomId, WasteRoomRequest wasteRoomRequest);

    void deleteWasteRoom(Long wasteRoomId);
}
