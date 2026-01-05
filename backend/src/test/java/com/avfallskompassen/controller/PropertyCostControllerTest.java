package com.avfallskompassen.controller;

import com.avfallskompassen.dto.GeneralPropertyCostDTO;
import com.avfallskompassen.services.PropertyCostService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.verify;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

class PropertyCostControllerTest {

    @Mock
    private PropertyCostService propertyCostService;

    @InjectMocks
    private PropertyCostController propertyCostController;

    @BeforeEach()
    public void setUp(){
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAnnualCost_ShouldReturnOk_WhenCostExists() {
        Long propertyId = 1L;
        GeneralPropertyCostDTO mockCost = new GeneralPropertyCostDTO(
                "Storgatan 12",
                BigDecimal.valueOf(2500.50),
                BigDecimal.valueOf(500.10)
        );

        when(propertyCostService.calculateAnnualCost(propertyId)).thenReturn(mockCost);

        ResponseEntity<?> response = propertyCostController.getAnnualCost(propertyId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isInstanceOf(GeneralPropertyCostDTO.class);

        GeneralPropertyCostDTO result = (GeneralPropertyCostDTO) response.getBody();
        assertThat(result.getAddress()).isEqualTo("Storgatan 12");
        assertThat(result.getTotalCost()).isEqualTo(BigDecimal.valueOf(2500.50));
        assertThat(result.getCostPerApartment()).isEqualTo(BigDecimal.valueOf(500.10));

        verify(propertyCostService, times(1)).calculateAnnualCost(propertyId);
    }

    @Test
    void getAnnualCost_ShouldReturnNotFound_WhenEntityNotFound() {
        Long propertyId = 99L;
        when(propertyCostService.calculateAnnualCost(propertyId))
                .thenThrow(new EntityNotFoundException("Property not found"));

        ResponseEntity<?> response = propertyCostController.getAnnualCost(propertyId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isInstanceOf(Map.class);
        assertThat(((Map<?, ?>) response.getBody()).get("error"))
                .isEqualTo("Property not found" );
    }

    @Test
    void getAnnualCost_ShouldReturnInternalServerError_WhenUnexpectedErrorOccurs() {
        Long propertyId = 2L;
        when(propertyCostService.calculateAnnualCost(propertyId))
                .thenThrow(new RuntimeException("Something failed"));

        ResponseEntity<?> response = propertyCostController.getAnnualCost(propertyId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(((Map<?, ?>) response.getBody()).get("error"))
                .isEqualTo("An unexpected error occured");
    }

    @Test
    void getAllCostsForUser_ShouldReturnOk_WhenCostsExist() {
        String username = "chris";
        List<GeneralPropertyCostDTO> mockList = List.of(
                new GeneralPropertyCostDTO("Lundväg 3", BigDecimal.valueOf(1800), BigDecimal.valueOf(600)),
                new GeneralPropertyCostDTO("Lundväg 4", BigDecimal.valueOf(3000), BigDecimal.valueOf(750))
        );

        when(propertyCostService.calculateAllCostsForUser(username)).thenReturn(mockList);

        ResponseEntity<?> response = propertyCostController.getAllCostsForUser(username);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isInstanceOf(List.class);

        List<?> resultList = (List<?>) response.getBody();
        assertThat(resultList).hasSize(2);

        GeneralPropertyCostDTO first = (GeneralPropertyCostDTO) resultList.get(0);
        assertThat(first.getAddress()).isEqualTo("Lundväg 3");
        assertThat(first.getTotalCost()).isEqualTo(BigDecimal.valueOf(1800));

        verify(propertyCostService, times(1)).calculateAllCostsForUser(username);
    }

    @Test
    void getAllCostsForUser_ShouldReturnNotFound_WhenEntityNotFound() {
        String username = "unknown_user";
        when(propertyCostService.calculateAllCostsForUser(username))
                .thenThrow(new EntityNotFoundException("No properties"));

        ResponseEntity<?> response = propertyCostController.getAllCostsForUser(username);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(((Map<?, ?>) response.getBody()).get("error"))
                .isEqualTo("Property not found");
    }

    @Test
    void getAllCostsForUser_ShouldReturnInternalServerError_WhenUnexpectedErrorOccurs() {
        String username = "chris";
        when(propertyCostService.calculateAllCostsForUser(username))
                .thenThrow(new RuntimeException("Unexpected failure"));

        ResponseEntity<?> response = propertyCostController.getAllCostsForUser(username);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(((Map<?, ?>) response.getBody()).get("error"))
                .isEqualTo("An unexpected error occured");
    }
}
