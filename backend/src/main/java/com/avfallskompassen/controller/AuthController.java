package com.avfallskompassen.controller;

import com.avfallskompassen.dto.request.LoginRequest;
import com.avfallskompassen.dto.response.LoginResponse;
import com.avfallskompassen.model.User;
import com.avfallskompassen.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * REST Controller for handling authentication operations including
 * user login and registration endpoints.
 * 
 * @author Akmal Safi
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    /**
     * Handles user login requests.
     * 
     * @param loginRequest contains username and password
     * @return LoginResponse with authentication result
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            Optional<User> userOptional = userService.findByUsername(loginRequest.getUsername());
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                
                if (userService.validatePassword(loginRequest.getPassword(), user.getPassword())) {
                    LoginResponse response = new LoginResponse(
                        true, 
                        "Login successful", 
                        user.getUsername(), 
                        user.getRole()
                    );
                    return ResponseEntity.ok(response);
                } else {
                    LoginResponse response = new LoginResponse(
                        false, 
                        "Invalid password", 
                        null, 
                        null
                    );
                    return ResponseEntity.badRequest().body(response);
                }
            } else {
                LoginResponse response = new LoginResponse(
                    false, 
                    "User not found", 
                    null, 
                    null
                );
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            LoginResponse response = new LoginResponse(
                false, 
                "Login failed: " + e.getMessage(), 
                null, 
                null
            );
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Handles user registration requests.
     * 
     * @param loginRequest contains username and password for new user
     * @return LoginResponse with registration result
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody LoginRequest loginRequest) {
        try {
            User newUser = userService.createUser(loginRequest.getUsername(), loginRequest.getPassword());
            
            LoginResponse response = new LoginResponse(
                true, 
                "Registration successful", 
                newUser.getUsername(), 
                newUser.getRole()
            );
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            LoginResponse response = new LoginResponse(
                false, 
                e.getMessage(), 
                null, 
                null
            );
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            LoginResponse response = new LoginResponse(
                false, 
                "Registration failed: " + e.getMessage(), 
                null, 
                null
            );
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
