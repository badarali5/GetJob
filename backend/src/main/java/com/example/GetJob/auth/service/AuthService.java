package com.example.GetJob.auth.service;

import com.example.GetJob.auth.dto.AuthResponse;
import com.example.GetJob.auth.dto.SigninRequest;
import com.example.GetJob.auth.dto.SignupRequest;
import com.example.GetJob.auth.model.Role;
import com.example.GetJob.auth.model.User;
import com.example.GetJob.auth.repository.AuthUserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Service
public class AuthService {
    private final AuthUserRepository authUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final SecretKey jwtSecretKey;
    private final ObjectMapper objectMapper = new ObjectMapper();

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

        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), token);
    }

    public AuthResponse signin(SigninRequest request) {
        User user = authUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        String token = generateToken(user);

        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), token);
    }

    public AuthResponse googleAuth(String googleToken) {
        try {
            JsonNode claims = decodeGoogleToken(googleToken);

            String email = claims.get("email").asText();
            String name = claims.has("name") ? claims.get("name").asText() : email.split("@")[0];

            if (email == null || email.isEmpty()) {
                throw new RuntimeException("Invalid Google token: email not found");
            }
            User user = authUserRepository.findByEmail(email).orElse(null);

            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setRole(Role.OTHER);
                user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setCreatedAt(LocalDateTime.now());
                user = authUserRepository.save(user);
            }
            String token = generateToken(user);

            return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), token);
        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }

    private JsonNode decodeGoogleToken(String token) throws Exception {
        String[] tokenParts = token.split("\\.");
        if (tokenParts.length != 3) {
            throw new RuntimeException("Invalid token format");
        }
        String payload = tokenParts[1];
        int padding = 4 - (payload.length() % 4);
        if (padding < 4) {
            payload += "=".repeat(padding);
        }

        byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(payload);
        return objectMapper.readTree(decodedBytes);
    }

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
