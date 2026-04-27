package com.hms.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Validates and decodes JWTs at the gateway. Same locked rules as auth-service:
 * UTF-8 bytes, no base64 decode. Secret must match auth-service's exactly.
 */
@Slf4j
@Component
public class JwtService {

    private final SecretKey signingKey;

    public JwtService(@Value("${hms.jwt.secret}") String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret too short: must be >= 32 bytes for HS256 (got " + bytes.length + ")");
        }
        this.signingKey = Keys.hmacShaKeyFor(bytes);
    }

    @PostConstruct
    void onInit() {
        log.info("Gateway JwtService initialized");
    }

    /** Returns the parsed claims, or throws JwtException if the token is invalid/expired. */
    public Claims parse(String token) throws JwtException {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
