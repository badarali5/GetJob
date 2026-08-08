package com.example.GetJob.storage;

import com.example.GetJob.config.StorageProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Objects;

@Service
public class ResumeStorageService {
    private final StorageProperties storageProperties;
    private final S3Client s3Client;

    public ResumeStorageService(StorageProperties storageProperties, S3Client s3Client) {
        this.storageProperties = storageProperties;
        this.s3Client = s3Client;
    }

    public String storeResume(Long userId, MultipartFile file) {
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "resume.pdf"));
        String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");

        if (useS3()) {
            return storeInS3(userId, safeFilename, file);
        }

        return storeLocally(userId, safeFilename, file);
    }

    private boolean useS3() {
        StorageProperties.S3 s3 = storageProperties.getS3();
        return s3.isEnabled()
                && StringUtils.hasText(s3.getBucket())
                && StringUtils.hasText(s3.getRegion());
    }

    private String storeInS3(Long userId, String safeFilename, MultipartFile file) {
        StorageProperties.S3 s3 = storageProperties.getS3();
        String objectKey = buildObjectKey(s3.getPrefix(), userId, safeFilename);

        try (InputStream inputStream = file.getInputStream()) {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(s3.getBucket())
                    .key(objectKey)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(inputStream, file.getSize()));
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to upload resume to S3", exception);
        }

        return buildPublicUrl(s3, objectKey);
    }

    private String storeLocally(Long userId, String safeFilename, MultipartFile file) {
        String timestamp = String.valueOf(Instant.now().toEpochMilli());
        Path userDir = Path.of(storageProperties.getLocalDir(), String.valueOf(userId));
        Path targetFile = userDir.resolve(timestamp + "_" + safeFilename);

        try {
            Files.createDirectories(userDir);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to save resume locally", exception);
        }

        return "/uploads/resumes/" + userId + "/" + targetFile.getFileName();
    }

    private String buildObjectKey(String prefix, Long userId, String safeFilename) {
        String normalizedPrefix = StringUtils.hasText(prefix) ? prefix.replaceAll("^/+|/+$", "") : "resumes";
        return normalizedPrefix + "/" + userId + "/" + Instant.now().toEpochMilli() + "_" + safeFilename;
    }

    private String buildPublicUrl(StorageProperties.S3 s3, String objectKey) {
        if (StringUtils.hasText(s3.getPublicBaseUrl())) {
            return s3.getPublicBaseUrl().replaceAll("/+$", "") + "/" + objectKey;
        }

        return "https://" + s3.getBucket() + ".s3." + s3.getRegion().trim() + ".amazonaws.com/" + objectKey;
    }
}