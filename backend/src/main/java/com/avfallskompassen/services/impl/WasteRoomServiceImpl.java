package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.*;
import com.avfallskompassen.dto.request.ContainerPositionRequest;
import com.avfallskompassen.dto.request.DoorRequest;
import com.avfallskompassen.dto.request.WasteRoomRequest;
import com.avfallskompassen.exception.ResourceNotFoundException;
import com.avfallskompassen.model.*;
import com.avfallskompassen.repository.*;
import com.avfallskompassen.services.ContainerService;
import com.avfallskompassen.services.WasteRoomService;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Service class for handling waste rooms.
 * Contains methods such as creating, updating, retrieving and deleting waste rooms.
 * Uses transaction on some methods since the methods uses several tables, to ensure database consistency.
 * @author Anton Persson
 */
@Service
public class WasteRoomServiceImpl implements WasteRoomService {
    private final WasteRoomRepository wasteRoomRepository;
    private final PropertyRepository propertyRepository;
    private final ContainerService containerService;

    public WasteRoomServiceImpl(
            WasteRoomRepository wasteRoomRepository,
            PropertyRepository propertyRepository,
            ContainerService containerService
    ) {
        this.wasteRoomRepository = wasteRoomRepository;
        this.propertyRepository = propertyRepository;
        this.containerService = containerService;
    }

    /**
     * Processes the data from a request to save a waste room and saves it in the database
     *
     * @param request The request containing the information about the waste room
     * @return A DTO containing the information about the waste room that was stored in the database
     */
    @Override
    @Transactional
    public WasteRoomDTO saveWasteRoom(WasteRoomRequest request) {
        WasteRoom wasteRoom = new WasteRoom();
        wasteRoom.setLength(request.getLength());
        wasteRoom.setWidth(request.getWidth());
        wasteRoom.setX(request.getX());
        wasteRoom.setY(request.getY());
        wasteRoom.setProperty(findPropertyById(request.getPropertyId()));

        List<ContainerPosition> containerPositions = convertContainerRequest(request.getContainers(), wasteRoom);
        List<Door> doorPositions = convertDoorRequest(request.getDoors(), wasteRoom);
        wasteRoom.setContainers(containerPositions);
        wasteRoom.setDoors(doorPositions);

        if (request.getName() != null) {
            wasteRoom.setName(request.getName());
        }

        WasteRoom savedRoom = wasteRoomRepository.save(wasteRoom);
        saveThumbnail(request.getThumbnailBase64(), savedRoom.getId(), savedRoom);
        savedRoom = wasteRoomRepository.save(savedRoom);

        return WasteRoomDTO.fromEntity(savedRoom);
    }

    /**
     * Collects a specific waste room based on an id
     *
     * @param id The id of the waste room
     * @return A DTO containing the information about the waste room from the database
     */
    @Override
    @Deprecated
    public WasteRoomDTO getWasteRoomById(Long id) {
        WasteRoom wasteRoom = wasteRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Waste room not found with id: " + id));

        return mapWasteRoomToDTO(wasteRoom);
    }

    /**
     * Collects list of waste rooms that are connected to a certain property
     *
     * @param propertyId The id of the property whose waste rooms are to be collected
     * @return A list of DTO containing the information about the waste room from the database
     */
    @Override
    public List<WasteRoomDTO> getWasteRoomsByPropertyId(Long propertyId) {
        List<WasteRoom> rooms = wasteRoomRepository.findByPropertyId(propertyId);

        return rooms.stream()
                .map(this::mapWasteRoomToDTO)
                .toList();
    }

    /**
     * Collects list of waste rooms that are connected to a certain property
     *
     * @param propertyId The id of the property whose waste rooms are to be collected
     * @return A list of DTO containing the information about the waste room from the database
     */
    @Override
    public WasteRoomImgDTO getActiveWasteRoomByPropertyId(Long propertyId) {
        WasteRoom room = wasteRoomRepository.findByPropertyId(propertyId);

        WasteRoomImgDTO dto = new WasteRoomImgDTO(room.getThumbnailUrl());
        return dto;
    }

