package com.example.GetJob.user;

import com.example.GetJob.auth.model.Role;
import java.time.LocalDateTime;

// This class is a simple DTO used by the `user` package. The actual JPA-mapped
// User entity is located in `com.example.GetJob.auth.model.User`. To avoid
// duplicate JPA mappings we intentionally do NOT annotate this class with
// @Entity. Reuse the auth.User entity for persistence operations.
public class User {
    private Long id;

    private String name;

    private String email;

    private String password;

    private Role role;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters/setters omitted for brevity; this DTO is not managed by JPA.
}
