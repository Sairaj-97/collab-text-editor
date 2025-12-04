package com.termination.collab_text_editor.auth;

import com.termination.collab_text_editor.user.User;
import com.termination.collab_text_editor.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordService passwordService;

    public AuthController(UserRepository userRepository,
                          PasswordService passwordService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        // Check if email is already used
        if (userRepository.findByEmail(request.email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.username);
        user.setEmail(request.email);
        user.setPasswordHash(passwordService.hash(request.password));
        user.setCreatedAt(Instant.now());

        userRepository.save(user);

        AuthResponse resp = new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        // Check password
        boolean passwordMatches = passwordService.matches(request.password, user.getPasswordHash());
        if (!passwordMatches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        AuthResponse resp = new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );

        return ResponseEntity.ok(resp);
    }
}
