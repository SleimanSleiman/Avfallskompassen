package com.avfallskompassen.dto;

/** 
 * This class encapsulates the user credentials required for authentication
 * operations, providing a structured way to receive login data from clients.
 * 
 * @author Akmal Safi
 */
public class LoginRequest {
    private String username;
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