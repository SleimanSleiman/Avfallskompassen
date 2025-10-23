package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.*;
import com.avfallskompassen.exception.ResourceNotFoundException;
import com.avfallskompassen.model.*;
import com.avfallskompassen.repository.*;
import com.avfallskompassen.services.WasteRoomService;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class WasteRoomServiceImpl implements WasteRoomService {
    private final WasteRoomRepository wasteRoomRepository;
    private final PropertyRepository propertyRepository;
    private final ContainerTypeRepository containerTypeRepository;
    private final DoorRepository doorRepository;

    public WasteRoomServiceImpl(
            WasteRoomRepository wasteRoomRepository,
            PropertyRepository propertyRepository,
            ContainerTypeRepository containerTypeRepository,
            DoorRepository doorRepository
    ) {
        this.wasteRoomRepository = wasteRoomRepository;
        this.propertyRepository = propertyRepository;
        this.containerTypeRepository = containerTypeRepository;
        this.doorRepository = doorRepository;
    }

    /**
     * Processes the data from a request to save a waste room and saves it in the database
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
        List<DoorPosition> doorPositions = convertDoorRequest(request.getDoors(), wasteRoom);
        wasteRoom.setContainers(containerPositions);
        wasteRoom.setDoors(doorPositions);

        WasteRoom savedRoom = wasteRoomRepository.save(wasteRoom);
        return WasteRoomDTO.fromEntity(savedRoom);
    }

    /**
     * Collects a specific waste room based on an id
     * @param id The id of the waste room
     * @return A DTO containing the information about the waste room from the database
     */
    @Override
    public WasteRoomDTO getWasteRoomById(Long id) {
        WasteRoom wasteRoom = wasteRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Waste room not found with id: " + id));

        return WasteRoomDTO.fromEntity(wasteRoom);
    }

    /**
     * Collects list of waste rooms that are connected to a certain property
     * @param propertyId The id of the property whose waste rooms are to be collected
     * @return A list of DTO containing the information about the waste room from the database
     */
    @Override
    public List<WasteRoomDTO> getWasteRoomsByPropertyId(Long propertyId) {
        List<WasteRoom> rooms = wasteRoomRepository.findByPropertyId(propertyId);

        return rooms.stream()
                .map(WasteRoomDTO::fromEntity)
                .toList();
    }

    /**
     * Helper method that converts the data from a request containing information about containers. Transfers
     * the data from {@link ContainerPositionRequest} to {@link ContainerPosition} which must be done before saving
     * the containers in the database
     * @param containers A list containing requests of containers
     * @param wasteRoom The waste room to be altered or created
     * @return A list of {@link ContainerPosition} with the appropriate data needed before saving it in database
     */
    private List<ContainerPosition> convertContainerRequest(List<ContainerPositionRequest> containers, WasteRoom wasteRoom) {
        if (containers == null) {
            return Collections.emptyList();
        }
        List<ContainerPosition> containerPositions = new ArrayList<>();

        for (ContainerPositionRequest request : containers) {
            ContainerPosition container = new ContainerPosition();
            container.setContainerType(containerTypeRepository.findById(request.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Container with ID: " + request.getId() + " can't be found"
                    )));
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
     * the data from {@link DoorPositionRequest} to {@link DoorPosition} which must be done before saving
     * the doors in the database
     * @param doors A list containing requests of doors
     * @param wasteRoom The waste room to be altered or created
     * @returnA list of {@link DoorPosition} with the appropriate data needed before saving it in database
     */
    private List<DoorPosition> convertDoorRequest(List<DoorPositionRequest> doors, WasteRoom wasteRoom) {
        if (doors == null) {
            return Collections.emptyList();
        }

        List<DoorPosition> doorPositions = new ArrayList<>();

        for (DoorPositionRequest request : doors) {
            DoorPosition door = new DoorPosition();
            door.setDoor(doorRepository.findById(request.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Door with ID: " + request.getId() + " can't be found"
                    )));
            door.setX(request.getX());
            door.setY(request.getY());
            door.setAngle(request.getAngle());
            door.setWasteRoom(wasteRoom);

            doorPositions.add(door);
        }

        return doorPositions;
    }

    /**
     * Collects a property from the database and returns it.
     * @param id The id of the property to be collected
     * @return The property matching the id
     */
    private Property findPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Property with id: " + id + " can't be found"
                ));
    }
}