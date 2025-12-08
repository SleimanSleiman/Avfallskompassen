package com.avfallskompassen.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * This class encapsulates the user credentials required for authentication
 * operations, providing a structured way to receive login data from clients.
 * 
 * @author Akmal Safi
 */
public class LoginRequest {
    @NotBlank(message = "Username may not be empty")
    @Size(min = 3, max = 50, message = "Username must be 3–50 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9._-]+$",
            message = "Username contains invalid characters"
    )
    private String username;

    @NotBlank(message = "Password may not be empty")
    @Size(min = 6, max = 255, message = "Password must be at least 6 characters")
    private String password;
    
    /**
     * Default constructor for JSON deserialization.
     */
    public LoginRequest() {}
    
    /**
     * Parameterized constructor for creating login requests.
     * 
     * @param username the user's username
     * @param password the user's password (plain text, will be hashed)
     */
    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }
    
    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}