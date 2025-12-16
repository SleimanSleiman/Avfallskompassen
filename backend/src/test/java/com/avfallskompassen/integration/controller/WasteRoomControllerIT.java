package com.avfallskompassen.integration.controller;

import com.avfallskompassen.dto.WasteRoomDTO;
import com.avfallskompassen.dto.request.ContainerPositionRequest;
import com.avfallskompassen.dto.request.DoorRequest;
import com.avfallskompassen.dto.request.WasteRoomRequest;
import com.avfallskompassen.model.*;
import com.avfallskompassen.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
@Transactional
public class WasteRoomControllerIT {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MunicipalityRepository municipalityRepository;

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    @Autowired
    private MunicipalityServiceRepository municipalityServiceRepository;

    @Autowired
    private ContainerTypeRepository containerTypeRepository;

    @Autowired
    private ContainerPlanRepository containerPlanRepository;

    @Autowired
    private WasteRoomRepository wasteRoomRepository;

    @Autowired
    private LockTypeRepository lockTypeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private WasteRoomRequest wasteRoomRequest;

    private Property property;
    private User user;
    private LockType lockType;
    private ContainerPlan containerPlan;

    @BeforeEach
    void setUp() {
        buildEntities();
        buildWasteRoomRequest();
    }

    @Test
    void createWasteRoom_savesRoomInDBAllFields() throws Exception {
        String jsonRequest = objectMapper.writeValueAsString(wasteRoomRequest);
        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isOk());

