package com.example.GetJob.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Security filter chain configuration for REST API with JWT authentication
     * Uses the CORS configuration from CorsConfig bean
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http, 
            CorsConfigurationSource corsConfigurationSource
    ) throws Exception {
        
        http
            // Enable CORS with the injected configuration source
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            
            // Disable CSRF for stateless REST API
            .csrf(csrf -> csrf.disable())
            
            // Configure authorization
            .authorizeHttpRequests(auth -> auth
                // Allow preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Allow auth endpoints without authentication
                .requestMatchers("/api/auth/**").permitAll()
                
                // Allow job endpoints for browsing
                .requestMatchers("/jobs/**").permitAll()
                
                // Allow Swagger/OpenAPI documentation if available
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            
            // Set session management to stateless
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
            
        return http.build();
    }
}
