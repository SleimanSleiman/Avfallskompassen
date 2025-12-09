package com.avfallskompassen.controller;

import com.avfallskompassen.dto.ContainerPositionDTO;
import com.avfallskompassen.dto.DoorDTO;
import com.avfallskompassen.dto.OtherObjectDTO;
import com.avfallskompassen.dto.WasteRoomDTO;
import com.avfallskompassen.dto.request.WasteRoomRequest;
import com.avfallskompassen.exception.BadRequestException;
import com.avfallskompassen.exception.InternalServerException;
import com.avfallskompassen.exception.ResourceNotFoundException;
import com.avfallskompassen.services.RoomPdfService;
import com.avfallskompassen.services.WasteRoomService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Unit tests for {@link WasteRoomController}
 * @author Anton Persson
 */
@WebMvcTest(WasteRoomController.class)
@AutoConfigureMockMvc(addFilters = false)
class WasteRoomControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WasteRoomService wasteRoomService;

    @MockBean
    private RoomPdfService roomPdfService;

    @Test
    void createWasteRoom_ReturnOK() throws Exception{
        List<ContainerPositionDTO> containers = List.of(
                new ContainerPositionDTO(1L,2,2,0,3L,5L),
                new ContainerPositionDTO(2L,4,4,90,4L,5L)
        );

        List<DoorDTO> doors = List.of(
                new DoorDTO(1L, 0.5, 0.5, 0, 1.0, 0.1, 5L,"top","outward")
        );

        List<OtherObjectDTO> otherObjects = List.of(
                new OtherObjectDTO(1L, "Skåp", 3, 3, 30, 30, 90, 5L)
        );

        WasteRoomDTO dto = new WasteRoomDTO(2L,10,10,10,10,containers,doors,otherObjects, 5L, "Name", 1, "user", null, null, true, null, null, null);

        when(wasteRoomService.saveWasteRoom(any(WasteRoomRequest.class))).thenReturn(dto);

        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "propertyId": 5,
                      "length": 8.0,
                      "width": 8.0,
                      "x": 1.0,
                      "y": 2.0,
                      "containers": [
                        { "id": 1, "x": 2.0, "y": 2.0, "angle": 5.0 }
                      ],
                      "doors": [
                        { "width": 1.0, "x": 0.5, "y": 0.5, "angle": 0.0, "wall": "top", "swingDirection": "outward" }
                      ],
                        "otherObjects": [
                        { "name": "Skåp", "x": 3.0, "y": 3.0, "length": 30.0, "width": 30.0, "angle": 90.0 }
                      ]
                    }
                """))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.propertyId").value(2))
                .andExpect(jsonPath("$.containers[0].id").value(1))
                .andExpect(jsonPath("$.doors[0].id").value(1))
                .andExpect(jsonPath("$.otherObjects[0].name").value("Skåp"));
    }

    @Test
    void createWasteRoom_InvalidSize_ReturnBadRequest() throws Exception {
        String invalidRequestJson = """
        {
            "propertyId": 1,
            "length": 2.4,  
            "width": 8.0,
            "x": 1.0,
            "y": 2.0,
            "containers": [],
            "doors": [],
            "otherObjects": []
        }
        """;
        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequestJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createWasteRoom_Null_ReturnBadRequest() throws Exception {
        String invalidRequestJson = """
        {
            "propertyId": 1,
            "length": null,  
            "width": 8.0,
            "x": 1.0,
            "y": 2.0,
            "containers": [],
            "doors": [],
            "otherObjects": []
        }
        """;
        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequestJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createWasteRoom_WrongType_ReturnBadRequest() throws Exception {
        String invalidRequestJson = """
        {
            "propertyId": 1,
            "length": "hej!",  
            "width": 8.0,
            "x": 1.0,
            "y": 2.0,
            "containers": [],
            "doors": [],
            "otherObjects": []
        }
        """;
        mockMvc.perform(post("/api/wasterooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequestJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateWasteRoom_ReturnOK() throws Exception{
        List<ContainerPositionDTO> containers = List.of(
                new ContainerPositionDTO(1L, 2, 2, 0, 3L, 5L),
                new ContainerPositionDTO(2L, 4, 4, 90, 4L, 5L)
        );

        List<DoorDTO> doors = List.of(
                new DoorDTO(1L, 0.5, 0.5, 0, 1.0, 0.1, 5L,"top","outward")
        );

        List<OtherObjectDTO> otherObjects = List.of(
                new OtherObjectDTO(1L, "Skåp", 3, 3, 30, 30, 90, 5L)
        );

        WasteRoomDTO dto = new WasteRoomDTO(2L, 10, 10, 10, 10, containers, doors, otherObjects, 5L, "Name", 1, "user", null, null, true, null, null, null);

        when(wasteRoomService.updateWasteRoom(any(Long.class), any(WasteRoomRequest.class))).thenReturn(dto);

        mockMvc.perform(put("/api/wasterooms/{id}", 2L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                      "propertyId": 5,
                      "length": 8.0,
                      "width": 8.0,
                      "x": 1.0,
                      "y": 2.0,
                      "containers": [
                        { "id": 1, "x": 2.0, "y": 2.0, "angle": 5.0 }
                      ],
                      "doors": [
                        { "width": 1.0, "x": 0.5, "y": 0.5, "angle": 0.0, "wall": "top", "swingDirection": "outward" }
                      ],
                        "otherObjects": [
                        { "name": "Skåp", "x": 3.0, "y": 3.0, "length": 30.0, "width": 30.0, "angle": 90.0 }
                      ]
                    }
                    """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.propertyId").value(2))
                .andExpect(jsonPath("$.containers[0].id").value(1))
                .andExpect(jsonPath("$.doors[0].id").value(1))
                .andExpect(jsonPath("$.otherObjects[0].name").value("Skåp"));
    }

    @Test
    void updateWasteRoom_ReturnBadRequest() throws Exception{
        String invalidRequestJson = """
    {
        "propertyId": 1,
        "length": 2.4,
        "width": 8.0,
        "x": 1.0,
        "y": 2.0,
        "containers": [],
        "doors": []
    }
    """;

        mockMvc.perform(put("/api/wasterooms/{id}", 2L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequestJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteWasteRoom_ReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/wasterooms/{id}", 1L))
                .andExpect(status().isNoContent());

        verify(wasteRoomService, times(1)).deleteWasteRoom(1L);
    }

    @Test
    void deleteWasteRoom_NotFound_Return404() throws Exception {
        doThrow(new ResourceNotFoundException("WasteRoom not found"))
                .when(wasteRoomService).deleteWasteRoom(anyLong());

        mockMvc.perform(delete("/api/wasterooms/{id}", 99L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("WasteRoom not found"));
    }

    @Test
    void deleteWasteRoom_InvalidState_Return400() throws Exception {
        doThrow(new BadRequestException("Cannot delete waste room in use"))
                .when(wasteRoomService).deleteWasteRoom(anyLong());

        mockMvc.perform(delete("/api/wasterooms/{id}", 2L))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Cannot delete waste room in use"));
    }
    @Test
    void deleteWasteRoom_InternalError_Return500() throws Exception {
        doThrow(new InternalServerException("Unexpected error"))
                .when(wasteRoomService).deleteWasteRoom(anyLong());

        mockMvc.perform(delete("/api/wasterooms/{id}", 1L))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("Unexpected error"));
    }

    @Test
    void getWasteRoomById_ReturnsOK() throws Exception {
        WasteRoomDTO dto = new WasteRoomDTO(1L, 10, 10, 0, 0, List.of(), List.of(), List.of(), 1L, "Name", 1, "user", null, null, true, null, null, null);

        when(wasteRoomService.getWasteRoomById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/wasterooms/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.propertyId").value(1));
    }

    @Test
    void getWasteRoomById_NotFound_Returns404() throws Exception {
        when(wasteRoomService.getWasteRoomById(99L))
                .thenThrow(new ResourceNotFoundException("WasteRoom not found"));

        mockMvc.perform(get("/api/wasterooms/{id}", 99L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("WasteRoom not found"));
    }

    @Test
    void getWasteRoomsByPropertyId_ReturnsOK() throws Exception {
        List<WasteRoomDTO> rooms = List.of(
                new WasteRoomDTO(1L, 10, 10, 0, 0, List.of(), List.of(), List.of(),3L, "Name", 1, "user", null, null, true, null, null, null),
                new WasteRoomDTO(1L, 12, 8, 5, 5, List.of(), List.of(), List.of(), 2L, "Name", 1, "user", null, null, true, null, null, null)
        );

        when(wasteRoomService.getWasteRoomsByPropertyId(1L)).thenReturn(rooms);

        mockMvc.perform(get("/api/properties/{propertyId}/wasterooms", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].propertyId").value(1));
    }

    @Test
    void getWasteRoomsByPropertyId_NotFound_Returns404() throws Exception {
        when(wasteRoomService.getWasteRoomsByPropertyId(99L))
                .thenThrow(new ResourceNotFoundException("No waste rooms found"));

        mockMvc.perform(get("/api/properties/{propertyId}/wasterooms", 99L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("No waste rooms found"));
    }

    @Test
    void uploadPdf() {
    }

    @Test
    void getRoomPdfs() {
    }

    @Test
    void downloadPfd() {
    }
}