package com.avfallskompassen.controller;

import com.avfallskompassen.dto.UserDTO;
import com.avfallskompassen.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AdminController.
 * Tests admin-only endpoints for user management.
 */
public class AdminControllerTest {
    
    @Mock
    private UserService userService;
    
    @InjectMocks
    private AdminController adminController;
    
    private UserDTO testUser1;
    private UserDTO testUser2;
    private UserDTO testAdmin;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // Create test user DTOs
        testUser1 = new UserDTO(1, "user1", "USER", Instant.now());
        testUser2 = new UserDTO(2, "user2", "USER", Instant.now());
        testAdmin = new UserDTO(3, "admin", "ADMIN", Instant.now());
    }
    
    /**
     * Test listing all users successfully.
     */
    @Test
    void testListUsers_Success() {
        // Arrange
        List<UserDTO> expectedUsers = Arrays.asList(testUser1, testUser2, testAdmin);
        when(userService.findAllUsers()).thenReturn(expectedUsers);
        
        // Act
        ResponseEntity<List<UserDTO>> response = adminController.listUsers();
        
        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(3, response.getBody().size());
        assertEquals(expectedUsers, response.getBody());
        
        verify(userService, times(1)).findAllUsers();
    }
    
    /**
     * Test listing users when no users exist.
     */
    @Test
    void testListUsers_EmptyList() {
        // Arrange
        List<UserDTO> emptyList = Arrays.asList();
        when(userService.findAllUsers()).thenReturn(emptyList);
        
        // Act
        ResponseEntity<List<UserDTO>> response = adminController.listUsers();
        
        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0, response.getBody().size());
        
        verify(userService, times(1)).findAllUsers();
    }
    
    /**
     * Test updating user role to ADMIN successfully.
     */
    @Test
    void testUpdateUserRole_ToAdmin_Success() {
        // Arrange
        Integer userId = 1;
        String newRole = "ADMIN";
        UserDTO updatedUser = new UserDTO(userId, "user1", "ADMIN", testUser1.getCreatedAt());
        
        when(userService.updateUserRole(userId, newRole)).thenReturn(updatedUser);
        
        // Act
        ResponseEntity<UserDTO> response = adminController.updateUserRole(userId, newRole);
        
        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(userId, response.getBody().getId());
        assertEquals("ADMIN", response.getBody().getRole());
        assertEquals("user1", response.getBody().getUsername());
        
        verify(userService, times(1)).updateUserRole(userId, newRole);
    }
    
    /**
     * Test updating user role to USER successfully.
     */
    @Test
    void testUpdateUserRole_ToUser_Success() {
        // Arrange
        Integer userId = 3;
        String newRole = "USER";
        UserDTO updatedUser = new UserDTO(userId, "admin", "USER", testAdmin.getCreatedAt());
        
        when(userService.updateUserRole(userId, newRole)).thenReturn(updatedUser);
        
        // Act
        ResponseEntity<UserDTO> response = adminController.updateUserRole(userId, newRole);
        
        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(userId, response.getBody().getId());
        assertEquals("USER", response.getBody().getRole());
        assertEquals("admin", response.getBody().getUsername());
        
        verify(userService, times(1)).updateUserRole(userId, newRole);
    }
    
    /**
     * Test updating user role with a custom role.
     */
    @Test
    void testUpdateUserRole_CustomRole_Success() {
        // Arrange
        Integer userId = 2;
        String newRole = "MODERATOR";
        UserDTO updatedUser = new UserDTO(userId, "user2", "MODERATOR", testUser2.getCreatedAt());
        
        when(userService.updateUserRole(userId, newRole)).thenReturn(updatedUser);
        
        // Act
        ResponseEntity<UserDTO> response = adminController.updateUserRole(userId, newRole);
        
        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(userId, response.getBody().getId());
        assertEquals("MODERATOR", response.getBody().getRole());
        
        verify(userService, times(1)).updateUserRole(userId, newRole);
    }
    
    /**
     * Test updating role for non-existent user.
     */
    @Test
    void testUpdateUserRole_UserNotFound() {
        // Arrange
        Integer userId = 999;
        String newRole = "ADMIN";
        
        when(userService.updateUserRole(userId, newRole))
            .thenThrow(new RuntimeException("User not found"));
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            adminController.updateUserRole(userId, newRole);
        });
        
        assertEquals("User not found", exception.getMessage());
        verify(userService, times(1)).updateUserRole(userId, newRole);
    }
    
    /**
     * Test that service methods are called with correct parameters.
     */
    @Test
    void testUpdateUserRole_CorrectParametersPassed() {
        // Arrange
        Integer userId = 1;
        String newRole = "ADMIN";
        UserDTO updatedUser = new UserDTO(userId, "user1", "ADMIN", Instant.now());
        
        when(userService.updateUserRole(userId, newRole)).thenReturn(updatedUser);
        
        // Act
        adminController.updateUserRole(userId, newRole);
        
        // Assert - verify that the service was called with exact parameters
        verify(userService, times(1)).updateUserRole(eq(userId), eq(newRole));
    }
    
    /**
     * Test that listUsers returns the exact list from service without modification.
     */
    @Test
    void testListUsers_ReturnsExactServiceResponse() {
        // Arrange
        List<UserDTO> users = Arrays.asList(testUser1, testAdmin);
        when(userService.findAllUsers()).thenReturn(users);
        
        // Act
        ResponseEntity<List<UserDTO>> response = adminController.listUsers();
        
        // Assert
        assertSame(users, response.getBody(), "Controller should return the exact list from service");
        verify(userService, times(1)).findAllUsers();
    }
}
