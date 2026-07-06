package com.restaurant.qrmenu.controller;

import com.restaurant.qrmenu.repository.AdminUserRepository;
import com.restaurant.qrmenu.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AdminUserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String u = body.get("username");
        String p = body.get("password");
        return repo.findByUsername(u)
                .filter(a -> encoder.matches(p, a.getPassword()))
                .<ResponseEntity<?>>map(a -> ResponseEntity.ok(Map.of(
                        "token", jwt.generate(a.getUsername()),
                        "username", a.getUsername(),
                        "role", a.getRole())))
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing token"));
        }
        String token = auth.substring(7);
        return jwt.isValid(token)
                ? ResponseEntity.ok(Map.of("username", jwt.extractUsername(token)))
                : ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
    }
}
