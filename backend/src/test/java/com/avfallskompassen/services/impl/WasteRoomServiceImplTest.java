package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.WasteRoomDTO;
import com.avfallskompassen.dto.WasteRoomImgDTO;
import com.avfallskompassen.dto.request.ContainerPositionRequest;
import com.avfallskompassen.dto.request.WasteRoomRequest;
import com.avfallskompassen.exception.ResourceNotFoundException;
import com.avfallskompassen.model.ContainerPosition;
import com.avfallskompassen.model.ContainerType;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.WasteRoom;
import com.avfallskompassen.repository.ContainerTypeRepository;
import com.avfallskompassen.repository.PropertyRepository;
import com.avfallskompassen.repository.WasteRoomRepository;
import com.avfallskompassen.services.ActivityService;
import com.avfallskompassen.services.ContainerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link WasteRoomServiceImpl}
 * @author Anton Persson
 */
@ExtendWith(MockitoExtension.class)
class WasteRoomServiceImplTest {
    @Mock
    private WasteRoomRepository wasteRoomRepository;

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private ContainerService containerService;

    @Mock
    private ActivityService activityService;

    @InjectMocks
    private WasteRoomServiceImpl wasteRoomService;

    @Test
    void saveWasteRoom_ValidRequest_ReturnsDTO() {
        WasteRoomRequest request = new WasteRoomRequest(10, 5, 12, 2, List.of(), List.of(), List.of(), 1L, "Name");

        Property property = new Property();
        property.setId(1L);

        WasteRoom savedWasteRoom = new WasteRoom();
        savedWasteRoom.setProperty(property);
        savedWasteRoom.setLength(10);
        savedWasteRoom.setWidth(5);
        savedWasteRoom.setX(12);
        savedWasteRoom.setY(2);
        savedWasteRoom.setContainers(List.of());
        savedWasteRoom.setDoors(List.of());
        savedWasteRoom.setOtherObjects(List.of());

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(wasteRoomRepository.save(any(WasteRoom.class))).thenReturn(savedWasteRoom);

        WasteRoomDTO result = wasteRoomService.saveWasteRoom(request);

        assertNotNull(result);
        assertEquals(1L, result.getPropertyId());
        assertEquals(10, result.getLength());
        assertEquals(5, result.getWidth());
        assertEquals(12, result.getX());
        assertEquals(2, result.getY());
        assertEquals(List.of(), result.getContainers());
        assertEquals(List.of(), result.getDoors());
        assertEquals(List.of(), result.getOtherObjects());

        verify(wasteRoomRepository, times(2)).save(any(WasteRoom.class));
    }

    @Test
    void saveWasteRoom_ValidRequest_NullLists() {
        WasteRoomRequest request = new WasteRoomRequest(10, 5, 12, 2, null, null, null, 1L, "Name");

        Property property = new Property();
        property.setId(1L);

        WasteRoom savedWasteRoom = new WasteRoom();
        savedWasteRoom.setProperty(property);
        savedWasteRoom.setLength(10);
        savedWasteRoom.setWidth(5);
        savedWasteRoom.setX(12);
        savedWasteRoom.setY(2);
        savedWasteRoom.setContainers(null);
        savedWasteRoom.setDoors(null);
        savedWasteRoom.setOtherObjects(null);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(wasteRoomRepository.save(any(WasteRoom.class))).thenReturn(savedWasteRoom);

        WasteRoomDTO result = wasteRoomService.saveWasteRoom(request);

        assertNotNull(result);
        assertEquals(1L, result.getPropertyId());
        assertEquals(10, result.getLength());
        assertEquals(5, result.getWidth());
        assertEquals(12, result.getX());
        assertEquals(2, result.getY());
        assertNull(result.getContainers());
        assertNull(result.getDoors());
        assertNull(result.getOtherObjects());

        verify(wasteRoomRepository, times(2)).save(any(WasteRoom.class));
    }

