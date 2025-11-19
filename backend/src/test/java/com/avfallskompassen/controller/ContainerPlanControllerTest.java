package com.avfallskompassen.controller;

import com.avfallskompassen.dto.CollectionFeeDTO;
import com.avfallskompassen.dto.PropertyContainerDTO;
import com.avfallskompassen.services.CollectionFeeService;
import com.avfallskompassen.services.ContainerService;
import com.avfallskompassen.services.PropertyContainerService;
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
import java.util.List;

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

    @MockBean
    private PropertyContainerService propertyContainerService;

    @MockBean
    private ContainerService containerService;

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

    @Test
    @DisplayName("GET /api/containerPlan/collectionFeeInput/{municipalityId} returns 400 , client could not process request")
    void testGetCollectionFeeByMunicipality_invalidId() throws Exception {
        mockMvc.perform(get("/api/containerPlan/collectionFeeInput/{municipalityId}", 0L)
                .param("distance", "10"))
                .andExpect(status().isBadRequest())
                .andExpect(status().reason("Kommunens ID måste vara giltigt"));
    }

    @Test
    @DisplayName("GET /api/containerPlan/collectionFee/{propertyId} returns fee successfully")
    void testGetCollectionFeeByPropertyId_success() throws Exception {
        CollectionFeeDTO dto = new CollectionFeeDTO(5L, BigDecimal.valueOf(250));

        Mockito.when(collectionFeeService.findCollectionFeeByPropertyId(anyLong()))
                .thenReturn(dto);

        mockMvc.perform(get("/api/containerPlan/collectionFee/{propertyId}", 5L)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect((status().isOk()))
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.cost").value(250));
    }

    @Test
    @DisplayName("GET /api/containerPlan/collectionFee/{propertyId} returns 404 when fee not found")
    void testGetCollectionFeeByPropertyId_notFound() throws Exception {
        Mockito.when(collectionFeeService.findCollectionFeeByPropertyId(anyLong()))
                .thenReturn(null);

        mockMvc.perform(get("/api/containerPlan/collectionFee/{propertyId}", 10L))
                .andExpect(status().isNotFound())
                .andExpect(status().reason("Dragvägskostnad hittades ej"));
    }

    @Test
    @DisplayName("GET /api/containerPlan/{propertyId}/containers returns containers successfully")
    void testGetPropertyContainers_success() throws Exception {

        PropertyContainerDTO c1 = new PropertyContainerDTO(
                "Paper", "240L kärl", 240, 1, 52, BigDecimal.valueOf(10.5)
        );

        PropertyContainerDTO c2 = new PropertyContainerDTO(
                "Plastic", "370L kärl", 370, 2, 26, BigDecimal.valueOf(20)
        );

        Mockito.when(containerService.getContainersByPropertyId(anyLong()))
                .thenReturn(List.of(c1, c2));

        mockMvc.perform(get("/api/containerPlan/{propertyId}/containers", 100L)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fractionType").value("Paper"))
                .andExpect(jsonPath("$[0].containerName").value("240L kärl"))
                .andExpect(jsonPath("$[0].size").value(240))
                .andExpect(jsonPath("$[0].quantity").value(1))
                .andExpect(jsonPath("$[0].emptyingFrequency").value(52))
                .andExpect(jsonPath("$[0].cost").value(10.5))
                .andExpect(jsonPath("$[1].fractionType").value("Plastic"))
                .andExpect(jsonPath("$[1].containerName").value("370L kärl"))
                .andExpect(jsonPath("$[1].size").value(370))
                .andExpect(jsonPath("$[1].quantity").value(2))
                .andExpect(jsonPath("$[1].emptyingFrequency").value(26))
                .andExpect(jsonPath("$[1].cost").value(20));
    }

    @Test
    @DisplayName("GET /api/containerPlan/{propertyId}/containers returns 404 when containers not found")
    void testGetPropertyContainers_notFound() throws Exception {

        Mockito.when(containerService.getContainersByPropertyId(anyLong()))
                .thenReturn(null);

        mockMvc.perform(get("/api/containerPlan/{propertyId}/containers", 200L))
                .andExpect(status().isNotFound())
                .andExpect(status().reason("Fastighetskärl hittades ej"));
    }
}