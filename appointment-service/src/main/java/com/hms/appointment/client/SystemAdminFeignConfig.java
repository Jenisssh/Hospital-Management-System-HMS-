package com.hms.appointment.client;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Adds gateway-style headers to internal Feign calls so downstream services
 * accept us as an admin. Network isolation is what keeps this safe.
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
