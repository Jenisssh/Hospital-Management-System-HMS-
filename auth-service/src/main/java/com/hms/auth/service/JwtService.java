package com.hms.auth.service;

import com.hms.auth.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Issues and parses HS256 JWTs.
 *
 * Locked rules (lessons from v1):
 * - Secret is read from JWT_SECRET env var via {@code hms.jwt.secret}.
 * - Secret bytes are UTF-8 encoded directly. NO base64 decode.
 * - Secret length must be >= 32 chars (256 bits) for HS256.
 */
@Slf4j
@Service
public class JwtService {

    private final String secret;
    private final long expirationMs;
    private final SecretKey signingKey;

    public JwtService(
            @Value("${hms.jwt.secret}") String secret,
            @Value("${hms.jwt.expiration-ms}") long expirationMs) {
        this.secret = secret;
        this.expirationMs = expirationMs;
        this.signingKey = buildKey(secret);
    }

    @PostConstruct
    void onInit() {
        log.info("JwtService initialized: secret length={} chars, expiration={}ms",
                secret.length(), expirationMs);
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole().name())
                .claim("userId", user.getId())
                .claim("linkedId", user.getLinkedId())
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parse(String token) throws JwtException {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private static SecretKey buildKey(String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret too short: must be >= 32 bytes for HS256 (got " + bytes.length + ")");
        }
        return Keys.hmacShaKeyFor(bytes);
    }
}
