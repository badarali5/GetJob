package com.example.GetJob.user;

import com.example.GetJob.auth.model.Role;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "created_at_app", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
