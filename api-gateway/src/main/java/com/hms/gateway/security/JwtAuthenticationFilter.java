package com.hms.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Set;

/**
 * Validates the JWT on every request and forwards user info to downstream services.
 *
 * - Public endpoints (no JWT required): /auth/login, /auth/register/**, /actuator/**
 * - All others require a valid bearer token.
 * - On success, mutates the request to add headers:
 *     X-Username, X-Role, X-User-Id, X-Linked-Id
 * - CORS preflight (OPTIONS) is always passed through.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final Set<String> PUBLIC_PREFIXES = Set.of(
            "/auth/login",
            "/auth/register",
            "/actuator/"
    );

    private final JwtService jwtService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest req = exchange.getRequest();
        String path = req.getURI().getPath();

        // CORS preflight bypass
        if (req.getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        // Public endpoints
        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        String authHeader = req.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing/invalid Authorization header for {} {}", req.getMethod(), path);
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        Claims claims;
        try {
            claims = jwtService.parse(token);
        } catch (JwtException e) {
            log.warn("JWT validation failed for {}: {}", path, e.getMessage());
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }

        String username = claims.getSubject();
        String role = claims.get("role", String.class);
        Long userId = claims.get("userId", Long.class);
        Long linkedId = claims.get("linkedId", Long.class);

        if (username == null || role == null || userId == null) {
            log.warn("JWT missing required claims (sub/role/userId) for {}", path);
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }

        ServerHttpRequest mutated = req.mutate()
                .header("X-Username", username)
                .header("X-Role", role)
                .header("X-User-Id", String.valueOf(userId))
                .header("X-Linked-Id", linkedId == null ? "" : String.valueOf(linkedId))
                .build();

        return chain.filter(exchange.mutate().request(mutated).build());
    }

    private static boolean isPublicPath(String path) {
        for (String prefix : PUBLIC_PREFIXES) {
            if (path.startsWith(prefix)) return true;
        }
        return false;
    }

    private Mono<Void> reject(ServerWebExchange exchange, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        // Run before routing
        return -100;
    }
}
