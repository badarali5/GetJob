package com.example.GetJob.auth.service;

import com.example.GetJob.auth.dto.AuthResponse;
import com.example.GetJob.auth.dto.SigninRequest;
import com.example.GetJob.auth.dto.SignupRequest;
import com.example.GetJob.auth.model.Role;
import com.example.GetJob.auth.model.User;
import com.example.GetJob.auth.repository.AuthUserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;

@Service
public class AuthService {
    private final AuthUserRepository authUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final SecretKey jwtSecretKey;

    public AuthService(AuthUserRepository authUserRepository,
                       @Value("${jwt.secret:mySecretKeyForJWTTokenGenerationThatIsLongEnough}") String jwtSecret) {
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtSecretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public AuthResponse signup(SignupRequest request) {
        if (authUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setCreatedAt(LocalDateTime.now());

        user = authUserRepository.save(user);
        String token = generateToken(user);

        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), token, user.getResumeUrl());
    }

    public AuthResponse signin(SigninRequest request) {
        User user = authUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        String token = generateToken(user);

        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), token, user.getResumeUrl());
    }

    // Google sign-in removed. Manual signup and signin use email/password only.

    private String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000)) // 24 hours
                .signWith(jwtSecretKey)
                .compact();
    }
}
