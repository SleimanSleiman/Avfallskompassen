package com.avfallskompassen.controller;

import com.avfallskompassen.dto.ContainerDTO;
import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.model.ContainerType;
import com.avfallskompassen.services.ContainerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for ContainerController.
 */
@WebMvcTest(
        controllers = ContainerController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
                org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
        }
)
public class ContainerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ContainerService service;

    /**
     * Test for getContainersByMunicipalityAndService endpoint.
     * Verifies that the endpoint returns HTTP 200 OK and the expected JSON response.
     * @throws Exception if an error occurs during the request
     */
    @Test
    void testGetContainersByMunicipalityAndService_ReturnsOkAndJson() throws Exception {
        ContainerType type = new ContainerType();
        type.setName("200L Kärl");

        ContainerPlan plan = new ContainerPlan();
        plan.setContainerType(type);

        ContainerDTO dto = new ContainerDTO(
                plan.getId(),
                type.getName(),
                200,     // size
                0.5,     // width
                0.5,     // depth
                1.0,     // height
                "frontUrl",
                "topUrl",
                12,      // emptyingFrequencyPerYear
                new BigDecimal("100.0")    // cost
        );

        when(service.getContainersByMunicipalityAndService(1L, 2L))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/containers/municipality/1/service/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("200L Kärl"));
    }

    /**
     * Test for getContainersByMunicipalityAndService endpoint when no containers are found.
     * Verifies that the endpoint returns HTTP 200 OK and an empty JSON array.
     * @throws Exception if an error occurs during the request
     */
    @Test
    void testGetContainersByMunicipalityAndService_ReturnsEmptyList() throws Exception {
        when(service.getContainersByMunicipalityAndService(1L, 2L))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/containers/municipality/1/service/2"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    /**
     * Test for getContainersByMunicipalityAndService endpoint when service throws IllegalArgumentException.
     * Verifies that the endpoint returns HTTP 400 Bad Request.
     * @throws Exception if an error occurs during the request
     */
    @Test
    void testGetContainersByMunicipalityAndService_ThrowsIllegalArgumentException() throws Exception {
        when(service.getContainersByMunicipalityAndService(null, 2L))
                .thenThrow(new IllegalArgumentException("Municipality ID cannot be null"));

        mockMvc.perform(get("/api/containers/municipality/null/service/2"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test for getContainersByMunicipalityAndService endpoint when service throws unexpected exception.
     * Verifies that the endpoint returns HTTP 500 Internal Server Error.
     * @throws Exception if an error occurs during the request
     */
    @Test
    void testGetContainersByMunicipalityAndService_ThrowsUnexpectedException() throws Exception {
        when(service.getContainersByMunicipalityAndService(1L, 2L))
                .thenThrow(new RuntimeException("Unexpected error"));

        mockMvc.perform(get("/api/containers/municipality/1/service/2"))
                .andExpect(status().isInternalServerError());
    }

    /**
     * Test for getContainersByMunicipalityAndService endpoint with invalid municipalityId and serviceTypeId.
     * Verifies that the endpoint returns HTTP 400 Bad Request.
     * @throws Exception if an error occurs during the request
     */
    @Test
    void testGetContainersByMunicipalityAndService_InvalidIds() throws Exception {
        mockMvc.perform(get("/api/containers/municipality/-1/service/2"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/containers/municipality/1/service/-5"))
                .andExpect(status().isBadRequest());
    }

}
