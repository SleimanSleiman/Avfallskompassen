package com.avfallskompassen.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * This class configures Spring Security to:
 * - Disable CSRF protection for REST API usage
 * - Allow unrestricted access to all /api/** endpoints
 * - Provide BCrypt password encoding for secure password storage
 * 
 * @author Akmal Safi
 */

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Provides BCrypt password encoder bean for secure password hashing.
     * 
     * @return BCryptPasswordEncoder instance for password encoding/validation
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures HTTP security settings for the application.
     * 
     * @param http HttpSecurity configuration object
     * @return SecurityFilterChain with configured security rules
     * @throws Exception if security configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for REST API
            .authorizeHttpRequests(authz -> authz
                    .requestMatchers(
                            "/api/**",
                            "/images/**"
                    ).permitAll()
                .anyRequest().authenticated() // Require auth for other endpoints
            );
        return http.build();
    }
}