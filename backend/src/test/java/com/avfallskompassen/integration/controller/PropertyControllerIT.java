package com.avfallskompassen.integration.controller;


import com.avfallskompassen.dto.UserStatsDTO;
import com.avfallskompassen.dto.request.PropertyRequest;
import com.avfallskompassen.model.LockType;
import com.avfallskompassen.model.Municipality;
import com.avfallskompassen.model.PropertyType;
import com.avfallskompassen.model.User;
import com.avfallskompassen.repository.LockTypeRepository;
import com.avfallskompassen.repository.MunicipalityRepository;
import com.avfallskompassen.repository.PropertyRepository;
import com.avfallskompassen.repository.UserRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
@Transactional
public class PropertyControllerIT {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private MunicipalityRepository municipalityRepository;

    @Autowired
    private LockTypeRepository lockTypeRepository;

    @Autowired
    private UserRepository userRepository;


    private PropertyRequest propertyRequest;

    @BeforeEach
    void setUp() {
        buildEntities();

    }

    @Test
    void createProperty_happyPath_returns201AndCreatesProperty() throws Exception {
        Municipality municipality = municipalityRepository.save(
                new Municipality("Malmö")
        );
        propertyRequest.setMunicipalityId(municipality.getId());

        String json = objectMapper.writeValueAsString(propertyRequest);

        mockMvc.perform(post("/api/properties")
                        .header("X-Username", "testUser")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Property created successfully"))
                .andExpect(jsonPath("$.address").value("Testgatan 5"))
                .andExpect(jsonPath("$.numberOfApartments").value(10))
                .andExpect(jsonPath("$.lockName").value("BasicLock"))
                .andExpect(jsonPath("$.lockPrice").value(100))
                .andExpect(jsonPath("$.municipalityId").value(municipality.getId()))
                .andExpect(jsonPath("$.municipalityName").value("Malmö"));

        assertThat(propertyRepository.count()).isEqualTo(1);
    }


    @Test
    void createProperty_missingUsername_shouldReturn401() throws Exception {
        PropertyRequest req = new PropertyRequest();
        req.setAddress("Test");
        req.setNumberOfApartments(5);
        req.setLockTypeId(1L);
        req.setAccessPathLength(1.0);
        req.setMunicipalityId(1L);

        String json = objectMapper.writeValueAsString(req);

        mockMvc.perform(post("/api/properties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("User authentication required"));
    }


    @Test
    void createProperty_lockTypeNotFound_returns400() throws Exception {
        Municipality municipality = municipalityRepository.save(new Municipality("Lund"));

        propertyRequest.setLockTypeId(9999L);

        String json = objectMapper.writeValueAsString(propertyRequest);

        mockMvc.perform(post("/api/properties")
                        .header("X-Username", "test")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }


    @Test
    void createProperty_validationError_returns400() throws Exception {
        propertyRequest.setAddress(""); 
        propertyRequest.setNumberOfApartments(0);
        propertyRequest.setAccessPathLength(-1.0);
        propertyRequest.setMunicipalityId(null);

        String json = objectMapper.writeValueAsString(propertyRequest);

        mockMvc.perform(post("/api/properties")
                        .header("X-Username", "test")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    void getUserStats_happyPath_returns200() throws Exception {
        User admin = userRepository.save(
                new User("admin", "admin0.0","ADMIN")
        );

        User userToFetch = userRepository.findAll().get(0);

        String json = objectMapper.writeValueAsString(propertyRequest);

        mockMvc.perform(get("/api/user/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value(userToFetch.getUsername()));
    }


    private void buildEntities() {
        Municipality municipality = municipalityRepository.save(
                new Municipality("Malmö")
        );

        LockType lockType = lockTypeRepository.save(
                new LockType("BasicLock", new BigDecimal(100))
        );

        User user = userRepository.save(
                new User("testUser", "testing:)")
        );

        propertyRequest = new PropertyRequest();
        propertyRequest.setAddress("Testgatan 5");
        propertyRequest.setNumberOfApartments(10);
        propertyRequest.setLockTypeId(lockType.getId());
        propertyRequest.setPropertyType(PropertyType.FLERBOSTADSHUS.name());
        propertyRequest.setAccessPathLength(12.5);
        propertyRequest.setMunicipalityId(municipality.getId());
    }
}
