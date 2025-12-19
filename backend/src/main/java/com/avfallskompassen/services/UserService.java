package com.avfallskompassen.services;

import com.avfallskompassen.dto.UserDTO;
import com.avfallskompassen.model.User;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for user-related business logic and operations.
 * 
 * This service handles user authentication, registration, and password
 * management using BCrypt encryption for secure password storage.
 * 
 * @author Akmal Safi
 */
public interface UserService {
    
    /**
     * Finds a user by their username.
     * 
     * @param username the username to search for
     * @return Optional containing the user if found, empty otherwise
     */
    Optional<User> findByUsername(String username);

    /**
     * Returns all users in the system as DTOs.
     * 
     * @return List of UserDTO
     */
    List<UserDTO> findAllUsers();
    
    /**
     * Validates a plain text password against an encoded password.
     * 
     * @param rawPassword the plain text password to validate
     * @param encodedPassword the BCrypt encoded password from database
     * @return true if passwords match, false otherwise
     */
    boolean validatePassword(String rawPassword, String encodedPassword);
    
    /**
     * Creates a new user with default USER role.
     * 
     * @param username the unique username for the new user
     * @param password the plain text password (will be BCrypt encoded)
     * @return the created User entity
     */
    User createUser(String username, String password);
    
    /**
     * Creates a new user with a specific role.
     * 
     * @param username the unique username for the new user
     * @param password the plain text password (will be BCrypt encoded)
     * @param role the role to assign to the user (USER, ADMIN, etc.)
     * @return the created User entity
     */
    User createUser(String username, String password, String role);

    /**
     * Update a user's role. Throws RuntimeException if user not found.
     * Returns a DTO instead of the entity.
     * 
     * @param userId the ID of the user to update
     * @param newRole the new role to assign
     * @return UserDTO of the updated user
     */
    UserDTO updateUserRole(Integer userId, String newRole);

    /**
     * Changes a user's password after validating the current password.
     *
     * @param username the username whose password should be changed
     * @param oldPassword the user's current password
     * @param newPassword the desired new password
     */
    void changePassword(String username, String oldPassword, String newPassword);

    /**
     * Checks whether the specified user has already seen
     * the interactive Planning Tool manual/tutorial.
     *
     * @param username the username of the user to check
     * @return true if the user has seen the manual, false otherwise
     */

    boolean hasSeenPlanningToolManual(String username);
    /**
     * Marks that the specified user has seen the
     * Planning Tool manual/tutorial by updating the
     * corresponding field in the database.
     *
     * @param username the username of the user to update
     */
    void markPlanningToolManualAsSeen(String username);
}
