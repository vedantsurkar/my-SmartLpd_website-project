package com.smartlpd.controller;

import com.smartlpd.dto.AuthResponse;
import com.smartlpd.dto.LoginRequest;
import com.smartlpd.dto.RegisterRequest;
import com.smartlpd.model.User;
import com.smartlpd.model.UserRole;
import com.smartlpd.repository.UserRepository;
import com.smartlpd.service.AuthService;
import com.smartlpd.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // GET endpoints for easy browser testing
    @GetMapping("/test")
    public String test() {
        return "Auth endpoint working!";
    }

    @GetMapping("/test-setup")
    public Map<String, String> testSetup() {
        Map<String, String> response = new HashMap<>();

        // Check if database is working
        long userCount = userRepository.count();
        response.put("database_status", "Working - " + userCount + " users");
        response.put("jwt_status", "Configured");
        response.put("auth_service", "Ready");

        return response;
    }

    @GetMapping("/quick-fix")
    public ResponseEntity<?> quickFix() {
        try {
            // Delete existing test users if any
            userRepository.findByUsername("testauthority").ifPresent(userRepository::delete);
            userRepository.findByUsername("testcitizen").ifPresent(userRepository::delete);

            // Create proper test users
            User authorityUser = new User(
                    "testauthority",
                    "authority@gov.ac.in",
                    passwordEncoder.encode("password123"),
                    "Test Authority",
                    UserRole.AUTHORITY
            );
            userRepository.save(authorityUser);

            User citizenUser = new User(
                    "testcitizen",
                    "citizen@example.com",
                    passwordEncoder.encode("password123"),
                    "Test Citizen",
                    UserRole.CITIZEN
            );
            userRepository.save(citizenUser);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Test users created successfully!",
                    "test_authority", "testauthority / password123",
                    "test_citizen", "testcitizen / password123"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/create-test-user")
    public AuthResponse createTestUser() {
        // Create a test user if doesn't exist - with CITIZEN role
        if (!userRepository.existsByUsername("testuser")) {
            User testUser = new User(
                    "testuser",
                    "test@example.com",
                    passwordEncoder.encode("password123"),
                    "Test User",
                    UserRole.CITIZEN
            );
            userRepository.save(testUser);
        }

        // Generate token for test user
        String token = jwtUtil.generateToken("testuser", UserRole.CITIZEN.name());

        return new AuthResponse(token, "Test user created and logged in", true, "testuser", UserRole.CITIZEN.name());
    }

    @GetMapping("/create-test-authority")
    public AuthResponse createTestAuthority() {
        // Create a test authority user if doesn't exist
        if (!userRepository.existsByUsername("testauthority")) {
            User testAuthority = new User(
                    "testauthority",
                    "authority@gov.ac.in",
                    passwordEncoder.encode("password123"),
                    "Test Authority",
                    UserRole.AUTHORITY
            );
            userRepository.save(testAuthority);
        }

        // Generate token for test authority user
        String token = jwtUtil.generateToken("testauthority", UserRole.AUTHORITY.name());

        return new AuthResponse(token, "Test authority user created and logged in", true, "testauthority", UserRole.AUTHORITY.name());
    }

    @GetMapping("/test-login")
    public AuthResponse testLogin() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password123");
        return authService.login(request);
    }

    @GetMapping("/test-authority-login")
    public AuthResponse testAuthorityLogin() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testauthority");
        request.setPassword("password123");
        return authService.login(request);
    }
}