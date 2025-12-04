package com.example.GetJob.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleTokenRequest {
    @NotBlank(message = "Token is required")
    private String token;

    public GoogleTokenRequest() {
    }

    public GoogleTokenRequest(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