    @Test
    void saveWasteRoom_InvalidRequest_WrongPropertyId() {
        WasteRoomRequest request = new WasteRoomRequest(10, 5, 12, 2, null, null, null, 10203L, "Name");

        when(propertyRepository.findById(10203L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            wasteRoomService.saveWasteRoom(request);
        });

        assertEquals("Property with id: 10203 can't be found", exception.getMessage());
        verify(wasteRoomRepository, never()).save(any(WasteRoom.class));
    }

    @Test
    void getWasteRoomById_ValidRequest_ReturnsDTO() {
        Property property = new Property();
        property.setId(1L);

        WasteRoom savedWasteRoom = new WasteRoom();
        savedWasteRoom.setProperty(property);
        savedWasteRoom.setLength(10);
        savedWasteRoom.setWidth(5);
        savedWasteRoom.setX(12);
        savedWasteRoom.setY(2);
        savedWasteRoom.setContainers(List.of());
        savedWasteRoom.setDoors(List.of());
        savedWasteRoom.setOtherObjects(List.of());

        when(wasteRoomRepository.findById(1L)).thenReturn(Optional.of(savedWasteRoom));

        WasteRoomDTO result = wasteRoomService.getWasteRoomById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getPropertyId());
        assertEquals(10, result.getLength());
        assertEquals(5, result.getWidth());
        assertEquals(12, result.getX());
        assertEquals(2, result.getY());
        assertEquals(List.of(), result.getContainers());
        assertEquals(List.of(), result.getDoors());
        assertEquals(List.of(), result.getOtherObjects());