        assertThat(wasteRoomRepository.findAll()).hasSize(1);
        WasteRoom savedRoom = wasteRoomRepository.findAll().get(0);
        assertThat(savedRoom.getProperty().getId()).isEqualTo(property.getId());
        assertThat(savedRoom.getLength()).isEqualTo(8.0);
        assertThat(savedRoom.getWidth()).isEqualTo(8.0);
        assertThat(savedRoom.getDoors().get(0).getX()).isEqualTo(wasteRoomRequest.getDoors().get(0).getX());
        assertThat(savedRoom.getName()).isEqualTo(wasteRoomRequest.getName());
        assertThat(savedRoom.getContainers().get(0).getX()).isEqualTo(wasteRoomRequest.getContainers().get(0).getX());
    }

    @Test
    void createWasteRoom_savesRoomInDBRequiredFields() throws Exception {
        wasteRoomRequest.setName(null);
        wasteRoomRequest.setContainers(null);
        String jsonRequest = objectMapper.writeValueAsString(wasteRoomRequest);
        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isOk());

        assertThat(wasteRoomRepository.findAll()).hasSize(1);
        WasteRoom savedRoom = wasteRoomRepository.findAll().get(0);
        assertThat(savedRoom.getProperty().getId()).isEqualTo(property.getId());
        assertThat(savedRoom.getLength()).isEqualTo(8.0);
        assertThat(savedRoom.getWidth()).isEqualTo(8.0);
        assertThat(savedRoom.getDoors().get(0).getX()).isEqualTo(wasteRoomRequest.getDoors().get(0).getX());
        assertThat(savedRoom.getName()).isEqualTo(null);
        assertThat(savedRoom.getContainers()).isEmpty();
    }

    @Test
    void createWasteRoom_nullValueOnNotNullField() throws Exception {
        wasteRoomRequest.setPropertyId(null);
        String jsonRequest = objectMapper.writeValueAsString(wasteRoomRequest);
        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createWasteRoom_wrongPropertyId() throws Exception {
        wasteRoomRequest.setPropertyId(100000L);
        String jsonRequest = objectMapper.writeValueAsString(wasteRoomRequest);
        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isNotFound());
    }

    @Test
    void createWasteRoom_tooBigLengthOnRoom() throws Exception {
        wasteRoomRequest.setLength(100);
        String jsonRequest = objectMapper.writeValueAsString(wasteRoomRequest);
        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createWasteRoom_textOnLengthRoom() throws Exception {
        String jsonRequest = "{ " +
                "\"propertyId\": " + property.getId() + "," +
                "\"length\": \"slköejf\"," + // Should be number but is string now
                "\"width\": 8.0," +
                "\"x\": 1.0," +
                "\"y\": 2.0" +
                "}";

        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateWasteRoom_savesUpdatedFields() throws Exception {
        String createJson = objectMapper.writeValueAsString(wasteRoomRequest);

        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isOk());

        WasteRoom existingRoom = wasteRoomRepository.findAll().get(0);

        WasteRoomRequest updateRequest = new WasteRoomRequest();
        updateRequest.setPropertyId(property.getId());
        updateRequest.setLength(9.0);
        updateRequest.setWidth(12.0);
        updateRequest.setName("Uppdatera rummet");
        updateRequest.setDoors(List.of(new DoorRequest(2.0, 90, 60,0, "bottom", "inward")));
        updateRequest.setContainers(List.of(new ContainerPositionRequest(containerPlan.getId(), 70, 80, 100)));

        String updateJson = objectMapper.writeValueAsString(updateRequest);

        mockMvc.perform(put("/api/wasterooms/{id}", existingRoom.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk());

        WasteRoom updatedRoom = wasteRoomRepository.findById(existingRoom.getId()).orElseThrow();

        assertThat(updatedRoom.getLength()).isEqualTo(updateRequest.getLength());
        assertThat(updatedRoom.getWidth()).isEqualTo(updateRequest.getWidth());
        assertThat(updatedRoom.getName()).isEqualTo(updateRequest.getName());
        assertThat(updatedRoom.getDoors()).hasSize(1);
        assertThat(updatedRoom.getDoors().get(0).getX()).isEqualTo(updateRequest.getDoors().get(0).getX());
        assertThat(updatedRoom.getContainers()).hasSize(1);
        assertThat(updatedRoom.getContainers().get(0).getX()).isEqualTo(updateRequest.getContainers().get(0).getX());
    }

    @Test
    void updateWasteRoom_updateNonExistingRoom() throws Exception {
        String updateJson = objectMapper.writeValueAsString(wasteRoomRequest);

        mockMvc.perform(put("/api/wasterooms/{id}", 100L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteWasteRoom_deleteExistingRoom() throws Exception {
        String createJson = objectMapper.writeValueAsString(wasteRoomRequest);

        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isOk());

        WasteRoom existingRoom = wasteRoomRepository.findAll().get(0);

        mockMvc.perform(delete("/api/wasterooms/{id}", existingRoom.getId()))
                .andExpect(status().isNoContent());

        assertThat(wasteRoomRepository.findById(existingRoom.getId())).isEmpty();
    }

    @Test // TODO Fixa så att man bara kan ta bort sina egna rum, och skriv sedan ett test för detta
    void deleteWasteRoom_deleteNonExistingRoom() throws Exception {
        mockMvc.perform(delete("/api/wasterooms/{id}", 100L))
                .andExpect(status().isNotFound());
    }

    @Test
    void getWasteRoomsByPropertyId_correctPropertyId() throws Exception {
        String createJson = objectMapper.writeValueAsString(wasteRoomRequest);
        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isOk());

        WasteRoom existingRoom = wasteRoomRepository.findAll().get(0);

        String responseJson = mockMvc.perform(get("/api/properties/{propertyId}/wasterooms", property.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        List<WasteRoomDTO> rooms = objectMapper.readValue(
                responseJson,
                objectMapper.getTypeFactory().constructCollectionType(List.class, WasteRoomDTO.class)
        );

        assertThat(rooms).hasSize(1);
        WasteRoomDTO room = rooms.get(0);
        assertThat(room.getWasteRoomId()).isEqualTo(existingRoom.getId());
        assertThat(room.getName()).isEqualTo(existingRoom.getName());
        assertThat(room.getLength()).isEqualTo(existingRoom.getLength());
        assertThat(room.getWidth()).isEqualTo(existingRoom.getWidth());
    }

    @Test
    void getWasteRoomsByPropertyId_wrongPropertyId() throws Exception {
        String createJson = objectMapper.writeValueAsString(wasteRoomRequest);
        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/properties/{propertyId}/wasterooms", 100L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    private void buildEntities() {
        user = new User("Kent", "Agent");
        userRepository.save(user);

        lockType = new LockType("Fysisk nyckel", new BigDecimal(100));
        lockTypeRepository.save(lockType);

        property = new Property("Testgatan 15", 75, lockType, 15.0, user);
        propertyRepository.save(property);

        Municipality municipality = municipalityRepository.save(
                new Municipality("Malmö")
        );

        ServiceType serviceType = serviceTypeRepository.save(
                new ServiceType("Restavfall")
        );

        MunicipalityService municipalityService = municipalityServiceRepository.save(
                new MunicipalityService(municipality, serviceType)
        );

        ContainerType containerType = containerTypeRepository.save(
                new ContainerType("Restavfall", 1, 100, 100, 150)
        );

        containerPlan = containerPlanRepository.save(
                new ContainerPlan(
                        municipalityService,
                        containerType,
                        12,
                        new BigDecimal("200.00"),
                        null,
                        null
                )
        );
    }

    private void buildWasteRoomRequest() {
        WasteRoomRequest request = new WasteRoomRequest();
        request.setPropertyId(property.getId());
        request.setLength(8.0);
        request.setWidth(8.0);
        request.setX(1.0);
        request.setY(2.0);
        request.setName("Nuvarande rum");
        request.setContainers(List.of(new ContainerPositionRequest(containerPlan.getId(), 50, 50, 90)));
        request.setDoors(List.of(new DoorRequest(1.2, 80, 50,0, "top","outward")));
        wasteRoomRequest = request;
    }
}