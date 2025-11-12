package com.avfallskompassen.controller;

import com.avfallskompassen.dto.request.LoginRequest;
import com.avfallskompassen.dto.response.LoginResponse;
import com.avfallskompassen.model.User;
import com.avfallskompassen.services.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Optional;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    @Test
    void login_success_returnsOkAndUserDetails() {
        LoginRequest req = new LoginRequest("john","pass");

        User user = new User("john","hashed","USER");

        when(userService.findByUsername("john")).thenReturn(Optional.of(user));
        when(userService.validatePassword("pass", "hashed")).thenReturn(true);

        ResponseEntity<LoginResponse> resp = authController.login(req);

    assertEquals(200, resp.getStatusCode().value());
    LoginResponse body1 = Objects.requireNonNull(resp.getBody());
    assertTrue(body1.isSuccess());
    assertEquals("john", body1.getUsername());
    assertEquals("USER", body1.getRole());
    }

    @Test
    void login_invalidPassword_returnsBadRequest() {
        LoginRequest req = new LoginRequest("john","wrong");

        User user = new User("john","hashed","USER");

        when(userService.findByUsername("john")).thenReturn(Optional.of(user));
        when(userService.validatePassword("wrong", "hashed")).thenReturn(false);

        ResponseEntity<LoginResponse> resp = authController.login(req);

    assertEquals(400, resp.getStatusCode().value());
    LoginResponse body2 = Objects.requireNonNull(resp.getBody());
    assertFalse(body2.isSuccess());
    assertEquals("Invalid password", body2.getMessage());
    }

    @Test
    void login_userNotFound_returnsBadRequest() {
        LoginRequest req = new LoginRequest("doesnotexist","pass");

        when(userService.findByUsername("doesnotexist")).thenReturn(Optional.empty());

        ResponseEntity<LoginResponse> resp = authController.login(req);

    assertEquals(400, resp.getStatusCode().value());
    LoginResponse body3 = Objects.requireNonNull(resp.getBody());
    assertFalse(body3.isSuccess());
    assertEquals("User not found", body3.getMessage());
    }

    @Test
    void register_success_returnsOk() {
        LoginRequest req = new LoginRequest("newuser","password");

        User created = new User("newuser","hashed","USER");

        when(userService.createUser("newuser", "password")).thenReturn(created);

        ResponseEntity<LoginResponse> resp = authController.register(req);

    assertEquals(200, resp.getStatusCode().value());
    LoginResponse body4 = Objects.requireNonNull(resp.getBody());
    assertTrue(body4.isSuccess());
    assertEquals("newuser", body4.getUsername());
    assertEquals("USER", body4.getRole());
    }

    @Test
    void register_existingUsername_returnsBadRequestWithMessage() {
        LoginRequest req = new LoginRequest("exists","password");

        when(userService.createUser("exists", "password")).thenThrow(new RuntimeException("Username already exists"));

        ResponseEntity<LoginResponse> resp = authController.register(req);

    assertEquals(400, resp.getStatusCode().value());
    LoginResponse body5 = Objects.requireNonNull(resp.getBody());
    assertFalse(body5.isSuccess());
    assertEquals("Username already exists", body5.getMessage());
    }
}