        verify(wasteRoomRepository, times(1)).findById(1L);
    }

    @Test
    void getWasteRoomById_InvalidRequest_WrongWasteRoomID() {
        Long wrongId = 10L;

        when(wasteRoomRepository.findById(wrongId)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            wasteRoomService.getWasteRoomById(wrongId);
        });

        assertEquals("Waste room not found with id: 10", exception.getMessage());
        verify(wasteRoomRepository, times(1)).findById(wrongId);
    }

    @Test
    void getWasteRoomsByPropertyId_ValidRequest_ReturnWasteRoomList() {
        Property property = new Property();
        property.setId(1L);

        WasteRoom savedWasteRoom1 = new WasteRoom();
        savedWasteRoom1.setProperty(property);
        savedWasteRoom1.setLength(10);
        savedWasteRoom1.setWidth(5);
        savedWasteRoom1.setX(12);
        savedWasteRoom1.setY(2);
        savedWasteRoom1.setContainers(List.of());
        savedWasteRoom1.setDoors(List.of());
        savedWasteRoom1.setOtherObjects(List.of());

        WasteRoom savedWasteRoom2 = new WasteRoom();
        savedWasteRoom2.setProperty(property);
        savedWasteRoom2.setLength(10);
        savedWasteRoom2.setWidth(5);
        savedWasteRoom2.setX(12);
        savedWasteRoom2.setY(2);
        savedWasteRoom2.setContainers(List.of());
        savedWasteRoom2.setDoors(List.of());
        savedWasteRoom2.setOtherObjects(List.of());

        List<WasteRoom> wasteRooms = List.of(savedWasteRoom1, savedWasteRoom2);

        when(wasteRoomRepository.findByPropertyId(1L)).thenReturn(wasteRooms);

        List<WasteRoomDTO> result = wasteRoomService.getWasteRoomsByPropertyId(1L);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).getPropertyId());
        assertEquals(1L, result.get(1).getPropertyId());

        verify(wasteRoomRepository, times(1)).findByPropertyId(1L);
    }

    @Test
    void getWasteRoomsByPropertyId_ValidRequest_ReturnEmptyList() {
        Long id = 10L;

        when(wasteRoomRepository.findByPropertyId(id)).thenReturn(List.of());

        List<WasteRoomDTO> result = wasteRoomService.getWasteRoomsByPropertyId(id);

        assertEquals(0,result.size());
        verify(wasteRoomRepository, times(1)).findByPropertyId(id);
    }

    @Test
    void updateWasteRoom_ValidRequest_ReturnUpdatedDTO() {
        Long wasteRoomId = 1L;
        WasteRoomRequest request = new WasteRoomRequest(12.5, 8.0, 1.0, 2.0, List.of(), List.of(), List.of(), 1L, "Name");

        Property property = new Property();
        property.setId(1L);

        WasteRoom existingRoom = new WasteRoom();
        existingRoom.setId(wasteRoomId);
        existingRoom.setProperty(property);
        existingRoom.setLength(10);
        existingRoom.setWidth(5);
        existingRoom.setX(0);
        existingRoom.setY(0);
        existingRoom.setContainers(new ArrayList<>());
        existingRoom.setDoors(new ArrayList<>());
        existingRoom.setOtherObjects(new ArrayList<>());

        WasteRoom updatedRoom = new WasteRoom();
        updatedRoom.setId(wasteRoomId);
        updatedRoom.setProperty(property);
        updatedRoom.setLength(request.getLength());
        updatedRoom.setWidth(request.getWidth());
        updatedRoom.setX(request.getX());
        updatedRoom.setY(request.getY());
        updatedRoom.setContainers(List.of());
        updatedRoom.setDoors(List.of());
        updatedRoom.setOtherObjects(List.of());

        when(wasteRoomRepository.findById(wasteRoomId)).thenReturn(Optional.of(existingRoom));
        when(propertyRepository.findById(request.getPropertyId())).thenReturn(Optional.of(property));
        when(wasteRoomRepository.save(any(WasteRoom.class))).thenReturn(updatedRoom);

        WasteRoomDTO result = wasteRoomService.updateWasteRoom(wasteRoomId, request);

        assertNotNull(result);
        assertEquals(12.5, result.getLength());
        assertEquals(8.0, result.getWidth());
        assertEquals(1.0, result.getX());
        assertEquals(2.0, result.getY());

        verify(wasteRoomRepository, times(2)).save(any(WasteRoom.class));
    }

    @Test
    void updateWasteRoom_ValidRequest_ReturnChangedContainers() {
        Long wasteRoomId = 1L;

        List<ContainerPositionRequest> newContainers = List.of(new ContainerPositionRequest(1L, 5, 5, 0, false));
        WasteRoomRequest request = new WasteRoomRequest(12.5, 8.0, 1.0, 2.0, List.of(), newContainers, List.of(), 1L, "Name");

        Property property = new Property();
        property.setId(1L);

        WasteRoom existingRoom = new WasteRoom();
        existingRoom.setId(wasteRoomId);
        existingRoom.setProperty(property);
        existingRoom.setLength(10);
        existingRoom.setWidth(5);
        existingRoom.setX(0);
        existingRoom.setY(0);
        existingRoom.setContainers(new ArrayList<>(List.of(new ContainerPosition(), new ContainerPosition(), new ContainerPosition())));
        existingRoom.setDoors(new ArrayList<>());
        existingRoom.setOtherObjects(new ArrayList<>());

        ContainerType containerType = new ContainerType();
        containerType.setId(1L);

        WasteRoom updatedRoom = new WasteRoom();
        updatedRoom.setId(wasteRoomId);
        updatedRoom.setProperty(property);
        updatedRoom.setLength(request.getLength());
        updatedRoom.setWidth(request.getWidth());
        updatedRoom.setX(request.getX());
        updatedRoom.setY(request.getY());
        updatedRoom.setContainers(new ArrayList<>(List.of(new ContainerPosition())));
        updatedRoom.setDoors(new ArrayList<>());
        updatedRoom.setOtherObjects(new ArrayList<>());

        when(wasteRoomRepository.findById(wasteRoomId)).thenReturn(Optional.of(existingRoom));
        when(propertyRepository.findById(request.getPropertyId())).thenReturn(Optional.of(property));
        when(wasteRoomRepository.save(any(WasteRoom.class))).thenReturn(updatedRoom);

        WasteRoomDTO result = wasteRoomService.updateWasteRoom(wasteRoomId, request);

        assertNotNull(result);
        assertEquals(12.5, result.getLength());
        assertEquals(8.0, result.getWidth());
        assertEquals(1.0, result.getX());
        assertEquals(2.0, result.getY());
        assertEquals(1, result.getContainers().size());
        assertEquals(0, result.getDoors().size());
        assertEquals(0, result.getOtherObjects().size());

        verify(wasteRoomRepository, times(2)).save(any(WasteRoom.class));
    }

    @Test
    void updateWasteRoom_InvalidRequest_WrongWasteRoomID() {
        Long wrongWasteRoomId = 99L;

        WasteRoomRequest request = new WasteRoomRequest(12.5, 8.0, 1.0, 2.0, List.of(), List.of(), List.of(), 1L,  "Name");

        when(wasteRoomRepository.findById(wrongWasteRoomId)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            wasteRoomService.updateWasteRoom(wrongWasteRoomId, request);
        });

        assertEquals("WasteRoom with id: 99 can't be found", exception.getMessage());

        verify(wasteRoomRepository, times(1)).findById(wrongWasteRoomId);
        verify(wasteRoomRepository, never()).save(any(WasteRoom.class));
    }

    @Test
    void deleteWasteRoom_ValidRequest_DeleteSuccessfully() {
        Long wasteRoomId = 1L;

        Property property = new Property();
        property.setId(10L);
        property.setAddress("Test Address");


        WasteRoom existingRoom = new WasteRoom();
        existingRoom.setId(wasteRoomId);
        existingRoom.setProperty(property);

        when(wasteRoomRepository.findById(wasteRoomId)).thenReturn(Optional.of(existingRoom));
        doNothing().when(wasteRoomRepository).delete(existingRoom);

        wasteRoomService.deleteWasteRoom(wasteRoomId);

        verify(wasteRoomRepository, times(1)).findById(wasteRoomId);
        verify(wasteRoomRepository, times(1)).delete(existingRoom);
    }

    @Test
    void deleteWasteRoom_InvalidRequest_WrongWasteRoomId() {
        Long wrongId = 99L;

        when(wasteRoomRepository.findById(wrongId)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            wasteRoomService.deleteWasteRoom(wrongId);
        });

        assertEquals("WasteRoom with id: 99 can't be found", exception.getMessage());
        verify(wasteRoomRepository, never()).delete(any(WasteRoom.class));
    }

    @Test
    void getActiveRoom_ValidRequest_ReturnsImgDTO() {
        Long propertyId = 1L;

        WasteRoom room = new WasteRoom();
        room.setThumbnailUrl("https://image.url/room.png");

        when(wasteRoomRepository.findByPropertyIdAndIsActiveTrue(propertyId))
                .thenReturn(Optional.of(room));

        WasteRoomImgDTO result = wasteRoomService.getActiveRoom(propertyId);

        assertNotNull(result);
        assertEquals("https://image.url/room.png", result.getThumbnailUrl());

        verify(wasteRoomRepository, times(1))
                .findByPropertyIdAndIsActiveTrue(propertyId);
    }

    @Test
    void getActiveRoom_NoActiveRoom_ThrowsException() {
        Long propertyId = 2L;

        when(wasteRoomRepository.findByPropertyIdAndIsActiveTrue(propertyId))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                wasteRoomService.getActiveRoom(propertyId)
        );

        assertEquals("No active waste room found", exception.getMessage());

        verify(wasteRoomRepository, times(1))
                .findByPropertyIdAndIsActiveTrue(propertyId);
    }

    @Test
    void getActiveRoom_RepositoryFailure_ThrowsException() {
        Long propertyId = 3L;

        when(wasteRoomRepository.findByPropertyIdAndIsActiveTrue(propertyId))
                .thenThrow(new RuntimeException("Database down"));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                wasteRoomService.getActiveRoom(propertyId)
        );

        assertEquals("Database down", exception.getMessage());

        verify(wasteRoomRepository, times(1))
                .findByPropertyIdAndIsActiveTrue(propertyId);
    }
}