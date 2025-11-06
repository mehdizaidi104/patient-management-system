package com.pm.authservice;

import lombok.Data;

// This is the JSON object we send back on successful login
@Data
public class AuthResponse {
    private final String token;
}