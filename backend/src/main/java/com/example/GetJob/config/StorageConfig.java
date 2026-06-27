package com.example.GetJob.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class StorageConfig {

    @Bean
    public S3Client s3Client(StorageProperties storageProperties) {
        String regionValue = storageProperties.getS3().getRegion();
        Region region = (regionValue == null || regionValue.isBlank())
                ? Region.US_EAST_1
                : Region.of(regionValue.trim());

        return S3Client.builder()
                .region(region)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}