package com.avfallskompassen.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.avfallskompassen.security.JwtAuthFilter;

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
@EnableMethodSecurity
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
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for REST API
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                    // authentication endpoints must remain public
                    .requestMatchers("/api/auth/**", "/images/**").permitAll()
                    // admin endpoints require ADMIN role
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    // other API endpoints require authentication
                    .requestMatchers("/api/**").authenticated()
                    .anyRequest().authenticated()
            )
            ;

        // add JWT filter before the username/password filter
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}