package com.hms.auth.client;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Feign config used by clients that call internal services (patient-service, doctor-service)
 * during user registration. We impersonate an ADMIN identity since downstream services trust
 * gateway-forwarded headers; on direct service-to-service calls we synthesize them here.
 *
 * Network-level isolation (only services in the same trusted cluster can reach each other)
 * is what keeps this safe.
 */
@Configuration
public class SystemAdminFeignConfig {

    @Bean
    public RequestInterceptor systemAdminHeaderInterceptor() {
        return template -> {
            template.header("X-Username", "system");
            template.header("X-Role", "ADMIN");
            template.header("X-User-Id", "0");
            template.header("X-Linked-Id", "");
        };
    }
}
