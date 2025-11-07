package com.avfallskompassen.dto.response;

/**
 * This class encapsulates the response information sent back to clients
 * after login or registration attempts, including success status, messages,
 * and user details.
 * 
 * @author Akmal Safi
 */
public class LoginResponse {
    private boolean success;
    private String message;
    private String username;
    private String role;
    
    /**
     * Default constructor for JSON serialization.
     */
    public LoginResponse() {}
    
     /**
     * Parameterized constructor for creating authentication responses.
     * 
     * @param success whether the authentication was successful
     * @param message descriptive message about the authentication result
     * @param username the authenticated user's username (null if failed)
     * @param role the authenticated user's role (null if failed)
     */
    public LoginResponse(boolean success, String message, String username, String role) {
        this.success = success;
        this.message = message;
        this.username = username;
        this.role = role;
    }
    
    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}