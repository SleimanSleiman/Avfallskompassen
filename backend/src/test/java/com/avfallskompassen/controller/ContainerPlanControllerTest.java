package com.avfallskompassen.controller;

import com.avfallskompassen.dto.CollectionFeeDTO;
import com.avfallskompassen.services.CollectionFeeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ContainerPlanController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ContainerPlanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CollectionFeeService collectionFeeService;

    @Test
    @DisplayName("GET /api/containerplan/collectionFeeInput/{municipalityId} returns cost successfully")
    void testGetCollectionFeeByMunicipalityId_success() throws Exception {
        Long municipalityId = 1L;
        double distance = 25.0;
        CollectionFeeDTO dto = new CollectionFeeDTO(municipalityId, BigDecimal.valueOf(100));

        Mockito.when(collectionFeeService.findCollectionFeeByMunicipalityId(anyLong(), anyDouble()))
                .thenReturn(dto);

        mockMvc.perform(get("/api/containerPlan/collectionFeeInput/{municipalityId}", municipalityId)
                .param("distance", String.valueOf(distance))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.cost").value(100));
    }

    @Test
    @DisplayName("GET /api/containerplan/collectionFeeInput/{municipalityId} returns 404 not found, when cost is not found")
    void testGetCollectionFeeByMunicipalityId_notFound() throws Exception {
        Mockito.when(collectionFeeService.findCollectionFeeByMunicipalityId(anyLong(), anyDouble()))
                .thenReturn(null);
        mockMvc.perform(get("/api/containerPlan/collectionFeeInput/{municipalityId}", 1L)
                .param("distance", "15"))
                .andExpect(status().isNotFound())
                .andExpect(status().reason("Dragvägskostnad hittades ej"));

    }
}
