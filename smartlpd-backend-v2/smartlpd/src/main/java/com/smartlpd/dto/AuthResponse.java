package com.smartlpd.dto;

public class AuthResponse {
    private String token;
    private String message;
    private boolean success;
    private String username;
    private String role;

    // Constructors
    public AuthResponse() {}

    public AuthResponse(String token, String message, boolean success, String username, String role) {
        this.token = token;
        this.message = message;
        this.success = success;
        this.username = username;
        this.role = role;
    }

    // Getters and setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}