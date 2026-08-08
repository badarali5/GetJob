package com.example.GetJob.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {
    private String localDir = System.getProperty("user.dir") + "/uploads/resumes";
    private final S3 s3 = new S3();

    @Data
    public static class S3 {
        private boolean enabled = true;
        private String bucket;
        private String region;
        private String publicBaseUrl;
        private String prefix = "resumes";
    }
}