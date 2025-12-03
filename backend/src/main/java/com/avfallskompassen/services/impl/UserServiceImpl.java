package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.UserDTO;
import com.avfallskompassen.model.User;
import com.avfallskompassen.repository.UserRepository;
import com.avfallskompassen.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementation of UserService interface for user-related business logic and operations.
 * 
 * This service handles user authentication, registration, and password
 * management using BCrypt encryption for secure password storage.
 * 
 * @author Akmal Safi
 */
@Service
public class UserServiceImpl implements UserService {
    
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
    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Returns all users in the system as DTOs.
     * 
     * @return List of UserDTO
     */
    @Override
    public List<UserDTO> findAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Validates a plain text password against an encoded password.
     * 
     * @param rawPassword the plain text password to validate
     * @param encodedPassword the BCrypt encoded password from database
     * @return true if passwords match, false otherwise
     */
    @Override
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
    @Override
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
    @Override
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
     * Returns a DTO instead of the entity.
     * 
     * @param userId the ID of the user to update
     * @param newRole the new role to assign
     * @return UserDTO of the updated user
     */
    @Override
    public UserDTO updateUserRole(Integer userId, String newRole) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        User savedUser = userRepository.save(user);
        return new UserDTO(savedUser);
    }

    @Override
    public boolean hasSeenPlanningToolManual(String username) {
        return userRepository.findByUsername(username)
                .map(User::getHasSeenPlanningToolManual)
                .orElse(false);
    }

    @Override
    public void markPlanningToolManualAsSeen(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setHasSeenPlanningToolManual(true);
            userRepository.save(user);
        });
    }

    /**
     * Finds a user with their associated properties.
     * 
     * @param userId the ID of the user to find
     * @return Optional containing the user with properties if found, empty otherwise
     */
    @Override
    public Optional<User> findUserWithProperties(Integer userId) {
        return userRepository.findById(userId);
    }
}
