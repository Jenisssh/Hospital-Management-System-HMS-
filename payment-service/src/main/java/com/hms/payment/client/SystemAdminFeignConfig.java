package com.hms.payment.client;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
