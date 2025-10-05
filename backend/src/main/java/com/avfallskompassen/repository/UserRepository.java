package com.avfallskompassen.repository;

import com.avfallskompassen.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * This interface extends JpaRepository to provide CRUD operations and
 * custom query methods for the User entity. Spring Data JPA automatically
 * generates implementations based on method naming conventions.
 * 
 * @author Akmal Safi
 */
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    
    /**
     * Finds a user by their username.
     * 
     * @param username the username to search for
     * @return Optional containing the user if found, empty otherwise
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Checks if a user with the given username exists.
     * 
     * @param username the username to check
     * @return true if user exists, false otherwise
     */
    boolean existsByUsername(String username);
}