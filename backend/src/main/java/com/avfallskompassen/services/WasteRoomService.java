package com.avfallskompassen.services;

import com.avfallskompassen.dto.WasteRoomDTO;
import com.avfallskompassen.dto.request.WasteRoomRequest;

import java.util.List;

/**
 * Interface for {@link com.avfallskompassen.services.impl.WasteRoomServiceImpl}
 */
public interface WasteRoomService {
    WasteRoomDTO saveWasteRoom(WasteRoomRequest request);

    WasteRoomDTO getWasteRoomById(Long id);

    List<WasteRoomDTO> getWasteRoomsByPropertyId(Long id);

    WasteRoomDTO updateWasteRoom(Long wasteRoomId, WasteRoomRequest wasteRoomRequest);

    void deleteWasteRoom(Long wasteRoomId);

    WasteRoomDTO saveAdminVersion(Long propertyId, String roomName, WasteRoomRequest request);

    List<WasteRoomDTO> getAllVersionsByPropertyAndName(Long propertyId, String roomName);
}
