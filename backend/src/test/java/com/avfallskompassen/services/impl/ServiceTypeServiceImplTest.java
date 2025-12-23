package com.avfallskompassen.services.impl;

import com.avfallskompassen.model.ServiceType;
import com.avfallskompassen.repository.ServiceTypeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ServiceTypeServiceImpl class.
 */
@ExtendWith(MockitoExtension.class)
public class ServiceTypeServiceImplTest {

    @Mock
    private ServiceTypeRepository repository;

    @InjectMocks
    private ServiceTypeServiceImpl service;

    /**
     * Test getAllServiceTypes method to ensure it returns a list of ServiceType
     * when service types are available in the repository.
     */
    @Test
    void testGetAllServiceTypes_ReturnsList() {
        ServiceType type = new ServiceType();
        type.setName("Trädgårdsavfall");
        when(repository.findAll())
                .thenReturn(List.of(type));

        List<ServiceType> result = service.getAllServiceTypes();

        assertEquals(1, result.size());
        assertEquals("Trädgårdsavfall", result.get(0).getName());
        verify(repository, times(1)).findAll();
    }

    /**
     * Test getAllServiceTypes method to ensure it returns an empty list
     * when no service types are available in the repository.
     */
    @Test
    void testGetAllServiceTypes_EmptyList() {
        when(repository.findAll()).thenReturn(List.of());
        List<ServiceType> result = service.getAllServiceTypes();
        assertEquals(0, result.size());
        verify(repository, times(1)).findAll();
    }

    /**
     * Test getAllServiceTypes method to ensure it throws an exception
     * when the repository throws an exception.
     */
    @Test
    void testGetAllServiceTypes_RepositoryThrows() {
        when(repository.findAll()).thenThrow(new RuntimeException("DB-fel"));
        assertThrows(RuntimeException.class, () -> service.getAllServiceTypes());
    }
}
