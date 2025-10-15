package com.avfallskompassen.controller;

import com.avfallskompassen.model.ServiceType;
import com.avfallskompassen.services.ServiceTypeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

/**
 * Unit tests for ServiceTypeController.
 */
@WebMvcTest(
        controllers = ServiceTypeController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
                org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
        }
)
public class ServiceTypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ServiceTypeService service;

    /**
     * Test retrieving all service types successfully.
     * @throws Exception if an error occurs during the test
     */
    @Test
    void testGetAllServiceTypes_ReturnsList() throws Exception {
        ServiceType type1 = new ServiceType();
        type1.setId(1L);
        type1.setName("Type1");

        ServiceType type2 = new ServiceType();
        type2.setId(2L);
        type2.setName("Type2");

        when(service.getAllServiceTypes()).thenReturn(List.of(type1, type2));

        mockMvc.perform(get("/api/serviceTypes")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Type1"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("Type2"));
    }

    /**
     * Test handling of service exception when retrieving service types.
     * @throws Exception if an error occurs during the test
     */
    @Test
    void testGetAllServiceTypes_ServiceThrowsException() throws Exception {
        when(service.getAllServiceTypes())
                .thenThrow(new RuntimeException("DB-fel"));

        mockMvc.perform(get("/api/serviceTypes")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is5xxServerError());
    }
}
