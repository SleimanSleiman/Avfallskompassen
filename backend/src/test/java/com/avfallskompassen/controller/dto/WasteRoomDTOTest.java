package com.avfallskompassen.controller.dto;

import com.avfallskompassen.dto.WasteRoomDTO;
import com.avfallskompassen.model.ContainerPosition;
import com.avfallskompassen.model.Door;
import com.avfallskompassen.model.Property;
import com.avfallskompassen.model.WasteRoom;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for fromEntity method in {@link WasteRoomDTO}
 * @author Anton Persson
 */
class WasteRoomDTOTest {

    @Test
    void fromEntity_MapsCorrectly() {
        Property property = new Property();
        property.setId(2L);

        ContainerPosition container1 = new ContainerPosition();
        container1.setId(10L);
        container1.setX(2.0);
        container1.setY(3.0);

        Door door1 = new Door();
        door1.setId(20L);
        door1.setX(1.0);
        door1.setY(1.5);
        door1.setWidth(5);

        WasteRoom entity = new WasteRoom();
        entity.setProperty(property);
        entity.setLength(10.0);
        entity.setWidth(5.0);
        entity.setX(0.0);
        entity.setY(0.0);
        entity.setContainers(List.of(container1));
        entity.setDoors(List.of(door1));

        WasteRoomDTO dto = WasteRoomDTO.fromEntity(entity);

        assertEquals(2L, dto.getPropertyId());
        assertEquals(10.0, dto.getLength());
        assertEquals(5.0, dto.getWidth());
        assertEquals(0.0, dto.getX());
        assertEquals(0.0, dto.getY());

        assertNotNull(dto.getContainers());
        assertEquals(1, dto.getContainers().size());
        assertEquals(10L, dto.getContainers().get(0).getId());

        assertNotNull(dto.getDoors());
        assertEquals(1, dto.getDoors().size());
        assertEquals(20L, dto.getDoors().get(0).getId());
    }

    @Test
    void fromEntity_NullLists_ReturnsNullLists() {
        Property property = new Property();
        property.setId(2L);

        WasteRoom entity = new WasteRoom();
        entity.setProperty(property);
        entity.setLength(8.0);
        entity.setWidth(4.0);
        entity.setX(1.0);
        entity.setY(1.0);
        entity.setContainers(null);
        entity.setDoors(null);

        WasteRoomDTO dto = WasteRoomDTO.fromEntity(entity);

        assertEquals(2L, dto.getPropertyId());
        assertNull(dto.getContainers());
        assertNull(dto.getDoors());
    }
}