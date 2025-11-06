package com.pm.authservice;

import lombok.Data;

// This is the JSON object for login/register requests
@Data
public class AuthRequest {
    private String username;
    private String password;
}