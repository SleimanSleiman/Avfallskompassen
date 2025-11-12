package com.avfallskompassen.services;

import com.avfallskompassen.model.User;
import com.avfallskompassen.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void findByUsername_found_returnsUserOptional() {
        User user = new User("alice", "encoded");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));

        Optional<User> result = userService.findByUsername("alice");

        assertTrue(result.isPresent());
        assertEquals("alice", result.get().getUsername());
    }

    @Test
    void findByUsername_notFound_returnsEmptyOptional() {
        when(userRepository.findByUsername("nobody")).thenReturn(Optional.empty());

        Optional<User> result = userService.findByUsername("nobody");

        assertFalse(result.isPresent());
    }

    @Test
    void validatePassword_matches_returnsTrue() {
        when(passwordEncoder.matches("raw", "encoded")).thenReturn(true);

        assertTrue(userService.validatePassword("raw", "encoded"));
    }

    @Test
    void validatePassword_notMatches_returnsFalse() {
        when(passwordEncoder.matches("raw", "encoded")).thenReturn(false);

        assertFalse(userService.validatePassword("raw", "encoded"));
    }

    @Test
    void createUser_success_encodesAndSavesUser() {
        when(userRepository.existsByUsername("bob")).thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("encoded-secret");
        // echo back the saved user (return the argument)
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User created = userService.createUser("bob", "secret");

        assertNotNull(created);
        assertEquals("bob", created.getUsername());
        assertEquals("encoded-secret", created.getPassword());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void createUser_existingUsername_throwsRuntimeException() {
        when(userRepository.existsByUsername("taken")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.createUser("taken", "pw"));
        assertEquals("Username already exists", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void createUser_withRole_success_encodesAndSavesUserWithRole() {
        when(userRepository.existsByUsername("carol")).thenReturn(false);
        when(passwordEncoder.encode("pw")).thenReturn("enc-pw");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User created = userService.createUser("carol", "pw", "ADMIN");

        assertNotNull(created);
        assertEquals("carol", created.getUsername());
        assertEquals("enc-pw", created.getPassword());
        assertEquals("ADMIN", created.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }
}