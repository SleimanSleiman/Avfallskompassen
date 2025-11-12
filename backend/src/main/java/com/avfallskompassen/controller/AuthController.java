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
    @Autowired(required = false)
    private com.avfallskompassen.security.JwtUtil jwtUtil;

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
                    // generate JWT token
                    String token = null;
                    if (jwtUtil != null) {
                        token = jwtUtil.generateToken(user.getUsername(), user.getRole());
                    }
                    LoginResponse response = new LoginResponse(
                        true, 
                        "Inloggning lyckades",
                        user.getUsername(),
                        user.getRole(),
                        token
                    );
                    return ResponseEntity.ok(response);
                } else {
                    LoginResponse response = new LoginResponse(
                        false, 
                        "Ogiltigt lösenord",
                        null, 
                        null
                    );
                    return ResponseEntity.badRequest().body(response);
                }
            } else {
                LoginResponse response = new LoginResponse(
                    false, 
                    "Användaren hittades inte",
                    null, 
                    null
                );
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            LoginResponse response = new LoginResponse(
                false, 
                "Inloggning misslyckades: " + e.getMessage(),
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
            // produce token for the newly registered user if JwtUtil available
            String token = null;
            if (jwtUtil != null) {
                token = jwtUtil.generateToken(newUser.getUsername(), newUser.getRole());
            }
            LoginResponse response = new LoginResponse(
                true,
                "Registrering lyckades",
                newUser.getUsername(),
                newUser.getRole(),
                token
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
                "Registrering misslyckades: " + e.getMessage(),
                null, 
                null
            );
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
