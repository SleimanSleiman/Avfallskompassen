package com.avfallskompassen.services;

import com.avfallskompassen.model.User;
import com.avfallskompassen.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service class for user-related business logic and operations.
 * 
 * This service handles user authentication, registration, and password
 * management using BCrypt encryption for secure password storage.
 * 
 * @author Akmal Safi
 */
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Finds a user by their username.
     * 
     * @param username the username to search for
     * @return Optional containing the user if found, empty otherwise
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Returns all users in the system.
     */
    public java.util.List<User> findAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Validates a plain text password against an encoded password.
     * 
     * @param rawPassword the plain text password to validate
     * @param encodedPassword the BCrypt encoded password from database
     * @return true if passwords match, false otherwise
     */
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
    
    /**
     * Creates a new user with default USER role.
     * 
     * @param username the unique username for the new user
     * @param password the plain text password (will be BCrypt encoded)
     * @return the created User entity
     */
    public User createUser(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        
        String encodedPassword = passwordEncoder.encode(password);
        User user = new User(username, encodedPassword);
        return userRepository.save(user);
    }
    
    /**
     * Creates a new user with a specific role.
     * 
     * @param username the unique username for the new user
     * @param password the plain text password (will be BCrypt encoded)
     * @param role the role to assign to the user (USER, ADMIN, etc.)
     * @return the created User entity
     */
    public User createUser(String username, String password, String role) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        
        String encodedPassword = passwordEncoder.encode(password);
        User user = new User(username, encodedPassword, role);
        return userRepository.save(user);
    }

    /**
     * Update a user's role. Throws RuntimeException if user not found.
     */
    public User updateUserRole(Integer userId, String newRole) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        return userRepository.save(user);
    }
}