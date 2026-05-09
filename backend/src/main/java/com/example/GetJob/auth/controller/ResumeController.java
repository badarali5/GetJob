package com.example.GetJob.auth.controller;

import com.example.GetJob.auth.repository.AuthUserRepository;
import com.example.GetJob.auth.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ResumeController {
    private static final Logger logger = LoggerFactory.getLogger(ResumeController.class);

    private final AuthUserRepository authUserRepository;

    @Autowired
    public ResumeController(AuthUserRepository authUserRepository) {
        this.authUserRepository = authUserRepository;
    }

    @PostMapping("/resume")
    public ResponseEntity<?> uploadResume(@RequestParam("userId") Long userId, @RequestParam("file") MultipartFile file) {
        User user = authUserRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file uploaded"));
        }

        // Mock resume upload: generate a URL string based on file name and timestamp (no actual file I/O)
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf";
        String mockResumeUrl = "/resume/" + userId + "/" + Instant.now().toEpochMilli() + "_" + filename;
        
        user.setResumeUrl(mockResumeUrl);
        authUserRepository.save(user);
        
        logger.info("Resume uploaded for user {}: {}", userId, mockResumeUrl);

        // Return AuthResponse-like payload so frontend can update stored user
        com.example.GetJob.auth.dto.AuthResponse resp = new com.example.GetJob.auth.dto.AuthResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole(), null, user.getResumeUrl()
        );
        return ResponseEntity.ok(resp);
    }
}
