package com.hms.auth.controller;

import com.hms.auth.dto.AuthResponse;
import com.hms.auth.dto.DoctorRegisterRequest;
import com.hms.auth.dto.LoginRequest;
import com.hms.auth.dto.MeResponse;
import com.hms.auth.dto.PatientRegisterRequest;
import com.hms.auth.dto.RegisterRequest;
import com.hms.auth.entity.Role;
import com.hms.auth.exception.InvalidCredentialsException;
import com.hms.auth.service.AuthService;
import com.hms.auth.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    /** Generic register — used for admin bootstrap. No linked profile is created. */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        log.info("Register attempt: username={}, role={}", req.getUsername(), req.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    /** One-step patient registration: creates User + linked Patient row via Feign. */
    @PostMapping("/register/patient")
    public ResponseEntity<AuthResponse> registerPatient(@Valid @RequestBody PatientRegisterRequest req) {
        log.info("Register patient attempt: username={}", req.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerPatient(req));
    }

    /** One-step doctor registration: creates User + linked Doctor row via Feign. */
    @PostMapping("/register/doctor")
    public ResponseEntity<AuthResponse> registerDoctor(@Valid @RequestBody DoctorRegisterRequest req) {
        log.info("Register doctor attempt: username={}, dept={}", req.getUsername(), req.getDepartment());
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerDoctor(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        log.info("Login attempt: username={}", req.getUsername());
        return ResponseEntity.ok(authService.login(req));
    }

    /**
     * Returns the user info encoded in the bearer token.
     * In production this is typically called via the gateway (which adds
     * X-Username/X-Role headers); for direct calls we parse the Authorization
     * header here.
     */
    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new InvalidCredentialsException("Missing Authorization: Bearer header");
        }
        String token = authHeader.substring(7);
        Claims claims = jwtService.parse(token);

        return ResponseEntity.ok(MeResponse.builder()
                .userId(claims.get("userId", Long.class))
                .username(claims.getSubject())
                .role(Role.valueOf(claims.get("role", String.class)))
                .linkedId(claims.get("linkedId", Long.class))
                .build());
    }
}
