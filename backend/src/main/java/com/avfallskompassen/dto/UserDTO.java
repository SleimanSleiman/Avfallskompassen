package com.avfallskompassen.dto;

import com.avfallskompassen.model.User;
import java.time.Instant;

/**
 * Data Transfer Object for User entity.
 * Used to transfer user data to controllers without exposing the entity.
 * 
 * @author Akmal Safi
 */
public class UserDTO {
    
    private Integer id;
    private String username;
    private String role;
    private Instant createdAt;
    private boolean hasSeenPlanningToolManual;

    /**
     * Default constructor for JPA/Jackson.
     */
    public UserDTO() {}
    
    /**
     * Constructor that creates a DTO from a User entity.
     * Note: Password is intentionally excluded for security.
     * 
     * @param user the User entity to convert
     */
    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();
        this.hasSeenPlanningToolManual = user.getHasSeenPlanningToolManual();
    }
    
    /**
     * Full constructor for creating DTOs directly.
     */
    public UserDTO(Integer id, String username, String role, Instant createdAt) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    public boolean isHasSeenPlanningToolManual() {
        return hasSeenPlanningToolManual;
    }

    public void setHasSeenPlanningToolManual(boolean seen) {
        this.hasSeenPlanningToolManual = seen;
    }
}