    /**
     * Processes the data from a request to update a waste room and saves the updated version in the database
     *
     * @param wasteRoomId Id to the waste room to be updated
     * @param request     The request containing the information about the waste room
     * @return A DTO containing the information about the waste room that was updated in the database
     */
    @Override
    @Transactional
    public WasteRoomDTO updateWasteRoom(Long wasteRoomId, WasteRoomRequest request) {
        WasteRoom wasteRoom = findWasteRoomById(wasteRoomId);

        wasteRoom.setLength(request.getLength());
        wasteRoom.setWidth(request.getWidth());
        wasteRoom.setX(request.getX());
        wasteRoom.setY(request.getY());
        wasteRoom.setProperty(findPropertyById(request.getPropertyId()));

        if (request.getName() != null) {
            wasteRoom.setName(request.getName());
        }

        wasteRoom.getContainers().clear();
        wasteRoom.getContainers().addAll(
                convertContainerRequest(request.getContainers(), wasteRoom)
        );

        wasteRoom.getDoors().clear();
        wasteRoom.getDoors().addAll(
                convertDoorRequest(request.getDoors(), wasteRoom)
        );

        WasteRoom updated = wasteRoomRepository.save(wasteRoom);

        //Save thumbnail
        saveThumbnail(request.getThumbnailBase64(), wasteRoomId, updated);

        updated = wasteRoomRepository.save(updated);
        return WasteRoomDTO.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteWasteRoom(Long wasteRoomId) {
        WasteRoom wasteRoom = findWasteRoomById(wasteRoomId);
        wasteRoomRepository.delete(wasteRoom);
    }

    /**
     * Helper method that converts the data from a request containing information about containers. Transfers
     * the data from {@link ContainerPositionRequest} to {@link ContainerPosition} which must be done before saving
     * the containers in the database
     *
     * @param containers A list containing requests of containers
     * @param wasteRoom  The waste room to be altered or created
     * @return A list of {@link ContainerPosition} with the appropriate data needed before saving it in database
     */
    private List<ContainerPosition> convertContainerRequest(List<ContainerPositionRequest> containers, WasteRoom wasteRoom) {
        if (containers == null) {
            return Collections.emptyList();
        }

        List<ContainerPosition> containerPositions = new ArrayList<>();

        for (ContainerPositionRequest request : containers) {
            ContainerPosition container = new ContainerPosition();
            container.setContainerPlan(containerService.getContainerPlanById(request.getId()));
            container.setX(request.getX());
            container.setY(request.getY());
            container.setAngle(request.getAngle());
            container.setWasteRoom(wasteRoom);
            containerPositions.add(container);
        }

        return containerPositions;
    }

    /**
     * Helper method that converts the data from a request containing information about doors. Transfers
     * the data from {@link DoorRequest} to {@link Door} which must be done before saving
     * the doors in the database
     *
     * @param doors     A list containing requests of doors
     * @param wasteRoom The waste room to be altered or created
     * @return A list of {@link Door} with the appropriate data needed before saving it in database
     */
    private List<Door> convertDoorRequest(List<DoorRequest> doors, WasteRoom wasteRoom) {
        if (doors == null || doors.isEmpty()) {
            return Collections.emptyList();
        }

        List<Door> doorPositions = new ArrayList<>();

        for (DoorRequest request : doors) {
            Door door = new Door();
            door.setWidth(request.getWidth());
            door.setX(request.getX());
            door.setY(request.getY());
            door.setAngle(request.getAngle());
            door.setWasteRoom(wasteRoom);
            door.setWall(request.getWall());
            door.setSwingDirection(request.getSwingDirection());

            doorPositions.add(door);
        }

        return doorPositions;
    }

    /**
     * Collects a property from the database and returns it.
     *
     * @param id The id of the property to be collected
     * @return The property matching the id
     */
    private Property findPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Property with id: " + id + " can't be found"
                ));
    }

    /**
     * Collects a waste room from the database and returns it
     *
     * @param id the id of the waste room to be collected
     * @return The waste room matching the id
     */
    private WasteRoom findWasteRoomById(Long id) {
        return wasteRoomRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException(
                        "WasteRoom with id: " + id + " can't be found"
                ));
    }

    /**
     * Maps a {@link WasteRoom} to a {@link WasteRoomDTO}
     * @param entity The waste rooms to be mapped
     * @return DTO containing info from waste room
     */
    private WasteRoomDTO mapWasteRoomToDTO(WasteRoom entity) {
        List<ContainerPositionDTO> containers =
                containerService.getContainersByWasteRoomId(entity.getId());

        List<DoorDTO> doors = entity.getDoors() != null
                ? entity.getDoors().stream().map(DoorDTO::fromEntity).toList()
                : new ArrayList<>();

        WasteRoomDTO dto = new WasteRoomDTO(
                entity.getProperty().getId(),
                entity.getLength(),
                entity.getWidth(),
                entity.getX(),
                entity.getY(),
                containerService.getContainersByWasteRoomId(entity.getId()),
                entity.getDoors() != null
                        ? entity.getDoors().stream().map(DoorDTO::fromEntity).toList()
                        : new ArrayList<>(),
                entity.getId(),
                entity.getName(),
                entity.getVersionNumber(),
                entity.getCreatedBy(),
                entity.getAdminUsername(),
                entity.getVersionName(),
                entity.getIsActive(),
                entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null,
                entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null
        );

        dto.setThumbnailUrl(entity.getThumbnailUrl());
        return dto;
    }

    private void saveThumbnail(String base64, Long roomId, WasteRoom room) {
        if (base64 == null || base64.isEmpty()) {
            return;
        }

        try {
            String clean = base64.replaceAll("\\s", "");
            String[] parts = clean.split(",");
            String imageBase64 = parts.length > 1 ? parts[1] : parts[0];
            byte[] decodedBytes = java.util.Base64.getDecoder().decode(imageBase64);

            // Save to folder
            File folder = new File("uploads/wasterooms/");
            if (!folder.exists()) {
                folder.mkdirs();
            }

            File file = new File(folder, roomId + ".png");

            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(decodedBytes);
            }

            room.setThumbnailUrl("/images/wasterooms/" + roomId + ".png");
        }
        catch (Exception e) {
            throw new RuntimeException("Failed to save thumbnail", e);
        }
    }

    /**
     * Saves an admin version of a waste room. Creates a new waste room entry with version info.
     * If versionToReplace is specified, marks that version as inactive.
     *
     * @param propertyId The id of the property
     * @param roomName The name of the waste room
     * @param request The request containing the waste room data and version info
     * @return A DTO containing the information about the newly created version
     */
    @Override
    @Transactional
    public WasteRoomDTO saveAdminVersion(Long propertyId, String roomName, WasteRoomRequest request) {
        Property property = findPropertyById(propertyId);
        
        // Get all existing versions for this room
        List<WasteRoom> existingVersions = wasteRoomRepository
                .findByPropertyIdAndNameOrderByVersionNumberAsc(propertyId, roomName);
        
        // Calculate next version number
        int nextVersionNumber = existingVersions.stream()
                .mapToInt(WasteRoom::getVersionNumber)
                .max()
                .orElse(0) + 1;
        
        // Create new version
        WasteRoom newVersion = new WasteRoom();
        newVersion.setLength(request.getLength());
        newVersion.setWidth(request.getWidth());
        newVersion.setX(request.getX());
        newVersion.setY(request.getY());
        newVersion.setProperty(property);
        newVersion.setName(roomName);
        newVersion.setVersionNumber(nextVersionNumber);
        newVersion.setCreatedBy("admin");
        newVersion.setAdminUsername(request.getAdminUsername());
        newVersion.setVersionName(request.getVersionName());
        newVersion.setIsActive(false); // Will be set to active after handling versionToReplace
        
        List<ContainerPosition> containerPositions = convertContainerRequest(request.getContainers(), newVersion);
        List<Door> doorPositions = convertDoorRequest(request.getDoors(), newVersion);
        newVersion.setContainers(containerPositions);
        newVersion.setDoors(doorPositions);
        
        // Handle version replacement or max versions
        if (request.getVersionToReplace() != null) {
            // Mark the specified version as inactive (soft delete)
            existingVersions.stream()
                    .filter(v -> v.getVersionNumber() == request.getVersionToReplace())
                    .findFirst()
                    .ifPresent(v -> {
                        v.setIsActive(false);
                        wasteRoomRepository.save(v);
                    });
        }
        
        // Set all other versions to inactive
        existingVersions.forEach(v -> {
            v.setIsActive(false);
            wasteRoomRepository.save(v);
        });
        
        // Set new version as active
        newVersion.setIsActive(true);
        WasteRoom savedRoom = wasteRoomRepository.save(newVersion);
        
        return mapWasteRoomToDTO(savedRoom);
    }

    /**
     * Gets all versions of a waste room for a specific property and room name
     *
     * @param propertyId The id of the property
     * @param roomName The name of the waste room
     * @return A list of DTOs containing all versions
     */
    @Override
    public List<WasteRoomDTO> getAllVersionsByPropertyAndName(Long propertyId, String roomName) {
        List<WasteRoom> versions = wasteRoomRepository
                .findByPropertyIdAndNameOrderByVersionNumberAsc(propertyId, roomName);
        
        return versions.stream()
                .map(this::mapWasteRoomToDTO)
                .toList();
    }
}