package com.avfallskompassen.model;

import jakarta.persistence.*;

/**
 * This class maps to the "users" table in the PostgreSQL database and
 * handles user authentication data including username, password, and role.
 * Passwords are stored using BCrypt hashing for security.
 * 
 * @author Akmal Safi

 */

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(nullable = false, length = 255)
    private String password;
    
    @Column(nullable = false, length = 50)
    private String role = "USER";
    
    /**
     * Default constructor for JPA.
     */
    public User() {}
    
    /**
     * Constructor for creating a new user with default USER role.
     * 
     * @param username the unique username
     * @param password the BCrypt hashed password
     */
    public User(String username, String password) {
        this.username = username;
        this.password = password;
        this.role = "USER";
    }
    
    /**
     * Constructor for creating a user with a specific role.
     * 
     * @param username the unique username
     * @param password the BCrypt hashed password
     * @param role the user's role (USER, ADMIN, etc.)
     */
    public User(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}