package com.smartlpd.service;

import com.smartlpd.dto.AuthResponse;
import com.smartlpd.dto.LoginRequest;
import com.smartlpd.dto.RegisterRequest;
import com.smartlpd.model.User;
import com.smartlpd.model.UserRole;
import com.smartlpd.repository.UserRepository;
import com.smartlpd.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private boolean isValidAuthorityEmail(String email) {
        return email != null && email.toLowerCase().endsWith("@gov.ac.in");
    }

    public AuthResponse register(RegisterRequest request) {
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse(null, "Username already exists", false, null, null);
        }

        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(null, "Email already exists", false, null, null);
        }

        // Validate authority email domain
        if (request.getRole() == UserRole.AUTHORITY && !isValidAuthorityEmail(request.getEmail())) {
            return new AuthResponse(null, "Government authorities must use @gov.ac.in email addresses", false, null, null);
        }

        // Determine role (default to CITIZEN)
        UserRole role = (request.getRole() != null) ? request.getRole() : UserRole.CITIZEN;

        // Create new user
        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                role
        );

        userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return new AuthResponse(token, "User registered successfully", true, user.getUsername(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        // Try to find user by username first
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());

        // If not found by username, try by email
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByEmail(request.getUsername());
        }

        if (userOptional.isEmpty()) {
            return new AuthResponse(null, "Invalid username/email or password", false, null, null);
        }

        User user = userOptional.get();

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse(null, "Invalid username/email or password", false, null, null);
        }

        // Generate JWT token with role
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return new AuthResponse(token, "Login successful", true, user.getUsername(), user.getRole().name());
    }
}