package com.example.GetJob.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadsDir = System.getProperty("user.dir") + "/uploads/";
        String resourceLocation = Path.of(uploadsDir).toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation);
    }
}
