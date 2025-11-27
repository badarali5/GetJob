package com.example.GetJob.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS configuration for the application.
 * 
 * To override the allowed origins in production, set one of the following:
 *   - Environment variable: CORS_ALLOWED_ORIGINS=https://your-frontend.com,https://another-origin.com
 *   - JVM argument: --cors.allowed-origins=https://your-frontend.com,https://another-origin.com
 */
@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:http://localhost:5173,https://getjobportal.vercel.app}")
    private String allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                if (allowedOrigins != null && !allowedOrigins.trim().isEmpty()) {
                    String[] origins = allowedOrigins.split(",");
                    registry.addMapping("/**")
                            .allowedOrigins(origins)
                            .allowedMethods("*")
                            .allowedHeaders("*")
                            .allowCredentials(true)
                            .maxAge(3600);
                } else {
                    // If no origins provided, be restrictive
                    registry.addMapping("/**");
                }
            }
        };
    }
}
