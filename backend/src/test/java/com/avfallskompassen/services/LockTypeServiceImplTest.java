package com.avfallskompassen.services;

import com.avfallskompassen.model.LockType;
import com.avfallskompassen.repository.LockTypeRepository;
import com.avfallskompassen.services.impl.LockTypeServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LockTypeServiceImplTest {

    @Mock
    private LockTypeRepository lockTypeRepository;

    @InjectMocks
    private LockTypeServiceImpl lockTypeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindLockTypeById_found() {
        LockType lockType = new LockType();
        lockType.setId(1L);
        lockType.setName("Sample lock");

        when(lockTypeRepository.findById(1L)).thenReturn(Optional.of(lockType));

        LockType result = lockTypeService.findLockTypeById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Sample lock", result.getName());
    }

    @Test
    void testFindLockTypeById_notFound() {
        when(lockTypeRepository.findById(2L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                lockTypeService.findLockTypeById(2L)
        );

        assertEquals("No Locktype found with ID: 2", exception.getMessage());
    }

    @Test
    void testGetAllLockTypes() {
        LockType lock1 = new LockType();
        lock1.setId(1L);
        lock1.setName("Inget lås");

        LockType lock2 = new LockType();
        lock2.setId(2L);
        lock2.setName("Fysisk nyckel");


        List<LockType> mockList = Arrays.asList(lock1, lock2);
        when(lockTypeRepository.findAll()).thenReturn(mockList);

        List<LockType> result = lockTypeService.getAllLockTypes();

        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyElementsOf(mockList);

        verify(lockTypeRepository, times(1)).findAll();
    }
}