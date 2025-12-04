package com.example.GetJob.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class CorsConfig {

    /**
     * Allowed origins from environment variable or defaults
     * MUST include all domains that will access your API:
     * - Local development (localhost)
     * - Vercel frontend (getjobportal.vercel.app and preview deployments)
     * - Railway backend itself (for testing/health checks)
     */
    @Value("${cors.allowed.origins:http://localhost:5173,http://localhost:3000,https://getjobportal.vercel.app,https://*.vercel.app,https://getjob-production.up.railway.app,https://*.railway.app}")
    private String allowedOrigins;

    /**
     * Single CORS configuration bean used by Spring Security
     * Defines allowed origins, methods, headers, and credentials
     * Uses environment variables for flexibility across environments
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Parse comma-separated origins and trim whitespace
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .collect(Collectors.toList());
        
        configuration.setAllowedOrigins(origins);
        
        // Allow all HTTP methods for REST API
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Explicitly list allowed headers for better security
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With", 
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Expose critical headers to frontend
        configuration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin", 
            "Access-Control-Allow-Credentials",
            "Authorization"
        ));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Set max age for preflight requests (1 hour)
        configuration.setMaxAge(3600L);
        
        // Register the configuration
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}

